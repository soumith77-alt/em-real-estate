import type {
  CandidateAssessment,
  CriteriaSet,
  Criterion,
  CriterionResult,
  Property,
  Restriction,
  Retailer,
  Unit,
} from "@/types";
import { retailers } from "@/mock/fixtures/retailers";
import { units } from "@/mock/fixtures/units";
import { properties } from "@/mock/fixtures/properties";
import { restrictions } from "@/mock/fixtures/restrictions";
import { criteriaSets } from "@/mock/fixtures/criteriaSets";
import { runHardFilters } from "./hardFilters";
import { getSoftScores } from "./softScores";

export interface RunSearchResult {
  inScope: number;
  hardPassed: number;
  ranked: CandidateAssessment[];
  complete: CandidateAssessment[];
}

function tierFit(retailer: Retailer, property: Property): boolean {
  return retailer.tiersOperated.includes(property.tier);
}

function formatBasicFit(retailer: Retailer, unit: Unit): boolean {
  // Rough pre-hard-filter fit: format overlap must be non-empty (retailer accepts *some* format)
  return retailer.formatsAccepted.length > 0 && retailer.formatsAccepted.some(() => true) && retailer.formatsAccepted.includes(unit.format);
}

function inScopePool(unit: Unit, property: Property): Retailer[] {
  return retailers.filter((r) => {
    // Province filter — retailers not in QC can't be shown for QC properties
    if (property.province === "QC" && !r.operatesInQuebec) return false;
    if (!tierFit(r, property)) return false;
    if (!formatBasicFit(r, unit)) return false;
    return true;
  });
}

function headlineFor(
  retailer: Retailer,
  passed: boolean,
  compositeScore: number,
  criteria: Criterion[],
  results: Record<string, CriterionResult>,
): string {
  if (!passed) {
    const failed = criteria.find(
      (c) => c.provenance === "deterministic" && (results[c.id] as CriterionResult | undefined)?.kind === "deterministic" && (results[c.id] as { outcome: string }).outcome === "fail",
    );
    if (failed) {
      const r = results[failed.id];
      if (r.kind === "deterministic") return `Fails on: ${failed.name}. ${r.evidence.slice(0, 120)}${r.evidence.length > 120 ? "…" : ""}`;
    }
    return `Fails a hard filter.`;
  }
  return `${retailer.brand} scores ${compositeScore.toFixed(0)}/100 against the small-town criteria set.`;
}

function assembleAssessment(
  retailer: Retailer,
  unit: Unit,
  property: Property,
  restrictionsForProp: Restriction[],
  criteriaSet: CriteriaSet,
  weights: Record<string, number>,
): CandidateAssessment {
  const hard = runHardFilters(retailer, unit, property, restrictionsForProp);
  const soft = getSoftScores(retailer.id, unit.id);

  const results: Record<string, CriterionResult> = {};
  for (const detail of hard.details) {
    results[detail.criterionId] = {
      kind: "deterministic",
      outcome: detail.outcome,
      evidence: detail.evidence,
      ...(detail.sourceDocId ? { sourceDocId: detail.sourceDocId } : {}),
      ...(detail.sourcePage ? { sourcePage: detail.sourcePage } : {}),
    };
  }

  // Ensure every criterion in the set has an entry
  for (const c of criteriaSet.criteria) {
    if (results[c.id]) continue;
    if (c.provenance === "ai") {
      const s = soft[c.id];
      if (s) {
        results[c.id] = { kind: "ai", score: s.score, reasoning: s.reasoning };
      } else {
        // Fallback (shouldn't happen — softScores covers all AI criteria)
        results[c.id] = { kind: "ai", score: 3, reasoning: "Insufficient signal to score." };
      }
    } else {
      // Deterministic criterion that wasn't emitted by hardFilters — treat as not-applicable
      results[c.id] = {
        kind: "deterministic",
        outcome: "not-applicable",
        evidence: "Criterion not applicable to this candidate/unit pair.",
      };
    }
  }

  // Composite: weighted mean of AI scores, scaled 0..100 (score 1..5 → 20..100)
  let sum = 0;
  let weightSum = 0;
  for (const c of criteriaSet.criteria) {
    if (c.provenance !== "ai") continue;
    const r = results[c.id];
    if (r.kind !== "ai") continue;
    const w = weights[c.id] ?? c.weight ?? 1.0;
    sum += r.score * 20 * w;
    weightSum += w;
  }
  const compositeScore = weightSum === 0 ? 0 : sum / weightSum;

  return {
    retailerId: retailer.id,
    results,
    hardFilterPassed: hard.pass,
    compositeScore,
    rank: null,
    headline: headlineFor(retailer, hard.pass, compositeScore, criteriaSet.criteria, results),
  };
}

/**
 * Run a full tenant-longlist search for a given unit + criteria set + weights.
 * Deterministic; no external I/O.
 */
export function runSearch(
  unitId: string,
  criteriaSetId: string,
  weights?: Record<string, number>,
): RunSearchResult {
  const unit = units.find((u) => u.id === unitId);
  if (!unit) throw new Error(`Unknown unit: ${unitId}`);
  const property = properties.find((p) => p.id === unit.propertyId);
  if (!property) throw new Error(`Unknown property: ${unit.propertyId}`);
  const criteriaSet = criteriaSets.find((c) => c.id === criteriaSetId);
  if (!criteriaSet) throw new Error(`Unknown criteria set: ${criteriaSetId}`);
  const restrictionsForProp = restrictions.filter((r) => r.propertyId === property.id);
  const w = weights ?? {};

  const pool = inScopePool(unit, property);
  const complete: CandidateAssessment[] = pool.map((r) =>
    assembleAssessment(r, unit, property, restrictionsForProp, criteriaSet, w),
  );

  const passers = complete.filter((c) => c.hardFilterPassed);
  passers.sort((a, b) => b.compositeScore - a.compositeScore);
  passers.forEach((c, i) => {
    c.rank = i + 1;
  });

  return {
    inScope: complete.length,
    hardPassed: passers.length,
    ranked: passers,
    complete,
  };
}

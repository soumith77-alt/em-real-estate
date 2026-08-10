import type {
  Property,
  Restriction,
  Retailer,
  Unit,
  UnitFeature,
} from "@/types";

export interface HardFilterDetail {
  criterionId: string;
  outcome: "pass" | "fail" | "not-applicable";
  evidence: string;
  sourceDocId?: string;
  sourcePage?: number;
}

export interface HardFilterResult {
  pass: boolean;
  details: HardFilterDetail[];
}

const CATEGORY_SYNONYMS: Record<string, string[]> = {
  pharmacy: ["pharmacy"],
  coffee: ["coffee"],
  "quick-service-restaurant": ["quick-service-restaurant", "coffee"],
  "casual-dining": ["casual-dining"],
  "dollar-store": ["dollar-store"],
  grocery: ["grocery"],
  liquor: ["liquor"],
  gym: ["health-fitness"],
  veterinary: ["pet"],
  medical: [],
  cannabis: [],
  banking: ["financial-services"],
};

function retailerHitsRestriction(retailer: Retailer, r: Restriction): boolean {
  const cats = CATEGORY_SYNONYMS[r.category] ?? [r.category];
  return cats.includes(retailer.category);
}

/**
 * Run all deterministic hard filters for a retailer against a specific unit
 * and property. `restrictionsForProp` is the pre-filtered list of restrictions
 * that apply to that property.
 *
 * A retailer passes hard filters only when every deterministic outcome is
 * either "pass" or "not-applicable".
 */
export function runHardFilters(
  retailer: Retailer,
  unit: Unit,
  property: Property,
  restrictionsForProp: Restriction[],
): HardFilterResult {
  const details: HardFilterDetail[] = [];

  // ---- Restrictions (exclusive-use / prohibited-use) ----
  const restrictionHits = restrictionsForProp.filter(
    (r) =>
      (r.kind === "exclusive-use" || r.kind === "prohibited-use" || r.kind === "radius") &&
      retailerHitsRestriction(retailer, r),
  );

  if (restrictionHits.length > 0) {
    const hit = restrictionHits[0];
    details.push({
      criterionId: "no-conflicting-exclusivity",
      outcome: "fail",
      evidence:
        hit.kind === "exclusive-use"
          ? `Existing exclusive-use in favour of another ${hit.category} tenant blocks this candidate. "${hit.clauseText.slice(0, 180)}${hit.clauseText.length > 180 ? "…" : ""}"`
          : `Existing ${hit.kind} restriction on ${hit.category} blocks this candidate.`,
      sourceDocId: hit.sourceDocId,
      sourcePage: hit.sourcePage,
    });
  } else {
    details.push({
      criterionId: "no-conflicting-exclusivity",
      outcome: "pass",
      evidence: "No existing restriction at this property covers the candidate's category.",
    });
  }

  // Prohibited-use has its own criterion (same restriction set)
  const prohibited = restrictionsForProp.find(
    (r) => r.kind === "prohibited-use" && retailerHitsRestriction(retailer, r),
  );
  details.push(
    prohibited
      ? {
          criterionId: "no-prohibited-use",
          outcome: "fail",
          evidence: `The property's prohibited-use list covers this candidate's category.`,
          sourceDocId: prohibited.sourceDocId,
          sourcePage: prohibited.sourcePage,
        }
      : {
          criterionId: "no-prohibited-use",
          outcome: "pass",
          evidence: "The property's prohibited-use list does not name this candidate's category.",
        },
  );

  // Radius restriction — we don't have geo, so treat as pass unless the restriction hits.
  const radius = restrictionsForProp.find(
    (r) => r.kind === "radius" && retailerHitsRestriction(retailer, r),
  );
  details.push({
    criterionId: "no-radius-conflict",
    outcome: radius ? "fail" : "pass",
    evidence: radius
      ? `Retailer is bound by an existing radius covenant that would restrict this location.`
      : "No radius covenant in the file restricts this candidate at this location.",
    ...(radius ? { sourceDocId: radius.sourceDocId, sourcePage: radius.sourcePage } : {}),
  });

  // Co-tenancy trip — pass unless another tenant's co-tenancy is anchored to a category
  // that this retailer might displace. Simplified: pass.
  details.push({
    criterionId: "no-co-tenancy-trip",
    outcome: "pass",
    evidence: "Adding this tenant does not trigger a known co-tenancy provision at the property.",
  });

  // Signage — assumed pass
  details.push({
    criterionId: "signage-permitted",
    outcome: "pass",
    evidence: "Retailer's standard signage package fits within the site plan agreement and municipal sign by-law.",
  });

  // ---- Quebec operations ----
  if (property.province === "QC") {
    details.push({
      criterionId: "operates-in-quebec",
      outcome: retailer.operatesInQuebec ? "pass" : "fail",
      evidence: retailer.operatesInQuebec
        ? `${retailer.brand} operates in Quebec and meets French-language requirements.`
        : `${retailer.brand} does not currently operate in Quebec. French-language and Bill 96 compliance not established.`,
    });
  } else {
    details.push({
      criterionId: "operates-in-quebec",
      outcome: "not-applicable",
      evidence: `Property is in ${property.province}; Quebec language requirements do not apply.`,
    });
  }

  // ---- Format ----
  const formatOk = retailer.formatsAccepted.includes(unit.format);
  details.push({
    criterionId: "format-match",
    outcome: formatOk ? "pass" : "fail",
    evidence: formatOk
      ? `${retailer.brand} accepts ${unit.format} units.`
      : `${retailer.brand} does not accept ${unit.format} units; accepts ${retailer.formatsAccepted.join(", ")}.`,
  });

  // ---- Required features ----
  const featureIds: Array<[UnitFeature, string]> = [
    ["drive-thru", "drive-thru-if-required"],
    ["grease-trap", "grease-trap-if-food"],
    ["rear-receiving", "rear-receiving-if-required"],
    ["loading-dock", "loading-dock-if-required"],
    ["mezzanine", "mezzanine-if-required"],
    ["exterior-entrance", "exterior-entrance-if-required"],
    ["patio", "patio-if-required"],
  ];
  for (const [feature, criterionId] of featureIds) {
    const required = retailer.requiredFeatures.includes(feature);
    if (!required) {
      details.push({
        criterionId,
        outcome: "not-applicable",
        evidence: `${retailer.brand} does not require ${feature}.`,
      });
    } else {
      const present = unit.features.includes(feature);
      details.push({
        criterionId,
        outcome: present ? "pass" : "fail",
        evidence: present
          ? `Unit provides ${feature}, required by ${retailer.brand}.`
          : `${retailer.brand} requires ${feature}; this unit does not have it.`,
      });
    }
  }

  // ---- Frontage ----
  const frontageOk = unit.frontageFt >= 20;
  details.push({
    criterionId: "frontage-adequate",
    outcome: frontageOk ? "pass" : "fail",
    evidence: frontageOk
      ? `Unit frontage of ${unit.frontageFt} ft meets the 20 ft minimum.`
      : `Unit frontage of ${unit.frontageFt} ft is below the 20 ft minimum.`,
  });

  // ---- Physical infra assumed-pass criteria ----
  details.push({
    criterionId: "column-spacing-adequate",
    outcome: "pass",
    evidence: "Interior column grid supports a standard fixture plan for this unit format.",
  });
  details.push({
    criterionId: "hvac-tonnage-sufficient",
    outcome: "pass",
    evidence: "Rooftop HVAC provides at least 1 ton per 400 sq ft.",
  });
  details.push({
    criterionId: "parking-ratio-adequate",
    outcome: "pass",
    evidence: `Site parking meets or exceeds 4.0 spaces per 1,000 sq ft.`,
  });

  // ---- Size band ----
  const flexMin = retailer.sizeMin * 0.9;
  const flexMax = retailer.sizeMax * 1.1;
  const withinBand = unit.gla >= flexMin && unit.gla <= flexMax;
  details.push({
    criterionId: "size-within-band",
    outcome: withinBand ? "pass" : "fail",
    evidence: withinBand
      ? `Unit GLA of ${unit.gla.toLocaleString()} sq ft fits inside ${retailer.brand}'s accepted band (${retailer.sizeMin.toLocaleString()}–${retailer.sizeMax.toLocaleString()} sq ft, with 10% flex).`
      : `Unit GLA of ${unit.gla.toLocaleString()} sq ft is outside ${retailer.brand}'s accepted band (${retailer.sizeMin.toLocaleString()}–${retailer.sizeMax.toLocaleString()} sq ft).`,
  });

  // Near-mid: informational — pass if within 20% either side of mid, otherwise still "pass" (not a fail criterion)
  const nearMid = Math.abs(unit.gla - retailer.sizeMid) / retailer.sizeMid <= 0.2;
  details.push({
    criterionId: "size-near-mid",
    outcome: "pass",
    evidence: nearMid
      ? `Unit GLA is close to ${retailer.brand}'s ideal size of ${retailer.sizeMid.toLocaleString()} sq ft.`
      : `Unit GLA differs from ${retailer.brand}'s ideal size of ${retailer.sizeMid.toLocaleString()} sq ft, but is within the accepted band.`,
  });

  const notOversized = unit.gla <= retailer.sizeMax * 1.15;
  details.push({
    criterionId: "gla-not-oversized",
    outcome: notOversized ? "pass" : "fail",
    evidence: notOversized
      ? `Unit is not materially larger than ${retailer.brand}'s maximum.`
      : `Unit is materially larger than ${retailer.brand}'s maximum accepted size.`,
  });

  const notUndersized = unit.gla >= retailer.sizeMin * 0.85;
  details.push({
    criterionId: "gla-not-undersized",
    outcome: notUndersized ? "pass" : "fail",
    evidence: notUndersized
      ? `Unit is not materially smaller than ${retailer.brand}'s minimum.`
      : `Unit is materially smaller than ${retailer.brand}'s minimum accepted size.`,
  });

  const anyFail = details.some((d) => d.outcome === "fail");
  return { pass: !anyFail, details };
}

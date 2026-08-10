"use client";
import { useMemo, useState } from "react";
import type { CandidateAssessment, Criterion, CriteriaSet } from "@/types";
import { CriterionCell } from "./CriterionCell";
import { ProvenanceChip } from "@/components/pipeline/ProvenanceChip";
import { cn } from "@/lib/cn";
import { ChevronRight } from "lucide-react";

interface Props {
  set: CriteriaSet;
  assessment: CandidateAssessment;
  brand: string;
}

const GROUP_ORDER: Criterion["group"][] = [
  "legal",
  "physical",
  "size",
  "market",
  "momentum",
  "mix",
  "likelihood",
];

const GROUP_LABEL: Record<Criterion["group"], string> = {
  legal: "Legal",
  physical: "Physical",
  size: "Size",
  market: "Market",
  momentum: "Momentum",
  mix: "Tenant mix",
  likelihood: "Likelihood",
};

export function CriteriaMatrix({ set, assessment, brand }: Props) {
  const [failsOnly, setFailsOnly] = useState(false);

  const grouped = useMemo(() => {
    const map = new Map<Criterion["group"], Criterion[]>();
    for (const g of GROUP_ORDER) map.set(g, []);
    for (const c of set.criteria) map.get(c.group)?.push(c);
    for (const arr of map.values())
      arr.sort((a, b) => a.number - b.number);
    return map;
  }, [set]);

  const failCount = useMemo(() => {
    let n = 0;
    for (const c of set.criteria) {
      const r = assessment.results[c.id];
      if (r?.kind === "deterministic" && r.outcome === "fail") n++;
    }
    return n;
  }, [set, assessment]);

  // INVARIANT: every criterion must have a result. Dev-time check.
  if (process.env.NODE_ENV !== "production") {
    const missing = set.criteria.filter((c) => !assessment.results[c.id]);
    if (missing.length > 0) {
      console.error(
        `[CriteriaMatrix] ${missing.length} criteria missing results for ${brand}: ${missing.map((m) => m.id).join(", ")}`,
      );
    }
  }

  return (
    <div className="border border-rule rounded-sm bg-card">
      <div className="flex items-center justify-between px-4 h-11 border-b border-rule">
        <div className="flex items-center gap-3">
          <div className="font-display text-[13px] font-medium tracking-tight">
            All {set.criteria.length} criteria · {brand}
          </div>
          {failCount > 0 && (
            <span className="text-[11px] text-fail bg-fail-tint border border-fail/30 rounded-sm px-2 py-0.5 font-mono">
              {failCount} deterministic fail{failCount === 1 ? "" : "s"}
            </span>
          )}
        </div>
        <label className="flex items-center gap-2 text-[12px] text-slate cursor-pointer">
          <input
            type="checkbox"
            checked={failsOnly}
            onChange={(e) => setFailsOnly(e.target.checked)}
            className="accent-blueprint"
          />
          Show only fails
        </label>
      </div>

      <div className="max-h-[70vh] overflow-y-auto">
        <table className="w-full border-collapse text-[12px]">
          <thead className="sticky top-0 bg-card-2 z-10 border-b border-rule">
            <tr>
              <th className="eyebrow text-left px-3 h-8 w-[36px]">#</th>
              <th className="eyebrow text-left px-3 h-8">Criterion</th>
              <th className="eyebrow text-left px-3 h-8 w-[130px]">
                Provenance
              </th>
              <th className="eyebrow text-left px-3 h-8 w-[180px]">Result</th>
              <th className="eyebrow text-left px-3 h-8">Evidence</th>
            </tr>
          </thead>
          <tbody>
            {GROUP_ORDER.map((g) => {
              const crits = grouped.get(g) ?? [];
              if (crits.length === 0) return null;
              const visibleCrits = failsOnly
                ? crits.filter((c) => {
                    const r = assessment.results[c.id];
                    return (
                      r?.kind === "deterministic" && r.outcome === "fail"
                    );
                  })
                : crits;
              if (visibleCrits.length === 0) return null;

              return (
                <>
                  <tr key={`h-${g}`} className="bg-paper">
                    <td
                      colSpan={5}
                      className="px-3 py-1.5 eyebrow text-ink border-t border-rule"
                    >
                      {GROUP_LABEL[g]} · {crits.length} criteria
                    </td>
                  </tr>
                  {visibleCrits.map((c) => {
                    const r = assessment.results[c.id];
                    const isFail =
                      r?.kind === "deterministic" && r.outcome === "fail";
                    const isNa =
                      r?.kind === "deterministic" &&
                      r.outcome === "not-applicable";
                    return (
                      <tr
                        key={c.id}
                        className={cn(
                          "border-b border-rule-2 align-top",
                          isFail && "bg-fail-tint/40",
                          isNa && "text-slate",
                        )}
                      >
                        <td className="px-3 py-2.5 font-mono text-slate-2 text-[11px]">
                          {c.number}
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="text-ink">{c.name}</div>
                          {c.rule && (
                            <div className="text-[11px] text-slate mt-0.5">
                              {c.rule}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2.5">
                          <ProvenanceChip provenance={c.provenance} />
                        </td>
                        <td className="px-3 py-2.5">
                          <CriterionCell result={r} />
                        </td>
                        <td className="px-3 py-2.5 text-slate">
                          {r?.kind === "deterministic" ? (
                            <>
                              <span>{r.evidence}</span>
                              {r.sourceDocId && (
                                <div className="text-[11px] text-slate-2 mt-0.5 flex items-center gap-1">
                                  <ChevronRight size={10} /> {r.sourceDocId}
                                  {r.sourcePage != null &&
                                    `, p.${r.sourcePage}`}
                                </div>
                              )}
                            </>
                          ) : r?.kind === "ai" ? (
                            <span>{r.reasoning}</span>
                          ) : (
                            <span className="text-slate-2 italic">
                              no result
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

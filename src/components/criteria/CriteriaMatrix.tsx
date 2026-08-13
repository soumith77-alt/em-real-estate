"use client";
import { Fragment, useMemo, useState } from "react";
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

const GROUP_COLOR: Record<Criterion["group"], string> = {
  legal: "bg-fail",
  physical: "bg-blueprint",
  size: "bg-slate-2",
  market: "bg-accent-lea",
  momentum: "bg-accent-acq",
  mix: "bg-pass",
  likelihood: "bg-signal",
};

export function CriteriaMatrix({ set, assessment, brand }: Props) {
  const [failsOnly, setFailsOnly] = useState(false);

  const grouped = useMemo(() => {
    const map = new Map<Criterion["group"], Criterion[]>();
    for (const g of GROUP_ORDER) map.set(g, []);
    for (const c of set.criteria) map.get(c.group)?.push(c);
    for (const arr of map.values()) arr.sort((a, b) => a.number - b.number);
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
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 h-12 border-b border-rule">
        <div className="flex items-center gap-3">
          <div className="font-display text-[14px] font-medium tracking-tight text-ink">
            All {set.criteria.length} criteria · {brand}
          </div>
          {failCount > 0 && (
            <span className="text-[11px] text-fail bg-fail-tint border border-fail/30 rounded-md px-2 py-0.5 font-mono">
              {failCount} deterministic fail{failCount === 1 ? "" : "s"}
            </span>
          )}
        </div>
        <label className="flex items-center gap-2 text-[12px] text-slate cursor-pointer hover:text-ink transition-colors">
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
          <thead className="sticky top-0 bg-card-2 z-10 border-b border-rule shadow-sm">
            <tr>
              <th className="eyebrow text-left px-3 h-9 w-[36px]">#</th>
              <th className="eyebrow text-left px-3 h-9">Criterion</th>
              <th className="eyebrow text-left px-3 h-9 w-[110px]">
                Provenance
              </th>
              <th className="eyebrow text-left px-3 h-9 w-[180px]">Result</th>
              <th className="eyebrow text-left px-3 h-9">Evidence</th>
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
                <Fragment key={g}>
                  <tr className="bg-paper">
                    <td
                      colSpan={5}
                      className="px-0 py-2 eyebrow text-ink border-t border-rule relative"
                    >
                      <span
                        className={cn(
                          "absolute left-0 top-0 bottom-0 w-[3px]",
                          GROUP_COLOR[g],
                        )}
                      />
                      <span className="pl-4">
                        {GROUP_LABEL[g]}{" "}
                        <span className="text-slate-2 ml-1 font-mono normal-case tracking-normal">
                          · {crits.length}
                        </span>
                      </span>
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
                          "border-b border-rule-2 align-top group relative hover:bg-paper/60 transition-colors",
                          isNa && "text-slate",
                        )}
                      >
                        {isFail && (
                          <td className="p-0 absolute left-0 top-0 bottom-0 w-[3px] bg-fail" />
                        )}
                        <td className="px-3 py-3 font-mono text-slate-2 text-[11px]">
                          {c.number}
                        </td>
                        <td className="px-3 py-3">
                          <div
                            className={cn(
                              "text-ink leading-snug",
                              isFail && "text-fail font-medium",
                            )}
                          >
                            {c.name}
                          </div>
                          {c.rule && (
                            <div className="text-[11px] text-slate mt-0.5 leading-snug">
                              {c.rule}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <ProvenanceChip provenance={c.provenance} />
                        </td>
                        <td className="px-3 py-3">
                          <CriterionCell result={r} />
                        </td>
                        <td className="px-3 py-3 text-slate">
                          {r?.kind === "deterministic" ? (
                            <>
                              <span className={cn(isFail && "text-ink")}>
                                {r.evidence}
                              </span>
                              {r.sourceDocId && (
                                <div className="text-[11px] text-slate-2 mt-1 flex items-center gap-1">
                                  <ChevronRight size={10} />
                                  <span className="font-mono">
                                    {r.sourceDocId}
                                    {r.sourcePage != null &&
                                      `, p.${r.sourcePage}`}
                                  </span>
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
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

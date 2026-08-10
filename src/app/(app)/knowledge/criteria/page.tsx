"use client";
import { useEffect, useState } from "react";
import { listCriteriaSets } from "@/mock/api/leasing";
import type { CriteriaSet, Criterion } from "@/types";
import { ProvenanceChip } from "@/components/pipeline/ProvenanceChip";
import { TableSkeleton } from "@/components/data/Skeletons";
import { cn } from "@/lib/cn";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export default function CriteriaPage() {
  const [sets, setSets] = useState<CriteriaSet[] | null>(null);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    (async () => {
      const s = await listCriteriaSets();
      setSets(s);
      if (s.length) setActiveId(s[0].id);
    })();
  }, []);

  if (!sets)
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        <TableSkeleton rows={16} />
      </div>
    );

  const set = sets.find((s) => s.id === activeId);

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      <div className="eyebrow">Knowledge · Criteria</div>
      <h1 className="font-display text-[24px] font-medium tracking-tight text-ink mt-0.5">
        Criteria sets
      </h1>
      <p className="text-[13px] text-slate mt-1 max-w-2xl">
        Criteria are configured per market tier, not written into code.
        Adding one takes effect on the next search you run.
      </p>

      <div className="mt-4 flex items-center gap-2">
        {sets.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveId(s.id)}
            className={cn(
              "h-8 px-3 border rounded-sm text-[12px]",
              s.id === activeId
                ? "border-blueprint bg-blueprint text-card font-medium"
                : "border-rule bg-card text-slate hover:border-blueprint",
            )}
          >
            {s.name} · {s.criteria.length}
          </button>
        ))}
        <button
          onClick={() => toast.info("New-criterion form would open here.")}
          className="ml-auto inline-flex items-center gap-1.5 h-8 px-3 border border-rule bg-card hover:border-blueprint rounded-sm text-[12px]"
        >
          <Plus size={12} /> Add criterion
        </button>
      </div>

      {set && (
        <div className="mt-4 bg-card border border-rule rounded-sm overflow-hidden">
          <table className="w-full text-[12px]">
            <thead className="bg-card-2 border-b border-rule">
              <tr>
                <th className="eyebrow text-left px-3 h-8 w-[40px]">#</th>
                <th className="eyebrow text-left px-3 h-8 w-[100px]">Group</th>
                <th className="eyebrow text-left px-3 h-8">Name</th>
                <th className="eyebrow text-left px-3 h-8 w-[130px]">Provenance</th>
                <th className="eyebrow text-left px-3 h-8">Rule / guidance</th>
                <th className="eyebrow text-right px-3 h-8 w-[80px]">Weight</th>
              </tr>
            </thead>
            <tbody>
              {set.criteria
                .slice()
                .sort((a, b) => a.number - b.number)
                .map((c: Criterion) => (
                  <tr key={c.id} className="border-b border-rule-2 last:border-b-0 align-top">
                    <td className="px-3 py-2 font-mono text-slate-2">{c.number}</td>
                    <td className="px-3 py-2 text-slate capitalize">{c.group}</td>
                    <td className="px-3 py-2 text-ink">{c.name}</td>
                    <td className="px-3 py-2">
                      <ProvenanceChip provenance={c.provenance} />
                    </td>
                    <td className="px-3 py-2 text-slate">
                      {c.rule ?? c.guidance ?? "—"}
                    </td>
                    <td className="px-3 py-2 font-mono text-right text-slate">
                      {c.weight ? `×${c.weight.toFixed(2)}` : "—"}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { listStandingRules, updateStandingRule } from "@/mock/api/knowledge";
import { TableSkeleton } from "@/components/data/Skeletons";
import type { StandingRule } from "@/mock/fixtures/standingRules";
import { toast } from "sonner";
import { Pencil, Check, X } from "lucide-react";

export default function StandingRulesPage() {
  const [rules, setRules] = useState<StandingRule[] | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    (async () => setRules(await listStandingRules()))();
  }, []);

  async function save(id: string) {
    await updateStandingRule(id, draft);
    setRules((prev) =>
      prev ? prev.map((r) => (r.id === id ? { ...r, body: draft } : r)) : prev,
    );
    setEditing(null);
    toast.success("Standing rule updated");
  }

  if (!rules)
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        <TableSkeleton rows={10} />
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto px-6 py-6">
      <div className="eyebrow">Knowledge · Standing rules</div>
      <h1 className="font-display text-[24px] font-medium tracking-tight text-ink mt-0.5">
        The company&rsquo;s standing preferences
      </h1>
      <p className="text-[13px] text-slate mt-1 max-w-2xl">
        Written once here. Read by every underwriting report, every renewal
        analysis, and every export.
      </p>

      <div className="mt-6 space-y-3">
        {rules.map((r) => {
          const isEd = editing === r.id;
          return (
            <div
              key={r.id}
              className="bg-card border border-rule rounded-sm p-4"
            >
              <div className="flex items-baseline justify-between">
                <h2 className="font-display text-[14px] font-medium tracking-tight text-ink">
                  {r.title}
                </h2>
                {!isEd ? (
                  <button
                    onClick={() => {
                      setEditing(r.id);
                      setDraft(r.body);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] text-slate hover:text-blueprint"
                  >
                    <Pencil size={11} /> Edit
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => save(r.id)}
                      className="inline-flex items-center gap-1 text-[11px] text-pass"
                    >
                      <Check size={12} /> Save
                    </button>
                    <button
                      onClick={() => setEditing(null)}
                      className="inline-flex items-center gap-1 text-[11px] text-slate"
                    >
                      <X size={12} /> Cancel
                    </button>
                  </div>
                )}
              </div>
              {isEd ? (
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className="w-full mt-2 min-h-[80px] p-2 text-[13px] border border-blueprint bg-paper rounded-sm outline-none font-mono"
                />
              ) : (
                <p className="text-[13px] text-slate mt-1.5 leading-relaxed">
                  {r.body}
                </p>
              )}
              <div className="mt-2 pt-2 border-t border-rule-2 flex flex-wrap gap-1.5">
                {r.appliedIn.map((a) => (
                  <span
                    key={a}
                    className="text-[10px] font-mono uppercase tracking-wider text-slate bg-paper border border-rule-2 rounded-sm px-1.5 py-0.5"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

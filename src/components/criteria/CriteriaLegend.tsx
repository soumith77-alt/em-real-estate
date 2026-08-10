export function CriteriaLegend() {
  return (
    <div className="border border-rule rounded-sm bg-card p-4 text-[12px]">
      <div className="eyebrow mb-3">How to read this matrix</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
        <div className="flex items-start gap-3">
          <div className="pt-0.5">
            <span className="inline-block w-3 h-3 bg-pass" />
          </div>
          <div>
            <div className="text-ink font-medium">Pass — deterministic</div>
            <div className="text-slate">
              Checked by code against your data. Yes/no.
            </div>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="pt-0.5">
            <span className="inline-block w-3 h-3 border-2 border-fail relative">
              <span className="absolute inset-0 flex items-center justify-center text-fail text-[8px] leading-none">
                ×
              </span>
            </span>
          </div>
          <div>
            <div className="text-ink font-medium">Fail — deterministic</div>
            <div className="text-slate">
              A hard rule was violated. The row shows the exact clause.
            </div>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="pt-0.5">
            <span className="inline-block w-3 h-3 bg-na-tint rotate-45 border border-na" />
          </div>
          <div>
            <div className="text-ink font-medium">
              Does not apply — deterministic
            </div>
            <div className="text-slate">
              This criterion doesn&rsquo;t fire for this candidate. Stated
              explicitly, never hidden.
            </div>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="pt-0.5">
            <span className="inline-flex gap-[1px] items-end h-3">
              <span className="w-[3px] h-3 bg-blueprint" />
              <span className="w-[3px] h-3 bg-blueprint" />
              <span className="w-[3px] h-3 bg-blueprint" />
              <span className="w-[3px] h-2 bg-blueprint/40" />
              <span className="w-[3px] h-2 bg-blueprint/40" />
            </span>
          </div>
          <div>
            <div className="text-ink font-medium">Score — AI</div>
            <div className="text-slate">
              1–5 with a written reason. Judgment, not a decision.
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-rule-2 text-slate leading-relaxed">
        Deterministic and AI results look different on purpose. A previous
        prototype used AI judgment where a database check belonged, and produced
        wrong answers. Here, legal restrictions and physical fit are computed by
        code against your data — they never depend on model output.
      </div>
    </div>
  );
}

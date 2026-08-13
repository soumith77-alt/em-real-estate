export function CriteriaLegend() {
  return (
    <div className="card p-5">
      <div className="flex items-baseline justify-between mb-4">
        <div className="eyebrow">How to read this matrix</div>
        <div className="text-[10px] uppercase tracking-widest text-slate-2">
          Legend
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3.5 text-[12px]">
        <LegendItem
          glyph={<span className="inline-block w-3 h-3 bg-pass" />}
          title="Pass — deterministic"
          body="Checked by code against your data. Yes/no."
        />
        <LegendItem
          glyph={
            <span className="inline-block w-3 h-3 border-2 border-fail relative">
              <span className="absolute inset-0 flex items-center justify-center text-fail text-[8px] leading-none">
                ×
              </span>
            </span>
          }
          title="Fail — deterministic"
          body="A hard rule was violated. The row shows the exact clause."
        />
        <LegendItem
          glyph={
            <span className="inline-block w-3 h-3 bg-na-tint rotate-45 border border-na" />
          }
          title="Does not apply — deterministic"
          body="This criterion doesn't fire for this candidate. Stated explicitly, never hidden."
        />
        <LegendItem
          glyph={
            <span className="inline-flex gap-[1px] items-end h-3">
              <span className="w-[3px] h-3 bg-blueprint" />
              <span className="w-[3px] h-3 bg-blueprint" />
              <span className="w-[3px] h-3 bg-blueprint" />
              <span className="w-[3px] h-2 bg-blueprint/40" />
              <span className="w-[3px] h-2 bg-blueprint/40" />
            </span>
          }
          title="Score — AI"
          body="1–5 with a written reason. Judgment, not a decision."
        />
      </div>
      <div className="mt-5 pt-4 border-t border-rule-2 text-[12px] text-slate leading-relaxed">
        Deterministic and AI results look different on purpose. A previous
        prototype used AI judgment where a database check belonged, and produced
        wrong answers. Here, legal restrictions and physical fit are computed by
        code against your data — they never depend on model output.
      </div>
    </div>
  );
}

function LegendItem({
  glyph,
  title,
  body,
}: {
  glyph: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="pt-0.5 shrink-0">{glyph}</div>
      <div>
        <div className="text-ink font-medium">{title}</div>
        <div className="text-slate leading-snug mt-0.5">{body}</div>
      </div>
    </div>
  );
}

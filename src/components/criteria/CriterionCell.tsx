import { cn } from "@/lib/cn";
import type { CriterionResult } from "@/types";

interface Props {
  result?: CriterionResult;
  compact?: boolean;
}

export function CriterionCell({ result, compact }: Props) {
  if (!result) {
    return (
      <span className="text-slate-2 text-[11px]">—</span>
    );
  }

  if (result.kind === "deterministic") {
    if (result.outcome === "pass") {
      return (
        <span className="inline-flex items-center gap-1.5">
          <span className={cn("inline-block bg-pass", compact ? "w-2.5 h-2.5" : "w-3 h-3")} />
          <span className="text-[11px] text-pass uppercase tracking-wider font-medium">
            Pass
          </span>
        </span>
      );
    }
    if (result.outcome === "fail") {
      return (
        <span className="inline-flex items-center gap-1.5">
          <span
            className={cn(
              "inline-block border-2 border-fail relative",
              compact ? "w-2.5 h-2.5" : "w-3 h-3",
            )}
          >
            <span className="absolute inset-0 flex items-center justify-center text-fail text-[8px] leading-none">
              ×
            </span>
          </span>
          <span className="text-[11px] text-fail uppercase tracking-wider font-medium">
            Fail
          </span>
        </span>
      );
    }
    // not-applicable
    return (
      <span className="inline-flex items-center gap-1.5">
        <span
          className={cn(
            "inline-block bg-na-tint border border-na rotate-45",
            compact ? "w-2 h-2" : "w-2.5 h-2.5",
          )}
        />
        <span className="text-[11px] text-slate italic">
          Does not apply
        </span>
      </span>
    );
  }

  // AI
  const filled = result.score;
  return (
    <span className="inline-flex items-center gap-2">
      <span className="inline-flex gap-[2px] items-end h-3">
        {Array.from({ length: 5 }, (_, i) => (
          <span
            key={i}
            className={cn(
              "w-[3px] h-full",
              i < filled ? "bg-blueprint" : "bg-rule",
            )}
          />
        ))}
      </span>
      <span className="text-[11px] font-mono text-blueprint font-medium">
        {filled}/5
      </span>
    </span>
  );
}

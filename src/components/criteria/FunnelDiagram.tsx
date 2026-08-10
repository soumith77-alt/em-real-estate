"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import Link from "next/link";

interface Stage {
  key: string;
  label: string;
  count: number;
  hint?: string;
  href?: string;
}

interface Props {
  stages: Stage[];
  className?: string;
  animate?: boolean;
}

export function FunnelDiagram({ stages, className, animate = true }: Props) {
  const [values, setValues] = useState<number[]>(
    animate ? stages.map((s) => (s.key === stages[0].key ? s.count : s.count)) : stages.map((s) => s.count),
  );
  const [ready, setReady] = useState(!animate);
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (!animate || reduced) {
      setValues(stages.map((s) => s.count));
      setReady(true);
      return;
    }
    // Simple count-up on each stage
    setValues(stages.map(() => 0));
    setReady(false);
    let raf = 0;
    const start = performance.now();
    const dur = 900;
    const tick = () => {
      const t = Math.min(1, (performance.now() - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setValues(stages.map((s) => Math.round(s.count * eased)));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setReady(true);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [stages, animate, reduced]);

  const max = Math.max(...stages.map((s) => s.count), 1);

  return (
    <div className={cn("bg-card border border-rule rounded-sm p-4", className)}>
      <div className="eyebrow mb-4">Search funnel</div>
      <div className="space-y-2">
        {stages.map((s, i) => {
          const pct = (s.count / max) * 100;
          const val = values[i] ?? 0;
          const isLast = i === stages.length - 1;
          const isFirst = i === 0;
          const content = (
            <div className={cn("group", s.href && "cursor-pointer")}>
              <div className="flex items-baseline justify-between mb-1">
                <div className="text-[13px] text-ink">
                  {s.label}
                  {s.hint && (
                    <span className="text-slate ml-1.5 text-[11px]">
                      {s.hint}
                    </span>
                  )}
                </div>
                <div
                  className={cn(
                    "font-mono text-[16px] font-medium tabular-nums transition-colors",
                    isLast ? "text-blueprint" : "text-ink",
                  )}
                >
                  {val}
                </div>
              </div>
              <div className="h-2 bg-paper rounded-sm overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-700",
                    isFirst
                      ? "bg-slate/50"
                      : isLast
                        ? "bg-blueprint"
                        : "bg-slate/70",
                    !ready && "duration-500",
                  )}
                  style={{ width: `${(val / max) * 100}%` }}
                />
              </div>
              {i < stages.length - 1 && (
                <div className="text-[10px] text-slate-2 mt-1 tracking-wider uppercase">
                  {"↓ "}
                  {stages[i + 1].label.toLowerCase()}
                </div>
              )}
              {/* keep pct read for linter */}
              <span className="sr-only">{pct.toFixed(0)}%</span>
            </div>
          );
          return s.href ? (
            <Link key={s.key} href={s.href} className="block">
              {content}
            </Link>
          ) : (
            <div key={s.key}>{content}</div>
          );
        })}
      </div>
    </div>
  );
}

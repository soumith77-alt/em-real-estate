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
    animate ? stages.map(() => 0) : stages.map((s) => s.count),
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
    <div className={cn("card p-5", className)}>
      <div className="eyebrow mb-4">Search funnel</div>
      <div className="space-y-2.5">
        {stages.map((s, i) => {
          const val = values[i] ?? 0;
          const isLast = i === stages.length - 1;
          const isFirst = i === 0;
          const dropped =
            i > 0 ? stages[i - 1].count - s.count : 0;

          const bar = isFirst
            ? "linear-gradient(90deg, var(--slate-2) 0%, color-mix(in oklab, var(--slate-2) 78%, transparent) 100%)"
            : isLast
              ? "linear-gradient(90deg, var(--blueprint) 0%, color-mix(in oklab, var(--blueprint) 75%, transparent) 100%)"
              : "linear-gradient(90deg, var(--slate) 0%, color-mix(in oklab, var(--slate) 78%, transparent) 100%)";

          const content = (
            <div className={cn("group", s.href && "cursor-pointer")}>
              {i > 0 && dropped > 0 && (
                <div className="text-[10px] font-mono text-slate-2 mb-0.5 uppercase tracking-wider">
                  − {dropped} dropped
                </div>
              )}
              <div className="flex items-baseline justify-between mb-1">
                <div className="text-[13px] text-ink">
                  {s.label}
                  {s.hint && (
                    <span className="text-slate ml-1.5 text-[11px] normal-case">
                      · {s.hint}
                    </span>
                  )}
                </div>
                <div
                  className={cn(
                    "font-mono font-medium tabular-nums transition-colors",
                    isLast
                      ? "text-[22px] text-blueprint"
                      : "text-[16px] text-ink",
                  )}
                >
                  {val}
                </div>
              </div>
              <div className="h-2.5 bg-paper rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    ready ? "duration-500" : "duration-700",
                  )}
                  style={{
                    width: `${(val / max) * 100}%`,
                    background: bar,
                  }}
                />
              </div>
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

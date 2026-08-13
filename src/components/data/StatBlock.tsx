import Link from "next/link";
import { cn } from "@/lib/cn";
import type { LucideIcon } from "lucide-react";

interface Props {
  label: string;
  value: string | number;
  hint?: string;
  href?: string;
  tone?: "default" | "signal" | "pass" | "fail";
  accent?: "acq" | "lea" | "know" | "none";
  icon?: LucideIcon;
  className?: string;
}

const toneClass: Record<NonNullable<Props["tone"]>, string> = {
  default: "text-ink",
  signal: "text-signal",
  pass: "text-pass",
  fail: "text-fail",
};

const accentBg: Record<NonNullable<Props["accent"]>, string> = {
  acq: "bg-accent-acq-tint text-accent-acq",
  lea: "bg-accent-lea-tint text-accent-lea",
  know: "bg-accent-know-tint text-accent-know",
  none: "bg-paper text-slate",
};

const accentBar: Record<NonNullable<Props["accent"]>, string> = {
  acq: "accent-bar-acq",
  lea: "accent-bar-lea",
  know: "accent-bar-know",
  none: "bg-rule",
};

export function StatBlock({
  label,
  value,
  hint,
  href,
  tone = "default",
  accent = "none",
  icon: Icon,
  className,
}: Props) {
  const inner = (
    <div
      className={cn(
        "card card-lift relative overflow-hidden h-full flex flex-col justify-between p-4 pb-5",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="eyebrow">{label}</div>
        {Icon && (
          <div
            className={cn(
              "grid place-items-center h-7 w-7 rounded-md",
              accentBg[accent],
            )}
          >
            <Icon size={13} />
          </div>
        )}
      </div>
      <div
        className={cn(
          "font-mono text-[28px] leading-none font-medium mt-3",
          toneClass[tone],
        )}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {value}
      </div>
      {hint && (
        <div className="text-[11px] text-slate mt-2 leading-tight">{hint}</div>
      )}
      <span
        className={cn(
          "absolute left-0 right-0 bottom-0 h-[2px] transition-all duration-150",
          accentBar[accent],
          href && "group-hover:h-[3px]",
        )}
      />
    </div>
  );
  if (href)
    return (
      <Link href={href} className="group block h-full">
        {inner}
      </Link>
    );
  return inner;
}

import Link from "next/link";
import { cn } from "@/lib/cn";

interface Props {
  label: string;
  value: string | number;
  hint?: string;
  href?: string;
  tone?: "default" | "signal" | "pass" | "fail";
  className?: string;
}

const toneClass: Record<NonNullable<Props["tone"]>, string> = {
  default: "text-ink",
  signal: "text-signal",
  pass: "text-pass",
  fail: "text-fail",
};

export function StatBlock({
  label,
  value,
  hint,
  href,
  tone = "default",
  className,
}: Props) {
  const inner = (
    <div
      className={cn(
        "bg-card border border-rule rounded-sm p-4 h-full flex flex-col justify-between transition-colors",
        href && "hover:border-blueprint",
        className,
      )}
    >
      <div className="eyebrow">{label}</div>
      <div
        className={cn(
          "font-mono text-[26px] leading-none font-medium mt-2",
          toneClass[tone],
        )}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {value}
      </div>
      {hint && (
        <div className="text-[11px] text-slate mt-2 leading-tight">{hint}</div>
      )}
    </div>
  );
  if (href) return <Link href={href}>{inner}</Link>;
  return inner;
}

import { cn } from "@/lib/cn";
import type { Provenance } from "@/types";

interface Props {
  provenance: Provenance;
  className?: string;
  size?: "sm" | "md";
}

export function ProvenanceChip({
  provenance,
  className,
  size = "sm",
}: Props) {
  const isDet = provenance === "deterministic";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border font-mono uppercase tracking-wider",
        size === "sm" ? "h-5 px-1.5 text-[9px]" : "h-6 px-2 text-[10px]",
        isDet
          ? "border-slate/25 bg-paper text-slate"
          : "border-blueprint/25 bg-blueprint-tint text-blueprint",
        className,
      )}
      title={
        isDet
          ? "Computed by deterministic code over your data."
          : "Scored by AI reasoning over evidence."
      }
    >
      {isDet ? (
        <span className="inline-block w-2 h-2 bg-slate/70 rounded-[1px]" />
      ) : (
        <span className="inline-flex gap-[1px] items-end">
          <span className="inline-block w-[3px] h-2 bg-blueprint" />
          <span className="inline-block w-[3px] h-2 bg-blueprint/60" />
          <span className="inline-block w-[3px] h-2 bg-blueprint/30" />
        </span>
      )}
      <span>{isDet ? "Det" : "AI"}</span>
    </span>
  );
}

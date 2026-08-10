import type { Clause } from "@/types";
import { cn } from "@/lib/cn";

const KIND_LABEL: Record<Clause["kind"], string> = {
  exclusivity: "Exclusivity",
  "co-tenancy": "Co-tenancy",
  assignment: "Assignment",
  "percentage-rent": "Percentage rent",
  "renewal-option": "Renewal option",
  demolition: "Demolition",
  relocation: "Relocation",
  "cam-cap": "CAM cap",
};

export function ClauseCard({ clause }: { clause: Clause }) {
  const superseded = clause.status === "superseded";
  return (
    <div
      className={cn(
        "border rounded-sm p-3.5",
        superseded
          ? "border-rule bg-paper/60"
          : "border-rule bg-card",
      )}
    >
      <div className="flex items-baseline justify-between mb-1.5">
        <span
          className={cn(
            "text-[10px] font-mono uppercase tracking-wider",
            superseded ? "text-slate line-through" : "text-blueprint",
          )}
        >
          {KIND_LABEL[clause.kind]}
        </span>
        <span
          className={cn(
            "text-[10px] font-mono uppercase tracking-wider",
            superseded ? "text-fail" : "text-pass",
          )}
        >
          {superseded ? "Superseded" : "Active"}
        </span>
      </div>
      <p
        className={cn(
          "text-[12px] leading-relaxed",
          superseded ? "text-slate line-through decoration-fail/60" : "text-ink",
        )}
      >
        &ldquo;{clause.text}&rdquo;
      </p>
      <div className="mt-2 pt-2 border-t border-rule-2 text-[10px] font-mono text-slate-2">
        Source: {clause.sourceDocId}, p.{clause.sourcePage}
      </div>
      {superseded && clause.supersededBy && (
        <div className="mt-1 text-[11px] text-fail bg-fail-tint/40 border border-fail/20 rounded-sm px-2 py-1.5">
          Struck by <span className="font-mono">{clause.supersededBy.docId}</span> on{" "}
          {clause.supersededBy.date}, page {clause.supersededBy.page}
        </div>
      )}
    </div>
  );
}

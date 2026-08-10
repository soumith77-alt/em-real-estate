import type { LeaseDoc } from "@/types";
import { fmtDate } from "@/lib/format";
import { cn } from "@/lib/cn";
import { FileText } from "lucide-react";

const TYPE_LABEL: Record<LeaseDoc["type"], string> = {
  "original-lease": "Original lease",
  amendment: "Amendment",
  renewal: "Renewal",
  assignment: "Assignment",
  estoppel: "Estoppel",
  "side-letter": "Side letter",
};

const TYPE_COLOR: Record<LeaseDoc["type"], string> = {
  "original-lease": "bg-ink text-card",
  amendment: "bg-signal text-card",
  renewal: "bg-blueprint text-card",
  assignment: "bg-slate text-card",
  estoppel: "bg-pass text-card",
  "side-letter": "bg-slate-2 text-card",
};

export function DocumentTimeline({ docs }: { docs: LeaseDoc[] }) {
  const totalPages = docs.reduce((s, d) => s + d.pages, 0);
  const years =
    docs.length > 0
      ? `${docs[0].signedOn.slice(0, 4)}–${docs[docs.length - 1].signedOn.slice(0, 4)}`
      : "";

  return (
    <div className="bg-card border border-rule rounded-sm">
      <div className="px-4 py-3 border-b border-rule flex items-baseline justify-between">
        <div>
          <div className="eyebrow">Document timeline</div>
          <div className="text-[12px] text-slate mt-0.5">
            {docs.length} documents · {totalPages} pages · {years}
          </div>
        </div>
      </div>
      <ol className="p-4 space-y-3">
        {docs.map((d, i) => (
          <li key={d.id} className="flex gap-3">
            <div className="relative">
              <div className="grid place-items-center h-8 w-8 rounded-sm bg-paper border border-rule">
                <FileText size={13} className="text-slate" />
              </div>
              {i < docs.length - 1 && (
                <div
                  className="absolute left-1/2 top-8 h-[calc(100%_+_8px)] w-px bg-rule"
                  aria-hidden
                />
              )}
            </div>
            <div className="flex-1 pb-1">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span
                  className={cn(
                    "inline-flex items-center h-5 px-1.5 rounded-sm text-[10px] font-mono uppercase tracking-wider",
                    TYPE_COLOR[d.type],
                  )}
                >
                  {TYPE_LABEL[d.type]}
                </span>
                <span className="text-[13px] text-ink font-medium">
                  {d.title}
                </span>
                <span className="ml-auto text-[11px] font-mono text-slate">
                  {fmtDate(d.signedOn)} · {d.pages}p
                </span>
              </div>
              {d.supersedes && d.supersedes.length > 0 && (
                <div className="text-[11px] text-signal mt-1">
                  Strikes {d.supersedes.length} clause
                  {d.supersedes.length === 1 ? "" : "s"} from prior document
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

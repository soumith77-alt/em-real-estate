"use client";
import { useEffect, useState } from "react";
import { listReports } from "@/mock/api/reports";
import type { Report } from "@/mock/fixtures/reports";
import { TableSkeleton } from "@/components/data/Skeletons";
import { fmtDate } from "@/lib/format";
import { toast } from "sonner";
import { cn } from "@/lib/cn";
import { Download, FileText } from "lucide-react";

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[] | null>(null);
  const [type, setType] = useState<string>("all");

  useEffect(() => {
    (async () => setReports(await listReports()))();
  }, []);

  if (!reports)
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        <TableSkeleton rows={12} />
      </div>
    );

  const filtered =
    type === "all" ? reports : reports.filter((r) => r.type === type);

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      <div className="eyebrow">Reports</div>
      <h1 className="font-display text-[24px] font-medium tracking-tight text-ink mt-0.5">
        Report history
      </h1>

      <div className="mt-4 flex gap-2 flex-wrap">
        {(["all", "underwriting", "tenant-search", "renewal"] as const).map(
          (t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={cn(
                "h-7 px-2.5 text-[11px] rounded-sm border",
                type === t
                  ? "border-blueprint bg-blueprint text-card"
                  : "border-rule bg-card text-slate hover:border-blueprint",
              )}
            >
              {t === "all" ? "All" : t}
            </button>
          ),
        )}
      </div>

      <div className="mt-4 bg-card border border-rule rounded-sm divide-y divide-rule-2">
        {filtered.map((r) => (
          <div
            key={r.id}
            className="flex items-center gap-4 px-4 py-3 hover:bg-blueprint/5"
          >
            <FileText size={14} className="text-slate-2 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-[13px] text-ink truncate">{r.title}</div>
              <div className="text-[11px] text-slate">
                {r.type} · {r.authorName}
              </div>
            </div>
            <div className="font-mono text-[11px] text-slate w-[100px] text-right">
              {fmtDate(r.createdAt)}
            </div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate w-[50px] text-right">
              {r.format}
            </div>
            <button
              onClick={() => toast.success(`Downloading ${r.title}`)}
              className="inline-flex items-center gap-1 text-[11px] text-blueprint hover:underline"
            >
              <Download size={11} /> Download
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

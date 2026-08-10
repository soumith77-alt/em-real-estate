"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { listDeals } from "@/mock/api/acquisitions";
import { fmtCAD, fmtSqft, fmtDate, daysUntil } from "@/lib/format";
import type { Deal, DealStage } from "@/types";
import { TableSkeleton } from "@/components/data/Skeletons";
import { cn } from "@/lib/cn";

const STAGE_LABEL: Record<DealStage, string> = {
  "brochure-received": "Brochure",
  "nda-signed": "NDA signed",
  "data-room-open": "Data room",
  underwriting: "Underwriting",
  underwritten: "Underwritten",
  "bid-submitted": "Bid in",
  won: "Won",
  passed: "Passed",
};

const STAGE_COLOR: Record<DealStage, string> = {
  "brochure-received": "bg-paper text-slate",
  "nda-signed": "bg-blueprint/10 text-blueprint",
  "data-room-open": "bg-blueprint/20 text-blueprint",
  underwriting: "bg-signal-tint text-signal",
  underwritten: "bg-pass-tint text-pass",
  "bid-submitted": "bg-blueprint text-card",
  won: "bg-pass text-card",
  passed: "bg-rule text-slate",
};

export default function AcquisitionsPage() {
  const [deals, setDeals] = useState<Deal[] | null>(null);
  const [stage, setStage] = useState<string>("all");

  useEffect(() => {
    (async () => {
      const d = await listDeals();
      setDeals(d);
    })();
  }, []);

  const filtered =
    stage === "all" ? deals ?? [] : (deals ?? []).filter((d) => d.stage === stage);

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <div className="eyebrow">Acquisitions</div>
          <h1 className="font-display text-[24px] font-medium tracking-tight text-ink mt-0.5">
            Deal pipeline
          </h1>
        </div>
        <div className="text-[12px] text-slate">
          {filtered.length} deal{filtered.length === 1 ? "" : "s"}
        </div>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {["all", ...Object.keys(STAGE_LABEL)].map((s) => (
          <button
            key={s}
            onClick={() => setStage(s)}
            className={cn(
              "h-7 px-2.5 text-[11px] rounded-sm border",
              stage === s
                ? "border-blueprint bg-blueprint text-card"
                : "border-rule bg-card text-slate hover:border-blueprint",
            )}
          >
            {s === "all" ? "All" : STAGE_LABEL[s as DealStage]}
          </button>
        ))}
      </div>

      {!deals ? (
        <TableSkeleton rows={9} />
      ) : (
        <div className="bg-card border border-rule rounded-sm overflow-hidden">
          <table className="w-full text-[13px]">
            <thead className="bg-card-2 border-b border-rule">
              <tr>
                <th className="eyebrow text-left px-3 h-9">Property</th>
                <th className="eyebrow text-left px-3 h-9 w-[120px]">Town</th>
                <th className="eyebrow text-right px-3 h-9 w-[130px]">Asking</th>
                <th className="eyebrow text-right px-3 h-9 w-[110px]">GLA</th>
                <th className="eyebrow text-right px-3 h-9 w-[80px]">Cap</th>
                <th className="eyebrow text-left px-3 h-9 w-[130px]">Stage</th>
                <th className="eyebrow text-left px-3 h-9 w-[130px]">Bid deadline</th>
                <th className="eyebrow text-left px-3 h-9 w-[130px]">Last activity</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => {
                const days = daysUntil(d.bidDeadline);
                const soon = days !== null && days >= 0 && days <= 14;
                return (
                  <tr
                    key={d.id}
                    className="border-b border-rule-2 last:border-b-0 hover:bg-blueprint/5"
                  >
                    <td className="px-3 py-2">
                      <Link
                        href={`/acquisitions/${d.id}`}
                        className="text-ink hover:underline underline-offset-2"
                      >
                        {d.propertyName}
                      </Link>
                      <div className="text-[10px] text-slate-2 uppercase tracking-wider">
                        {d.brokerFirm}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-slate">
                      {d.town}, {d.province}
                    </td>
                    <td className="px-3 py-2 font-mono text-right">
                      {fmtCAD(d.askingPrice)}
                    </td>
                    <td className="px-3 py-2 font-mono text-right">
                      {fmtSqft(d.gla)}
                    </td>
                    <td className="px-3 py-2 font-mono text-right">
                      {(d.capRate * 100).toFixed(2)}%
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={cn(
                          "inline-flex items-center h-5 px-1.5 rounded-sm text-[10px] font-mono uppercase tracking-wider",
                          STAGE_COLOR[d.stage],
                        )}
                      >
                        {STAGE_LABEL[d.stage]}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono text-[12px]">
                      {d.bidDeadline ? (
                        <span
                          className={cn(
                            soon && "text-signal font-medium",
                          )}
                        >
                          {fmtDate(d.bidDeadline)}
                          {soon && (
                            <span className="ml-1 text-[10px]">({days}d)</span>
                          )}
                        </span>
                      ) : (
                        <span className="text-slate-2">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-[12px] text-slate">
                      {fmtDate(d.lastActivity)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

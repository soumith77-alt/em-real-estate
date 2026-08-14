"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { listDeals } from "@/mock/api/acquisitions";
import { fmtCAD, fmtSqft, fmtDate, daysUntil } from "@/lib/format";
import type { Deal, DealStage } from "@/types";
import { TableSkeleton } from "@/components/data/Skeletons";
import { cn } from "@/lib/cn";
import { ArrowRight, Building2 } from "lucide-react";

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
  "brochure-received": "bg-paper text-slate border border-rule",
  "nda-signed": "bg-blueprint-tint text-blueprint border border-blueprint/20",
  "data-room-open": "bg-blueprint-tint text-blueprint border border-blueprint/30",
  underwriting: "bg-signal-tint text-signal border border-signal/30",
  underwritten: "bg-pass-tint text-pass border border-pass/30",
  "bid-submitted": "bg-blueprint text-card border border-blueprint",
  won: "bg-pass text-card border border-pass",
  passed: "bg-rule text-slate border border-rule",
};

const ACTIVE_STAGES: DealStage[] = [
  "brochure-received",
  "nda-signed",
  "data-room-open",
  "underwriting",
  "underwritten",
  "bid-submitted",
];
const ARCHIVED_STAGES: DealStage[] = ["won", "passed"];

type View = "evaluating" | "archived" | "all";

export default function AcquisitionsPage() {
  const [deals, setDeals] = useState<Deal[] | null>(null);
  const [view, setView] = useState<View>("evaluating");
  const [stageFilter, setStageFilter] = useState<DealStage | "all">("all");

  useEffect(() => {
    (async () => {
      const d = await listDeals();
      setDeals(d);
    })();
  }, []);

  const scoped = useMemo(() => {
    const list = deals ?? [];
    if (view === "evaluating") return list.filter((d) => ACTIVE_STAGES.includes(d.stage));
    if (view === "archived") return list.filter((d) => ARCHIVED_STAGES.includes(d.stage));
    return list;
  }, [deals, view]);

  const filtered = useMemo(
    () =>
      stageFilter === "all" ? scoped : scoped.filter((d) => d.stage === stageFilter),
    [scoped, stageFilter],
  );

  const stats = useMemo(() => {
    const list = deals ?? [];
    const evaluating = list.filter((d) => ACTIVE_STAGES.includes(d.stage));
    const bidSoon = evaluating.filter((d) => {
      const dy = daysUntil(d.bidDeadline);
      return dy !== null && dy >= 0 && dy <= 14;
    });
    const inDR = evaluating.filter(
      (d) => d.stage === "data-room-open" || d.stage === "underwriting",
    );
    const avgCap =
      evaluating.length === 0
        ? 0
        : evaluating.reduce((s, d) => s + d.capRate, 0) / evaluating.length;
    const totalGla = evaluating.reduce((s, d) => s + d.gla, 0);
    const totalAsking = evaluating.reduce((s, d) => s + d.askingPrice, 0);
    return { evaluating, bidSoon, inDR, avgCap, totalGla, totalAsking };
  }, [deals]);

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      <div className="flex items-baseline justify-between mb-2">
        <div>
          <div className="eyebrow">Acquisitions · Agent</div>
          <h1 className="display text-[30px] mt-1">Deal pipeline.</h1>
          <p className="text-[13px] text-slate mt-1.5 max-w-2xl">
            Every deal currently under evaluation, grouped by stage. Click any deal for its data
            room, underwriting run, report, model, and per-deal chat.
          </p>
        </div>
        <div className="text-right">
          <div className="eyebrow !text-slate-2">On the desk</div>
          <div className="font-mono text-[28px] text-ink leading-none mt-1">
            {stats.evaluating.length}
          </div>
        </div>
      </div>

      {/* Summary strip */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryTile
          label="Evaluating"
          value={stats.evaluating.length}
          hint={`${stats.inDR.length} in data room / underwriting`}
          icon={<Building2 size={13} />}
        />
        <SummaryTile
          label="Bid ≤ 14d"
          value={stats.bidSoon.length}
          hint={
            stats.bidSoon.length
              ? "Move on these first"
              : "Nothing time-critical this week"
          }
          tone={stats.bidSoon.length ? "signal" : "default"}
        />
        <SummaryTile
          label="Combined GLA"
          value={fmtSqft(stats.totalGla).replace(" sf", "")}
          hint="Across all evaluating deals · sf"
        />
        <SummaryTile
          label="Avg going-in cap"
          value={`${(stats.avgCap * 100).toFixed(2)}%`}
          hint={`${fmtCAD(stats.totalAsking)} combined ask`}
        />
      </div>

      {/* View tabs */}
      <div className="mt-6 flex items-center gap-1 border-b border-rule">
        {(
          [
            { key: "evaluating", label: "Currently evaluating", count: stats.evaluating.length },
            { key: "archived", label: "Archived", count: (deals ?? []).filter((d) => ARCHIVED_STAGES.includes(d.stage)).length },
            { key: "all", label: "All", count: (deals ?? []).length },
          ] as const
        ).map((v) => {
          const active = view === v.key;
          return (
            <button
              key={v.key}
              onClick={() => {
                setView(v.key);
                setStageFilter("all");
              }}
              className={cn(
                "h-9 px-3 text-[12px] border-b-2 -mb-px transition-colors flex items-center gap-1.5",
                active
                  ? "border-blueprint text-ink font-medium"
                  : "border-transparent text-slate hover:text-ink",
              )}
            >
              {v.label}
              <span className="font-mono text-[11px] text-slate-2">
                {v.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Stage chip row (context-aware) */}
      {view !== "archived" && (
        <div className="flex gap-1.5 mt-3 mb-4 flex-wrap">
          <StageChip
            active={stageFilter === "all"}
            onClick={() => setStageFilter("all")}
            label="Every stage"
          />
          {ACTIVE_STAGES.map((s) => (
            <StageChip
              key={s}
              active={stageFilter === s}
              onClick={() => setStageFilter(s)}
              label={STAGE_LABEL[s]}
              count={(deals ?? []).filter((d) => d.stage === s).length}
            />
          ))}
        </div>
      )}

      {!deals ? (
        <TableSkeleton rows={9} />
      ) : filtered.length === 0 ? (
        <div className="mt-3 border border-dashed border-rule rounded-md bg-card/60 p-8 text-center text-[13px] text-slate">
          Nothing in this stage yet.
        </div>
      ) : (
        <div className="card overflow-hidden mt-3">
          <table className="w-full text-[13px]">
            <thead className="bg-card-2 border-b border-rule">
              <tr>
                <th className="eyebrow text-left px-3 h-9">Property</th>
                <th className="eyebrow text-left px-3 h-9 w-[140px]">Town</th>
                <th className="eyebrow text-right px-3 h-9 w-[130px]">Asking</th>
                <th className="eyebrow text-right px-3 h-9 w-[110px]">GLA</th>
                <th className="eyebrow text-right px-3 h-9 w-[80px]">Cap</th>
                <th className="eyebrow text-left px-3 h-9 w-[135px]">Stage</th>
                <th className="eyebrow text-left px-3 h-9 w-[140px]">Bid deadline</th>
                <th className="eyebrow text-left px-3 h-9 w-[120px]">Last activity</th>
                <th className="eyebrow text-right px-3 h-9 w-[40px]"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => {
                const days = daysUntil(d.bidDeadline);
                const soon = days !== null && days >= 0 && days <= 14;
                return (
                  <tr
                    key={d.id}
                    className="border-b border-rule-2 last:border-b-0 hover:bg-blueprint-tint/40 group transition-colors"
                  >
                    <td className="px-3 py-2.5">
                      <Link
                        href={`/acquisitions/${d.id}`}
                        className="text-ink hover:text-blueprint underline-offset-2 hover:underline"
                      >
                        {d.propertyName}
                      </Link>
                      <div className="text-[10px] text-slate-2 uppercase tracking-wider mt-0.5">
                        {d.brokerFirm} · {d.brokerName}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-slate">
                      {d.town}, {d.province}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-right">
                      {fmtCAD(d.askingPrice)}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-right">
                      {fmtSqft(d.gla)}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-right">
                      {(d.capRate * 100).toFixed(2)}%
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={cn(
                          "inline-flex items-center h-5 px-2 rounded-md text-[10px] font-mono uppercase tracking-wider",
                          STAGE_COLOR[d.stage],
                        )}
                      >
                        {STAGE_LABEL[d.stage]}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-[12px]">
                      {d.bidDeadline ? (
                        <span
                          className={cn(soon && "text-signal font-medium")}
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
                    <td className="px-3 py-2.5 text-[12px] text-slate">
                      {fmtDate(d.lastActivity)}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <Link
                        href={`/acquisitions/${d.id}`}
                        className="inline-flex text-slate-2 group-hover:text-blueprint group-hover:translate-x-0.5 transition-all"
                        aria-label="Open deal"
                      >
                        <ArrowRight size={14} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-5 text-[11px] text-slate-2 max-w-2xl">
        Every deal here is one Kyle chose to work on. Nothing gets added to this pipeline
        automatically — new deals start when you log them via the &ldquo;New&rdquo; button in the
        top bar.
      </div>
    </div>
  );
}

function SummaryTile({
  label,
  value,
  hint,
  tone = "default",
  icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "signal";
  icon?: React.ReactNode;
}) {
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between">
        <div className="eyebrow">{label}</div>
        {icon && (
          <div className="grid place-items-center h-6 w-6 rounded-md bg-blueprint-tint text-blueprint">
            {icon}
          </div>
        )}
      </div>
      <div
        className={cn(
          "font-mono text-[24px] leading-none mt-2 tabular-nums",
          tone === "signal" ? "text-signal" : "text-ink",
        )}
      >
        {value}
      </div>
      {hint && (
        <div className="text-[11px] text-slate mt-2 leading-snug">{hint}</div>
      )}
    </div>
  );
}

function StageChip({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "h-8 px-3 text-[11px] rounded-md border transition-all duration-150 inline-flex items-center gap-1.5",
        active
          ? "border-blueprint bg-blueprint text-card"
          : "border-rule bg-card text-slate hover:border-blueprint/50 hover:text-ink",
      )}
    >
      {label}
      {count !== undefined && count > 0 && (
        <span
          className={cn(
            "font-mono text-[10px]",
            active ? "text-card/80" : "text-slate-2",
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

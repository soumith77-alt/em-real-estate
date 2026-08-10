"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  getSearch,
  getSearchResults,
  type SearchResultBundle,
} from "@/mock/api/leasing";
import { db } from "@/mock/db";
import { FunnelDiagram } from "@/components/criteria/FunnelDiagram";
import { TableSkeleton } from "@/components/data/Skeletons";
import { fmtSqft } from "@/lib/format";
import type { CandidateAssessment, CriteriaSet, SavedSearch, Retailer } from "@/types";
import { cn } from "@/lib/cn";
import { Download, Grid3x3 } from "lucide-react";
import { CriterionCell } from "@/components/criteria/CriterionCell";
import { toast } from "sonner";

type Mode = "ranked" | "complete" | "matrix";

export default function SearchResultsPage() {
  const { searchId } = useParams<{ searchId: string }>();
  const [search, setSearch] = useState<SavedSearch | null>(null);
  const [bundle, setBundle] = useState<SearchResultBundle | null>(null);
  const [mode, setMode] = useState<Mode>("ranked");
  const [weights, setWeights] = useState<Record<string, number>>({});

  useEffect(() => {
    (async () => {
      const s = await getSearch(searchId);
      setSearch(s);
      if (s?.weights) setWeights(s.weights);
      const b = await getSearchResults(searchId, s?.weights);
      setBundle(b);
    })();
  }, [searchId]);

  useEffect(() => {
    if (!search) return;
    if (Object.keys(weights).length === 0) return;
    (async () => {
      const b = await getSearchResults(searchId, weights);
      setBundle(b);
    })();
  }, [weights, searchId, search]);

  if (!search || !bundle) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        <TableSkeleton rows={12} />
      </div>
    );
  }

  const unit = db.units.find((u) => u.id === search.unitId);
  const property = db.properties.find((p) => p.id === unit?.propertyId);

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      <div className="mb-4 flex items-baseline justify-between">
        <div>
          <div className="eyebrow">Leasing · Search results</div>
          <h1 className="font-display text-[22px] font-medium tracking-tight text-ink mt-0.5">
            {property?.name} · Unit {unit?.unitNo}
          </h1>
          <div className="text-[12px] text-slate mt-1">
            {property?.town}, {property?.province} ·{" "}
            <span className="font-mono">{fmtSqft(unit?.gla)}</span> ·{" "}
            <span className="capitalize">{unit?.format}</span>
          </div>
        </div>
        <button
          onClick={() =>
            toast.success("Prepared Excel export of ranked results")
          }
          className="inline-flex items-center gap-1.5 h-9 px-3 border border-rule bg-card hover:border-blueprint rounded-sm text-[12px] text-ink"
        >
          <Download size={12} /> Export to Excel
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
        <div className="space-y-4">
          <FunnelDiagram
            stages={[
              { key: "u", label: "Retailer universe", count: db.retailers.length },
              { key: "s", label: "In scope", count: bundle.inScope, hint: "format · province · tier" },
              { key: "h", label: "Hard filters passed", count: bundle.hardPassed, hint: "deterministic" },
              { key: "r", label: "Ranked", count: bundle.ranked.length, hint: "AI-scored" },
            ]}
          />

          <WeightsPanel
            weights={weights}
            onChange={setWeights}
            set={bundle.set}
          />
        </div>

        <div>
          <div className="flex items-center gap-1 border-b border-rule mb-3">
            {(["ranked", "complete", "matrix"] as Mode[]).map((m) => {
              const active = mode === m;
              const label =
                m === "ranked"
                  ? `Ranked results (${bundle.ranked.length})`
                  : m === "complete"
                    ? `Complete list (${bundle.complete.length})`
                    : `Matrix view (top 20)`;
              return (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={cn(
                    "h-9 px-3 text-[12px] border-b-2 -mb-px transition-colors",
                    active
                      ? "border-blueprint text-ink font-medium"
                      : "border-transparent text-slate hover:text-ink",
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {mode === "ranked" && (
            <ResultsTable
              rows={bundle.ranked}
              searchId={searchId}
              showRank
            />
          )}
          {mode === "complete" && (
            <ResultsTable
              rows={bundle.complete}
              searchId={searchId}
              showHardStatus
            />
          )}
          {mode === "matrix" && (
            <MatrixView
              set={bundle.set}
              rows={bundle.ranked.slice(0, 20)}
              searchId={searchId}
            />
          )}
        </div>
      </div>

      <div className="mt-6 text-[11px] text-slate-2 border-t border-rule pt-3">
        Ranked results present 40–80 candidates with reasoning. The complete
        in-scope list is always available — nothing is hidden from you.
      </div>
    </div>
  );
}

function WeightsPanel({
  weights,
  onChange,
  set,
}: {
  weights: Record<string, number>;
  onChange: (w: Record<string, number>) => void;
  set: CriteriaSet;
}) {
  const groups = ["market", "momentum", "mix", "likelihood"] as const;
  // Aggregate per-group weight display; store per-criterion.
  const groupValue = (g: string) => {
    const ids = set.criteria.filter((c) => c.group === g && c.provenance === "ai").map((c) => c.id);
    if (ids.length === 0) return 1;
    const sum = ids.reduce((s, id) => s + (weights[id] ?? 1), 0);
    return sum / ids.length;
  };
  const setGroup = (g: string, v: number) => {
    const ids = set.criteria.filter((c) => c.group === g && c.provenance === "ai").map((c) => c.id);
    const next = { ...weights };
    for (const id of ids) next[id] = v;
    onChange(next);
  };
  return (
    <div className="bg-card border border-rule rounded-sm p-4">
      <div className="eyebrow mb-3">Weight the ranking</div>
      <div className="space-y-3">
        {groups.map((g) => (
          <div key={g}>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[12px] text-ink capitalize">{g}</label>
              <span className="font-mono text-[11px] text-slate">
                ×{groupValue(g).toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min={0.2}
              max={2}
              step={0.1}
              value={groupValue(g)}
              onChange={(e) => setGroup(g, Number(e.target.value))}
              className="w-full accent-blueprint"
            />
          </div>
        ))}
      </div>
      <div className="text-[11px] text-slate mt-3 leading-relaxed">
        Shifting weights re-ranks live. Ranking is judgment, not a decision —
        the full list stays visible.
      </div>
    </div>
  );
}

function ResultsTable({
  rows,
  searchId,
  showRank,
  showHardStatus,
}: {
  rows: CandidateAssessment[];
  searchId: string;
  showRank?: boolean;
  showHardStatus?: boolean;
}) {
  return (
    <div className="bg-card border border-rule rounded-sm overflow-hidden">
      <table className="w-full text-[13px]">
        <thead className="bg-card-2 border-b border-rule">
          <tr>
            {showRank && (
              <th className="eyebrow text-right px-3 h-9 w-[50px]">#</th>
            )}
            <th className="eyebrow text-left px-3 h-9">Brand</th>
            <th className="eyebrow text-left px-3 h-9">Category</th>
            <th className="eyebrow text-right px-3 h-9 w-[110px]">Typical size</th>
            <th className="eyebrow text-left px-3 h-9 w-[110px]">Expansion</th>
            {showHardStatus && (
              <th className="eyebrow text-left px-3 h-9 w-[110px]">Hard filters</th>
            )}
            <th className="eyebrow text-right px-3 h-9 w-[80px]">Score</th>
            <th className="eyebrow text-left px-3 h-9">Headline</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const retailer = db.retailers.find((x) => x.id === r.retailerId);
            return (
              <tr
                key={r.retailerId}
                className={cn(
                  "border-b border-rule-2 last:border-b-0",
                  !r.hardFilterPassed && "text-slate",
                )}
              >
                {showRank && (
                  <td className="px-3 py-2 font-mono text-right text-slate">
                    {r.rank}
                  </td>
                )}
                <td className="px-3 py-2">
                  <Link
                    href={`/leasing/search/${searchId}/${r.retailerId}`}
                    className="text-ink hover:underline underline-offset-2"
                  >
                    {retailer?.brand}
                  </Link>
                </td>
                <td className="px-3 py-2 text-slate capitalize">
                  {retailer?.category?.replace(/-/g, " ")}
                </td>
                <td className="px-3 py-2 font-mono text-right">
                  {retailer && fmtSqft(retailer.sizeMid)}
                </td>
                <td className="px-3 py-2">
                  <ExpansionChip status={retailer?.expansionStatus.value} />
                </td>
                {showHardStatus && (
                  <td className="px-3 py-2">
                    {r.hardFilterPassed ? (
                      <span className="text-[11px] text-pass font-medium uppercase tracking-wider">
                        Pass
                      </span>
                    ) : (
                      <span className="text-[11px] text-fail font-medium uppercase tracking-wider">
                        Fail
                      </span>
                    )}
                  </td>
                )}
                <td className="px-3 py-2 font-mono text-right">
                  {r.hardFilterPassed
                    ? r.compositeScore.toFixed(1)
                    : "—"}
                </td>
                <td className="px-3 py-2 text-[12px] text-slate">
                  {r.headline}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function MatrixView({
  set,
  rows,
  searchId,
}: {
  set: CriteriaSet;
  rows: CandidateAssessment[];
  searchId: string;
}) {
  return (
    <div className="bg-card border border-rule rounded-sm overflow-auto">
      <div className="p-3 border-b border-rule flex items-center gap-2 text-[11px] text-slate">
        <Grid3x3 size={12} />
        {rows.length} candidates × {set.criteria.length} criteria — full grid
      </div>
      <table className="text-[11px] border-collapse min-w-max">
        <thead className="bg-card-2">
          <tr>
            <th className="text-left px-2 py-1.5 eyebrow border-b border-rule sticky left-0 bg-card-2 min-w-[120px]">
              Criterion
            </th>
            {rows.map((r) => {
              const retailer = db.retailers.find((x) => x.id === r.retailerId);
              return (
                <th
                  key={r.retailerId}
                  className="text-left px-2 py-1.5 border-b border-l border-rule text-[10px] font-mono uppercase tracking-wider text-slate min-w-[80px]"
                >
                  <Link
                    href={`/leasing/search/${searchId}/${r.retailerId}`}
                    className="hover:text-ink"
                  >
                    {retailer?.brand.slice(0, 12)}
                  </Link>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {set.criteria.slice().sort((a, b) => a.number - b.number).map((c) => (
            <tr key={c.id} className="border-b border-rule-2 last:border-b-0">
              <td className="text-left px-2 py-1 text-slate sticky left-0 bg-card text-[11px]">
                <span className="font-mono text-slate-2 mr-1.5">
                  {c.number}
                </span>
                {c.name}
              </td>
              {rows.map((r) => (
                <td key={r.retailerId + c.id} className="px-2 py-1 border-l border-rule-2 text-center">
                  <CriterionCell result={r.results[c.id]} compact />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ExpansionChip({ status }: { status?: Retailer["expansionStatus"]["value"] }) {
  if (!status) return <span className="text-slate-2">—</span>;
  const color =
    status === "expanding"
      ? "bg-pass-tint text-pass border-pass/30"
      : status === "closing"
        ? "bg-fail-tint text-fail border-fail/30"
        : status === "dormant"
          ? "bg-signal-tint text-signal border-signal/30"
          : "bg-paper text-slate border-rule";
  return (
    <span
      className={cn(
        "inline-flex items-center h-5 px-1.5 border rounded-sm text-[10px] font-mono uppercase tracking-wider",
        color,
      )}
    >
      {status}
    </span>
  );
}

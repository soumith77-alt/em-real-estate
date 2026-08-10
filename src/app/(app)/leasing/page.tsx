"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getVacantUnits } from "@/mock/api/leasing";
import { db } from "@/mock/db";
import { fmtDate, fmtSqft, fmtPSF } from "@/lib/format";
import type { Unit } from "@/types";
import { TableSkeleton } from "@/components/data/Skeletons";
import { cn } from "@/lib/cn";

type EnrichedUnit = Unit & {
  propertyName: string;
  town: string;
  province: string;
  tier: string;
};

export default function LeasingBoard() {
  const [units, setUnits] = useState<EnrichedUnit[] | null>(null);
  const [tier, setTier] = useState<string>("all");
  const [province, setProvince] = useState<string>("all");
  const [format, setFormat] = useState<string>("all");

  useEffect(() => {
    (async () => {
      const list = await getVacantUnits();
      const enriched = list.map((u) => {
        const p = db.properties.find((x) => x.id === u.propertyId);
        return {
          ...u,
          propertyName: p?.name ?? "—",
          town: p?.town ?? "—",
          province: p?.province ?? "—",
          tier: p?.tier ?? "—",
        };
      });
      setUnits(enriched);
    })();
  }, []);

  const filtered = (units ?? []).filter(
    (u) =>
      (tier === "all" || u.tier === tier) &&
      (province === "all" || u.province === province) &&
      (format === "all" || u.format === format),
  );

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      <div className="flex items-baseline justify-between mb-1">
        <div>
          <div className="eyebrow">Leasing · Tenant search</div>
          <h1 className="font-display text-[24px] font-medium tracking-tight text-ink mt-0.5">
            Vacancy board
          </h1>
        </div>
        {units && (
          <div className="text-[12px] text-slate">
            {filtered.length} of {units.length} vacant / notice-given units
          </div>
        )}
      </div>
      <p className="text-[13px] text-slate max-w-2xl mb-6">
        Every unit currently vacant or under notice. Pick one to start a
        tenant search — the workspace already knows the unit&rsquo;s size,
        format, features, and the legal restrictions that apply on its
        property.
      </p>

      <div className="flex gap-2 mb-4 flex-wrap">
        <Chip label="Tier" value={tier} onChange={setTier} options={["all", "small-town", "mid-market", "major-city"]} />
        <Chip label="Province" value={province} onChange={setProvince} options={["all", "QC", "ON", "NB", "NS", "PE", "NL"]} />
        <Chip label="Format" value={format} onChange={setFormat} options={["all", "inline", "end-cap", "freestanding", "anchor", "pad"]} />
      </div>

      {units === null ? (
        <TableSkeleton rows={10} />
      ) : (
        <div className="bg-card border border-rule rounded-sm overflow-hidden">
          <table className="w-full text-[13px]">
            <thead className="bg-card-2 border-b border-rule">
              <tr>
                <th className="eyebrow text-left px-3 h-9">Property</th>
                <th className="eyebrow text-left px-3 h-9">Town</th>
                <th className="eyebrow text-left px-3 h-9 w-[80px]">Unit</th>
                <th className="eyebrow text-right px-3 h-9 w-[100px]">GLA</th>
                <th className="eyebrow text-right px-3 h-9 w-[70px]">Front.</th>
                <th className="eyebrow text-left px-3 h-9 w-[110px]">Format</th>
                <th className="eyebrow text-left px-3 h-9 w-[130px]">Features</th>
                <th className="eyebrow text-left px-3 h-9 w-[100px]">Vacant since</th>
                <th className="eyebrow text-right px-3 h-9 w-[90px]">Ask</th>
                <th className="eyebrow text-right px-3 h-9 w-[140px]"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-rule-2 last:border-b-0 hover:bg-blueprint/5"
                >
                  <td className="px-3 py-2">
                    <div className="text-ink">{u.propertyName}</div>
                    <div className="text-[10px] text-slate-2 uppercase tracking-wider">
                      {u.tier}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-slate">
                    {u.town}, {u.province}
                  </td>
                  <td className="px-3 py-2 font-mono">{u.unitNo}</td>
                  <td className="px-3 py-2 font-mono text-right">
                    {fmtSqft(u.gla)}
                  </td>
                  <td className="px-3 py-2 font-mono text-right">
                    {u.frontageFt}&#39;
                  </td>
                  <td className="px-3 py-2 text-slate capitalize">
                    {u.format}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {u.features.slice(0, 3).map((f) => (
                        <span
                          key={f}
                          className="text-[10px] font-mono uppercase tracking-wider text-slate bg-paper border border-rule-2 rounded-sm px-1.5"
                        >
                          {f.replace(/-/g, " ")}
                        </span>
                      ))}
                      {u.features.length === 0 && (
                        <span className="text-[11px] text-slate-2">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 font-mono text-[11px] text-slate">
                    {fmtDate(u.vacantSince)}
                  </td>
                  <td className="px-3 py-2 font-mono text-right">
                    {u.askingRentPsf ? fmtPSF(u.askingRentPsf) : "—"}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Link
                      href={`/leasing/search?unit=${u.id}`}
                      className="inline-flex h-7 px-3 items-center bg-blueprint text-card rounded-sm text-[11px] font-medium hover:bg-blueprint-hover"
                    >
                      Start tenant search
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Chip({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="inline-flex items-center h-8 bg-card border border-rule rounded-sm">
      <span className="eyebrow px-2.5 border-r border-rule">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "bg-transparent px-2 h-full text-[12px] outline-none capitalize",
          value !== "all" && "text-blueprint font-medium",
        )}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o === "all" ? "all" : o}
          </option>
        ))}
      </select>
    </div>
  );
}

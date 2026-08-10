"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { listProperties } from "@/mock/api/knowledge";
import { db } from "@/mock/db";
import type { Property } from "@/types";
import { fmtSqft, fmtInt } from "@/lib/format";
import { TableSkeleton } from "@/components/data/Skeletons";

export default function PropertiesList() {
  const [properties, setProperties] = useState<Property[] | null>(null);

  useEffect(() => {
    (async () => setProperties(await listProperties()))();
  }, []);

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      <div className="eyebrow">Knowledge · Properties</div>
      <h1 className="font-display text-[24px] font-medium tracking-tight text-ink mt-0.5">
        42 shopping centres
      </h1>
      <p className="text-[13px] text-slate mt-1">
        ≈2.7M sq ft across Quebec, New Brunswick, Nova Scotia, Prince Edward
        Island, Newfoundland and Eastern Ontario.
      </p>

      {!properties ? (
        <div className="mt-6">
          <TableSkeleton rows={12} />
        </div>
      ) : (
        <div className="mt-6 bg-card border border-rule rounded-sm overflow-hidden">
          <table className="w-full text-[13px]">
            <thead className="bg-card-2 border-b border-rule">
              <tr>
                <th className="eyebrow text-left px-3 h-9">Name</th>
                <th className="eyebrow text-left px-3 h-9 w-[160px]">Town</th>
                <th className="eyebrow text-left px-3 h-9 w-[90px]">Type</th>
                <th className="eyebrow text-right px-3 h-9 w-[110px]">GLA</th>
                <th className="eyebrow text-right px-3 h-9 w-[80px]">Units</th>
                <th className="eyebrow text-right px-3 h-9 w-[80px]">Occ.</th>
                <th className="eyebrow text-left px-3 h-9 w-[120px]">Anchor</th>
                <th className="eyebrow text-right px-3 h-9 w-[100px]">Population</th>
                <th className="eyebrow text-left px-3 h-9 w-[100px]">Tier</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((p) => {
                const units = db.units.filter((u) => u.propertyId === p.id).length;
                return (
                  <tr
                    key={p.id}
                    className="border-b border-rule-2 last:border-b-0 hover:bg-blueprint/5"
                  >
                    <td className="px-3 py-2">
                      <Link
                        href={`/knowledge/properties/${p.id}`}
                        className="text-ink hover:underline"
                      >
                        {p.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-slate">
                      {p.town}, {p.province}
                    </td>
                    <td className="px-3 py-2 text-slate capitalize">
                      {p.type.replace(/-/g, " ")}
                    </td>
                    <td className="px-3 py-2 font-mono text-right">
                      {fmtSqft(p.gla)}
                    </td>
                    <td className="px-3 py-2 font-mono text-right">{units}</td>
                    <td className="px-3 py-2 font-mono text-right">
                      {(p.occupancy * 100).toFixed(1)}%
                    </td>
                    <td className="px-3 py-2 text-slate">
                      {p.anchor ?? <span className="text-slate-2">—</span>}
                    </td>
                    <td className="px-3 py-2 font-mono text-right text-slate">
                      {fmtInt(p.population)}
                    </td>
                    <td className="px-3 py-2 text-slate capitalize">
                      {p.tier}
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

"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getProperty, listRestrictionsForProperty } from "@/mock/api/knowledge";
import { db } from "@/mock/db";
import type { Property, Restriction } from "@/types";
import { fmtSqft, fmtDate } from "@/lib/format";
import { TableSkeleton } from "@/components/data/Skeletons";
import { ArrowLeft } from "lucide-react";

export default function PropertyPage() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const [prop, setProp] = useState<Property | null>(null);
  const [restrictions, setRestrictions] = useState<Restriction[] | null>(null);

  useEffect(() => {
    (async () => {
      const [p, r] = await Promise.all([
        getProperty(propertyId),
        listRestrictionsForProperty(propertyId),
      ]);
      setProp(p);
      setRestrictions(r);
    })();
  }, [propertyId]);

  if (!prop || !restrictions)
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        <TableSkeleton rows={10} />
      </div>
    );

  const units = db.units.filter((u) => u.propertyId === propertyId);
  const tenantById = new Map(db.tenants.map((t) => [t.id, t]));

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      <Link
        href="/knowledge/properties"
        className="inline-flex items-center gap-1 text-[12px] text-slate hover:text-ink"
      >
        <ArrowLeft size={12} /> All properties
      </Link>

      <div className="mt-2 flex items-baseline justify-between">
        <div>
          <div className="eyebrow">{prop.tier} · {prop.type.replace(/-/g, " ")}</div>
          <h1 className="font-display text-[24px] font-medium tracking-tight text-ink mt-0.5">
            {prop.name}
          </h1>
          <div className="text-[12px] text-slate mt-1">
            {prop.town}, {prop.province} · Population {prop.population.toLocaleString()}
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-[20px] text-ink">{fmtSqft(prop.gla)}</div>
          <div className="text-[11px] text-slate">GLA · Anchor: {prop.anchor ?? "—"}</div>
        </div>
      </div>

      {restrictions.length > 0 && (
        <div className="mt-6">
          <h2 className="eyebrow mb-2">
            Legal restrictions · {restrictions.length}
          </h2>
          <p className="text-[12px] text-slate mb-3">
            These drive deterministic hard filters when running a tenant
            search on any unit here.
          </p>
          <div className="space-y-2">
            {restrictions.map((r) => {
              const tenant = tenantById.get(r.grantedToTenantId);
              return (
                <div
                  key={r.id}
                  className="bg-card border border-rule rounded-sm p-3 border-l-4 border-l-signal"
                >
                  <div className="flex items-baseline gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-signal">
                      {r.kind.replace(/-/g, " ")}
                    </span>
                    <span className="text-ink text-[13px] capitalize">
                      {r.category}
                    </span>
                    {tenant && (
                      <span className="text-[11px] text-slate ml-2">
                        granted to {tenant.brand}
                      </span>
                    )}
                  </div>
                  <div className="text-[12px] text-slate mt-1.5 italic border-l-2 border-rule pl-2">
                    &ldquo;{r.clauseText}&rdquo;
                  </div>
                  <div className="text-[10px] text-slate-2 mt-1 font-mono">
                    Source: {r.sourceDocId}, p.{r.sourcePage}
                    {r.expiresOn && ` · expires ${fmtDate(r.expiresOn)}`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="eyebrow mb-2">
          Units · {units.length}
        </h2>
        <div className="bg-card border border-rule rounded-sm overflow-hidden">
          <table className="w-full text-[12px]">
            <thead className="bg-card-2 border-b border-rule">
              <tr>
                <th className="eyebrow text-left px-3 h-8">Unit</th>
                <th className="eyebrow text-right px-3 h-8 w-[90px]">GLA</th>
                <th className="eyebrow text-left px-3 h-8 w-[100px]">Format</th>
                <th className="eyebrow text-left px-3 h-8">Current tenant</th>
                <th className="eyebrow text-left px-3 h-8 w-[110px]">Status</th>
                <th className="eyebrow text-right px-3 h-8 w-[100px]">Expiry</th>
              </tr>
            </thead>
            <tbody>
              {units.map((u) => {
                const t = u.currentTenantId
                  ? tenantById.get(u.currentTenantId)
                  : undefined;
                return (
                  <tr
                    key={u.id}
                    className="border-b border-rule-2 last:border-b-0"
                  >
                    <td className="px-3 py-1.5 font-mono">{u.unitNo}</td>
                    <td className="px-3 py-1.5 font-mono text-right">
                      {fmtSqft(u.gla)}
                    </td>
                    <td className="px-3 py-1.5 text-slate capitalize">
                      {u.format}
                    </td>
                    <td className="px-3 py-1.5">
                      {t ? (
                        <Link
                          href={`/vault/${t.id}`}
                          className="text-ink hover:underline"
                        >
                          {t.brand}
                        </Link>
                      ) : (
                        <span className="text-slate-2">—</span>
                      )}
                    </td>
                    <td className="px-3 py-1.5">
                      <StatusChip status={u.status} />
                    </td>
                    <td className="px-3 py-1.5 font-mono text-right text-slate">
                      {t ? fmtDate(t.endDate) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusChip({ status }: { status: string }) {
  const color =
    status === "occupied"
      ? "bg-pass-tint text-pass"
      : status === "vacant"
        ? "bg-fail-tint text-fail"
        : "bg-signal-tint text-signal";
  return (
    <span
      className={`inline-flex items-center h-5 px-1.5 rounded-sm text-[10px] font-mono uppercase tracking-wider ${color}`}
    >
      {status.replace(/-/g, " ")}
    </span>
  );
}

"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { listAllDocs } from "@/mock/api/vault";
import { db } from "@/mock/db";
import type { LeaseDoc } from "@/types";
import { TableSkeleton } from "@/components/data/Skeletons";
import { fmtDate } from "@/lib/format";

export default function VaultPage() {
  const [docs, setDocs] = useState<LeaseDoc[] | null>(null);
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [year, setYear] = useState("");

  useEffect(() => {
    (async () => {
      const list = await listAllDocs({});
      setDocs(list);
    })();
  }, []);

  const tenantById = useMemo(
    () => new Map(db.tenants.map((t) => [t.id, t])),
    [],
  );
  const propertyById = useMemo(
    () => new Map(db.properties.map((p) => [p.id, p])),
    [],
  );

  const filtered = (docs ?? []).filter(
    (d) =>
      (!q || d.title.toLowerCase().includes(q.toLowerCase())) &&
      (!type || d.type === type) &&
      (!year || d.signedOn.startsWith(year)),
  );

  const grouped = useMemo(() => {
    const m = new Map<string, LeaseDoc[]>();
    for (const d of filtered) {
      const arr = m.get(d.tenantId) ?? [];
      arr.push(d);
      m.set(d.tenantId, arr);
    }
    return m;
  }, [filtered]);

  if (!docs)
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        <TableSkeleton rows={14} />
      </div>
    );

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      <div className="eyebrow">Vault</div>
      <h1 className="font-display text-[24px] font-medium tracking-tight text-ink mt-0.5">
        Every signed lease, amendment and renewal
      </h1>
      <p className="text-[13px] text-slate mt-1 max-w-2xl">
        Stored permanently. Nothing to upload at request time — the workspace
        already has it.
      </p>

      <div className="mt-4 flex gap-2 items-center flex-wrap">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search title"
          className="h-8 px-3 border border-rule bg-card rounded-sm text-[12px] w-[220px] focus:border-blueprint outline-none"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="h-8 px-2 border border-rule bg-card rounded-sm text-[12px]"
        >
          <option value="">All types</option>
          <option value="original-lease">Original lease</option>
          <option value="amendment">Amendment</option>
          <option value="renewal">Renewal</option>
          <option value="assignment">Assignment</option>
          <option value="estoppel">Estoppel</option>
          <option value="side-letter">Side letter</option>
        </select>
        <input
          value={year}
          onChange={(e) => setYear(e.target.value)}
          placeholder="Year"
          className="h-8 px-3 border border-rule bg-card rounded-sm text-[12px] w-[80px] font-mono focus:border-blueprint outline-none"
        />
        <div className="ml-auto text-[12px] text-slate">
          {filtered.length.toLocaleString()} documents across {grouped.size.toLocaleString()} tenants
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {Array.from(grouped.entries()).slice(0, 60).map(([tenantId, tdocs]) => {
          const tenant = tenantById.get(tenantId);
          const property = tenant
            ? propertyById.get(tenant.propertyId)
            : undefined;
          if (!tenant) return null;
          return (
            <Link
              key={tenantId}
              href={`/vault/${tenantId}`}
              className="flex items-center gap-4 px-4 py-3 bg-card border border-rule rounded-sm hover:border-blueprint"
            >
              <div className="flex-1 min-w-0">
                <div className="text-[13px] text-ink font-medium">
                  {tenant.brand}
                </div>
                <div className="text-[11px] text-slate">
                  {property?.name} · {property?.town}, {property?.province}
                </div>
              </div>
              <div className="text-[11px] font-mono text-slate">
                {tdocs.length} doc{tdocs.length === 1 ? "" : "s"} ·{" "}
                {tdocs.reduce((s, d) => s + d.pages, 0)} pages
              </div>
              <div className="text-[11px] font-mono text-slate-2 w-[110px] text-right">
                {fmtDate(tdocs[tdocs.length - 1].signedOn)}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

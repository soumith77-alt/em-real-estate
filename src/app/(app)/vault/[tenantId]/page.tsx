"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { listTenantDocs, getClausesForTenant, getRentHistory } from "@/mock/api/vault";
import { db } from "@/mock/db";
import type { LeaseDoc, Clause } from "@/types";
import { DocumentTimeline } from "@/components/docs/DocumentTimeline";
import { ClauseCard } from "@/components/docs/ClauseCard";
import { TableSkeleton } from "@/components/data/Skeletons";
import { ArrowLeft } from "lucide-react";

export default function TenantVaultPage() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const [docs, setDocs] = useState<LeaseDoc[] | null>(null);
  const [clauses, setClauses] = useState<Clause[] | null>(null);
  const [rent, setRent] = useState<Awaited<ReturnType<typeof getRentHistory>> | null>(null);

  useEffect(() => {
    (async () => {
      const [d, c, r] = await Promise.all([
        listTenantDocs(tenantId),
        getClausesForTenant(tenantId),
        getRentHistory(tenantId),
      ]);
      setDocs(d);
      setClauses(c);
      setRent(r);
    })();
  }, [tenantId]);

  const tenant = db.tenants.find((t) => t.id === tenantId);
  const property = tenant ? db.properties.find((p) => p.id === tenant.propertyId) : undefined;

  if (!docs || !clauses || !rent || !tenant)
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        <TableSkeleton rows={10} />
      </div>
    );

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      <Link
        href="/vault"
        className="inline-flex items-center gap-1 text-[12px] text-slate hover:text-ink"
      >
        <ArrowLeft size={12} /> Vault
      </Link>
      <div className="mt-2 flex items-baseline justify-between">
        <div>
          <div className="eyebrow">{tenant.category}</div>
          <h1 className="font-display text-[24px] font-medium tracking-tight text-ink mt-0.5">
            {tenant.brand}
          </h1>
          <div className="text-[12px] text-slate mt-1">
            {property?.name} · {property?.town}, {property?.province}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-6">
          <DocumentTimeline docs={docs} />
          <div>
            <h2 className="eyebrow mb-2">Clauses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {clauses.map((c) => (
                <ClauseCard key={c.id} clause={c} />
              ))}
            </div>
          </div>
        </div>

        <aside>
          <div className="bg-card border border-rule rounded-sm p-4">
            <div className="eyebrow mb-3">Lease facts</div>
            <dl className="text-[12px] space-y-1.5">
              <RowKV label="Term">
                <span className="font-mono">
                  {tenant.startDate.slice(0, 4)} – {tenant.endDate.slice(0, 4)}
                </span>
              </RowKV>
              <RowKV label="Base rent">
                <span className="font-mono">${tenant.baseRentPsf}/sf</span>
              </RowKV>
              <RowKV label="CAM">
                <span className="font-mono">${tenant.camPsf}/sf</span>
              </RowKV>
              <RowKV label="Options to renew">
                <span className="font-mono">{tenant.optionsToRenew}</span>
              </RowKV>
              <RowKV label="Escalation">
                <span className="font-mono">{tenant.escalationPct.toFixed(2)}%/yr</span>
              </RowKV>
              <RowKV label="Status">
                <span className="capitalize">{tenant.status.replace(/-/g, " ")}</span>
              </RowKV>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}

function RowKV({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between border-b border-rule-2 last:border-b-0 pb-1 last:pb-0">
      <dt className="text-slate">{label}</dt>
      <dd className="text-ink">{children}</dd>
    </div>
  );
}

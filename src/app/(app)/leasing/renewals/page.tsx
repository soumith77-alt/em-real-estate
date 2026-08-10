"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { listRenewals } from "@/mock/api/leasing";
import { db } from "@/mock/db";
import { TableSkeleton } from "@/components/data/Skeletons";
import { fmtDate } from "@/lib/format";
import { toast } from "sonner";
import { cn } from "@/lib/cn";
import type { Renewal } from "@/mock/fixtures/renewals";

export default function RenewalsPage() {
  const [renewals, setRenewals] = useState<Renewal[] | null>(null);
  const [request, setRequest] = useState("Bulk Barn is renewing at Centre Rimouski");
  const [parsed, setParsed] = useState<{ brand: string; property: string } | null>(null);

  useEffect(() => {
    (async () => setRenewals(await listRenewals()))();
  }, []);

  function parseIntent() {
    const m = request.match(/^(.+?)\s+(?:is renewing|renewal)\s+(?:at\s+)?(.+)$/i);
    if (m) {
      setParsed({ brand: m[1].trim(), property: m[2].trim() });
    } else {
      setParsed({ brand: request.trim(), property: "unknown" });
    }
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      <div className="eyebrow">Leasing · Renewals</div>
      <h1 className="font-display text-[24px] font-medium tracking-tight text-ink mt-0.5">
        Renewal analysis
      </h1>
      <p className="text-[13px] text-slate mt-1 max-w-2xl">
        Choose a tenant, or type what you want in plain English. Nothing runs
        until you confirm.
      </p>

      <div className="mt-6 bg-card border border-rule rounded-sm p-4">
        <div className="eyebrow mb-2">Start a new analysis</div>
        <div className="flex gap-2">
          <input
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && parseIntent()}
            className="flex-1 h-9 px-3 border border-rule bg-paper rounded-sm text-[13px] focus:border-blueprint outline-none"
            placeholder="Bulk Barn renewal at Drummondville"
          />
          <button
            onClick={parseIntent}
            className="h-9 px-4 bg-blueprint text-card rounded-sm text-[12px] font-medium hover:bg-blueprint-hover"
          >
            Parse request
          </button>
        </div>
        {parsed && (
          <div className="mt-3 border-l-2 border-blueprint pl-3">
            <div className="eyebrow mb-1">Understood as</div>
            <div className="text-[13px] text-ink">
              Renew <span className="font-medium">{parsed.brand}</span> at{" "}
              <span className="font-medium">{parsed.property}</span>
            </div>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => {
                  toast.success("Analysis started");
                  const bulk = db.renewals.find((r) => r.id === "renewal-bulk-barn");
                  if (bulk)
                    window.location.href = `/leasing/renewals/${bulk.id}`;
                }}
                className="h-8 px-3 bg-blueprint text-card rounded-sm text-[12px]"
              >
                Yes, run this
              </button>
              <button
                onClick={() => setParsed(null)}
                className="h-8 px-3 text-[12px] text-slate hover:text-ink"
              >
                No, that&rsquo;s not what I meant
              </button>
            </div>
          </div>
        )}
      </div>

      <h2 className="eyebrow mt-8 mb-2">In progress</h2>
      {!renewals ? (
        <TableSkeleton rows={6} />
      ) : (
        <div className="bg-card border border-rule rounded-sm overflow-hidden">
          <table className="w-full text-[13px]">
            <thead className="bg-card-2 border-b border-rule">
              <tr>
                <th className="eyebrow text-left px-3 h-9">Tenant</th>
                <th className="eyebrow text-left px-3 h-9">Property</th>
                <th className="eyebrow text-left px-3 h-9 w-[120px]">Expiry</th>
                <th className="eyebrow text-left px-3 h-9 w-[110px]">Status</th>
                <th className="eyebrow text-right px-3 h-9 w-[120px]">Created</th>
              </tr>
            </thead>
            <tbody>
              {renewals.map((r) => {
                const t = db.tenants.find((x) => x.id === r.tenantId);
                const p = db.properties.find((x) => x.id === r.propertyId);
                return (
                  <tr
                    key={r.id}
                    className="border-b border-rule-2 last:border-b-0 hover:bg-blueprint/5"
                  >
                    <td className="px-3 py-2">
                      <Link
                        href={`/leasing/renewals/${r.id}`}
                        className="text-ink hover:underline"
                      >
                        {t?.brand ?? "—"}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-slate">
                      {p?.name ?? "—"} · {p?.town}, {p?.province}
                    </td>
                    <td className="px-3 py-2 font-mono">
                      {fmtDate(r.expiryDate)}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={cn(
                          "inline-flex items-center h-5 px-1.5 rounded-sm text-[10px] font-mono uppercase tracking-wider",
                          r.status === "ready"
                            ? "bg-pass-tint text-pass"
                            : r.status === "sent"
                              ? "bg-blueprint text-card"
                              : "bg-signal-tint text-signal",
                        )}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono text-right text-[12px] text-slate">
                      {fmtDate(r.createdAt)}
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

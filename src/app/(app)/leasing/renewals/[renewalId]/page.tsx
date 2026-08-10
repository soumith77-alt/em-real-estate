"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getRenewal } from "@/mock/api/leasing";
import {
  listTenantDocs,
  getClausesForTenant,
  getRentHistory,
} from "@/mock/api/vault";
import { db } from "@/mock/db";
import type { LeaseDoc, Clause } from "@/types";
import type { Renewal } from "@/mock/fixtures/renewals";
import { DocumentTimeline } from "@/components/docs/DocumentTimeline";
import { ClauseCard } from "@/components/docs/ClauseCard";
import { TableSkeleton } from "@/components/data/Skeletons";
import {
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
} from "recharts";
import { fmtDate, fmtPSF } from "@/lib/format";
import { ArrowLeft, Download } from "lucide-react";
import { toast } from "sonner";

export default function RenewalPage() {
  const { renewalId } = useParams<{ renewalId: string }>();
  const [renewal, setRenewal] = useState<Renewal | null>(null);
  const [docs, setDocs] = useState<LeaseDoc[] | null>(null);
  const [clauses, setClauses] = useState<Clause[] | null>(null);
  const [rent, setRent] = useState<Awaited<ReturnType<typeof getRentHistory>> | null>(null);

  useEffect(() => {
    (async () => {
      const r = await getRenewal(renewalId);
      setRenewal(r);
      if (!r) return;
      const [d, c, rh] = await Promise.all([
        listTenantDocs(r.tenantId),
        getClausesForTenant(r.tenantId),
        getRentHistory(r.tenantId),
      ]);
      setDocs(d);
      setClauses(c);
      setRent(rh);
    })();
  }, [renewalId]);

  if (!renewal || !docs || !clauses || !rent)
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        <TableSkeleton rows={12} />
      </div>
    );

  const tenant = db.tenants.find((t) => t.id === renewal.tenantId);
  const property = db.properties.find((p) => p.id === renewal.propertyId);
  const currentRent = rent[rent.length - 1];
  const recommendedLow = currentRent.marketPsfLow.toFixed(2);
  const recommendedHigh = currentRent.marketPsfHigh.toFixed(2);
  const activeClauses = clauses.filter((c) => c.status === "active");
  const supersededClauses = clauses.filter((c) => c.status === "superseded");

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      <Link
        href="/leasing/renewals"
        className="inline-flex items-center gap-1 text-[12px] text-slate hover:text-ink"
      >
        <ArrowLeft size={12} /> Renewals
      </Link>

      <div className="mt-2 flex items-baseline justify-between">
        <div>
          <div className="eyebrow">Renewal analysis</div>
          <h1 className="font-display text-[24px] font-medium tracking-tight text-ink mt-0.5">
            {tenant?.brand} · {property?.name}
          </h1>
          <div className="text-[12px] text-slate mt-1">
            Expiry {fmtDate(renewal.expiryDate)} · {docs.length} documents
            spanning{" "}
            {docs.length > 0 &&
              `${docs[0].signedOn.slice(0, 4)}–${docs[docs.length - 1].signedOn.slice(0, 4)}`}
          </div>
        </div>
        <button
          onClick={() => toast.success("Renewal report exported to Word")}
          className="inline-flex items-center gap-1.5 h-9 px-3 border border-rule bg-card hover:border-blueprint rounded-sm text-[12px]"
        >
          <Download size={12} /> Export to Word
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-6">
          <DocumentTimeline docs={docs} />

          <div>
            <h2 className="eyebrow mb-2">
              Clauses · {activeClauses.length} active ·{" "}
              <span className="text-fail">{supersededClauses.length} superseded</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {[...supersededClauses, ...activeClauses].map((c) => (
                <ClauseCard key={c.id} clause={c} />
              ))}
            </div>
          </div>

          <div className="bg-card border border-rule rounded-sm p-4">
            <div className="eyebrow mb-3">Rent history vs market band</div>
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <ComposedChart
                  data={rent}
                  margin={{ top: 5, right: 8, bottom: 0, left: -12 }}
                >
                  <CartesianGrid stroke="var(--rule-2)" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="year"
                    tick={{ fontSize: 11, fill: "var(--slate)" }}
                    axisLine={{ stroke: "var(--rule)" }}
                    tickLine={{ stroke: "var(--rule)" }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "var(--slate)" }}
                    axisLine={{ stroke: "var(--rule)" }}
                    tickLine={{ stroke: "var(--rule)" }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--ink)",
                      color: "var(--card)",
                      border: "none",
                      fontSize: 11,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="marketPsfHigh"
                    stroke="none"
                    fill="var(--blueprint)"
                    fillOpacity={0.08}
                  />
                  <Area
                    type="monotone"
                    dataKey="marketPsfLow"
                    stroke="none"
                    fill="var(--paper)"
                    fillOpacity={1}
                  />
                  <Line
                    type="monotone"
                    dataKey="rentPsf"
                    stroke="var(--ink)"
                    strokeWidth={2}
                    dot={{ fill: "var(--ink)", r: 2.5 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="text-[11px] text-slate mt-1">
              Dark line: actual base rent. Shaded band: market comparables
              (±12% of trend).
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="bg-card border border-rule rounded-sm p-4">
            <div className="eyebrow mb-3">Recommendation</div>
            <div className="text-[13px] text-ink">
              Renew at{" "}
              <span className="font-mono text-[18px]">
                ${recommendedLow}–${recommendedHigh}/sf
              </span>{" "}
              base rent.
            </div>
            <p className="text-[12px] text-slate mt-2 leading-relaxed">
              Tenant has performed well in-market. Recommended range reflects
              market comparables, 3.5%/year escalation, and the amended
              co-tenancy provisions from the 2018 amendment.
            </p>
            <div className="mt-3 pt-3 border-t border-rule-2 text-[11px] text-slate">
              This is a recommendation for you to decide on. The workspace
              never sends terms to a tenant on its own.
            </div>
          </div>

          <div className="bg-card border border-rule rounded-sm p-4">
            <div className="eyebrow mb-3">Standing rules applied</div>
            <ul className="space-y-1.5 text-[12px] text-ink">
              <li className="flex gap-2">
                <span className="text-slate-2 font-mono">•</span>
                <span>Anchor tenant covenant not required (non-anchor)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-slate-2 font-mono">•</span>
                <span>Percentage rent capped at 6% for specialty food</span>
              </li>
              <li className="flex gap-2">
                <span className="text-slate-2 font-mono">•</span>
                <span>Tone: neutral, evidence-first</span>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { getDeal } from "@/mock/api/acquisitions";
import { ConfidentialityBadge } from "@/components/shell/ConfidentialityBadge";
import type { Deal } from "@/types";
import { fmtCAD, fmtSqft, fmtDate } from "@/lib/format";
import { cn } from "@/lib/cn";

const TABS = [
  { href: "", label: "Overview" },
  { href: "/data-room", label: "Data room" },
  { href: "/run", label: "Run" },
  { href: "/report", label: "Report" },
  { href: "/model", label: "Model" },
];

export default function DealLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { dealId } = useParams<{ dealId: string }>();
  const pathname = usePathname();
  const [deal, setDeal] = useState<Deal | null>(null);

  useEffect(() => {
    (async () => {
      const d = await getDeal(dealId);
      setDeal(d);
    })();
  }, [dealId]);

  return (
    <div>
      <div className="border-b border-rule bg-card">
        <div className="max-w-[1400px] mx-auto px-6 pt-5 pb-3">
          <Link
            href="/acquisitions"
            className="text-[11px] text-slate hover:text-ink uppercase tracking-wider"
          >
            ← All deals
          </Link>
          <div className="mt-1.5 flex items-baseline justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-display text-[22px] font-medium tracking-tight text-ink">
                {deal?.propertyName ?? "—"}
              </h1>
              <div className="text-[12px] text-slate mt-0.5">
                {deal?.town}, {deal?.province} · {deal?.brokerFirm} ·{" "}
                {deal?.brokerName}
              </div>
            </div>
            {deal?.ndaSignedOn && (
              <ConfidentialityBadge ndaDate={fmtDate(deal.ndaSignedOn)} />
            )}
          </div>

          <div className="mt-3 grid grid-cols-4 gap-4 max-w-3xl text-[12px]">
            <Kv label="Asking">{deal ? fmtCAD(deal.askingPrice) : "—"}</Kv>
            <Kv label="GLA">{deal ? fmtSqft(deal.gla) : "—"}</Kv>
            <Kv label="Cap">{deal ? `${(deal.capRate * 100).toFixed(2)}%` : "—"}</Kv>
            <Kv label="Bid deadline">
              {deal?.bidDeadline ? fmtDate(deal.bidDeadline) : "—"}
            </Kv>
          </div>

          <nav className="mt-4 flex items-center gap-1">
            {TABS.map((t) => {
              const href = `/acquisitions/${dealId}${t.href}`;
              const active = pathname === href || (t.href === "" && pathname === `/acquisitions/${dealId}`);
              return (
                <Link
                  key={t.href}
                  href={href}
                  className={cn(
                    "h-8 px-3 text-[12px] rounded-t-sm border-b-2 -mb-px transition-colors flex items-center",
                    active
                      ? "border-blueprint text-ink font-medium"
                      : "border-transparent text-slate hover:text-ink",
                  )}
                >
                  {t.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
      {children}
    </div>
  );
}

function Kv({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="eyebrow">{label}</div>
      <div className="text-ink font-mono mt-0.5">{children}</div>
    </div>
  );
}

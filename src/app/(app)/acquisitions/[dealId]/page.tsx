"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  getExtractedFields,
  getDeal,
  hasCompletedRun,
} from "@/mock/api/acquisitions";
import type { Deal, ExtractedField } from "@/types";
import { EmptyState } from "@/components/data/EmptyState";
import { fmtDate } from "@/lib/format";
import { StatSkeleton } from "@/components/data/Skeletons";

export default function DealOverview() {
  const { dealId } = useParams<{ dealId: string }>();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [hasRun, setHasRun] = useState<boolean | null>(null);
  const [fields, setFields] = useState<ExtractedField[] | null>(null);

  useEffect(() => {
    (async () => {
      const [d, r] = await Promise.all([getDeal(dealId), hasCompletedRun(dealId)]);
      setDeal(d);
      setHasRun(r);
      if (r) {
        const f = await getExtractedFields(dealId);
        setFields(f);
      }
    })();
  }, [dealId]);

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      <h2 className="eyebrow mb-3">Extracted summary</h2>

      {hasRun === null && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 8 }, (_, i) => (
            <StatSkeleton key={i} />
          ))}
        </div>
      )}

      {hasRun === false && (
        <EmptyState
          title="No underwriting has been run for this deal yet"
          body="Run the pipeline to extract rent roll, financials, market comps, red flags, and a scenario in one pass. You control when it runs."
          action={{ label: "Run underwriting", href: `/acquisitions/${dealId}/run` }}
        />
      )}

      {hasRun && fields && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {fields.map((f) => (
              <div
                key={f.key}
                className="bg-card border border-rule rounded-sm p-4"
                title={
                  f.sourceFileId
                    ? `Source: ${f.sourceFileId}, p.${f.sourcePage}`
                    : undefined
                }
              >
                <div className="eyebrow">{f.label}</div>
                <div className="font-mono text-[20px] text-ink mt-1">
                  {f.value}
                </div>
                {f.sourceFileId && (
                  <div className="text-[10px] text-slate-2 mt-1 truncate">
                    from {f.sourceFileId}
                  </div>
                )}
              </div>
            ))}
          </div>

          <h2 className="eyebrow mt-8 mb-3">Deal timeline</h2>
          <ol className="border border-rule bg-card rounded-sm divide-y divide-rule-2">
            {deal &&
              [
                { at: deal.lastActivity, label: "Last activity logged", by: deal.brokerName },
                deal.ndaSignedOn && {
                  at: deal.ndaSignedOn,
                  label: "NDA signed — data room access granted",
                  by: "Kyle Robitaille",
                },
              ]
                .filter(Boolean)
                .map((row, i) => {
                  if (!row) return null;
                  return (
                    <li key={i} className="flex items-baseline gap-4 px-4 py-3">
                      <span className="font-mono text-[11px] text-slate w-[90px] shrink-0">
                        {fmtDate(row.at)}
                      </span>
                      <span className="text-[13px] text-ink flex-1">
                        {row.label}
                      </span>
                      <span className="text-[11px] text-slate">{row.by}</span>
                    </li>
                  );
                })}
          </ol>

          <div className="mt-6 flex items-center gap-3">
            <Link
              href={`/acquisitions/${dealId}/report`}
              className="inline-flex h-9 px-4 items-center bg-blueprint text-card rounded-sm text-[13px] font-medium hover:bg-blueprint-hover"
            >
              Open underwriting report
            </Link>
            <Link
              href={`/acquisitions/${dealId}/model`}
              className="text-[13px] text-blueprint hover:underline"
            >
              Adjust financing scenario →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

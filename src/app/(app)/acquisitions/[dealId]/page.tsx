"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { Sparkles, ArrowRight } from "lucide-react";

const CHAT_SUGGESTIONS = [
  "Summarize the rent roll.",
  "What are the biggest red flags?",
  "How sensitive is IRR to exit cap?",
];

export default function DealOverview() {
  const { dealId } = useParams<{ dealId: string }>();
  const router = useRouter();
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

  const chatWith = (q?: string) => {
    const href = q
      ? `/acquisitions/${dealId}/chat?q=${encodeURIComponent(q)}`
      : `/acquisitions/${dealId}/chat`;
    router.push(href);
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      {/* Chat entry — the discoverability answer to Jordan's feedback. */}
      {hasRun && (
        <div
          className="mb-6 rounded-lg overflow-hidden border border-blueprint/25"
          style={{ boxShadow: "var(--shadow-sm)" }}
        >
          <div className="bg-blueprint-tint px-5 py-4 flex items-start gap-3">
            <div className="grid place-items-center h-9 w-9 rounded-md bg-blueprint text-card shrink-0">
              <Sparkles size={15} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[14px] text-ink font-medium">
                Talk to the deal agent
              </div>
              <div className="text-[12px] text-slate mt-0.5 leading-snug">
                Ask about {deal?.propertyName ?? "this deal"}&rsquo;s rent roll,
                red flags, comparables, or any scenario in the model. Every
                answer cites its source.
              </div>
            </div>
            <button
              onClick={() => chatWith()}
              className="inline-flex items-center gap-1.5 h-9 px-4 bg-blueprint text-card rounded-md text-[12px] font-medium hover:bg-blueprint-hover transition-all shadow-sm shrink-0"
            >
              Open chat <ArrowRight size={13} />
            </button>
          </div>
          <div className="bg-card px-5 py-3 flex items-center gap-2 flex-wrap border-t border-blueprint/15">
            <span className="text-[10px] uppercase tracking-widest text-slate-2 mr-1">
              Try
            </span>
            {CHAT_SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => chatWith(s)}
                className="text-[11px] text-blueprint hover:text-blueprint-hover border border-blueprint/25 hover:border-blueprint hover:bg-blueprint-tint rounded-full px-3 h-7 transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

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
                className="card p-4"
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
          <ol className="card divide-y divide-rule-2 overflow-hidden">
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

          <div className="mt-6 flex items-center gap-3 flex-wrap">
            <Link
              href={`/acquisitions/${dealId}/report`}
              className="inline-flex h-10 px-5 items-center bg-blueprint text-card rounded-md text-[13px] font-medium hover:bg-blueprint-hover shadow-sm hover:shadow-md transition-all"
            >
              Open underwriting report
            </Link>
            <Link
              href={`/acquisitions/${dealId}/model`}
              className="inline-flex h-10 px-4 items-center border border-rule bg-card hover:border-blueprint rounded-md text-[13px] text-ink transition-colors"
            >
              Adjust financing scenario
            </Link>
            <button
              onClick={() => chatWith()}
              className="inline-flex items-center gap-1.5 h-10 px-4 text-[13px] text-blueprint hover:underline underline-offset-2"
            >
              <Sparkles size={13} /> Chat about this deal
            </button>
          </div>
        </>
      )}
    </div>
  );
}

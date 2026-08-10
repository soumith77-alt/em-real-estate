"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  getDeal,
  getExtractedFields,
  getRedFlags,
  getComparables,
  getRentRoll,
  getNarrative,
} from "@/mock/api/acquisitions";
import type { Deal, ExtractedField, RedFlag } from "@/types";
import { TableSkeleton } from "@/components/data/Skeletons";
import { fmtCAD, fmtDate } from "@/lib/format";
import { buildUnderwritingDocx } from "@/components/export/buildUnderwritingDocx";
import { downloadBlob } from "@/lib/download";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { cn } from "@/lib/cn";

export default function ReportPage() {
  const { dealId } = useParams<{ dealId: string }>();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [fields, setFields] = useState<ExtractedField[] | null>(null);
  const [redFlags, setRedFlags] = useState<RedFlag[] | null>(null);
  const [rentRoll, setRentRoll] = useState<Awaited<ReturnType<typeof getRentRoll>> | null>(null);
  const [comps, setComps] = useState<Awaited<ReturnType<typeof getComparables>> | null>(null);
  const [narrative, setNarrative] = useState<Awaited<ReturnType<typeof getNarrative>> | null>(null);

  useEffect(() => {
    (async () => {
      const [d, f, r, rr, c, n] = await Promise.all([
        getDeal(dealId),
        getExtractedFields(dealId),
        getRedFlags(dealId),
        getRentRoll(dealId),
        getComparables(dealId),
        getNarrative(dealId),
      ]);
      setDeal(d);
      setFields(f);
      setRedFlags(r);
      setRentRoll(rr);
      setComps(c);
      setNarrative(n);
    })();
  }, [dealId]);

  async function exportDocx() {
    if (!deal || !fields || !redFlags || !rentRoll || !comps || !narrative) return;
    const blob = await buildUnderwritingDocx({
      deal,
      fields,
      redFlags,
      rentRoll,
      comps,
      narrative,
    });
    downloadBlob(blob, `${deal.propertyName.replace(/\s+/g, "_")}_underwriting.docx`);
    toast.success("Word document exported");
  }

  if (!deal || !fields || !redFlags || !rentRoll || !comps || !narrative) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-6">
        <TableSkeleton rows={14} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-6">
      <div className="flex items-baseline justify-between mb-6">
        <h2 className="eyebrow">Underwriting report</h2>
        <button
          onClick={exportDocx}
          className="inline-flex items-center gap-1.5 h-9 px-3 border border-rule bg-card hover:border-blueprint rounded-sm text-[12px]"
        >
          <Download size={12} /> Export to Word
        </button>
      </div>

      <article className="bg-card border border-rule rounded-sm p-8 space-y-6">
        <div>
          <div className="eyebrow text-slate">Underwriting</div>
          <h1 className="font-display text-[26px] font-medium tracking-tight text-ink mt-1">
            {deal.propertyName}
          </h1>
          <div className="text-[12px] text-slate mt-1">
            {deal.town}, {deal.province} · Prepared 10 August 2026 · Kyle Robitaille
          </div>
        </div>

        <Section title="Executive summary">
          <p>{narrative.executiveSummary}</p>
        </Section>

        <Section title="Extracted deal facts">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-[12px]">
            {fields.map((f) => (
              <div key={f.key} className="flex items-baseline justify-between border-b border-rule-2 pb-1">
                <dt className="text-slate flex items-center gap-1">
                  {f.label}
                  {f.sourceFileId && (
                    <span
                      title={`Source: ${f.sourceFileId}, p.${f.sourcePage}`}
                      className="inline-block h-1.5 w-1.5 bg-blueprint/60 rounded-full ml-1"
                    />
                  )}
                </dt>
                <dd className="font-mono text-ink">{f.value}</dd>
              </div>
            ))}
          </dl>
          <div className="text-[10px] text-slate-2 mt-2">
            Blue dot = citation available on hover.
          </div>
        </Section>

        <Section title="Asset and market">
          <p>{narrative.assetAndMarket}</p>
        </Section>

        <Section title="Rent roll">
          <table className="w-full text-[12px] border-collapse">
            <thead>
              <tr className="border-b border-rule">
                <th className="eyebrow text-left py-1.5">Unit</th>
                <th className="eyebrow text-left py-1.5">Tenant</th>
                <th className="eyebrow text-right py-1.5">GLA</th>
                <th className="eyebrow text-right py-1.5">Rent PSF</th>
                <th className="eyebrow text-right py-1.5">Expiry</th>
              </tr>
            </thead>
            <tbody>
              {rentRoll.map((r, i) => (
                <tr key={i} className="border-b border-rule-2">
                  <td className="py-1.5 font-mono">{r.unit}</td>
                  <td className="py-1.5">{r.tenant}</td>
                  <td className="py-1.5 font-mono text-right">{r.sqft.toLocaleString()}</td>
                  <td className="py-1.5 font-mono text-right">${r.rentPsf.toFixed(2)}</td>
                  <td className="py-1.5 font-mono text-right">{fmtDate(r.end)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section title="Financial summary">
          <p>{narrative.financialSummary}</p>
        </Section>

        <Section title="Comparable sales">
          <table className="w-full text-[12px] border-collapse">
            <thead>
              <tr className="border-b border-rule">
                <th className="eyebrow text-left py-1.5">Property</th>
                <th className="eyebrow text-left py-1.5">Town</th>
                <th className="eyebrow text-right py-1.5">Date</th>
                <th className="eyebrow text-right py-1.5">Price</th>
                <th className="eyebrow text-right py-1.5">Cap</th>
              </tr>
            </thead>
            <tbody>
              {comps.map((c, i) => (
                <tr key={i} className="border-b border-rule-2">
                  <td className="py-1.5">{c.property}</td>
                  <td className="py-1.5">{c.town}</td>
                  <td className="py-1.5 font-mono text-right">{fmtDate(c.date)}</td>
                  <td className="py-1.5 font-mono text-right">{fmtCAD(c.price)}</td>
                  <td className="py-1.5 font-mono text-right">{(c.capRate * 100).toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section title="Red flags">
          <ul className="space-y-2">
            {redFlags.map((f) => (
              <li
                key={f.id}
                className="flex items-start gap-3 border-l-2 pl-3"
                style={{
                  borderColor:
                    f.severity === "high"
                      ? "var(--fail)"
                      : f.severity === "medium"
                        ? "var(--signal)"
                        : "var(--slate)",
                }}
              >
                <span
                  className={cn(
                    "eyebrow shrink-0",
                    f.severity === "high" ? "text-fail" : f.severity === "medium" ? "text-signal" : "text-slate",
                  )}
                >
                  {f.severity}
                </span>
                <div>
                  <div className="text-ink font-medium">{f.title}</div>
                  <div className="text-[12px] text-slate mt-0.5">{f.detail}</div>
                </div>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Recommendation">
          <p>{narrative.recommendation}</p>
        </Section>
      </article>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-[16px] font-medium tracking-tight text-ink mb-2">
        {title}
      </h2>
      <div className="text-[13px] text-slate leading-relaxed space-y-2">
        {children}
      </div>
    </section>
  );
}

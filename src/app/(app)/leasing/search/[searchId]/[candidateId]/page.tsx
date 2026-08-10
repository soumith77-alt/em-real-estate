"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  getSearch,
  getCandidateAssessment,
  getCriteriaSet,
} from "@/mock/api/leasing";
import { db } from "@/mock/db";
import type {
  CandidateAssessment,
  CriteriaSet,
  Retailer,
  SavedSearch,
} from "@/types";
import { fmtSqft, fmtDate } from "@/lib/format";
import { CriteriaMatrix } from "@/components/criteria/CriteriaMatrix";
import { CriteriaLegend } from "@/components/criteria/CriteriaLegend";
import { TableSkeleton } from "@/components/data/Skeletons";
import { ArrowLeft, Copy, Mail } from "lucide-react";
import { toast } from "sonner";

export default function CandidatePage() {
  const { searchId, candidateId } = useParams<{
    searchId: string;
    candidateId: string;
  }>();
  const [search, setSearch] = useState<SavedSearch | null>(null);
  const [assessment, setAssessment] = useState<CandidateAssessment | null>(null);
  const [set, setSet] = useState<CriteriaSet | null>(null);

  useEffect(() => {
    (async () => {
      const s = await getSearch(searchId);
      setSearch(s);
      if (!s) return;
      const [a, cs] = await Promise.all([
        getCandidateAssessment(searchId, candidateId),
        getCriteriaSet(s.criteriaSetId),
      ]);
      setAssessment(a);
      setSet(cs);
    })();
  }, [searchId, candidateId]);

  if (!search || !assessment || !set) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        <TableSkeleton rows={16} />
      </div>
    );
  }

  const retailer = db.retailers.find((r) => r.id === candidateId);
  if (!retailer) return null;

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      <Link
        href={`/leasing/search/${searchId}`}
        className="inline-flex items-center gap-1 text-[12px] text-slate hover:text-ink"
      >
        <ArrowLeft size={12} /> Back to results
      </Link>

      <div className="mt-3 grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
        <BrandCard retailer={retailer} assessment={assessment} />

        <div className="space-y-6">
          <CriteriaLegend />
          <CriteriaMatrix set={set} assessment={assessment} brand={retailer.brand} />

          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  buildAssessmentText(retailer, assessment, set),
                );
                toast.success("Assessment copied to clipboard");
              }}
              className="inline-flex items-center gap-1.5 h-8 px-3 border border-rule bg-card hover:border-blueprint rounded-sm text-[12px]"
            >
              <Copy size={12} /> Copy assessment
            </button>
            {retailer.realEstateContact && (
              <a
                href={`mailto:${retailer.realEstateContact.email}`}
                className="inline-flex items-center gap-1.5 h-8 px-3 border border-rule bg-card hover:border-blueprint rounded-sm text-[12px]"
              >
                <Mail size={12} /> Email {retailer.realEstateContact.name.split(" ")[0]}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function BrandCard({
  retailer,
  assessment,
}: {
  retailer: Retailer;
  assessment: CandidateAssessment;
}) {
  return (
    <div className="bg-card border border-rule rounded-sm p-4">
      <div className="flex items-start gap-3">
        <div className="grid place-items-center h-11 w-11 rounded-sm bg-ink text-card font-display font-medium">
          {retailer.brand.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="font-display text-[18px] font-medium tracking-tight text-ink truncate">
            {retailer.brand}
          </div>
          <div className="text-[11px] text-slate capitalize truncate">
            {retailer.category.replace(/-/g, " ")} · {retailer.parentCompany}
          </div>
        </div>
      </div>

      <dl className="mt-4 space-y-2.5 text-[12px]">
        <Row label="Composite score">
          <span className="font-mono text-[16px] text-blueprint">
            {assessment.compositeScore.toFixed(1)}
          </span>
        </Row>
        <Row label="Rank">
          <span className="font-mono">
            {assessment.rank ?? "—"}
          </span>
        </Row>
        <Row label="Hard filters">
          {assessment.hardFilterPassed ? (
            <span className="text-pass text-[11px] uppercase tracking-wider font-medium">
              Pass
            </span>
          ) : (
            <span className="text-fail text-[11px] uppercase tracking-wider font-medium">
              Fail
            </span>
          )}
        </Row>
        <Row label="Typical size">
          <span className="font-mono">
            {fmtSqft(retailer.sizeMin)} – {fmtSqft(retailer.sizeMax)}
          </span>
        </Row>
        <Row label="Locations in Canada">
          <span className="font-mono">
            {retailer.locationsCanada.value}
          </span>
        </Row>
        <Row label="Expansion">
          <span className="capitalize">{retailer.expansionStatus.value}</span>
        </Row>
        <Row label="Operates in Quebec">
          <span>{retailer.operatesInQuebec ? "Yes" : "No"}</span>
        </Row>
        <Row label="Tiers">
          <span className="capitalize">
            {retailer.tiersOperated.join(", ")}
          </span>
        </Row>
        {retailer.realEstateContact && (
          <Row label="Real-estate contact">
            <div className="text-right">
              <div>{retailer.realEstateContact.name}</div>
              <div className="text-[10px] text-slate-2">
                {retailer.realEstateContact.title}
              </div>
            </div>
          </Row>
        )}
      </dl>

      <div className="mt-4 pt-3 border-t border-rule-2 text-[11px] text-slate-2">
        Volatile fields last refreshed{" "}
        {fmtDate(retailer.expansionStatus.asOf)} · source{" "}
        {retailer.expansionStatus.source}
      </div>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-slate">{label}</dt>
      <dd className="text-ink text-right">{children}</dd>
    </div>
  );
}

function buildAssessmentText(
  retailer: Retailer,
  a: CandidateAssessment,
  set: CriteriaSet,
) {
  const lines = [
    `${retailer.brand} — ${retailer.category}`,
    `Composite score: ${a.compositeScore.toFixed(1)}. Rank: ${a.rank ?? "—"}. Hard filters: ${a.hardFilterPassed ? "PASS" : "FAIL"}.`,
    a.headline,
    "",
  ];
  for (const c of set.criteria.slice().sort((x, y) => x.number - y.number)) {
    const r = a.results[c.id];
    if (!r) continue;
    if (r.kind === "deterministic") {
      lines.push(
        `${c.number}. ${c.name} — ${r.outcome.toUpperCase()}. ${r.evidence}`,
      );
    } else {
      lines.push(`${c.number}. ${c.name} — ${r.score}/5. ${r.reasoning}`);
    }
  }
  return lines.join("\n");
}

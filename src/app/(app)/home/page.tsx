import { StatBlock } from "@/components/data/StatBlock";
import Link from "next/link";
import {
  getHomeSummary,
  getAttentionItems,
  getRecentReports,
  getKnowledgeSummary,
} from "@/mock/api/home";
import { fmtDate } from "@/lib/format";
import { AlertCircle, ArrowRight, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [summary, attention, reports, knowledge] = await Promise.all([
    getHomeSummary(),
    getAttentionItems(),
    getRecentReports(),
    getKnowledgeSummary(),
  ]);

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <div className="eyebrow">Today · 10 Aug 2026</div>
          <h1 className="font-display text-[24px] font-medium tracking-tight text-ink mt-0.5">
            Good morning, Kyle.
          </h1>
        </div>
        <div className="text-[12px] text-slate">
          Workspace last synced 12 min ago
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatBlock
          label="Open deals"
          value={summary.openDeals}
          hint="2 with bid deadlines this month"
          href="/acquisitions"
        />
        <StatBlock
          label="Bid deadlines ≤ 14d"
          value={summary.bidsSoon}
          tone={summary.bidsSoon > 0 ? "signal" : "default"}
          href="/acquisitions"
        />
        <StatBlock
          label="Vacant units"
          value={summary.vacant}
          hint="Across 42 centres"
          href="/leasing"
        />
        <StatBlock
          label="Expiries ≤ 6 mo"
          value={summary.expiring}
          hint="Renewal decisions to make"
          href="/leasing/expiry-watch"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section>
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="font-display text-[15px] font-medium tracking-tight">
                Needs your attention
              </h2>
              <span className="text-[11px] text-slate">
                {attention.length} items
              </span>
            </div>
            <div className="bg-card border border-rule rounded-sm divide-y divide-rule-2">
              {attention.map((a) => (
                <Link
                  key={a.id}
                  href={a.href}
                  className="flex items-start gap-3 p-3.5 hover:bg-blueprint/5"
                >
                  <div
                    className="mt-0.5"
                    style={{
                      color:
                        a.severity === "high"
                          ? "var(--fail)"
                          : a.severity === "medium"
                            ? "var(--signal)"
                            : "var(--slate)",
                    }}
                  >
                    <AlertCircle size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] text-ink">{a.title}</div>
                    <div className="text-[11px] text-slate mt-0.5">
                      {a.subtitle}
                    </div>
                  </div>
                  <div className="text-[11px] font-mono text-slate-2 shrink-0">
                    {a.metaRight}
                  </div>
                  <ArrowRight size={12} className="text-slate-2 mt-1" />
                </Link>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="font-display text-[15px] font-medium tracking-tight">
                Recent reports
              </h2>
              <Link
                href="/reports"
                className="text-[12px] text-blueprint hover:underline"
              >
                All reports →
              </Link>
            </div>
            <div className="bg-card border border-rule rounded-sm divide-y divide-rule-2">
              {reports.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center gap-3 p-3 text-[13px]"
                >
                  <FileText size={13} className="text-slate-2" />
                  <div className="flex-1 min-w-0 truncate">{r.title}</div>
                  <span className="text-[11px] text-slate uppercase tracking-wider">
                    {r.type}
                  </span>
                  <span className="font-mono text-[11px] text-slate-2 w-[80px] text-right">
                    {fmtDate(r.createdAt)}
                  </span>
                  <button className="text-[11px] text-blueprint hover:underline">
                    Download
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside>
          <div className="bg-card border border-rule rounded-sm p-4">
            <div className="eyebrow mb-3">What this workspace knows</div>
            <ul className="space-y-2 text-[13px]">
              {knowledge.map((k) => (
                <li
                  key={k.label}
                  className="flex items-baseline justify-between border-b border-rule-2 pb-2 last:border-b-0 last:pb-0"
                >
                  <div>
                    <div className="text-ink">{k.label}</div>
                    <div className="text-[11px] text-slate-2">
                      updated {fmtDate(k.updatedAt)}
                    </div>
                  </div>
                  <span className="font-mono text-[15px] text-ink">
                    {k.value}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              href="/knowledge"
              className="mt-4 inline-block text-[12px] text-blueprint hover:underline"
            >
              Open knowledge base →
            </Link>
          </div>
          <div className="mt-4 bg-card border border-rule rounded-sm p-4 text-[12px] text-slate leading-relaxed">
            Every job in this workspace is triggered by you. Nothing runs on
            its own — no auto-sends, no background posting.
          </div>
        </aside>
      </div>
    </div>
  );
}

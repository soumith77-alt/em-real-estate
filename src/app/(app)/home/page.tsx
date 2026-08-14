import { StatBlock } from "@/components/data/StatBlock";
import Link from "next/link";
import {
  getHomeSummary,
  getAttentionItems,
  getRecentReports,
  getKnowledgeSummary,
} from "@/mock/api/home";
import { fmtDate } from "@/lib/format";
import {
  ArrowRight,
  Building2,
  CalendarClock,
  Clock,
  FileText,
  Store,
  TrendingUp,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [summary, attention, reports, knowledge] = await Promise.all([
    getHomeSummary(),
    getAttentionItems(),
    getRecentReports(),
    getKnowledgeSummary(),
  ]);

  return (
    <div className="page">
      {/* Hero */}
      <div className="flex items-end justify-between mb-12 flex-wrap gap-6">
        <div className="max-w-2xl">
          <div className="eyebrow mb-3">
            Today · Thursday, 14 August · Montréal
          </div>
          <h1 className="display text-[42px] leading-[1.05]">
            Good morning, Kyle.
          </h1>
          <p className="text-[15px] text-slate mt-4 leading-relaxed">
            Three deals on the desk, one search finished overnight. Nothing runs
            on its own — every step here is yours to start.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate bg-card border border-rule rounded-full pl-2 pr-3.5 py-2 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span
              className="absolute inline-flex h-full w-full rounded-full bg-pass live-dot"
              style={{ opacity: 0.5 }}
            />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-pass" />
          </span>
          Workspace synced 12 min ago
        </div>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
        <StatBlock
          label="Open deals"
          value={summary.openDeals}
          hint="2 with bid deadlines this month"
          href="/acquisitions"
          accent="acq"
          icon={Building2}
        />
        <StatBlock
          label="Bid deadlines ≤ 14d"
          value={summary.bidsSoon}
          tone={summary.bidsSoon > 0 ? "signal" : "default"}
          hint="Move on these first"
          href="/acquisitions"
          accent="acq"
          icon={CalendarClock}
        />
        <StatBlock
          label="Vacant units"
          value={summary.vacant}
          hint="Across 42 centres"
          href="/leasing"
          accent="lea"
          icon={Store}
        />
        <StatBlock
          label="Expiries ≤ 6 mo"
          value={summary.expiring}
          hint="Renewal decisions to make"
          href="/leasing/expiry-watch"
          accent="lea"
          icon={Clock}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-14">
          <section>
            <div className="flex items-baseline justify-between mb-5">
              <h2 className="display text-[22px]">Needs your attention.</h2>
              <span className="text-[11px] text-slate">
                {attention.length} items
              </span>
            </div>
            <div className="card divide-y divide-rule-2 overflow-hidden">
              {attention.map((a) => {
                const sevBar =
                  a.severity === "high"
                    ? "bg-fail"
                    : a.severity === "medium"
                      ? "bg-signal"
                      : "bg-slate-2";
                const surface = a.href.startsWith("/acquisitions")
                  ? {
                      label: "Acquisitions",
                      cls: "bg-accent-acq-tint text-accent-acq",
                    }
                  : a.href.startsWith("/leasing")
                    ? {
                        label: "Leasing",
                        cls: "bg-accent-lea-tint text-accent-lea",
                      }
                    : {
                        label: "Workspace",
                        cls: "bg-blueprint-tint text-blueprint",
                      };
                return (
                  <Link
                    key={a.id}
                    href={a.href}
                    className="flex items-start gap-4 p-5 hover:bg-paper transition-colors group relative"
                  >
                    <span
                      className={`absolute left-0 top-4 bottom-4 w-[3px] rounded-r-sm ${sevBar}`}
                    />
                    <div className="flex-1 min-w-0 pl-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded ${surface.cls}`}
                        >
                          {surface.label}
                        </span>
                        <span className="text-[13.5px] text-ink truncate">
                          {a.title}
                        </span>
                      </div>
                      <div className="text-[11.5px] text-slate mt-0.5 leading-snug">
                        {a.subtitle}
                      </div>
                    </div>
                    <div className="text-[11px] font-mono text-slate-2 shrink-0 self-center">
                      {a.metaRight}
                    </div>
                    <ArrowRight
                      size={13}
                      className="text-slate-2 self-center group-hover:translate-x-0.5 group-hover:text-blueprint transition-all"
                    />
                  </Link>
                );
              })}
            </div>
          </section>

          <section>
            <div className="flex items-baseline justify-between mb-5">
              <h2 className="display text-[22px]">Recent reports.</h2>
              <Link
                href="/reports"
                className="text-[12px] text-blueprint hover:underline underline-offset-2"
              >
                All reports →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {reports.slice(0, 4).map((r) => {
                const typeAccent =
                  r.type === "underwriting"
                    ? {
                        cls: "bg-accent-acq-tint text-accent-acq",
                        label: "Underwriting",
                      }
                    : r.type === "renewal"
                      ? {
                          cls: "bg-accent-lea-tint text-accent-lea",
                          label: "Renewal",
                        }
                      : {
                          cls: "bg-blueprint-tint text-blueprint",
                          label: "Tenant search",
                        };
                return (
                  <div
                    key={r.id}
                    className="card card-lift p-5 flex flex-col gap-3 group cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`grid place-items-center h-8 w-8 rounded-md ${typeAccent.cls}`}
                      >
                        <FileText size={14} />
                      </div>
                      <span className="text-[9px] font-mono uppercase tracking-wider text-slate">
                        {typeAccent.label} · {r.format}
                      </span>
                    </div>
                    <div className="text-[13.5px] text-ink leading-snug line-clamp-2">
                      {r.title}
                    </div>
                    <div className="flex items-center justify-between mt-auto pt-1">
                      <span className="font-mono text-[10px] text-slate-2">
                        {fmtDate(r.createdAt)}
                      </span>
                      <span className="text-[11px] text-blueprint opacity-0 group-hover:opacity-100 transition-opacity">
                        Download →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="grid place-items-center h-8 w-8 rounded-md bg-blueprint-tint text-blueprint">
                <TrendingUp size={14} />
              </div>
              <h3 className="eyebrow !text-slate mb-0">
                What this workspace knows
              </h3>
            </div>
            <ul className="space-y-4 text-[13px]">
              {knowledge.map((k) => (
                <li
                  key={k.label}
                  className="flex items-baseline justify-between border-b border-rule-2 pb-3.5 last:border-b-0 last:pb-0"
                >
                  <div>
                    <div className="text-ink">{k.label}</div>
                    <div className="text-[10px] text-slate-2 mt-0.5">
                      refreshed {fmtDate(k.updatedAt)}
                    </div>
                  </div>
                  <span className="font-mono text-[18px] text-ink">
                    {k.value.toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              href="/knowledge"
              className="mt-5 inline-flex items-center gap-1 text-[12px] text-blueprint hover:underline underline-offset-2"
            >
              Open knowledge base
              <ArrowRight size={11} />
            </Link>
          </div>
          <div className="card p-5 text-[12.5px] text-slate leading-relaxed border-l-4 border-l-blueprint">
            Every job in this workspace is triggered by you. Nothing runs on its
            own — no auto-sends, no background posting.
          </div>
        </aside>
      </div>
    </div>
  );
}

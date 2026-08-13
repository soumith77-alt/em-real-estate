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
    <div className="relative">
      {/* Hero band */}
      <div
        className="absolute inset-x-0 top-0 h-[220px] pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, var(--accent-know-tint) 0%, transparent 100%)",
          opacity: 0.6,
        }}
      />

      <div className="relative max-w-[1400px] mx-auto px-6 py-8">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="eyebrow mb-1.5">
              Today · Thursday, 13 August · Montréal
            </div>
            <h1 className="font-display text-[30px] font-medium tracking-tight text-ink leading-tight">
              Good morning, Kyle.
            </h1>
            <p className="text-[13px] text-slate mt-1">
              Three deals on the desk, one search finished overnight.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate bg-card border border-rule rounded-full pl-2 pr-3 py-1.5 shadow-sm">
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

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-8">
            <section>
              <div className="flex items-baseline justify-between mb-3">
                <h2 className="font-display text-[16px] font-medium tracking-tight">
                  Needs your attention
                </h2>
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
                    ? { label: "Acquisitions", cls: "bg-accent-acq-tint text-accent-acq" }
                    : a.href.startsWith("/leasing")
                      ? { label: "Leasing", cls: "bg-accent-lea-tint text-accent-lea" }
                      : { label: "Workspace", cls: "bg-blueprint-tint text-blueprint" };
                  return (
                    <Link
                      key={a.id}
                      href={a.href}
                      className="flex items-start gap-3 p-4 hover:bg-paper transition-colors group relative"
                    >
                      <span
                        className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-r-sm ${sevBar}`}
                      />
                      <div className="flex-1 min-w-0 pl-2">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span
                            className={`text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded ${surface.cls}`}
                          >
                            {surface.label}
                          </span>
                          <span className="text-[13px] text-ink truncate">
                            {a.title}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate mt-0.5">
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
              <div className="flex items-baseline justify-between mb-3">
                <h2 className="font-display text-[16px] font-medium tracking-tight">
                  Recent reports
                </h2>
                <Link
                  href="/reports"
                  className="text-[12px] text-blueprint hover:underline underline-offset-2"
                >
                  All reports →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {reports.slice(0, 4).map((r) => {
                  const typeAccent =
                    r.type === "underwriting"
                      ? { cls: "bg-accent-acq-tint text-accent-acq", label: "Underwriting" }
                      : r.type === "renewal"
                        ? { cls: "bg-accent-lea-tint text-accent-lea", label: "Renewal" }
                        : { cls: "bg-blueprint-tint text-blueprint", label: "Tenant search" };
                  return (
                    <div
                      key={r.id}
                      className="card card-lift p-3.5 flex flex-col gap-2 group cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`grid place-items-center h-7 w-7 rounded-md ${typeAccent.cls}`}>
                          <FileText size={13} />
                        </div>
                        <span className="text-[9px] font-mono uppercase tracking-wider text-slate">
                          {typeAccent.label} · {r.format}
                        </span>
                      </div>
                      <div className="text-[13px] text-ink leading-snug line-clamp-2">
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

          <aside className="space-y-4">
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="grid place-items-center h-7 w-7 rounded-md bg-blueprint-tint text-blueprint">
                  <TrendingUp size={13} />
                </div>
                <h3 className="eyebrow !text-slate mb-0">
                  What this workspace knows
                </h3>
              </div>
              <ul className="space-y-3 text-[13px]">
                {knowledge.map((k) => (
                  <li
                    key={k.label}
                    className="flex items-baseline justify-between border-b border-rule-2 pb-2.5 last:border-b-0 last:pb-0"
                  >
                    <div>
                      <div className="text-ink">{k.label}</div>
                      <div className="text-[10px] text-slate-2 mt-0.5">
                        refreshed {fmtDate(k.updatedAt)}
                      </div>
                    </div>
                    <span className="font-mono text-[17px] text-ink">
                      {k.value.toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                href="/knowledge"
                className="mt-4 inline-flex items-center gap-1 text-[12px] text-blueprint hover:underline underline-offset-2"
              >
                Open knowledge base
                <ArrowRight size={11} />
              </Link>
            </div>
            <div className="card p-4 text-[12px] text-slate leading-relaxed border-l-4 border-l-blueprint">
              Every job in this workspace is triggered by you. Nothing runs on
              its own — no auto-sends, no background posting.
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

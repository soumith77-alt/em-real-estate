import Link from "next/link";
import { db } from "@/mock/db";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default function KnowledgeOverview() {
  const cards = [
    {
      href: "/knowledge/properties",
      title: "Properties",
      count: db.properties.length,
      body: "All 42 shopping centres, their units, tenancies, and legal restrictions.",
      consumes: "Hard filters, tenant search, renewal analysis",
    },
    {
      href: "/knowledge/retailers",
      title: "Retailers universe",
      count: db.retailers.length,
      body: "The industry-wide list the tenant search draws from. Stable fields (size, format) stay; volatile fields (locations, expansion) refresh — and your corrections survive.",
      consumes: "Tenant search",
    },
    {
      href: "/knowledge/criteria",
      title: "Criteria sets",
      count: `${db.criteriaSets.length}`,
      body: "Two market-tier criteria sets. Small-town uses more filters than major-city. Add or edit criteria without touching code.",
      consumes: "Tenant search hard filters + AI scoring",
    },
    {
      href: "/knowledge/rules",
      title: "Standing rules",
      count: db.standingRules.length,
      body: "The company's written preferences — cap-rate range, DSCR floor, provinces in scope, report tone. Every job reads these.",
      consumes: "Underwriting, renewal, all reports",
    },
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      <div className="eyebrow">Knowledge</div>
      <h1 className="font-display text-[24px] font-medium tracking-tight text-ink mt-0.5">
        What the workspace permanently knows
      </h1>
      <p className="text-[13px] text-slate mt-1 max-w-2xl">
        This is the answer to &ldquo;no memory&rdquo;. Every job in the app
        reads from these four places. You edit here once; every future report
        uses it.
      </p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="bg-card border border-rule rounded-sm p-5 hover:border-blueprint transition-colors group"
          >
            <div className="flex items-baseline justify-between">
              <div className="font-display text-[16px] font-medium tracking-tight text-ink">
                {c.title}
              </div>
              <div className="font-mono text-[24px] text-ink">
                {c.count}
              </div>
            </div>
            <div className="text-[13px] text-slate mt-2">{c.body}</div>
            <div className="mt-4 pt-3 border-t border-rule-2 flex items-center justify-between text-[11px] text-slate-2">
              <span>Consumed by: {c.consumes}</span>
              <ArrowRight
                size={12}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

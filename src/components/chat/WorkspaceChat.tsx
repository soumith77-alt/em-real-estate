"use client";
import { useEffect, useRef, useState } from "react";
import { db } from "@/mock/db";
import { cn } from "@/lib/cn";
import { fmtSqft, fmtDate } from "@/lib/format";
import { Send, Sparkles, User as UserIcon, X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

interface LinkRef {
  href: string;
  label: string;
}
interface Msg {
  id: string;
  from: "you" | "agent";
  text: string;
  links?: LinkRef[];
  ts: string;
}

const SUGGESTED = [
  "Which deals have bid deadlines this week?",
  "Which vacant units are largest?",
  "What pharmacy exclusivities are on file?",
  "When does the next lease expire?",
  "What's our cap-rate range in standing rules?",
  "Summarize what I need to look at today.",
];

// Small helpers into the mock DB.
const NOW = new Date("2026-08-14");
function daysBetween(iso: string): number {
  return Math.round((new Date(iso).getTime() - NOW.getTime()) / 86400000);
}

function scriptedReply(q: string): Msg {
  const query = q.toLowerCase();
  const now = new Date().toISOString();
  const mk = (text: string, links?: LinkRef[]): Msg => ({
    id: `a-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    from: "agent",
    text,
    links,
    ts: now,
  });

  // Bid deadlines
  if (/(bid|deadline|this week|coming up|urgent)/.test(query)) {
    const soon = db.deals
      .filter((d) => d.bidDeadline)
      .map((d) => ({ d, days: daysBetween(d.bidDeadline!) }))
      .filter((x) => x.days >= 0 && x.days <= 14)
      .sort((a, b) => a.days - b.days);
    if (soon.length === 0) {
      return mk("Nothing time-critical on bids in the next 14 days.");
    }
    const lines = soon
      .map(
        (x) =>
          `· ${x.d.propertyName} (${x.d.town}, ${x.d.province}) — bid ${fmtDate(x.d.bidDeadline!)}, ${x.days} day${x.days === 1 ? "" : "s"} out`,
      )
      .join("\n");
    return mk(
      `${soon.length} deal${soon.length === 1 ? "" : "s"} with bid deadlines in the next 14 days:\n${lines}\n\nMove on the earliest first.`,
      soon.slice(0, 3).map((x) => ({
        href: `/acquisitions/${x.d.id}`,
        label: `Open ${x.d.propertyName}`,
      })),
    );
  }

  // Vacant units
  if (/(vacant|vacan|unit|available|largest)/.test(query)) {
    const vacant = db.units
      .filter((u) => u.status === "vacant" || u.status === "notice-given")
      .sort((a, b) => b.gla - a.gla);
    const top = vacant.slice(0, 5);
    const lines = top
      .map((u) => {
        const p = db.properties.find((x) => x.id === u.propertyId);
        return `· ${p?.name ?? "—"} · Unit ${u.unitNo} — ${fmtSqft(u.gla)} ${u.format}`;
      })
      .join("\n");
    return mk(
      `${vacant.length} vacant or notice-given units across the portfolio. Largest five:\n${lines}`,
      [{ href: "/leasing", label: "Open the vacancy board" }],
    );
  }

  // Restrictions
  if (/(restrict|exclusiv|pharmacy|dollar store|coffee|liquor)/.test(query)) {
    const category = /pharmacy/.test(query)
      ? "pharmacy"
      : /dollar/.test(query)
        ? "dollar-store"
        : /coffee|café/.test(query)
          ? "coffee"
          : /liquor|saq/.test(query)
            ? "liquor"
            : null;
    const rows = db.restrictions.filter(
      (r) => !category || r.category.toLowerCase().includes(category),
    );
    if (rows.length === 0) {
      return mk(`No restrictions on file matching that.`);
    }
    const lines = rows
      .slice(0, 6)
      .map((r) => {
        const p = db.properties.find((x) => x.id === r.propertyId);
        const t = db.tenants.find((x) => x.id === r.grantedToTenantId);
        return `· ${p?.name ?? "—"} — ${r.kind.replace(/-/g, " ")} on ${r.category} (granted to ${t?.brand ?? "—"})`;
      })
      .join("\n");
    return mk(
      `${rows.length} matching restriction${rows.length === 1 ? "" : "s"} on file${category ? ` in the ${category.replace(/-/g, " ")} category` : ""}. First few:\n${lines}\n\nThese screen out candidates deterministically in every tenant search.`,
      [{ href: "/knowledge/properties", label: "Browse properties + restrictions" }],
    );
  }

  // Expiries
  if (/(expiry|expir|renewal|renew|lease end)/.test(query)) {
    const expiring = db.tenants
      .map((t) => ({ t, days: daysBetween(t.endDate) }))
      .filter((x) => x.days >= 0 && x.days <= 365)
      .sort((a, b) => a.days - b.days);
    const next = expiring.slice(0, 5);
    if (next.length === 0) {
      return mk("Nothing expiring in the next 12 months.");
    }
    const lines = next
      .map((x) => {
        const p = db.properties.find((pp) => pp.id === x.t.propertyId);
        return `· ${x.t.brand} at ${p?.name ?? "—"} — ${fmtDate(x.t.endDate)} (${x.days} days)`;
      })
      .join("\n");
    return mk(
      `Next expiries within 12 months:\n${lines}`,
      [{ href: "/leasing/expiry-watch", label: "Open expiry watch" }],
    );
  }

  // Standing rules
  if (/(rule|standing|cap rate|dscr|preference)/.test(query)) {
    const rules = db.standingRules.slice(0, 5);
    const lines = rules.map((r) => `· ${r.title}: ${r.body}`).join("\n");
    return mk(
      `${db.standingRules.length} standing rules on file. First few:\n${lines}`,
      [{ href: "/knowledge/rules", label: "Open standing rules" }],
    );
  }

  // Today / summary
  if (/(today|summary|need to|attention|morning|priorities)/.test(query)) {
    const openDeals = db.deals.filter(
      (d) => d.stage !== "won" && d.stage !== "passed",
    ).length;
    const bidsSoon = db.deals.filter((d) => {
      if (!d.bidDeadline) return false;
      const days = daysBetween(d.bidDeadline);
      return days >= 0 && days <= 14;
    }).length;
    const vacant = db.units.filter(
      (u) => u.status === "vacant" || u.status === "notice-given",
    ).length;
    return mk(
      `Today's snapshot:\n· ${openDeals} deals under evaluation, ${bidsSoon} with bid deadlines inside 14 days\n· ${vacant} vacant or notice-given units\n· ${db.reminders.filter((r) => !r.acknowledged).length} unacknowledged expiry reminders\n\nIf you only look at one thing, look at the deals with bids coming up.`,
      [{ href: "/home", label: "Open Today" }],
    );
  }

  // Property lookup by name
  const propMatch = db.properties.find((p) =>
    p.name.toLowerCase().includes(query),
  );
  if (propMatch) {
    return mk(
      `${propMatch.name} — ${propMatch.town}, ${propMatch.province}. ${propMatch.type.replace(/-/g, " ")}, ${fmtSqft(propMatch.gla)}, occupancy ${(propMatch.occupancy * 100).toFixed(1)}%. Anchor: ${propMatch.anchor ?? "—"}.`,
      [
        {
          href: `/knowledge/properties/${propMatch.id}`,
          label: "Open property",
        },
      ],
    );
  }

  // Tenant lookup
  const tenantMatch = db.tenants.find((t) =>
    t.brand.toLowerCase().includes(query),
  );
  if (tenantMatch) {
    const p = db.properties.find((x) => x.id === tenantMatch.propertyId);
    return mk(
      `${tenantMatch.brand} at ${p?.name ?? "—"}. Term ${tenantMatch.startDate.slice(0, 4)}–${tenantMatch.endDate.slice(0, 4)}, base rent $${tenantMatch.baseRentPsf}/sf, ${tenantMatch.optionsToRenew} option(s) to renew.`,
      [{ href: `/vault/${tenantMatch.id}`, label: "Open lease vault" }],
    );
  }

  // Fallback
  return mk(
    "I can answer across the workspace — deals, vacancies, tenants, restrictions, standing rules, and expiries. Try one of the suggestions on the right, or ask me about a specific property, tenant, or category. I don't run jobs or send anything; you trigger every action.",
  );
}

export function WorkspaceChat({ open, onClose }: Props) {
  const [msgs, setMsgs] = useState<Msg[]>(() => [
    {
      id: "greet",
      from: "agent",
      text: "Hi Kyle — I've got the full workspace in view. Deals, vacancies, tenants, restrictions, standing rules, expiries. Ask me anything.",
      ts: new Date().toISOString(),
    },
  ]);
  const [q, setQ] = useState("");
  const [thinking, setThinking] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [msgs, thinking]);

  async function send(text: string) {
    if (!text.trim() || thinking) return;
    const you: Msg = {
      id: `y-${Date.now()}`,
      from: "you",
      text: text.trim(),
      ts: new Date().toISOString(),
    };
    setMsgs((m) => [...m, you]);
    setQ("");
    setThinking(true);
    await new Promise((r) => setTimeout(r, 650 + Math.random() * 700));
    setMsgs((m) => [...m, scriptedReply(text)]);
    setThinking(false);
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex justify-end bg-ink/40"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="h-full w-full max-w-[560px] bg-card border-l border-rule flex flex-col"
        style={{ boxShadow: "var(--shadow-lg)" }}
      >
        <div className="flex items-center justify-between px-5 h-[60px] border-b border-rule">
          <div className="flex items-center gap-2.5">
            <div className="grid place-items-center h-8 w-8 rounded-md bg-blueprint text-card">
              <Sparkles size={14} />
            </div>
            <div className="leading-tight">
              <div className="text-[13px] text-ink font-medium">
                Workspace agent
              </div>
              <div className="text-[10px] text-slate-2 uppercase tracking-widest">
                Reads across every source you&rsquo;ve loaded
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-2 hover:text-ink p-1 rounded-md hover:bg-paper"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div
          ref={listRef}
          className="flex-1 overflow-y-auto px-5 py-4 space-y-4"
        >
          {msgs.map((m) => (
            <div
              key={m.id}
              className={cn(
                "flex gap-3",
                m.from === "you" && "flex-row-reverse",
              )}
            >
              <div
                className={cn(
                  "grid place-items-center h-7 w-7 rounded-full shrink-0",
                  m.from === "agent"
                    ? "bg-blueprint text-card"
                    : "bg-ink text-card",
                )}
                aria-hidden
              >
                {m.from === "agent" ? (
                  <Sparkles size={12} />
                ) : (
                  <UserIcon size={12} />
                )}
              </div>
              <div
                className={cn(
                  "max-w-[85%] px-3.5 py-2.5 rounded-lg text-[13px] leading-relaxed",
                  m.from === "agent"
                    ? "bg-paper text-ink"
                    : "bg-blueprint text-card",
                )}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>
                {m.links && m.links.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-rule/70 flex flex-wrap gap-1.5">
                    {m.links.map((l, i) => (
                      <a
                        key={i}
                        href={l.href}
                        onClick={() => onClose()}
                        className="text-[11px] text-blueprint hover:text-blueprint-hover underline underline-offset-2"
                      >
                        {l.label} →
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {thinking && (
            <div className="flex gap-3">
              <div className="grid place-items-center h-7 w-7 rounded-full bg-blueprint text-card shrink-0">
                <Sparkles size={12} />
              </div>
              <div className="bg-paper rounded-lg px-3.5 py-2.5 inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-2 skeleton" />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-slate-2 skeleton"
                  style={{ animationDelay: "0.15s" }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-slate-2 skeleton"
                  style={{ animationDelay: "0.3s" }}
                />
              </div>
            </div>
          )}

          {msgs.length <= 1 && (
            <div className="pt-2">
              <div className="eyebrow mb-2">Try asking</div>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    disabled={thinking}
                    className="text-[11px] text-blueprint hover:text-blueprint-hover border border-blueprint/25 hover:border-blueprint hover:bg-blueprint-tint rounded-full px-3 h-7 transition-all disabled:opacity-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(q);
          }}
          className="border-t border-rule px-4 py-3 flex items-center gap-2"
        >
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ask about deals, vacancies, tenants, restrictions…"
            className="flex-1 h-10 px-3 border border-rule bg-paper rounded-md text-[13px] focus:outline-none focus:border-blueprint focus:ring-2 focus:ring-blueprint/20 transition-all"
          />
          <button
            type="submit"
            disabled={!q.trim() || thinking}
            className="h-10 px-3 bg-blueprint text-card rounded-md text-[12px] font-medium hover:bg-blueprint-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
          >
            <Send size={13} /> Send
          </button>
        </form>
        <div className="px-4 pb-3 text-[10px] text-slate-2">
          The agent reads what the workspace already knows. It never triggers a
          job, sends anything, or edits records — you do.
        </div>
      </div>
    </div>
  );
}

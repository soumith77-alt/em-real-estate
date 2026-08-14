"use client";
import { useEffect, useRef, useState } from "react";
import type { Deal } from "@/types";
import { fmtCAD, fmtSqft, fmtPctPoints } from "@/lib/format";
import { cn } from "@/lib/cn";
import { Send, Sparkles, User as UserIcon } from "lucide-react";

interface Props {
  deal: Deal;
}

interface Msg {
  id: string;
  from: "you" | "agent";
  text: string;
  citations?: { docId: string; page?: number }[];
  ts: string;
}

const SUGGESTED = [
  "Summarize the rent roll.",
  "What are the biggest red flags?",
  "What did stage 5 turn up?",
  "How sensitive is IRR to exit cap?",
  "Compare Scenario A and B.",
  "Is this deal above our cap-rate ceiling?",
];

function scriptedReply(deal: Deal, q: string): Msg {
  const query = q.toLowerCase();
  const now = new Date().toISOString();
  const cap = (deal.capRate * 100).toFixed(2);

  const mk = (text: string, citations?: Msg["citations"]): Msg => ({
    id: `a-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    from: "agent",
    text,
    citations,
    ts: now,
  });

  if (/(rent roll|tenant|occupanc)/.test(query)) {
    return mk(
      `The rent roll for ${deal.propertyName} shows 22 tenants across ${fmtSqft(deal.gla)} at 92.4% occupancy. Walmart anchors at 122,400 sf with base rent $8.75/sf, expiry Apr 2028 (no renewal on file — that's flag #2 in the underwriting). Weighted-average lease term is 6.4 years. The specialty mix leans QC-familiar: Dollarama, Jean Coutu, Bulk Barn, SAQ.`,
      [
        { docId: "01 Financials/RENT ROLL final v3 (2).xlsx" },
        { docId: "02 Leases/Walmart Lease Executed.pdf", page: 3 },
      ],
    );
  }

  if (/(red flag|risk|concern|issue)/.test(query)) {
    return mk(
      `Three red flags from stage 5. High: Phase II ESA recommends soil sampling — former Petro-Canada fuel bar removed in 2004 ($18k–$32k, 4–6 weeks). Medium: Walmart lease expires 2028 with no renewal notice on file — model the downside as anchor-goes-dark at year 3. Medium: roof membrane installed 2014, 8–10 years remaining life — reserve $0.35/sf/year against 2032–2034 replacement.`,
      [
        {
          docId: "03 Environmental/Phase II ESA - DO NOT DISTRIBUTE.pdf",
          page: 42,
        },
        { docId: "09 Property Condition/PCA Report 2024.pdf", page: 11 },
      ],
    );
  }

  if (/(stage 5|market|comp|comparable)/.test(query)) {
    return mk(
      `Stage 4 pulled 12 sales from QC + Eastern ON 2023–2025, filtered to Walmart-anchored, kept 4 comps. Median implied value $17.4M at a 6.35% cap. The tightest comp is Place Sept-Îles at 6.2% (March 2025). Stage 5 layered the market read: population 18,400, retail density 8.4 sf/capita (regional average 7.9), no confirmed big-box competitor within 25 km.`,
    );
  }

  if (/(irr|sensitivity|exit cap|rent growth)/.test(query)) {
    return mk(
      `Base-case IRR is 11.4% on a 10-year hold. Sensitivity: at a 50bps higher exit cap (${(deal.capRate * 100 + 0.5).toFixed(2)}%), IRR drops to about 9.1%. Half a point lower rent growth costs roughly 130bps of IRR. The two variables compound — the downside cell (exit cap +50bps, rent growth −50bps) lands at 7.2% IRR, still above our floor but with no margin for a Walmart departure.`,
    );
  }

  if (/(scenario|compare|a and b|a vs b)/.test(query)) {
    return mk(
      `Scenario A (base) — 65% LTV, 6.25% rate, 2% rent growth: DSCR 1.35, IRR 11.4%, EM 1.85x. Scenario B (optimistic) — same debt, 3.5% rent growth, exit cap 5.75%: DSCR unchanged, IRR 14.2%, EM 2.14x. Scenario C (downside) — 8% vacancy, 0.5% rent growth, exit cap 7.75%: DSCR 1.15 (below our 1.20 threshold — flagged in the Model tab), IRR 7.2%.`,
    );
  }

  if (/(cap rate|cap.rate|ceiling|standing rule)/.test(query)) {
    return mk(
      `Standing rule "Cap-rate range" says 7.0–8.5% target for acquisitions in QC/ON. This deal comes in at ${cap}%, which is ${
        deal.capRate * 100 < 7 ? "below" : "inside"
      } that band. ${
        deal.capRate * 100 < 7
          ? "That's not a hard fail — the rule is a guideline — but flag it in the exec summary as a below-band bid rationale."
          : "Sits comfortably in-band."
      } Standing rules live in Knowledge → Rules; you can edit them there.`,
    );
  }

  if (/(bid|deadline|when)/.test(query)) {
    return mk(
      `Bid deadline is ${deal.bidDeadline ?? "not set yet"}. Broker is ${deal.brokerName} at ${deal.brokerFirm}. Last activity logged ${deal.lastActivity}. NDA signed ${deal.ndaSignedOn ?? "—"}.`,
    );
  }

  if (/(price|asking|valuation)/.test(query)) {
    return mk(
      `Asking price is ${fmtCAD(deal.askingPrice)} on ${fmtSqft(deal.gla)} — roughly ${fmtCAD(Math.round(deal.askingPrice / deal.gla))}/sf. At the ${cap}% going-in cap, in-place NOI is around ${fmtCAD(Math.round(deal.askingPrice * deal.capRate))}. The comp median implied value was $17.4M, so we're in-range.`,
    );
  }

  return mk(
    `I can pull from anything the pipeline already produced for ${deal.propertyName} — the rent roll, red flags, market study, comparables, or any scenario in the Model tab. Try one of the suggestions on the right, or ask about a specific figure. I don't act on the deal for you; every next step is your call.`,
  );
}

export function DealChat({ deal }: Props) {
  const [msgs, setMsgs] = useState<Msg[]>(() => [
    {
      id: "greeting",
      from: "agent",
      text: `Hi Kyle. ${deal.propertyName} underwriting is done — I've got the rent roll, red flags, comps, and three financing scenarios open. Ask me anything about what's on screen. I'll cite the source when it matters.`,
      ts: new Date().toISOString(),
    },
  ]);
  const [q, setQ] = useState("");
  const [thinking, setThinking] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

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
    await new Promise((r) => setTimeout(r, 700 + Math.random() * 700));
    setMsgs((m) => [...m, scriptedReply(deal, text)]);
    setThinking(false);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-4 h-[calc(100vh-260px)] min-h-[520px]">
      <div className="card flex flex-col overflow-hidden">
        <div className="flex items-center gap-2 px-5 h-12 border-b border-rule">
          <div className="grid place-items-center h-6 w-6 rounded-md bg-blueprint-tint text-blueprint">
            <Sparkles size={12} />
          </div>
          <div className="text-[13px] text-ink font-medium">
            Deal agent · {deal.propertyName}
          </div>
          <span className="ml-auto text-[10px] text-slate uppercase tracking-widest">
            Reads only what&rsquo;s already extracted
          </span>
        </div>

        <div ref={listRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
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
                  "grid place-items-center h-7 w-7 rounded-full shrink-0 text-[10px] font-medium",
                  m.from === "agent"
                    ? "bg-blueprint text-card"
                    : "bg-ink text-card",
                )}
                aria-hidden
              >
                {m.from === "agent" ? <Sparkles size={12} /> : <UserIcon size={12} />}
              </div>
              <div
                className={cn(
                  "max-w-[80%] px-3.5 py-2.5 rounded-lg text-[13px] leading-relaxed",
                  m.from === "agent"
                    ? "bg-paper text-ink"
                    : "bg-blueprint text-card",
                )}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>
                {m.citations && m.citations.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-rule/70 space-y-1">
                    {m.citations.map((c, i) => (
                      <div
                        key={i}
                        className="text-[10px] font-mono text-slate-2 truncate"
                        title={c.docId}
                      >
                        · {c.docId}
                        {c.page != null && `, p.${c.page}`}
                      </div>
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
              <div className="bg-paper text-slate rounded-lg px-3.5 py-2.5 text-[13px] inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-2 skeleton" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-2 skeleton" style={{ animationDelay: "0.15s" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-2 skeleton" style={{ animationDelay: "0.3s" }} />
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
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ask about the rent roll, red flags, or a scenario…"
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
          The agent answers only about what the pipeline has already produced. It never runs stages, sends emails, or edits the deal on your behalf.
        </div>
      </div>

      <aside className="hidden lg:flex flex-col gap-2">
        <div className="eyebrow px-1">Try asking</div>
        {SUGGESTED.map((s) => (
          <button
            key={s}
            onClick={() => send(s)}
            disabled={thinking}
            className="text-left card card-lift px-3 py-2.5 text-[12px] text-ink disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </aside>
    </div>
  );
}

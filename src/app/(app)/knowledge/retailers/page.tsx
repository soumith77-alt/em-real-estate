"use client";
import { useEffect, useMemo, useState } from "react";
import { listRetailers, refreshVolatile } from "@/mock/api/knowledge";
import type { Retailer } from "@/types";
import { useEditsStore } from "@/stores/useEditsStore";
import { fmtSqft, fmtDate } from "@/lib/format";
import { cn } from "@/lib/cn";
import { toast } from "sonner";
import { TableSkeleton } from "@/components/data/Skeletons";
import { Check, Pencil, RefreshCw, X } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";

export default function RetailersPage() {
  const [retailers, setRetailers] = useState<Retailer[] | null>(null);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [expansion, setExpansion] = useState<string>("all");
  const [correctionsOnly, setCorrectionsOnly] = useState(false);
  const [refresh, setRefresh] = useState<{ updated: number; total: number } | null>(null);
  const { retailerEdits, editRetailer, count } = useEditsStore();

  useEffect(() => {
    (async () => {
      const list = await listRetailers();
      setRetailers(list);
    })();
  }, []);

  const categories = useMemo(() => {
    if (!retailers) return [];
    return Array.from(new Set(retailers.map((r) => r.category))).sort();
  }, [retailers]);

  const filtered = useMemo(() => {
    if (!retailers) return [];
    return retailers.filter((r) => {
      if (q && !r.brand.toLowerCase().includes(q.toLowerCase())) return false;
      if (category !== "all" && r.category !== category) return false;
      if (expansion !== "all" && r.expansionStatus.value !== expansion) return false;
      if (correctionsOnly && !retailerEdits[r.id]) return false;
      return true;
    });
  }, [retailers, q, category, expansion, correctionsOnly, retailerEdits]);

  async function doRefresh() {
    if (refresh) return;
    toast.info("Refreshing volatile fields — your corrections are preserved.");
    for await (const evt of refreshVolatile()) {
      setRefresh(evt);
    }
    setRefresh(null);
    toast.success(`Volatile fields refreshed. Your ${count()} correction${count() === 1 ? "" : "s"} are untouched.`);
  }

  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 46,
    overscan: 10,
  });

  if (!retailers)
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        <TableSkeleton rows={12} />
      </div>
    );

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      <div className="flex items-baseline justify-between mb-1">
        <div>
          <div className="eyebrow">Knowledge · Retailers</div>
          <h1 className="font-display text-[24px] font-medium tracking-tight text-ink mt-0.5">
            Retailer universe
          </h1>
        </div>
        <div className="text-[12px] text-slate">
          {filtered.length.toLocaleString()} of {retailers.length.toLocaleString()} retailers
        </div>
      </div>
      <p className="text-[13px] text-slate mt-1 max-w-3xl">
        Every retailer the tenant search evaluates. Fields marked with a dot
        are volatile — they update on refresh. Your corrections are never
        overwritten.
      </p>

      <div className="mt-4 flex gap-2 items-center flex-wrap">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search brand"
          className="h-8 px-3 border border-rule bg-card rounded-sm text-[12px] w-[220px] focus:border-blueprint outline-none"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-8 px-2 border border-rule bg-card rounded-sm text-[12px] capitalize"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c.replace(/-/g, " ")}
            </option>
          ))}
        </select>
        <select
          value={expansion}
          onChange={(e) => setExpansion(e.target.value)}
          className="h-8 px-2 border border-rule bg-card rounded-sm text-[12px] capitalize"
        >
          <option value="all">All expansion states</option>
          <option value="expanding">Expanding</option>
          <option value="stable">Stable</option>
          <option value="dormant">Dormant</option>
          <option value="closing">Closing</option>
        </select>
        <label className="ml-2 flex items-center gap-1.5 text-[12px] text-slate cursor-pointer">
          <input
            type="checkbox"
            checked={correctionsOnly}
            onChange={(e) => setCorrectionsOnly(e.target.checked)}
            className="accent-blueprint"
          />
          Your corrections ({count()})
        </label>

        <button
          onClick={doRefresh}
          disabled={!!refresh}
          className="ml-auto inline-flex items-center gap-1.5 h-8 px-3 border border-rule bg-card hover:border-blueprint rounded-sm text-[12px]"
        >
          <RefreshCw
            size={12}
            className={refresh ? "animate-spin" : ""}
          />
          {refresh
            ? `Refreshing ${refresh.updated}/${refresh.total}…`
            : "Refresh volatile fields"}
        </button>
      </div>

      <div className="mt-4 bg-card border border-rule rounded-sm overflow-hidden">
        <div className="bg-card-2 border-b border-rule flex text-[10px] uppercase tracking-wider text-slate">
          <div className="px-3 h-8 flex items-center flex-1 min-w-0">Brand</div>
          <div className="px-3 h-8 flex items-center w-[130px]">Category</div>
          <div className="px-3 h-8 flex items-center w-[130px] text-right">Typical size</div>
          <div className="px-3 h-8 flex items-center w-[80px] text-right">Locations</div>
          <div className="px-3 h-8 flex items-center w-[110px]">Expansion</div>
          <div className="px-3 h-8 flex items-center w-[80px]">Tiers</div>
          <div className="px-3 h-8 flex items-center w-[100px]">Source</div>
        </div>

        <div
          ref={parentRef}
          className="overflow-auto"
          style={{ height: "min(calc(100vh - 320px), 620px)" }}
        >
          <div
            style={{ height: `${virtualizer.getTotalSize()}px`, position: "relative" }}
          >
            {virtualizer.getVirtualItems().map((v) => {
              const r = filtered[v.index];
              return (
                <div
                  key={r.id}
                  className="absolute left-0 right-0 flex items-center border-b border-rule-2 hover:bg-blueprint/5 text-[13px]"
                  style={{ transform: `translateY(${v.start}px)`, height: 46 }}
                >
                  <div className="px-3 flex-1 min-w-0 truncate">
                    <div className="text-ink truncate">{r.brand}</div>
                    <div className="text-[10px] text-slate-2 truncate">
                      {r.parentCompany}
                    </div>
                  </div>
                  <div className="px-3 w-[130px] text-slate capitalize truncate">
                    {r.category.replace(/-/g, " ")}
                  </div>
                  <div className="px-3 w-[130px] font-mono text-right text-slate">
                    {fmtSqft(r.sizeMin)}–{fmtSqft(r.sizeMax)}
                  </div>
                  <EditableCell
                    retailerId={r.id}
                    field="locationsCanada"
                    original={r.locationsCanada.value}
                    edit={retailerEdits[r.id]?.locationsCanada}
                    onSave={(val) =>
                      editRetailer({
                        retailerId: r.id,
                        field: "locationsCanada",
                        value: val,
                        at: "2026-08-10",
                        by: "Kyle",
                      })
                    }
                    className="px-3 w-[80px]"
                  />
                  <div className="px-3 w-[110px]">
                    <ExpansionChip status={r.expansionStatus.value} corrected={!!retailerEdits[r.id]?.expansionStatus} />
                  </div>
                  <div className="px-3 w-[80px] text-[10px] text-slate uppercase tracking-wider">
                    {r.tiersOperated.length}
                  </div>
                  <div className="px-3 w-[100px] text-[10px] text-slate-2 truncate">
                    {fmtDate(r.expansionStatus.asOf)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-4 text-[11px] text-slate leading-relaxed max-w-3xl">
        <span className="inline-flex items-center gap-1 mr-3">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-blueprint/60" />
          volatile
        </span>
        <span className="inline-flex items-center gap-1 mr-3">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-signal" />
          corrected by you (excluded from refresh)
        </span>
        Refresh pulls the latest from Retail Insider / Chain Store Guide.
        Your edits are preserved and always win.
      </div>
    </div>
  );
}

function EditableCell({
  retailerId,
  field,
  original,
  edit,
  onSave,
  className,
}: {
  retailerId: string;
  field: string;
  original: number;
  edit?: { value: number | string; at: string; by: string };
  onSave: (v: number) => void;
  className?: string;
}) {
  void retailerId;
  void field;
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState<number>(
    typeof edit?.value === "number" ? edit.value : original,
  );
  const display = typeof edit?.value === "number" ? edit.value : original;

  return (
    <div
      className={cn(
        "font-mono text-right relative group flex items-center justify-end gap-1",
        className,
      )}
    >
      {editing ? (
        <>
          <input
            type="number"
            value={val}
            onChange={(e) => setVal(Number(e.target.value))}
            className="w-[52px] h-6 px-1.5 border border-blueprint bg-card text-[12px] text-right font-mono outline-none"
            autoFocus
          />
          <button
            onClick={() => {
              onSave(val);
              setEditing(false);
              toast.success("Correction saved");
            }}
            className="text-pass"
            aria-label="Save"
          >
            <Check size={11} />
          </button>
          <button onClick={() => setEditing(false)} className="text-slate">
            <X size={11} />
          </button>
        </>
      ) : (
        <>
          <span
            className={cn(edit ? "text-signal" : "text-ink")}
            title={
              edit
                ? `Corrected by ${edit.by} on ${edit.at}`
                : "Volatile field — updates on refresh"
            }
          >
            <span
              className={cn(
                "inline-block w-1.5 h-1.5 rounded-full mr-1.5",
                edit ? "bg-signal" : "bg-blueprint/60",
              )}
            />
            {display}
          </span>
          <button
            onClick={() => {
              setVal(display);
              setEditing(true);
            }}
            className="opacity-0 group-hover:opacity-100 text-slate-2 hover:text-ink transition-opacity"
            aria-label="Edit"
          >
            <Pencil size={10} />
          </button>
        </>
      )}
    </div>
  );
}

function ExpansionChip({
  status,
  corrected,
}: {
  status: Retailer["expansionStatus"]["value"];
  corrected: boolean;
}) {
  const color =
    status === "expanding"
      ? "bg-pass-tint text-pass border-pass/30"
      : status === "closing"
        ? "bg-fail-tint text-fail border-fail/30"
        : status === "dormant"
          ? "bg-signal-tint text-signal border-signal/30"
          : "bg-paper text-slate border-rule";
  return (
    <span
      className={cn(
        "inline-flex items-center h-5 px-1.5 border rounded-sm text-[10px] font-mono uppercase tracking-wider",
        color,
      )}
    >
      <span
        className={cn(
          "inline-block w-1 h-1 rounded-full mr-1",
          corrected ? "bg-signal" : "bg-current opacity-60",
        )}
      />
      {status}
    </span>
  );
}

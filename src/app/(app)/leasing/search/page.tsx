"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { db } from "@/mock/db";
import { startSearch, getCriteriaSet } from "@/mock/api/leasing";
import { fmtSqft } from "@/lib/format";
import { ChevronRight } from "lucide-react";
import { toast } from "sonner";
import type { CriteriaSet } from "@/types";

export default function NewSearchPage() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto px-6 py-10 text-slate">Loading…</div>}>
      <SearchConfig />
    </Suspense>
  );
}

function SearchConfig() {
  const router = useRouter();
  const params = useSearchParams();
  const unitId = params.get("unit") ?? db.units.find((u) => u.status === "vacant")?.id ?? "";

  const unit = db.units.find((u) => u.id === unitId);
  const property = db.properties.find((p) => p.id === unit?.propertyId);
  const propRestrictions = db.restrictions.filter(
    (r) => r.propertyId === unit?.propertyId,
  );

  const [setId, setSetId] = useState<string>("");
  const [criteriaSet, setCriteriaSet] = useState<CriteriaSet | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!property) return;
    const defaultSet = db.criteriaSets.find((s) => s.tier === property.tier);
    if (defaultSet) setSetId(defaultSet.id);
  }, [property]);

  useEffect(() => {
    if (!setId) return;
    (async () => {
      const cs = await getCriteriaSet(setId);
      setCriteriaSet(cs);
    })();
  }, [setId]);

  if (!unit || !property) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10 text-slate">
        Unit not found.
      </div>
    );
  }

  const inScopeApprox = 400;

  async function run() {
    if (!setId) return;
    setBusy(true);
    const search = await startSearch(unitId, setId);
    toast.success("Search started");
    router.push(`/leasing/search/${search.id}`);
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-6">
      <div className="eyebrow">Leasing · Tenant search</div>
      <h1 className="font-display text-[22px] font-medium tracking-tight text-ink mt-1">
        New search
      </h1>
      <p className="text-[13px] text-slate mt-1">
        Confirm the unit and criteria, then run. You control the run.
      </p>

      <ol className="mt-6 space-y-4">
        <Step n={1} title="Unit">
          <div className="grid grid-cols-2 gap-4 text-[13px]">
            <Field label="Property">{property.name}</Field>
            <Field label="Town">
              {property.town}, {property.province}
            </Field>
            <Field label="Unit">
              <span className="font-mono">{unit.unitNo}</span>
            </Field>
            <Field label="GLA">
              <span className="font-mono">{fmtSqft(unit.gla)}</span>
            </Field>
            <Field label="Frontage">
              <span className="font-mono">{unit.frontageFt}&#39;</span>
            </Field>
            <Field label="Format">
              <span className="capitalize">{unit.format}</span>
            </Field>
            <Field label="Features">
              <span className="capitalize">
                {unit.features.length
                  ? unit.features.map((f) => f.replace(/-/g, " ")).join(", ")
                  : "None"}
              </span>
            </Field>
            <Field label="Market tier">
              <span className="capitalize">{property.tier}</span>
            </Field>
          </div>

          {propRestrictions.length > 0 && (
            <div className="mt-4 border border-signal/30 bg-signal-tint/40 rounded-sm p-3">
              <div className="eyebrow text-signal mb-2">
                {propRestrictions.length} legal restriction
                {propRestrictions.length === 1 ? "" : "s"} apply on this
                property
              </div>
              <ul className="space-y-1.5 text-[12px] text-ink">
                {propRestrictions.slice(0, 4).map((r) => (
                  <li key={r.id} className="flex gap-2">
                    <ChevronRight size={12} className="mt-0.5 text-signal" />
                    <span>
                      <span className="font-medium capitalize">
                        {r.category}
                      </span>{" "}
                      · {r.kind.replace(/-/g, " ")}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="text-[11px] text-slate mt-2">
                These drive deterministic fails — no retailer in a restricted
                category will pass hard filters.
              </div>
            </div>
          )}
        </Step>

        <Step n={2} title="Criteria set">
          <div className="grid grid-cols-2 gap-2">
            {db.criteriaSets.map((s) => (
              <label
                key={s.id}
                className={`flex items-start gap-3 p-3 border rounded-sm cursor-pointer transition-colors ${
                  setId === s.id
                    ? "border-blueprint bg-blueprint/5"
                    : "border-rule hover:border-blueprint/40"
                }`}
              >
                <input
                  type="radio"
                  name="set"
                  checked={setId === s.id}
                  onChange={() => setSetId(s.id)}
                  className="mt-0.5 accent-blueprint"
                />
                <div>
                  <div className="text-ink text-[13px] font-medium">
                    {s.name}
                  </div>
                  <div className="text-[11px] text-slate mt-0.5">
                    {s.criteria.length} criteria · {s.tier}
                  </div>
                </div>
              </label>
            ))}
          </div>
          {criteriaSet && (
            <div className="mt-2 text-[11px] text-slate">
              {criteriaSet.criteria.filter((c) => c.provenance === "deterministic").length}{" "}
              deterministic ·{" "}
              {criteriaSet.criteria.filter((c) => c.provenance === "ai").length}{" "}
              AI-scored
            </div>
          )}
        </Step>

        <Step n={3} title="Starting pool">
          <div className="text-[13px] text-ink">
            <span className="font-mono text-[16px] text-ink">
              {db.retailers.length}
            </span>{" "}
            retailers in the universe →{" "}
            <span className="font-mono text-[16px] text-blueprint">
              ~{inScopeApprox}
            </span>{" "}
            in scope for this format, size band, and province.
          </div>
          <p className="text-[11px] text-slate mt-1">
            Scope excludes retailers whose accepted formats or tier operations
            don&rsquo;t match this unit.
          </p>
        </Step>
      </ol>

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={run}
          disabled={busy || !setId}
          className="h-10 px-5 bg-blueprint text-card rounded-sm text-[13px] font-medium hover:bg-blueprint-hover disabled:opacity-50"
        >
          {busy ? "Starting…" : "Run search"}
        </button>
        <button
          onClick={() => router.back()}
          className="h-10 px-3 text-[13px] text-slate hover:text-ink"
        >
          Cancel
        </button>
        <span className="text-[11px] text-slate-2 ml-auto">
          Every job in this workspace is triggered by you.
        </span>
      </div>
    </div>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="bg-card border border-rule rounded-sm">
      <div className="px-4 py-2.5 border-b border-rule flex items-center gap-3">
        <span className="grid place-items-center h-5 w-5 rounded-full bg-ink text-card text-[10px] font-mono">
          {n}
        </span>
        <span className="eyebrow">{title}</span>
      </div>
      <div className="p-4">{children}</div>
    </li>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="eyebrow mb-1">{label}</div>
      <div className="text-ink">{children}</div>
    </div>
  );
}

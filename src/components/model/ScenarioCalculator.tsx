"use client";
import { useMemo, useState } from "react";
import { fmtCAD, fmtPctPoints, fmtRatio } from "@/lib/format";
import { cn } from "@/lib/cn";
import { computeScenario, sensitivity, type FinanceInputs } from "@/mock/engine/financeModel";
import { buildScenarioXlsx } from "@/components/export/buildScenarioXlsx";
import { downloadBlob } from "@/lib/download";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { SensitivityGrid } from "./SensitivityGrid";

interface Props {
  dealName: string;
  askingPrice: number;
  gla: number;
  goingInCap: number;
}

interface Scenario {
  id: "A" | "B" | "C";
  name: string;
  inputs: FinanceInputs;
}

export function ScenarioCalculator({
  dealName,
  askingPrice,
  gla,
  goingInCap,
}: Props) {
  const [activeId, setActiveId] = useState<Scenario["id"]>("A");
  const [scenarios, setScenarios] = useState<Scenario[]>(() => [
    {
      id: "A",
      name: "Base case",
      inputs: mkInputs(askingPrice, gla, goingInCap),
    },
    {
      id: "B",
      name: "Optimistic",
      inputs: mkInputs(askingPrice, gla, goingInCap, {
        rentGrowth: 0.035,
        exitCap: goingInCap - 0.005,
      }),
    },
    {
      id: "C",
      name: "Downside",
      inputs: mkInputs(askingPrice, gla, goingInCap, {
        rentGrowth: 0.005,
        exitCap: goingInCap + 0.01,
        vacancyAllowance: 0.08,
      }),
    },
  ]);
  const [compare, setCompare] = useState(false);

  const active = scenarios.find((s) => s.id === activeId)!;

  const outputs = useMemo(() => computeScenario(active.inputs), [active.inputs]);

  const setInput = (patch: Partial<FinanceInputs>) =>
    setScenarios((prev) =>
      prev.map((s) =>
        s.id === activeId ? { ...s, inputs: { ...s.inputs, ...patch } } : s,
      ),
    );

  const sens = useMemo(() => {
    const exitCaps = [-0.01, -0.005, 0, 0.005, 0.01].map((d) => active.inputs.exitCap + d);
    const growths = [-0.01, -0.005, 0, 0.005, 0.01].map((d) => active.inputs.rentGrowth + d);
    // sensitivity returns [exitCap][rentGrowth]; the grid wants [rentGrowth (y)][exitCap (x)] so transpose.
    const raw = sensitivity(active.inputs, exitCaps, growths);
    const matrix = growths.map((_, gi) => exitCaps.map((__, ei) => raw[ei][gi]));
    return { exitCaps, growths, matrix };
  }, [active.inputs]);

  const dscrBad = outputs.dscr < 1.2;

  async function exportXlsx() {
    const blob = await buildScenarioXlsx(dealName, scenarios);
    downloadBlob(blob, `${dealName.replace(/\s+/g, "_")}_scenario.xlsx`);
    toast.success("Excel exported with live formulas");
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {scenarios.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveId(s.id)}
              className={cn(
                "h-8 px-3 border rounded-sm text-[12px]",
                activeId === s.id
                  ? "border-blueprint bg-blueprint text-card font-medium"
                  : "border-rule bg-card text-slate hover:border-blueprint",
              )}
            >
              {s.id} · {s.name}
            </button>
          ))}
          <button
            onClick={() => setCompare((c) => !c)}
            className="h-8 px-3 border border-rule bg-card rounded-sm text-[12px] text-slate hover:border-blueprint ml-2"
          >
            {compare ? "Hide comparison" : "Compare A / B / C"}
          </button>
        </div>
        <button
          onClick={exportXlsx}
          className="inline-flex items-center gap-1.5 h-8 px-3 border border-rule bg-card rounded-sm text-[12px] text-ink hover:border-blueprint"
        >
          <Download size={12} /> Export to Excel
        </button>
      </div>

      {compare && (
        <div className="mb-6 grid grid-cols-3 gap-3">
          {scenarios.map((s) => {
            const o = computeScenario(s.inputs);
            return (
              <div
                key={s.id}
                className="bg-card border border-rule rounded-sm p-3"
              >
                <div className="eyebrow mb-2">
                  {s.id} · {s.name}
                </div>
                <dl className="space-y-1 text-[12px]">
                  <MicroKV label="DSCR" v={fmtRatio(o.dscr)} bad={o.dscr < 1.2} />
                  <MicroKV label="IRR" v={fmtPctPoints(o.irr * 100)} />
                  <MicroKV label="Equity multiple" v={`${o.equityMultiple.toFixed(2)}x`} />
                  <MicroKV label="Equity req." v={fmtCAD(o.equityRequired)} />
                </dl>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
        <div className="bg-card border border-rule rounded-sm p-4">
          <div className="eyebrow mb-3">Inputs</div>
          <div className="grid grid-cols-2 gap-3">
            <NumInput label="Purchase price" value={active.inputs.purchasePrice} step={100000} onChange={(v) => setInput({ purchasePrice: v })} prefix="$" />
            <NumInput label="LTV" value={active.inputs.ltv} step={0.01} min={0} max={0.85} onChange={(v) => setInput({ ltv: v })} suffix="" isPct />
            <NumInput label="Interest rate" value={active.inputs.interestRate} step={0.0025} onChange={(v) => setInput({ interestRate: v })} isPct />
            <NumInput label="Amort. years" value={active.inputs.amortYears} step={1} onChange={(v) => setInput({ amortYears: v })} />
            <NumInput label="Term years" value={active.inputs.termYears} step={1} onChange={(v) => setInput({ termYears: v })} />
            <NumInput label="Going-in cap" value={active.inputs.goingInCap} step={0.0025} onChange={(v) => setInput({ goingInCap: v })} isPct />
            <NumInput label="Exit cap" value={active.inputs.exitCap} step={0.0025} onChange={(v) => setInput({ exitCap: v })} isPct />
            <NumInput label="Hold years" value={active.inputs.holdYears} step={1} onChange={(v) => setInput({ holdYears: v })} />
            <NumInput label="Rent growth" value={active.inputs.rentGrowth} step={0.0025} onChange={(v) => setInput({ rentGrowth: v })} isPct />
            <NumInput label="Vacancy" value={active.inputs.vacancyAllowance} step={0.005} onChange={(v) => setInput({ vacancyAllowance: v })} isPct />
            <NumInput label="CAM recovery" value={active.inputs.camRecoveryRate} step={0.01} onChange={(v) => setInput({ camRecoveryRate: v })} isPct />
            <NumInput label="Capex/sf" value={active.inputs.capexReservePsf} step={0.05} onChange={(v) => setInput({ capexReservePsf: v })} prefix="$" />
            <NumInput label="Closing costs" value={active.inputs.closingCostsPct} step={0.005} onChange={(v) => setInput({ closingCostsPct: v })} isPct />
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Out label="Loan amount" v={fmtCAD(outputs.loanAmount)} />
            <Out label="Equity required" v={fmtCAD(outputs.equityRequired)} />
            <Out label="Debt service (yr)" v={fmtCAD(outputs.annualDebtService)} />
            <Out label="DSCR" v={fmtRatio(outputs.dscr)} tone={dscrBad ? "signal" : undefined} note={dscrBad ? "Below 1.20 threshold" : undefined} />
            <Out label="In-place NOI" v={fmtCAD(outputs.inPlaceNoi)} />
            <Out label="Stabilized NOI" v={fmtCAD(outputs.stabilizedNoi)} />
            <Out label="IRR" v={fmtPctPoints(outputs.irr * 100)} tone="pass" />
            <Out label="Equity multiple" v={`${outputs.equityMultiple.toFixed(2)}x`} />
            <Out label="Exit value" v={fmtCAD(outputs.exitValue)} />
            <Out label="Break-even occ." v={fmtPctPoints(outputs.breakEvenOccupancy * 100)} />
          </div>

          <div className="bg-card border border-rule rounded-sm p-4">
            <div className="eyebrow mb-3">Cash-on-cash by year</div>
            <div className="overflow-auto">
              <table className="text-[12px] font-mono min-w-full">
                <thead>
                  <tr className="text-slate">
                    {outputs.cashOnCashByYear.map((_, i) => (
                      <th key={i} className="px-3 py-1 text-right eyebrow">
                        Y{i + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {outputs.cashOnCashByYear.map((v, i) => (
                      <td key={i} className="px-3 py-1.5 text-right">
                        {fmtPctPoints(v * 100)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <SensitivityGrid
            xLabel="Exit cap"
            yLabel="Rent growth"
            xValues={sens.exitCaps.map((v) => `${(v * 100).toFixed(2)}%`)}
            yValues={sens.growths.map((v) => `${(v * 100).toFixed(2)}%`)}
            matrix={sens.matrix}
          />
        </div>
      </div>
    </div>
  );
}

function mkInputs(
  price: number,
  gla: number,
  cap: number,
  overrides?: Partial<FinanceInputs>,
): FinanceInputs {
  return {
    purchasePrice: price,
    ltv: 0.65,
    interestRate: 0.0625,
    amortYears: 25,
    termYears: 5,
    goingInCap: cap,
    exitCap: cap,
    holdYears: 10,
    rentGrowth: 0.02,
    vacancyAllowance: 0.04,
    camRecoveryRate: 0.95,
    capexReservePsf: 0.25,
    closingCostsPct: 0.015,
    gla,
    ...overrides,
  };
}

function NumInput({
  label,
  value,
  onChange,
  step = 1,
  min,
  max,
  prefix,
  suffix,
  isPct,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
  prefix?: string;
  suffix?: string;
  isPct?: boolean;
}) {
  const display = isPct ? (value * 100).toFixed(2) : String(value);
  return (
    <label>
      <div className="eyebrow mb-1">{label}</div>
      <div className="flex items-center border border-rule rounded-sm bg-paper focus-within:border-blueprint">
        {prefix && (
          <span className="pl-2 text-[11px] text-slate-2 font-mono">
            {prefix}
          </span>
        )}
        <input
          type="number"
          value={display}
          step={isPct ? step * 100 : step}
          min={min}
          max={max}
          onChange={(e) => {
            const raw = parseFloat(e.target.value);
            if (Number.isNaN(raw)) return;
            onChange(isPct ? raw / 100 : raw);
          }}
          className="w-full h-8 px-2 bg-transparent text-[13px] font-mono text-ink outline-none"
        />
        {(isPct || suffix) && (
          <span className="pr-2 text-[11px] text-slate-2 font-mono">
            {suffix ?? "%"}
          </span>
        )}
      </div>
    </label>
  );
}

function Out({
  label,
  v,
  tone,
  note,
}: {
  label: string;
  v: string;
  tone?: "signal" | "pass" | "fail";
  note?: string;
}) {
  const cls =
    tone === "signal"
      ? "text-signal"
      : tone === "pass"
        ? "text-pass"
        : tone === "fail"
          ? "text-fail"
          : "text-ink";
  return (
    <div className="bg-card border border-rule rounded-sm p-3">
      <div className="eyebrow">{label}</div>
      <div className={cn("font-mono text-[18px] mt-1", cls)}>{v}</div>
      {note && <div className="text-[10px] text-signal mt-0.5">{note}</div>}
    </div>
  );
}

function MicroKV({ label, v, bad }: { label: string; v: string; bad?: boolean }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-slate">{label}</span>
      <span className={cn("font-mono", bad && "text-signal")}>{v}</span>
    </div>
  );
}

import type { FinanceInputs } from "@/mock/engine/financeModel";
import * as XLSX from "xlsx";

interface Scenario {
  id: "A" | "B" | "C";
  name: string;
  inputs: FinanceInputs;
}

// Build a real .xlsx with LIVE FORMULAS. Opening it in Excel and changing
// LTV or interest rate re-computes DSCR, debt service, and IRR in place.
export async function buildScenarioXlsx(
  dealName: string,
  scenarios: Scenario[],
) {
  const wb = XLSX.utils.book_new();

  for (const s of scenarios) {
    const sheet = XLSX.utils.aoa_to_sheet<unknown>([
      [`${dealName} — Scenario ${s.id} (${s.name})`],
      [],
      ["Inputs"],
      ["Purchase price", s.inputs.purchasePrice],
      ["LTV", s.inputs.ltv],
      ["Interest rate", s.inputs.interestRate],
      ["Amortization years", s.inputs.amortYears],
      ["Term years", s.inputs.termYears],
      ["Going-in cap", s.inputs.goingInCap],
      ["Exit cap", s.inputs.exitCap],
      ["Hold years", s.inputs.holdYears],
      ["Rent growth", s.inputs.rentGrowth],
      ["Vacancy allowance", s.inputs.vacancyAllowance],
      ["CAM recovery rate", s.inputs.camRecoveryRate],
      ["Capex reserve / sf", s.inputs.capexReservePsf],
      ["Closing costs (%)", s.inputs.closingCostsPct],
      ["GLA (sf)", s.inputs.gla],
      [],
      ["Derived — recomputes when inputs change"],
      // Row 20+ = derived
      ["Loan amount", { f: "B4*B5" }],
      ["Equity required", { f: "B4-B21 + B4*B16" }],
      ["Monthly rate", { f: "B6/12" }],
      ["Amort months", { f: "B7*12" }],
      [
        "Monthly payment (PMT)",
        {
          f: "IF(B23=0,B21/B24,B21*(B23*(1+B23)^B24)/((1+B23)^B24-1))",
        },
      ],
      ["Annual debt service", { f: "B25*12" }],
      ["In-place NOI", { f: "B4*B9" }],
      ["Capex reserve total", { f: "B15*B17" }],
      ["Effective NOI (year 1)", { f: "B27*(1-B13) + B27*B14 - B28" }],
      ["DSCR", { f: "B29/B26" }],
      ["Break-even occupancy", { f: "B26/B27" }],
      ["Stabilized NOI (year 5)", { f: "B27*(1+B12)^5" }],
      ["Exit value", { f: "B32/B10" }],
      ["Simple equity IRR (approx)", { f: "((B33+B26*B11)/B22)^(1/B11)-1" }],
    ]);

    // Format columns
    sheet["!cols"] = [{ wch: 30 }, { wch: 22 }];
    XLSX.utils.book_append_sheet(wb, sheet, `Scenario ${s.id}`);
  }

  // Comparison sheet references the individual scenario cells
  const cmp = XLSX.utils.aoa_to_sheet<unknown>([
    ["Metric", "Scenario A", "Scenario B", "Scenario C"],
    ["Loan amount", { f: "'Scenario A'!B21" }, { f: "'Scenario B'!B21" }, { f: "'Scenario C'!B21" }],
    ["Debt service", { f: "'Scenario A'!B26" }, { f: "'Scenario B'!B26" }, { f: "'Scenario C'!B26" }],
    ["In-place NOI", { f: "'Scenario A'!B27" }, { f: "'Scenario B'!B27" }, { f: "'Scenario C'!B27" }],
    ["DSCR", { f: "'Scenario A'!B30" }, { f: "'Scenario B'!B30" }, { f: "'Scenario C'!B30" }],
    ["Exit value", { f: "'Scenario A'!B33" }, { f: "'Scenario B'!B33" }, { f: "'Scenario C'!B33" }],
    ["IRR", { f: "'Scenario A'!B34" }, { f: "'Scenario B'!B34" }, { f: "'Scenario C'!B34" }],
  ]);
  cmp["!cols"] = [{ wch: 24 }, { wch: 18 }, { wch: 18 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, cmp, "Comparison");

  const arr = XLSX.write(wb, { bookType: "xlsx", type: "array" }) as ArrayBuffer;
  return new Blob([arr], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

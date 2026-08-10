import { db } from "@/mock/db";
import { mockDelay } from "@/mock/delay";
import { rng } from "@/mock/seed";
import type {
  Deal,
  DataRoomFile,
  ExtractedField,
  RedFlag,
  StageStatus,
} from "@/types";

export async function listDeals(): Promise<Deal[]> {
  await mockDelay();
  return db.deals;
}

export async function getDeal(id: string): Promise<Deal | null> {
  await mockDelay();
  return db.deals.find((d) => d.id === id) ?? null;
}

export async function listDataRoom(dealId: string): Promise<DataRoomFile[]> {
  await mockDelay();
  return db.dataRoomFiles.filter((f) => f.dealId === dealId);
}

export async function resolveOcr(fileId: string): Promise<void> {
  await mockDelay(3500, 6500);
  // Client-side state applies the resolution.
  void fileId;
}

export async function hasCompletedRun(dealId: string): Promise<boolean> {
  await mockDelay();
  // Deals in "underwritten" or later stages have completed runs.
  const d = db.deals.find((x) => x.id === dealId);
  if (!d) return false;
  return ["underwritten", "bid-submitted", "won"].includes(d.stage);
}

// Streaming pipeline events — 6 stages, ~15s total.
interface StageEvent {
  stageId: string;
  status?: StageStatus;
  log?: string;
  summary?: string;
}

const STAGE_SCRIPT: {
  id: string;
  logs: string[];
  summary: string;
  durMs: [number, number];
}[] = [
  {
    id: "s1",
    logs: [
      "Reading CIM cover page …",
      "Detected: Walmart-anchored strip retail centre",
      "Confidence 0.94 — classification confirmed",
    ],
    summary: "Walmart-anchored strip centre",
    durMs: [1200, 1800],
  },
  {
    id: "s2",
    logs: [
      "Opening RENT ROLL final v3 (2).xlsx",
      "Detected 22 tenants, 108,400 sqft leased",
      "Reconciling with Operating Statement 2024 …",
      "Rent roll extracted, discrepancies flagged in stage 5",
    ],
    summary: "22 tenants, 108,400 sqft",
    durMs: [2200, 3200],
  },
  {
    id: "s3",
    logs: [
      "Retrieving Statistics Canada population 2021 …",
      "Household income median: $61,400",
      "Retail density: 8.4 sqft per capita (regional avg 7.9)",
      "Walmart drives traffic; no confirmed competition within 25km",
    ],
    summary: "Population 18,400 · retail density above avg",
    durMs: [2200, 3400],
  },
  {
    id: "s4",
    logs: [
      "Querying 12 sales 2023–2025 in QC + Eastern ON",
      "Filtering by anchor type = Walmart",
      "Selected 4 comparables (5.7–6.9% cap)",
      "Median implied value: $17.4M",
    ],
    summary: "4 comps · median cap 6.35%",
    durMs: [1800, 2600],
  },
  {
    id: "s5",
    logs: [
      "Cross-checking Phase II ESA — recommends soil sampling",
      "Anchor lease expires 2028; no announced renewal",
      "Roof estimated remaining life 8–10 years — capex reserve advised",
      "3 red flags assembled",
    ],
    summary: "3 red flags identified",
    durMs: [1800, 2500],
  },
  {
    id: "s6",
    logs: [
      "Applying standing rule: min DSCR 1.25",
      "Loading base scenario: 65% LTV, 6.25% rate, 25-yr amort",
      "IRR (base) 11.4% · Equity multiple 1.8x",
      "Scenario A/B/C ready in Model tab",
    ],
    summary: "Base IRR 11.4%",
    durMs: [1400, 2000],
  },
];

export async function* runPipeline(dealId: string): AsyncGenerator<StageEvent> {
  void dealId;
  for (const stage of STAGE_SCRIPT) {
    yield { stageId: stage.id, status: "running" };
    await new Promise((r) => setTimeout(r, 250));
    for (const line of stage.logs) {
      yield { stageId: stage.id, log: line };
      await new Promise((r) =>
        setTimeout(r, stage.durMs[0] / stage.logs.length + rng() * 250),
      );
    }
    yield {
      stageId: stage.id,
      status: "complete",
      summary: stage.summary,
    };
  }
}

export async function getExtractedFields(
  dealId: string,
): Promise<ExtractedField[]> {
  await mockDelay();
  const deal = db.deals.find((d) => d.id === dealId);
  if (!deal) return [];
  return [
    { key: "asking", label: "Asking price", value: `$${(deal.askingPrice / 1_000_000).toFixed(1)}M`, sourceFileId: "10 CIM/CIM_v6_confidential.pdf", sourcePage: 3 },
    { key: "psf", label: "Price / sf", value: `$${Math.round(deal.askingPrice / deal.gla)}`, sourceFileId: "10 CIM/CIM_v6_confidential.pdf", sourcePage: 4 },
    { key: "noi", label: "In-place NOI", value: `$${Math.round((deal.askingPrice * deal.capRate) / 1000).toLocaleString()}K`, sourceFileId: "01 Financials/Operating Statement 2024.xlsx", sourcePage: 1 },
    { key: "cap", label: "Going-in cap", value: `${(deal.capRate * 100).toFixed(2)}%`, sourceFileId: "10 CIM/CIM_v6_confidential.pdf", sourcePage: 5 },
    { key: "occ", label: "Occupancy", value: `92.4%`, sourceFileId: "01 Financials/RENT ROLL final v3 (2).xlsx", sourcePage: 1 },
    { key: "anchor", label: "Anchor", value: "Walmart Supercentre", sourceFileId: "02 Leases/Walmart Lease Executed.pdf", sourcePage: 1 },
    { key: "walt", label: "WALT (yrs)", value: "6.4", sourceFileId: "01 Financials/RENT ROLL final v3 (2).xlsx", sourcePage: 2 },
    { key: "gla", label: "GLA", value: `${deal.gla.toLocaleString()} sf`, sourceFileId: "04 Surveys/Site Plan 2018.pdf", sourcePage: 1 },
  ];
}

export async function getRedFlags(dealId: string): Promise<RedFlag[]> {
  await mockDelay();
  void dealId;
  return [
    {
      id: "rf-1",
      severity: "high",
      title: "Phase II ESA recommends soil sampling",
      detail:
        "Former Petro-Canada fuel bar removed in 2004. Consultant recommends targeted Phase II sampling before close. Estimated $18k–$32k, 4–6 weeks.",
      sourceFileId: "03 Environmental/Phase II ESA - DO NOT DISTRIBUTE.pdf",
      sourcePage: 42,
    },
    {
      id: "rf-2",
      severity: "medium",
      title: "Anchor lease expires in 2028 with no announced renewal",
      detail:
        "Walmart's current term ends April 2028. No renewal notice on file. Model downside case with anchor going dark for 12 months at year 3.",
      sourceFileId: "02 Leases/Walmart Lease Executed.pdf",
      sourcePage: 3,
    },
    {
      id: "rf-3",
      severity: "medium",
      title: "Roof remaining life 8–10 years",
      detail:
        "PCA notes membrane installed 2014. Budget capex reserve of $0.35/sf/year against anticipated 2032–2034 replacement.",
      sourceFileId: "09 Property Condition/PCA Report 2024.pdf",
      sourcePage: 11,
    },
  ];
}

export async function getRentRoll(dealId: string) {
  await mockDelay();
  void dealId;
  return [
    { unit: "A-01", tenant: "Walmart Supercentre", sqft: 122400, rentPsf: 8.75, end: "2028-04-30" },
    { unit: "B-02", tenant: "Dollarama", sqft: 8200, rentPsf: 15.5, end: "2029-08-31" },
    { unit: "B-03", tenant: "Jean Coutu", sqft: 10600, rentPsf: 22.0, end: "2031-01-31" },
    { unit: "B-04", tenant: "Tim Hortons", sqft: 2400, rentPsf: 28.75, end: "2027-06-30" },
    { unit: "B-05", tenant: "Bulk Barn", sqft: 4200, rentPsf: 18.5, end: "2028-02-28" },
    { unit: "B-06", tenant: "Rossy", sqft: 6800, rentPsf: 16.25, end: "2029-11-30" },
    { unit: "C-01", tenant: "SAQ", sqft: 5400, rentPsf: 24.5, end: "2030-05-31" },
    { unit: "C-02", tenant: "Sports Experts", sqft: 12800, rentPsf: 17.5, end: "2027-12-31" },
  ];
}

export async function getComparables(dealId: string) {
  await mockDelay();
  void dealId;
  return [
    { property: "Place Sept-Îles", town: "Sept-Îles, QC", date: "2025-03-14", price: 19200000, capRate: 0.062 },
    { property: "Centre Val-d'Or", town: "Val-d'Or, QC", date: "2024-11-22", price: 22400000, capRate: 0.0655 },
    { property: "Plaza Baie-Comeau", town: "Baie-Comeau, QC", date: "2024-06-08", price: 15800000, capRate: 0.069 },
    { property: "Centre Miramichi", town: "Miramichi, NB", date: "2025-02-01", price: 16400000, capRate: 0.0685 },
  ];
}

export async function getNarrative(dealId: string) {
  await mockDelay();
  const deal = db.deals.find((d) => d.id === dealId);
  const name = deal?.propertyName ?? "the property";
  const town = deal?.town ?? "the market";
  return {
    executiveSummary: `${name} is a Walmart-anchored strip centre in ${town}, offered at a ${((deal?.capRate ?? 0.065) * 100).toFixed(2)}% going-in cap. The centre is 92.4% occupied on a weighted-average lease term of 6.4 years, with a stable regional tenant mix and no announced anchor departure. Underwriting supports pursuing the deal at asking, subject to Phase II environmental sampling and a capex reserve for roof replacement.`,
    assetAndMarket: `${town} has a stable population of approximately 18,400 with above-regional-average retail sales per capita. The centre benefits from Walmart's daily traffic and enjoys no direct big-box competitor within 25 km. Household income aligns with the tenant mix, which includes Dollarama, Jean Coutu, Tim Hortons, and Bulk Barn. Anchor lease runs to April 2028 with no renewal on file; recent conversations with the leasing rep were neutral.`,
    financialSummary: `In-place NOI of $${Math.round(((deal?.askingPrice ?? 20_000_000) * (deal?.capRate ?? 0.065)) / 1000).toLocaleString()}K. Assuming 65% LTV at 6.25%, 25-year amort, base-case IRR is 11.4% with a 1.85x equity multiple over a 10-year hold, and DSCR 1.35 in year 1. Downside case (rent growth 0.5%, exit cap 7.5%) yields IRR of 7.2%.`,
    recommendation: `Recommend advancing to bid at $${((deal?.askingPrice ?? 20_000_000) / 1_000_000).toFixed(1)}M subject to (1) satisfactory Phase II ESA, (2) anchor renewal confirmation or documented mitigation, and (3) confirming CAM recovery ratios in prior-year Operating Statements. All three items are addressable pre-close.`,
  };
}

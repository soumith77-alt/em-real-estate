import type { CriteriaSet, Criterion, MarketTier } from "@/types";

// Shared library. `number` is per-set, assigned when the set is built.
interface RawCriterion {
  id: string;
  name: string;
  group: Criterion["group"];
  provenance: Criterion["provenance"];
  rule?: string;
  guidance?: string;
  weight?: number;
  tiers?: MarketTier[];
}

const ALL_TIERS: MarketTier[] = ["small-town", "mid-market", "major-city"];

// --- LEGAL (deterministic) ---
const LEGAL: RawCriterion[] = [
  {
    id: "no-conflicting-exclusivity",
    name: "No conflicting exclusivity restriction",
    group: "legal",
    provenance: "deterministic",
    rule: "No existing tenant at the property holds an exclusive-use covering the candidate's category.",
  },
  {
    id: "no-prohibited-use",
    name: "Retailer's use is not prohibited at the property",
    group: "legal",
    provenance: "deterministic",
    rule: "The property's prohibited-use list does not name the candidate's category.",
  },
  {
    id: "operates-in-quebec",
    name: "Retailer operates in Quebec (French-language compliance)",
    group: "legal",
    provenance: "deterministic",
    rule: "If property.province === 'QC', retailer.operatesInQuebec must be true; otherwise not applicable.",
    tiers: ALL_TIERS,
  },
  {
    id: "no-radius-conflict",
    name: "No radius restriction elsewhere in portfolio",
    group: "legal",
    provenance: "deterministic",
    rule: "Candidate is not bound by a radius covenant that includes this property's coordinates.",
  },
  {
    id: "no-co-tenancy-trip",
    name: "No adverse co-tenancy trigger",
    group: "legal",
    provenance: "deterministic",
    rule: "Placing this tenant does not trigger a co-tenancy provision for another existing tenant.",
  },
  {
    id: "signage-permitted",
    name: "Retailer signage complies with municipal by-law",
    group: "legal",
    provenance: "deterministic",
    rule: "Retailer's standard signage package fits within the municipal sign by-law and any site plan agreement.",
  },
];

// --- PHYSICAL (deterministic) ---
const PHYSICAL: RawCriterion[] = [
  { id: "format-match", name: "Unit format matches retailer's accepted formats", group: "physical", provenance: "deterministic", rule: "retailer.formatsAccepted includes unit.format." },
  { id: "drive-thru-if-required", name: "Drive-thru available if required", group: "physical", provenance: "deterministic", rule: "If retailer.requiredFeatures includes 'drive-thru', unit.features must include it." },
  { id: "grease-trap-if-food", name: "Grease trap available if food-service", group: "physical", provenance: "deterministic", rule: "If retailer.requiredFeatures includes 'grease-trap', unit.features must include it." },
  { id: "rear-receiving-if-required", name: "Rear receiving available if required", group: "physical", provenance: "deterministic", rule: "If retailer.requiredFeatures includes 'rear-receiving', unit.features must include it." },
  { id: "loading-dock-if-required", name: "Loading dock available if required", group: "physical", provenance: "deterministic", rule: "If retailer.requiredFeatures includes 'loading-dock', unit.features must include it." },
  { id: "mezzanine-if-required", name: "Mezzanine available if required", group: "physical", provenance: "deterministic", rule: "If retailer.requiredFeatures includes 'mezzanine', unit.features must include it." },
  { id: "exterior-entrance-if-required", name: "Exterior entrance available if required", group: "physical", provenance: "deterministic", rule: "If retailer.requiredFeatures includes 'exterior-entrance', unit.features must include it." },
  { id: "patio-if-required", name: "Patio available if required", group: "physical", provenance: "deterministic", rule: "If retailer.requiredFeatures includes 'patio', unit.features must include it." },
  { id: "frontage-adequate", name: "Frontage adequate (min. 20 ft)", group: "physical", provenance: "deterministic", rule: "unit.frontageFt >= 20." },
  { id: "column-spacing-adequate", name: "Column spacing acceptable", group: "physical", provenance: "deterministic", rule: "Interior column grid supports retailer's fixture plan (assumed pass if unit format is inline/end-cap)." },
  { id: "hvac-tonnage-sufficient", name: "HVAC tonnage sufficient for use", group: "physical", provenance: "deterministic", rule: "Rooftop HVAC provides at least 1 ton per 400 sq ft — assumed satisfied for standardized retail." },
  { id: "parking-ratio-adequate", name: "Parking ratio adequate for use", group: "physical", provenance: "deterministic", rule: "Site parking supports at least 4.0 spaces per 1,000 sq ft leased." },
];

// --- SIZE (deterministic) ---
const SIZE: RawCriterion[] = [
  { id: "size-within-band", name: "Unit GLA within retailer's accepted size band", group: "size", provenance: "deterministic", rule: "unit.gla within [sizeMin * 0.9, sizeMax * 1.1]." },
  { id: "size-near-mid", name: "Unit GLA close to retailer's ideal size", group: "size", provenance: "deterministic", rule: "unit.gla within +/- 20% of retailer.sizeMid — passes as informational note." },
  { id: "gla-not-oversized", name: "Unit not materially larger than retailer's max", group: "size", provenance: "deterministic", rule: "unit.gla <= retailer.sizeMax * 1.15." },
  { id: "gla-not-undersized", name: "Unit not materially smaller than retailer's min", group: "size", provenance: "deterministic", rule: "unit.gla >= retailer.sizeMin * 0.85." },
];

// --- MARKET (AI) ---
const MARKET: RawCriterion[] = [
  { id: "market-population-supports", name: "Market population supports store type", group: "market", provenance: "ai", guidance: "5 = population well above brand's typical threshold; 1 = population significantly below." },
  { id: "trade-area-drive-time", name: "Trade area drive-time captures adequate population", group: "market", provenance: "ai", guidance: "Consider 15-minute drive-time captured population vs brand's typical threshold." },
  { id: "median-income-fit", name: "Median household income aligns with brand", group: "market", provenance: "ai", guidance: "5 = market income aligned with brand's core customer; 1 = major mismatch." },
  { id: "language-market-fit", name: "Language / cultural market fit", group: "market", provenance: "ai", guidance: "Consider French/English mix in the market vs the brand's operating model." },
  { id: "existing-competition-in-market", name: "Competitive density in the market", group: "market", provenance: "ai", guidance: "5 = low competitive density leaves room for entry; 1 = market already saturated." },
  { id: "traffic-generators-nearby", name: "Nearby traffic generators (anchor, transit, hospital)", group: "market", provenance: "ai", guidance: "Consider proximity to strong traffic generators." },
  { id: "seasonality-fit", name: "Seasonal traffic pattern acceptable", group: "market", provenance: "ai", guidance: "Consider seasonal fluctuations in the market vs the brand." },
  { id: "car-vs-walk-fit", name: "Car- vs walk-in retail mix acceptable", group: "market", provenance: "ai", guidance: "Consider whether the trade area supports the brand's typical customer arrival mode." },
];

// --- MOMENTUM (AI) ---
const MOMENTUM: RawCriterion[] = [
  { id: "category-momentum", name: "Category momentum in this market tier", group: "momentum", provenance: "ai", guidance: "Consider whether the retailer's category is expanding, stable, or contracting in this tier." },
  { id: "brand-expansion-status", name: "Brand's own expansion posture", group: "momentum", provenance: "ai", guidance: "5 = actively expanding; 1 = closing." },
  { id: "same-store-sales-trend", name: "Same-store sales trend for the category", group: "momentum", provenance: "ai", guidance: "Consider recent same-store sales trend for comparable brands." },
  { id: "recent-news-signal", name: "Recent news / press momentum for the brand", group: "momentum", provenance: "ai", guidance: "Consider recent press coverage or investor communications." },
  { id: "openings-past-24-months", name: "Store openings in the past 24 months", group: "momentum", provenance: "ai", guidance: "Consider the brand's opening pace over the last 24 months." },
  { id: "closures-past-24-months", name: "Store closures in the past 24 months", group: "momentum", provenance: "ai", guidance: "5 = no meaningful closures; 1 = active portfolio pruning." },
];

// --- MIX (AI) ---
const MIX: RawCriterion[] = [
  { id: "complements-tenant-mix", name: "Complements existing tenant mix", group: "mix", provenance: "ai", guidance: "5 = clearly complements existing tenants; 1 = redundant or cannibalizes." },
  { id: "improves-anchor-drawpower", name: "Improves anchor draw-power", group: "mix", provenance: "ai", guidance: "Consider whether this tenant benefits from or contributes to the anchor's traffic." },
  { id: "adds-daypart-coverage", name: "Adds daypart coverage (morning/evening/weekend)", group: "mix", provenance: "ai", guidance: "Consider whether the tenant fills a daypart currently under-served." },
  { id: "adds-service-category", name: "Adds an under-served service category", group: "mix", provenance: "ai", guidance: "Consider whether the tenant adds a service category not currently present." },
  { id: "avoids-cannibalization", name: "Avoids cannibalization of existing tenants", group: "mix", provenance: "ai", guidance: "5 = no material overlap; 1 = direct overlap with existing tenant." },
  { id: "elevates-centre-image", name: "Elevates the shopping centre's image", group: "mix", provenance: "ai", guidance: "Consider brand strength and how it positions the centre." },
  { id: "supports-daily-needs", name: "Supports daily-needs positioning", group: "mix", provenance: "ai", guidance: "Consider whether the tenant reinforces the centre's daily-needs mix." },
  { id: "reduces-tenant-concentration", name: "Reduces tenant / category concentration risk", group: "mix", provenance: "ai", guidance: "Consider portfolio concentration effect." },
];

// --- LIKELIHOOD (AI) ---
const LIKELIHOOD: RawCriterion[] = [
  { id: "likelihood-execute-deal", name: "Likelihood of executing a deal here", group: "likelihood", provenance: "ai", guidance: "Consider brand's expansion posture, market fit and site quality together." },
  { id: "rent-affordability", name: "Asking rent likely within retailer's underwriting", group: "likelihood", provenance: "ai", guidance: "Consider brand's typical occupancy-cost ratio for this category." },
  { id: "existing-tenant-relationship", name: "Existing tenant relationship with retailer", group: "likelihood", provenance: "ai", guidance: "5 = active tenant in portfolio; 1 = no prior relationship." },
  { id: "time-to-open", name: "Reasonable time-to-open for retailer's build-out", group: "likelihood", provenance: "ai", guidance: "Consider typical build-out timeline given unit condition." },
  { id: "deal-structure-flexibility", name: "Deal structure fits landlord requirements", group: "likelihood", provenance: "ai", guidance: "Consider whether the brand's typical deal structure aligns with landlord's economics." },
  { id: "capex-contribution-plausible", name: "Reasonable landlord capex contribution required", group: "likelihood", provenance: "ai", guidance: "Consider typical TI/inducement level for the brand." },
  { id: "credit-strength", name: "Brand credit strength acceptable for the deal size", group: "likelihood", provenance: "ai", guidance: "Consider corporate covenant strength." },
  { id: "regional-manager-active", name: "Regional / real estate manager is actively looking", group: "likelihood", provenance: "ai", guidance: "Consider whether the brand's real estate team is currently active in this region." },
];

const SMALL_TOWN: RawCriterion[] = [
  ...LEGAL,
  ...PHYSICAL,
  ...SIZE,
  ...MARKET,
  ...MOMENTUM,
  ...MIX,
  ...LIKELIHOOD,
];

// --- Major-city set: 31 criteria (curated) ---
const MAJOR_CITY: RawCriterion[] = [
  ...LEGAL.slice(0, 5),
  ...PHYSICAL.slice(0, 7),
  ...SIZE.slice(0, 3),
  ...MARKET.slice(0, 5),
  ...MOMENTUM.slice(0, 3),
  ...MIX.slice(0, 4),
  ...LIKELIHOOD.slice(0, 4),
];

function toCriterion(raw: RawCriterion, i: number, defaultTiers: MarketTier[]): Criterion {
  return {
    id: raw.id,
    number: i + 1,
    name: raw.name,
    group: raw.group,
    provenance: raw.provenance,
    tiers: raw.tiers ?? defaultTiers,
    ...(raw.rule ? { rule: raw.rule } : {}),
    ...(raw.guidance ? { guidance: raw.guidance } : {}),
    ...(raw.provenance === "ai" ? { weight: raw.weight ?? 1.0 } : {}),
  };
}

// Vary a few weights in the small-town set
const WEIGHT_OVERRIDES: Record<string, number> = {
  "likelihood-execute-deal": 1.5,
  "rent-affordability": 1.25,
  "category-momentum": 1.25,
  "complements-tenant-mix": 1.25,
  "market-population-supports": 1.25,
  "elevates-centre-image": 0.75,
  "reduces-tenant-concentration": 0.75,
  "seasonality-fit": 0.5,
  "car-vs-walk-fit": 0.75,
};

const smallTownCriteria: Criterion[] = SMALL_TOWN.map((raw, i) => {
  const c = toCriterion(raw, i, ["small-town"]);
  if (raw.provenance === "ai" && WEIGHT_OVERRIDES[raw.id] !== undefined) {
    c.weight = WEIGHT_OVERRIDES[raw.id];
  }
  return c;
});

const majorCityCriteria: Criterion[] = MAJOR_CITY.map((raw, i) =>
  toCriterion(raw, i, ["major-city"]),
);

export const criteriaSets: CriteriaSet[] = [
  {
    id: "cs-small-town",
    name: "Small-town shopping centre (52 criteria)",
    tier: "small-town",
    criteria: smallTownCriteria,
  },
  {
    id: "cs-major-city",
    name: "Major-city shopping centre (31 criteria)",
    tier: "major-city",
    criteria: majorCityCriteria,
  },
];

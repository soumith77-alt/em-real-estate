import type { CriteriaSet, Criterion } from "@/types";
import { retailers } from "@/mock/fixtures/retailers";
import { units } from "@/mock/fixtures/units";
import { properties } from "@/mock/fixtures/properties";
import { criteriaSets } from "@/mock/fixtures/criteriaSets";

export interface SoftScore {
  score: 1 | 2 | 3 | 4 | 5;
  reasoning: string;
}

/**
 * Deterministic PRNG seeded per (retailerId, unitId, criterionId).
 * Uses a tiny FNV-1a-ish mixer so we don't touch the shared demo RNG.
 */
function seededScore(retailerId: string, unitId: string, criterionId: string): number {
  const key = `${retailerId}|${unitId}|${criterionId}`;
  let h = 2166136261 >>> 0;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h / 0xffffffff;
}

function bucketize(x: number): 1 | 2 | 3 | 4 | 5 {
  if (x < 0.08) return 1;
  if (x < 0.28) return 2;
  if (x < 0.58) return 3;
  if (x < 0.88) return 4;
  return 5;
}

function biasFor(criterion: Criterion, ctx: {
  brand: string;
  town: string;
  province: string;
  population: number;
  category: string;
  expansion: "expanding" | "stable" | "dormant" | "closing";
  operatesInQuebec: boolean;
}): number {
  // Small bumps or drops based on grounded facts.
  let bias = 0;
  switch (criterion.id) {
    case "market-population-supports":
      if (ctx.population > 60_000) bias += 0.12;
      if (ctx.population < 15_000) bias -= 0.15;
      break;
    case "trade-area-drive-time":
      if (ctx.population > 40_000) bias += 0.08;
      break;
    case "median-income-fit":
      if (ctx.category === "beauty-personal-care" && ctx.population < 20_000) bias -= 0.1;
      break;
    case "language-market-fit":
      if (ctx.province === "QC" && !ctx.operatesInQuebec) bias -= 0.4;
      else if (ctx.province === "QC" && ctx.operatesInQuebec) bias += 0.08;
      break;
    case "existing-competition-in-market":
      if (ctx.population > 80_000) bias -= 0.05;
      break;
    case "category-momentum":
      if (ctx.expansion === "expanding") bias += 0.15;
      if (ctx.expansion === "closing") bias -= 0.3;
      if (ctx.expansion === "dormant") bias -= 0.12;
      break;
    case "brand-expansion-status":
      if (ctx.expansion === "expanding") bias += 0.25;
      if (ctx.expansion === "closing") bias -= 0.35;
      if (ctx.expansion === "dormant") bias -= 0.15;
      break;
    case "likelihood-execute-deal":
      if (ctx.expansion === "expanding") bias += 0.18;
      if (ctx.expansion === "closing") bias -= 0.4;
      if (ctx.province === "QC" && !ctx.operatesInQuebec) bias -= 0.35;
      break;
    case "existing-tenant-relationship":
      // Portfolio-wide brands slightly favored
      if (["Dollarama", "Tim Hortons", "Jean Coutu", "Bulk Barn", "Metro", "IGA", "Marks"].includes(ctx.brand)) bias += 0.2;
      break;
    case "complements-tenant-mix":
      if (ctx.category === "pharmacy" || ctx.category === "grocery") bias += 0.05;
      break;
    case "reduces-tenant-concentration":
      // Neutral bias
      break;
    default:
      break;
  }
  return bias;
}

function reasoningFor(
  criterion: Criterion,
  score: 1 | 2 | 3 | 4 | 5,
  ctx: {
    brand: string;
    town: string;
    province: string;
    population: number;
    category: string;
    expansion: string;
    operatesInQuebec: boolean;
  },
): string {
  const good = score >= 4;
  const bad = score <= 2;
  const strength = good ? "supports" : bad ? "weighs against" : "is neutral for";
  switch (criterion.id) {
    case "market-population-supports":
      return `${ctx.town} has a population of ~${ctx.population.toLocaleString()} which ${strength} ${ctx.brand}'s typical trade-area threshold for the ${ctx.category} category.`;
    case "trade-area-drive-time":
      return `A 15-minute drive-time from the site captures a population that ${strength} ${ctx.brand}'s standard site selection model.`;
    case "median-income-fit":
      return `Median household income in ${ctx.town} ${strength} ${ctx.brand}'s core customer profile.`;
    case "language-market-fit":
      return ctx.province === "QC"
        ? `In this Quebec market, ${ctx.brand}'s language capability ${strength} a Bill 96-compliant rollout.`
        : `${ctx.brand}'s language capability ${strength} the market's demographic profile.`;
    case "existing-competition-in-market":
      return `Competitive density in ${ctx.town} for ${ctx.category} ${strength} entry economics for ${ctx.brand}.`;
    case "traffic-generators-nearby":
      return `Nearby traffic generators (anchor, transit, hospital) ${strength} the ${ctx.brand} site model.`;
    case "seasonality-fit":
      return `Seasonal fluctuations in ${ctx.town} ${strength} ${ctx.brand}'s ${ctx.category} operating model.`;
    case "car-vs-walk-fit":
      return `Trade-area arrival mix ${strength} ${ctx.brand}'s prototypical unit.`;
    case "category-momentum":
      return `Momentum for ${ctx.category} in this market tier is ${ctx.expansion} — this ${strength} ${ctx.brand}.`;
    case "brand-expansion-status":
      return `${ctx.brand}'s expansion posture is ${ctx.expansion}, which ${strength} pursuing this site.`;
    case "same-store-sales-trend":
      return `Recent same-store sales for ${ctx.category} peers ${strength} an underwriting case for ${ctx.brand}.`;
    case "recent-news-signal":
      return `Recent press coverage of ${ctx.brand} ${strength} a near-term site request in ${ctx.town}.`;
    case "openings-past-24-months":
      return `${ctx.brand}'s opening pace over the last 24 months ${strength} readiness for a new site.`;
    case "closures-past-24-months":
      return `Recent closure activity for ${ctx.brand} ${strength} the reliability of a new commitment.`;
    case "complements-tenant-mix":
      return `${ctx.brand} ${strength} the existing tenant mix at the property.`;
    case "improves-anchor-drawpower":
      return `${ctx.brand}'s draw ${strength} the anchor's traffic pattern.`;
    case "adds-daypart-coverage":
      return `${ctx.brand} ${strength} adding an under-served daypart at this centre.`;
    case "adds-service-category":
      return `${ctx.brand} ${strength} adding a service category not presently represented at the centre.`;
    case "avoids-cannibalization":
      return `${ctx.brand} ${strength} avoiding overlap with existing tenants at the centre.`;
    case "elevates-centre-image":
      return `${ctx.brand}'s brand positioning ${strength} the centre's market image.`;
    case "supports-daily-needs":
      return `${ctx.brand} ${strength} the centre's daily-needs positioning.`;
    case "reduces-tenant-concentration":
      return `Adding ${ctx.brand} ${strength} portfolio-level tenant / category concentration.`;
    case "likelihood-execute-deal":
      return `Considering ${ctx.brand}'s expansion posture (${ctx.expansion}) and fit with ${ctx.town}, the likelihood of executing ${strength} a near-term deal.`;
    case "rent-affordability":
      return `Estimated occupancy cost ${strength} ${ctx.brand}'s typical underwriting range.`;
    case "existing-tenant-relationship":
      return `The current portfolio relationship with ${ctx.brand} ${strength} deal pace.`;
    case "time-to-open":
      return `Estimated build-out time from LOI to opening ${strength} ${ctx.brand}'s typical timing expectations.`;
    case "deal-structure-flexibility":
      return `${ctx.brand}'s typical deal structure ${strength} landlord economics on this asset.`;
    case "capex-contribution-plausible":
      return `Required landlord TI ${strength} the underwriting for this deal.`;
    case "credit-strength":
      return `${ctx.brand}'s corporate covenant strength ${strength} the risk profile of this deal.`;
    case "regional-manager-active":
      return `Regional real-estate team activity in this sub-market ${strength} responsiveness to a new site.`;
    default:
      return `${ctx.brand}'s fit on this criterion ${strength} the assessment for ${ctx.town}.`;
  }
}

/**
 * Return a map of AI criterion id → { score, reasoning } for every AI
 * criterion in every criteria set. Fully deterministic, no I/O, no AI call.
 */
export function getSoftScores(
  retailerId: string,
  unitId: string,
): Record<string, SoftScore> {
  const retailer = retailers.find((r) => r.id === retailerId);
  const unit = units.find((u) => u.id === unitId);
  if (!retailer || !unit) return {};
  const property = properties.find((p) => p.id === unit.propertyId);
  if (!property) return {};

  const ctx = {
    brand: retailer.brand,
    town: property.town,
    province: property.province,
    population: property.population,
    category: retailer.category,
    expansion: retailer.expansionStatus.value,
    operatesInQuebec: retailer.operatesInQuebec,
  };

  const out: Record<string, SoftScore> = {};
  const seen = new Set<string>();
  for (const cs of criteriaSets) {
    for (const c of cs.criteria) {
      if (c.provenance !== "ai") continue;
      if (seen.has(c.id)) continue;
      seen.add(c.id);
      const raw = seededScore(retailerId, unitId, c.id);
      const bias = biasFor(c, ctx);
      const adjusted = Math.max(0, Math.min(1, raw + bias));
      const score = bucketize(adjusted);
      out[c.id] = { score, reasoning: reasoningFor(c, score, ctx) };
    }
  }
  return out;
}

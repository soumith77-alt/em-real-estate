import type { Tenant } from "@/types";
import { units } from "./units";
import { properties } from "./properties";
import { rng, range, rangeF, pick, chance } from "@/mock/seed";

interface Brand {
  brand: string;
  category: string;
  minGla: number;
  maxGla: number;
  quebec: boolean;
}

// Anchor / big-box brands
const ANCHOR_BRANDS: Brand[] = [
  { brand: "Walmart Supercentre", category: "grocery", minGla: 80_000, maxGla: 200_000, quebec: true },
  { brand: "Loblaws", category: "grocery", minGla: 45_000, maxGla: 80_000, quebec: true },
  { brand: "Metro", category: "grocery", minGla: 30_000, maxGla: 60_000, quebec: true },
  { brand: "Sobeys", category: "grocery", minGla: 25_000, maxGla: 55_000, quebec: true },
  { brand: "IGA", category: "grocery", minGla: 20_000, maxGla: 55_000, quebec: true },
  { brand: "Maxi", category: "grocery", minGla: 25_000, maxGla: 55_000, quebec: true },
  { brand: "Provigo", category: "grocery", minGla: 22_000, maxGla: 45_000, quebec: true },
  { brand: "Canadian Tire", category: "home-improvement", minGla: 40_000, maxGla: 100_000, quebec: true },
  { brand: "Giant Tiger", category: "dollar-store", minGla: 18_000, maxGla: 30_000, quebec: true },
];

// Mid-box end-cap brands
const ENDCAP_BRANDS: Brand[] = [
  { brand: "Dollarama", category: "dollar-store", minGla: 8_000, maxGla: 12_000, quebec: true },
  { brand: "Réno-Dépôt", category: "home-improvement", minGla: 60_000, maxGla: 100_000, quebec: true },
  { brand: "Bulk Barn", category: "specialty-food", minGla: 3_500, maxGla: 6_500, quebec: true },
  { brand: "Winners", category: "apparel", minGla: 20_000, maxGla: 30_000, quebec: true },
  { brand: "Marks", category: "apparel", minGla: 8_000, maxGla: 14_000, quebec: true },
  { brand: "Sports Experts", category: "apparel", minGla: 10_000, maxGla: 18_000, quebec: true },
  { brand: "Sportium", category: "apparel", minGla: 15_000, maxGla: 25_000, quebec: true },
  { brand: "Rossy", category: "dollar-store", minGla: 8_000, maxGla: 14_000, quebec: true },
  { brand: "Hart", category: "apparel", minGla: 10_000, maxGla: 18_000, quebec: true },
  { brand: "Mondou", category: "pet", minGla: 3_000, maxGla: 5_000, quebec: true },
];

// Inline brands
const INLINE_BRANDS: Brand[] = [
  { brand: "Jean Coutu", category: "pharmacy", minGla: 8_000, maxGla: 15_000, quebec: true },
  { brand: "Pharmaprix", category: "pharmacy", minGla: 8_000, maxGla: 15_000, quebec: true },
  { brand: "Familiprix", category: "pharmacy", minGla: 4_000, maxGla: 8_000, quebec: true },
  { brand: "Uniprix", category: "pharmacy", minGla: 4_000, maxGla: 8_000, quebec: true },
  { brand: "Brunet", category: "pharmacy", minGla: 4_000, maxGla: 8_000, quebec: true },
  { brand: "SAQ", category: "liquor", minGla: 2_500, maxGla: 5_500, quebec: true },
  { brand: "Reitmans", category: "apparel", minGla: 3_000, maxGla: 5_500, quebec: true },
  { brand: "Laura", category: "apparel", minGla: 3_000, maxGla: 5_500, quebec: true },
  { brand: "Tim Hortons", category: "quick-service-restaurant", minGla: 1_800, maxGla: 3_200, quebec: true },
  { brand: "Subway", category: "quick-service-restaurant", minGla: 1_200, maxGla: 2_400, quebec: true },
  { brand: "McDonald's", category: "quick-service-restaurant", minGla: 2_800, maxGla: 4_500, quebec: true },
  { brand: "Starbucks", category: "coffee", minGla: 1_600, maxGla: 2_800, quebec: true },
  { brand: "Second Cup", category: "coffee", minGla: 1_400, maxGla: 2_400, quebec: true },
  { brand: "A&W", category: "quick-service-restaurant", minGla: 2_400, maxGla: 4_000, quebec: true },
  { brand: "Scores", category: "casual-dining", minGla: 4_500, maxGla: 7_500, quebec: true },
  { brand: "Rôtisserie St-Hubert", category: "casual-dining", minGla: 5_500, maxGla: 8_500, quebec: true },
  { brand: "Boston Pizza", category: "casual-dining", minGla: 4_500, maxGla: 7_500, quebec: true },
  { brand: "Sushi Shop", category: "quick-service-restaurant", minGla: 1_200, maxGla: 2_400, quebec: true },
  { brand: "Mikes", category: "casual-dining", minGla: 4_000, maxGla: 6_500, quebec: true },
  { brand: "Pacini", category: "casual-dining", minGla: 4_500, maxGla: 7_500, quebec: true },
  { brand: "La Cage", category: "casual-dining", minGla: 5_500, maxGla: 8_500, quebec: true },
  { brand: "Ashton", category: "quick-service-restaurant", minGla: 1_800, maxGla: 3_200, quebec: true },
  { brand: "Chocolats Favoris", category: "specialty-food", minGla: 900, maxGla: 1_800, quebec: true },
];

const PARENT: Record<string, string> = {
  "Walmart Supercentre": "Walmart Canada",
  "Tim Hortons": "Restaurant Brands International",
  "Jean Coutu": "Metro Inc.",
  "Pharmaprix": "Loblaw Companies",
  "Metro": "Metro Inc.",
  "IGA": "Sobeys Inc.",
  "Provigo": "Loblaw Companies",
  "Maxi": "Loblaw Companies",
  "Loblaws": "Loblaw Companies",
  "Sobeys": "Empire Company",
  "Canadian Tire": "Canadian Tire Corp.",
  "Giant Tiger": "Giant Tiger Stores",
  "Dollarama": "Dollarama Inc.",
  "Bulk Barn": "Bulk Barn Foods",
  "Winners": "TJX Canada",
  "Marks": "Canadian Tire Corp.",
  "SAQ": "Société des alcools du Québec",
  "McDonald's": "McDonald's Restaurants of Canada",
  "Starbucks": "Starbucks Corp.",
  "Subway": "Subway Franchise Systems",
  "Boston Pizza": "Boston Pizza International",
};

function parentOf(brand: string): string {
  return PARENT[brand] ?? `${brand} Corp.`;
}

function pickForFormat(format: string, gla: number): Brand {
  const pool =
    format === "anchor"
      ? ANCHOR_BRANDS
      : format === "end-cap"
      ? ENDCAP_BRANDS
      : format === "pad"
      ? INLINE_BRANDS.filter((b) => b.category === "quick-service-restaurant" || b.category === "coffee")
      : INLINE_BRANDS;
  // filter by size band
  const fits = pool.filter((b) => gla >= b.minGla * 0.7 && gla <= b.maxGla * 1.4);
  if (fits.length > 0) return pick(fits);
  return pick(pool);
}

function isoDate(y: number, m: number, d: number) {
  return new Date(Date.UTC(y, m - 1, d)).toISOString().slice(0, 10);
}

const propMap = new Map(properties.map((p) => [p.id, p]));

// Tenant occupancy: build for each occupied + notice-given unit
export const tenants: Tenant[] = [];

for (const u of units) {
  if (u.status === "vacant") continue;
  const brand = pickForFormat(u.format, u.gla);
  // Term: 5–15 years
  const termYears = range(5, 15);
  const startYear = range(2013, 2023);
  const startMonth = range(1, 12);
  const startDay = range(1, 28);
  const endYear = startYear + termYears;
  const start = isoDate(startYear, startMonth, startDay);
  const end = isoDate(endYear, startMonth, startDay);
  // Bias some to expire 2026-2027
  const shouldExpireSoon = chance(0.14);
  const finalEnd = shouldExpireSoon
    ? isoDate(pick([2026, 2027]), range(1, 12), range(1, 28))
    : end;
  const status = u.status === "notice-given" ? "notice-given" : "active";
  tenants.push({
    id: `tenant-${u.id}`,
    brand: brand.brand,
    category: brand.category,
    propertyId: u.propertyId,
    unitId: u.id,
    startDate: start,
    endDate: finalEnd,
    baseRentPsf: Number(rangeF(12, 40).toFixed(2)),
    camPsf: Number(rangeF(4, 12).toFixed(2)),
    optionsToRenew: range(0, 3),
    escalationPct: Number(rangeF(2, 5).toFixed(2)),
    status,
  });
}

// Ensure at least one specific tenant will drive the special restriction:
// Force a "Jean Coutu" pharmacy tenant to exist at prop-05 (Chicoutimi) if not already.
const chicoutimiJC = tenants.find(
  (t) => t.propertyId === "prop-05" && t.brand === "Jean Coutu",
);
if (!chicoutimiJC) {
  const target = tenants.find((t) => t.propertyId === "prop-05" && t.status === "active");
  if (target) {
    target.brand = "Jean Coutu";
    target.category = "pharmacy";
  }
}

// Ensure a Bulk Barn tenant at prop-11 (Drummondville) for the renewal workflow demo
const drummondBulk = tenants.find(
  (t) => t.propertyId === "prop-11" && t.brand === "Bulk Barn",
);
if (!drummondBulk) {
  const target = tenants.find((t) => t.propertyId === "prop-11" && t.status === "active");
  if (target) {
    target.brand = "Bulk Barn";
    target.category = "specialty-food";
    target.startDate = "2009-05-15";
    target.endDate = "2026-05-14";
    target.optionsToRenew = 2;
  }
}

// Silence unused-import warnings
void propMap;

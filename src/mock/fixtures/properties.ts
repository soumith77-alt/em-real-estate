import type { Property, Province, MarketTier } from "@/types";
import { range, rangeF, pick, chance } from "@/mock/seed";

interface Seed {
  town: string;
  province: Province;
  tier: MarketTier;
  population: number;
  frenchName?: boolean;
}

// 42 real Eastern Canadian towns, hand-authored order for deterministic RNG.
const SEEDS: Seed[] = [
  // Quebec (French-name friendly)
  { town: "Rimouski", province: "QC", tier: "small-town", population: 48664, frenchName: true },
  { town: "Rivière-du-Loup", province: "QC", tier: "small-town", population: 20200, frenchName: true },
  { town: "Sept-Îles", province: "QC", tier: "small-town", population: 25086, frenchName: true },
  { town: "Baie-Comeau", province: "QC", tier: "small-town", population: 20670, frenchName: true },
  { town: "Chicoutimi", province: "QC", tier: "mid-market", population: 66547, frenchName: true },
  { town: "Alma", province: "QC", tier: "small-town", population: 30331, frenchName: true },
  { town: "Val-d'Or", province: "QC", tier: "small-town", population: 32752, frenchName: true },
  { town: "Rouyn-Noranda", province: "QC", tier: "small-town", population: 42313, frenchName: true },
  { town: "Trois-Rivières", province: "QC", tier: "mid-market", population: 139163, frenchName: true },
  { town: "Shawinigan", province: "QC", tier: "small-town", population: 49930, frenchName: true },
  { town: "Drummondville", province: "QC", tier: "mid-market", population: 79258, frenchName: true },
  { town: "Granby", province: "QC", tier: "small-town", population: 69025, frenchName: true },
  { town: "Sorel-Tracy", province: "QC", tier: "small-town", population: 34755, frenchName: true },
  { town: "Saint-Hyacinthe", province: "QC", tier: "small-town", population: 59614, frenchName: true },
  { town: "Joliette", province: "QC", tier: "small-town", population: 20951, frenchName: true },
  { town: "Saint-Georges", province: "QC", tier: "small-town", population: 33345, frenchName: true },
  { town: "Thetford Mines", province: "QC", tier: "small-town", population: 25709, frenchName: true },
  { town: "Victoriaville", province: "QC", tier: "small-town", population: 47591, frenchName: true },
  { town: "Magog", province: "QC", tier: "small-town", population: 29303, frenchName: true },
  { town: "Sherbrooke", province: "QC", tier: "mid-market", population: 172950, frenchName: true },
  // New Brunswick
  { town: "Moncton", province: "NB", tier: "mid-market", population: 79470 },
  { town: "Fredericton", province: "NB", tier: "mid-market", population: 63116 },
  { town: "Saint John", province: "NB", tier: "mid-market", population: 69895 },
  { town: "Bathurst", province: "NB", tier: "small-town", population: 12157 },
  { town: "Edmundston", province: "NB", tier: "small-town", population: 16437 },
  { town: "Miramichi", province: "NB", tier: "small-town", population: 17537 },
  // Nova Scotia
  { town: "Halifax", province: "NS", tier: "major-city", population: 439819 },
  { town: "Sydney", province: "NS", tier: "small-town", population: 29904 },
  { town: "Truro", province: "NS", tier: "small-town", population: 12851 },
  { town: "New Glasgow", province: "NS", tier: "small-town", population: 9075 },
  { town: "Yarmouth", province: "NS", tier: "small-town", population: 6518 },
  // PEI
  { town: "Charlottetown", province: "PE", tier: "small-town", population: 38809 },
  { town: "Summerside", province: "PE", tier: "small-town", population: 15654 },
  // Newfoundland
  { town: "St. John's", province: "NL", tier: "mid-market", population: 110525 },
  { town: "Corner Brook", province: "NL", tier: "small-town", population: 19333 },
  { town: "Gander", province: "NL", tier: "small-town", population: 11880 },
  { town: "Grand Falls-Windsor", province: "NL", tier: "small-town", population: 13853 },
  // Eastern Ontario
  { town: "Cornwall", province: "ON", tier: "small-town", population: 47845 },
  { town: "Brockville", province: "ON", tier: "small-town", population: 21346 },
  { town: "Kingston", province: "ON", tier: "mid-market", population: 132485 },
  { town: "Belleville", province: "ON", tier: "small-town", population: 55071 },
  { town: "Pembroke", province: "ON", tier: "small-town", population: 13882 },
];

const TYPES: Array<Property["type"]> = [
  "strip-centre",
  "strip-centre",
  "strip-centre",
  "community-centre",
  "power-centre",
  "freestanding",
];

const FRENCH_PREFIXES = ["Centre Commercial", "Place", "Carrefour", "Galeries", "Place du Commerce"];
const ENGLISH_SUFFIXES = ["Shopping Centre", "Plaza", "Mall", "Marketplace", "Crossing", "Common"];

function makeName(seed: Seed): string {
  if (seed.frenchName && chance(0.55)) {
    return `${pick(FRENCH_PREFIXES)} ${seed.town.replace(/^Saint-/, "St-")}`;
  }
  return `${seed.town} ${pick(ENGLISH_SUFFIXES)}`;
}

function pickAnchor(type: Property["type"]): string | null {
  if (type === "freestanding") return null;
  if (type === "power-centre") return pick(["Walmart Supercentre", "Costco", "Canadian Tire"]);
  // strip / community
  if (chance(0.72)) return "Walmart Supercentre";
  if (chance(0.5)) return pick(["Loblaws", "Metro", "Sobeys", "IGA", "Maxi", "Provigo", "Canadian Tire", "Giant Tiger"]);
  return null;
}

export const properties: Property[] = SEEDS.map((seed, i): Property => {
  const type = pick(TYPES);
  const gla = range(30_000, 150_000);
  const yearBuilt = range(1978, 2018);
  const anchor = pickAnchor(type);
  const occupancy = Number(rangeF(0.82, 0.98).toFixed(3));
  return {
    id: `prop-${String(i + 1).padStart(2, "0")}`,
    name: makeName(seed),
    town: seed.town,
    province: seed.province,
    tier: seed.tier,
    gla,
    yearBuilt,
    anchor,
    population: seed.population,
    type,
    occupancy,
  };
});

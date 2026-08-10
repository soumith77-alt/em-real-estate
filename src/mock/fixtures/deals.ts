import type { Deal, DealStage } from "@/types";
import { range, rangeF, pick } from "@/mock/seed";

interface Seed {
  id: string;
  propertyName: string;
  town: string;
  province: string;
  stage: DealStage;
  daysToBid?: number;
  ndaDaysAgo?: number;
}

const BROKERS: Array<{ firm: string; names: string[] }> = [
  { firm: "CBRE", names: ["Étienne Fournier", "Anna MacIntyre"] },
  { firm: "Cushman & Wakefield", names: ["Renaud Girard", "Priya Sharma"] },
  { firm: "Colliers", names: ["Marc Boisvert", "Jamie O'Donnell"] },
  { firm: "Avison Young", names: ["Sébastien Roy", "Emily Chen"] },
  { firm: "JLL", names: ["Isabelle Lévesque", "Dan Ferguson"] },
  { firm: "Marcus & Millichap Canada", names: ["Charles Beaulieu", "Rania Habib"] },
];

const DEMO_DATE = new Date("2026-08-10T00:00:00Z");

function daysBefore(n: number): string {
  return new Date(DEMO_DATE.getTime() - n * 86_400_000).toISOString().slice(0, 10);
}
function daysAfter(n: number): string {
  return new Date(DEMO_DATE.getTime() + n * 86_400_000).toISOString().slice(0, 10);
}

const SEEDS: Seed[] = [
  { id: "deal-1", propertyName: "Place Saguenay", town: "Saguenay", province: "QC", stage: "brochure-received" },
  { id: "deal-2", propertyName: "Sackville Crossing", town: "Sackville", province: "NB", stage: "brochure-received" },
  { id: "deal-3", propertyName: "Bedford Commons", town: "Bedford", province: "NS", stage: "nda-signed", ndaDaysAgo: 4 },
  { id: "deal-open", propertyName: "Carrefour Trois-Rivières Ouest", town: "Trois-Rivières", province: "QC", stage: "data-room-open", ndaDaysAgo: 12, daysToBid: 9 },
  { id: "deal-5", propertyName: "Kingston East Plaza", town: "Kingston", province: "ON", stage: "underwriting", ndaDaysAgo: 22, daysToBid: 6 },
  { id: "deal-6", propertyName: "Place Lévis", town: "Lévis", province: "QC", stage: "underwriting", ndaDaysAgo: 26 },
  { id: "deal-7", propertyName: "Truro Marketplace", town: "Truro", province: "NS", stage: "underwritten", ndaDaysAgo: 40 },
  { id: "deal-8", propertyName: "Fredericton North Common", town: "Fredericton", province: "NB", stage: "underwritten", ndaDaysAgo: 55, daysToBid: 3 },
  { id: "deal-9", propertyName: "Sydney River Plaza", town: "Sydney", province: "NS", stage: "passed" },
];

export const deals: Deal[] = SEEDS.map((s): Deal => {
  const broker = pick(BROKERS);
  const brokerName = pick(broker.names);
  const askingPrice = range(8_000_000, 45_000_000);
  const gla = range(35_000, 140_000);
  // Stored as a decimal (0.056–0.078). UI multiplies by 100 for display.
  const capRate = Number((rangeF(5.6, 7.8) / 100).toFixed(4));
  const lastActivity = daysBefore(range(1, 21));
  const bidDeadline = s.daysToBid !== undefined ? daysAfter(s.daysToBid) : undefined;
  const ndaSignedOn = s.ndaDaysAgo !== undefined ? daysBefore(s.ndaDaysAgo) : undefined;
  return {
    id: s.id,
    propertyName: s.propertyName,
    town: s.town,
    province: s.province,
    askingPrice,
    gla,
    capRate,
    stage: s.stage,
    ...(bidDeadline ? { bidDeadline } : {}),
    ...(ndaSignedOn ? { ndaSignedOn } : {}),
    lastActivity,
    brokerName,
    brokerFirm: broker.firm,
  };
});

import type { Unit, UnitFormat, UnitFeature } from "@/types";
import { properties } from "./properties";
import { rng, range, rangeF, pick, pickN, chance } from "@/mock/seed";

const INLINE_FORMATS: UnitFormat[] = ["inline", "inline", "inline", "end-cap"];
const FEATURES: UnitFeature[] = [
  "rear-receiving",
  "exterior-entrance",
  "grease-trap",
  "mezzanine",
  "patio",
  "loading-dock",
];

interface Draft {
  id: string;
  propertyId: string;
  unitNo: string;
  gla: number;
  frontageFt: number;
  format: UnitFormat;
  features: UnitFeature[];
}

const drafts: Draft[] = [];

for (const p of properties) {
  const count = range(8, 20);
  // one anchor unit if property has anchor
  let idx = 0;
  if (p.anchor) {
    idx++;
    drafts.push({
      id: `unit-${p.id}-${String(idx).padStart(3, "0")}`,
      propertyId: p.id,
      unitNo: "A1",
      gla: range(25_000, 120_000),
      frontageFt: range(150, 260),
      format: "anchor",
      features: pickN(FEATURES, range(1, 3)),
    });
  }
  // sometimes an end-cap larger unit
  if (chance(0.55)) {
    idx++;
    const feats: UnitFeature[] = [];
    if (chance(0.35)) feats.push("drive-thru");
    for (const f of pickN(FEATURES, range(0, 2))) feats.push(f);
    drafts.push({
      id: `unit-${p.id}-${String(idx).padStart(3, "0")}`,
      propertyId: p.id,
      unitNo: `E${idx}`,
      gla: range(12_000, 25_000),
      frontageFt: range(90, 140),
      format: "end-cap",
      features: feats,
    });
  }
  // maybe a pad site
  if (chance(0.4)) {
    idx++;
    const feats: UnitFeature[] = [];
    if (chance(0.7)) feats.push("drive-thru");
    if (chance(0.3)) feats.push("patio");
    drafts.push({
      id: `unit-${p.id}-${String(idx).padStart(3, "0")}`,
      propertyId: p.id,
      unitNo: `P${idx}`,
      gla: range(2_400, 6_500),
      frontageFt: range(40, 90),
      format: "pad",
      features: feats,
    });
  }
  // inline / end-cap fill
  while (idx < count) {
    idx++;
    const format = pick(INLINE_FORMATS);
    const feats = pickN(FEATURES, range(0, 2));
    drafts.push({
      id: `unit-${p.id}-${String(idx).padStart(3, "0")}`,
      propertyId: p.id,
      unitNo: chance(0.5) ? String(100 + idx) : `${pick(["A", "B", "C"])}-${idx}`,
      gla: range(900, 8_000),
      frontageFt: range(18, 60),
      format,
      features: feats,
    });
  }
}

// --- assign statuses: hit exactly 34 vacant + 11 notice-given ---
const TARGET_VACANT = 34;
const TARGET_NOTICE = 11;

// Shuffle indices deterministically
const idxs = drafts.map((_, i) => i);
for (let i = idxs.length - 1; i > 0; i--) {
  const j = Math.floor(rng() * (i + 1));
  [idxs[i], idxs[j]] = [idxs[j], idxs[i]];
}
const vacantIdx = new Set<number>();
const noticeIdx = new Set<number>();
let cursor = 0;
while (vacantIdx.size < TARGET_VACANT && cursor < idxs.length) {
  const i = idxs[cursor++];
  // don't make anchors vacant more than a couple times
  if (drafts[i].format === "anchor" && vacantIdx.size > 2) continue;
  vacantIdx.add(i);
}
while (noticeIdx.size < TARGET_NOTICE && cursor < idxs.length) {
  const i = idxs[cursor++];
  if (vacantIdx.has(i)) continue;
  noticeIdx.add(i);
}

function vacantSinceDate(): string {
  // Between 2024-06 and 2026-07
  const y = pick([2024, 2024, 2025, 2025, 2025, 2026]);
  const m = range(1, 12);
  const d = range(1, 28);
  const date = new Date(Date.UTC(y, m - 1, d));
  // clamp to before demo date
  if (date > new Date("2026-08-10")) date.setUTCFullYear(2026, 5, 1);
  return date.toISOString().slice(0, 10);
}

export const units: Unit[] = drafts.map((d, i): Unit => {
  const status = vacantIdx.has(i)
    ? "vacant"
    : noticeIdx.has(i)
    ? "notice-given"
    : "occupied";
  const base: Unit = {
    id: d.id,
    propertyId: d.propertyId,
    unitNo: d.unitNo,
    gla: d.gla,
    frontageFt: d.frontageFt,
    format: d.format,
    features: d.features,
    status,
  };
  if (status === "vacant") {
    base.vacantSince = vacantSinceDate();
    base.askingRentPsf = Number(rangeF(10, 32).toFixed(2));
  } else {
    // occupied and notice-given both have a tenant id
    base.currentTenantId = `tenant-${d.id}`;
  }
  return base;
});

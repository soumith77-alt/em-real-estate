import type { SavedSearch } from "@/types";
import { units } from "./units";
import { criteriaSets } from "./criteriaSets";

const vacantUnits = units.filter((u) => u.status === "vacant");

// Deterministic: take the first, middle and last vacant units.
const pickIndices = [
  0,
  Math.floor(vacantUnits.length / 2),
  vacantUnits.length - 1,
];

const [u1, u2, u3] = pickIndices.map((i) => vacantUnits[i]);

const smallTownId = criteriaSets[0].id;
const majorCityId = criteriaSets[1].id;

const runningWeights: Record<string, number> = {};
for (const c of criteriaSets[0].criteria) {
  if (c.provenance === "ai") runningWeights[c.id] = c.weight ?? 1.0;
}

const completeWeights: Record<string, number> = { ...runningWeights };
// Tweak a couple weights on the "complete" search
completeWeights["likelihood-execute-deal"] = 1.75;
completeWeights["category-momentum"] = 1.5;

export const savedSearches: SavedSearch[] = [
  {
    id: "search-complete-1",
    unitId: u1.id,
    criteriaSetId: smallTownId,
    createdAt: "2026-08-01",
    status: "complete",
    weights: completeWeights,
  },
  {
    id: "search-running-1",
    unitId: u2.id,
    criteriaSetId: smallTownId,
    createdAt: "2026-08-09",
    status: "running",
    weights: runningWeights,
  },
  {
    id: "search-draft-1",
    unitId: u3.id,
    criteriaSetId: majorCityId,
    createdAt: "2026-08-10",
    status: "draft",
  },
];

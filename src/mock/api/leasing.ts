import { db } from "@/mock/db";
import { mockDelay } from "@/mock/delay";
import type {
  CandidateAssessment,
  CriteriaSet,
  SavedSearch,
  Unit,
} from "@/types";
import { runSearch } from "@/mock/engine/runSearch";

export async function getVacantUnits(): Promise<Unit[]> {
  await mockDelay();
  return db.units.filter(
    (u) => u.status === "vacant" || u.status === "notice-given",
  );
}

export async function getUnit(id: string): Promise<Unit | null> {
  await mockDelay();
  return db.units.find((u) => u.id === id) ?? null;
}

export async function listCriteriaSets(): Promise<CriteriaSet[]> {
  await mockDelay();
  return db.criteriaSets;
}

export async function getCriteriaSet(id: string): Promise<CriteriaSet | null> {
  await mockDelay();
  return db.criteriaSets.find((s) => s.id === id) ?? null;
}

let searchIdCounter = 100;

export async function startSearch(
  unitId: string,
  criteriaSetId: string,
): Promise<SavedSearch> {
  await mockDelay();
  const s: SavedSearch = {
    id: `srch-live-${searchIdCounter++}`,
    unitId,
    criteriaSetId,
    createdAt: "2026-08-10",
    status: "complete",
    weights: {},
  };
  // Insert into in-memory DB so subsequent gets work
  (db.savedSearches as unknown as SavedSearch[]).push(s);
  return s;
}

export async function getSearch(id: string): Promise<SavedSearch | null> {
  await mockDelay();
  return db.savedSearches.find((s) => s.id === id) ?? null;
}

export interface SearchResultBundle {
  inScope: number;
  hardPassed: number;
  ranked: CandidateAssessment[];
  complete: CandidateAssessment[];
  set: CriteriaSet;
}

export async function getSearchResults(
  searchId: string,
  weights?: Record<string, number>,
): Promise<SearchResultBundle> {
  await mockDelay(500, 1200);
  const search = db.savedSearches.find((s) => s.id === searchId);
  if (!search) throw new Error("search not found");
  const set = db.criteriaSets.find((s) => s.id === search.criteriaSetId);
  if (!set) throw new Error("criteria set not found");
  const result = runSearch(search.unitId, search.criteriaSetId, weights);
  return { ...result, set };
}

export async function getCandidateAssessment(
  searchId: string,
  retailerId: string,
): Promise<CandidateAssessment | null> {
  await mockDelay();
  const search = db.savedSearches.find((s) => s.id === searchId);
  if (!search) return null;
  const result = runSearch(search.unitId, search.criteriaSetId, search.weights);
  return (
    result.complete.find((c) => c.retailerId === retailerId) ?? null
  );
}

export async function listRenewals() {
  await mockDelay();
  return db.renewals;
}

export async function getRenewal(id: string) {
  await mockDelay();
  return db.renewals.find((r) => r.id === id) ?? null;
}

export async function listExpiries() {
  await mockDelay();
  return db.tenants.filter((t) => {
    const end = new Date(t.endDate);
    const now = new Date("2026-08-10");
    const diffMonths =
      (end.getFullYear() - now.getFullYear()) * 12 +
      (end.getMonth() - now.getMonth());
    return diffMonths >= 0 && diffMonths <= 12;
  });
}

export async function listReminders() {
  await mockDelay();
  return db.reminders;
}

export async function saveExpirySettings(v: {
  noticeMonths: number;
  recipients: string[];
  sendDay: number;
}) {
  await mockDelay();
  return v;
}

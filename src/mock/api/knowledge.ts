import { db } from "@/mock/db";
import { mockDelay } from "@/mock/delay";
import { rng } from "@/mock/seed";
import type { Property, Restriction, Retailer, Criterion } from "@/types";

export async function listProperties(): Promise<Property[]> {
  await mockDelay();
  return db.properties;
}

export async function getProperty(id: string): Promise<Property | null> {
  await mockDelay();
  return db.properties.find((p) => p.id === id) ?? null;
}

export async function listRestrictionsForProperty(
  propId: string,
): Promise<Restriction[]> {
  await mockDelay();
  return db.restrictions.filter((r) => r.propertyId === propId);
}

export async function listRetailers(): Promise<Retailer[]> {
  await mockDelay();
  return db.retailers;
}

export async function getRetailer(id: string): Promise<Retailer | null> {
  await mockDelay();
  return db.retailers.find((r) => r.id === id) ?? null;
}

/**
 * User correction to a retailer field. In the real app this would be
 * persisted (Zustand store hydrates the change); here we simply confirm.
 */
export async function updateRetailerField(
  retailerId: string,
  field: string,
  value: unknown,
): Promise<{ retailerId: string; field: string; value: unknown }> {
  await mockDelay();
  return { retailerId, field, value };
}

// Simulated refresh: yields events over ~6s indicating how many rows updated.
export async function* refreshVolatile(): AsyncGenerator<{
  updated: number;
  total: number;
}> {
  const total = 240;
  for (let i = 0; i <= total; i += 30 + Math.floor(rng() * 20)) {
    await new Promise((r) => setTimeout(r, 400 + rng() * 500));
    yield { updated: Math.min(i, total), total };
  }
  yield { updated: total, total };
}

export async function listStandingRules() {
  await mockDelay();
  return db.standingRules;
}

export async function updateStandingRule(id: string, body: string) {
  await mockDelay();
  return { id, body };
}

export async function addCriterion(setId: string, c: Criterion) {
  await mockDelay();
  return { setId, c };
}

export async function updateCriterion(
  setId: string,
  criterionId: string,
  patch: Partial<Criterion>,
) {
  await mockDelay();
  return { setId, criterionId, patch };
}

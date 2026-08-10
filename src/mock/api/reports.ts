import { db } from "@/mock/db";
import { mockDelay } from "@/mock/delay";

export async function listReports({ type }: { type?: string } = {}) {
  await mockDelay();
  return db.reports.filter((r) => !type || r.type === type);
}

export async function getReport(id: string) {
  await mockDelay();
  return db.reports.find((r) => r.id === id) ?? null;
}

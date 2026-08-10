import { db } from "@/mock/db";
import { mockDelay } from "@/mock/delay";
import type { Clause, LeaseDoc } from "@/types";
import { parseISO } from "date-fns";

export async function listTenantDocs(tenantId: string): Promise<LeaseDoc[]> {
  await mockDelay();
  return db.leaseDocs
    .filter((d) => d.tenantId === tenantId)
    .sort(
      (a, b) => parseISO(a.signedOn).valueOf() - parseISO(b.signedOn).valueOf(),
    );
}

export async function listAllDocs({
  q,
  type,
  year,
}: { q?: string; type?: string; year?: string } = {}): Promise<LeaseDoc[]> {
  await mockDelay();
  return db.leaseDocs.filter((d) => {
    if (q && !d.title.toLowerCase().includes(q.toLowerCase())) return false;
    if (type && d.type !== type) return false;
    if (year && !d.signedOn.startsWith(year)) return false;
    return true;
  });
}

export async function getClausesForTenant(
  tenantId: string,
): Promise<Clause[]> {
  await mockDelay();
  return db.clauses.filter((c) => c.tenantId === tenantId);
}

export async function getRentHistory(tenantId: string) {
  await mockDelay();
  const tenant = db.tenants.find((t) => t.id === tenantId);
  if (!tenant) return [];
  const start = parseISO(tenant.startDate);
  const startYear = start.getFullYear();
  const currentYear = 2026;
  const out: { year: number; rentPsf: number; marketPsfLow: number; marketPsfHigh: number }[] = [];
  for (let y = startYear; y <= currentYear; y++) {
    const growth = Math.pow(1 + tenant.escalationPct / 100, y - startYear);
    out.push({
      year: y,
      rentPsf: +(tenant.baseRentPsf * growth).toFixed(2),
      marketPsfLow: +(tenant.baseRentPsf * growth * 0.92).toFixed(2),
      marketPsfHigh: +(tenant.baseRentPsf * growth * 1.14).toFixed(2),
    });
  }
  return out;
}

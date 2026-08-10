import { tenants } from "./tenants";
import { range, pick } from "@/mock/seed";

export type RenewalStatus = "analyzing" | "ready" | "sent";

export interface Renewal {
  id: string;
  tenantId: string;
  propertyId: string;
  expiryDate: string;
  status: RenewalStatus;
  createdAt: string;
}

const DEMO_DATE = new Date("2026-08-10");

function daysFromNow(days: number): string {
  return new Date(DEMO_DATE.getTime() + days * 86_400_000)
    .toISOString()
    .slice(0, 10);
}

const list: Renewal[] = [];

// The demo tenant (Bulk Barn at prop-11) — analyzing
const bulk = tenants.find(
  (t) => t.propertyId === "prop-11" && t.brand === "Bulk Barn",
);
if (bulk) {
  list.push({
    id: "renewal-bulk-barn",
    tenantId: bulk.id,
    propertyId: bulk.propertyId,
    expiryDate: bulk.endDate,
    status: "analyzing",
    createdAt: "2026-08-05",
  });
}

// 5 more renewals across expiring tenants
const soon = tenants
  .filter((t) => t.status === "active" && new Date(t.endDate) <= new Date("2027-12-31"))
  .filter((t) => !bulk || t.id !== bulk.id)
  .slice(0, 5);

const STATUSES: RenewalStatus[] = ["ready", "sent", "analyzing", "ready", "sent"];

soon.forEach((t, i) => {
  list.push({
    id: `renewal-${String(i + 2).padStart(2, "0")}`,
    tenantId: t.id,
    propertyId: t.propertyId,
    expiryDate: t.endDate,
    status: STATUSES[i] ?? pick(STATUSES),
    createdAt: daysFromNow(-range(2, 30)),
  });
});

export const renewals: Renewal[] = list;

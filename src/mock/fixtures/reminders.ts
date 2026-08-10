import { tenants } from "./tenants";
import { rng, range, chance } from "@/mock/seed";

export interface Reminder {
  id: string;
  tenantId: string;
  expiryDate: string;
  sentAt: string;
  acknowledged: boolean;
}

const DEMO_DATE = new Date("2026-08-10");

function daysBefore(anchor: Date, days: number): string {
  return new Date(anchor.getTime() - days * 86_400_000).toISOString().slice(0, 10);
}

// Pick tenants whose lease expires in the next 24 months
const expiringSoon = tenants.filter((t) => {
  const end = new Date(t.endDate);
  const diff = (end.getTime() - DEMO_DATE.getTime()) / 86_400_000;
  return diff >= 0 && diff <= 730;
});

const list: Reminder[] = [];
const TARGET = 40;

let idx = 0;
for (const t of expiringSoon) {
  if (list.length >= TARGET) break;
  idx++;
  const expiry = new Date(t.endDate);
  const daysAhead = range(180, 300); // 6-10 months before expiry
  const sentAt = daysBefore(expiry, daysAhead);
  const acknowledged = chance(0.6);
  list.push({
    id: `rem-${String(idx).padStart(3, "0")}`,
    tenantId: t.id,
    expiryDate: t.endDate,
    sentAt,
    acknowledged,
  });
}

// silence unused
void rng;

export const reminders: Reminder[] = list;

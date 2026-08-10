import { db } from "@/mock/db";
import { mockDelay } from "@/mock/delay";
import { differenceInDays, parseISO } from "date-fns";

const NOW = new Date("2026-08-10");

export async function getHomeSummary() {
  await mockDelay();
  const openDeals = db.deals.filter(
    (d) => d.stage !== "won" && d.stage !== "passed",
  ).length;
  const bidsSoon = db.deals.filter((d) => {
    if (!d.bidDeadline) return false;
    const days = differenceInDays(parseISO(d.bidDeadline), NOW);
    return days >= 0 && days <= 14;
  }).length;
  const vacant = db.units.filter(
    (u) => u.status === "vacant" || u.status === "notice-given",
  ).length;
  const expiring = db.tenants.filter((t) => {
    const days = differenceInDays(parseISO(t.endDate), NOW);
    return days >= 0 && days <= 180;
  }).length;
  return { openDeals, bidsSoon, vacant, expiring };
}

export interface AttentionItem {
  id: string;
  title: string;
  subtitle: string;
  metaRight: string;
  href: string;
  severity: "high" | "medium" | "low";
}

export async function getAttentionItems(): Promise<AttentionItem[]> {
  await mockDelay();
  const items: AttentionItem[] = [];

  // Bid deadlines soon
  for (const d of db.deals) {
    if (!d.bidDeadline) continue;
    const days = differenceInDays(parseISO(d.bidDeadline), NOW);
    if (days >= 0 && days <= 14) {
      items.push({
        id: `bid-${d.id}`,
        title: `Bid due for ${d.propertyName}`,
        subtitle: `${d.town}, ${d.province} · ${d.brokerFirm}`,
        metaRight: `${days}d`,
        href: `/acquisitions/${d.id}`,
        severity: days <= 5 ? "high" : "medium",
      });
    }
  }

  // Unacknowledged expiry reminders
  const unack = db.reminders.filter((r) => !r.acknowledged).slice(0, 4);
  for (const r of unack) {
    const t = db.tenants.find((x) => x.id === r.tenantId);
    if (!t) continue;
    const p = db.properties.find((x) => x.id === t.propertyId);
    items.push({
      id: `rem-${r.id}`,
      title: `${t.brand} lease expiring ${r.expiryDate.slice(0, 7)}`,
      subtitle: `${p?.name ?? ""} · notification sent ${r.sentAt.slice(0, 10)}`,
      metaRight: `${differenceInDays(parseISO(r.expiryDate), NOW)}d`,
      href: `/leasing/expiry-watch`,
      severity: "medium",
    });
  }

  // Data-room failures (deal-open)
  const failures = db.dataRoomFiles.filter(
    (f) => f.status === "failed" || f.status === "needs-ocr",
  );
  if (failures.length > 0) {
    const deal = db.deals.find((d) => d.id === failures[0].dealId);
    items.push({
      id: `ingest-${failures[0].dealId}`,
      title: `${failures.length} files need action in ${deal?.propertyName ?? "data room"}`,
      subtitle: "One password-protected PDF and one scan without a text layer",
      metaRight: "review",
      href: `/acquisitions/${failures[0].dealId}/data-room`,
      severity: "medium",
    });
  }

  return items.slice(0, 8);
}

export async function getRecentReports() {
  await mockDelay();
  return [...db.reports]
    .sort(
      (a, b) => parseISO(b.createdAt).valueOf() - parseISO(a.createdAt).valueOf(),
    )
    .slice(0, 5);
}

export async function getKnowledgeSummary() {
  await mockDelay();
  return [
    { label: "Properties", value: db.properties.length, updatedAt: "2026-08-01" },
    { label: "Units", value: db.units.length, updatedAt: "2026-08-01" },
    { label: "Tenancies", value: db.tenants.length, updatedAt: "2026-08-05" },
    { label: "Retailers tracked", value: db.retailers.length, updatedAt: "2026-08-08" },
    { label: "Standing rules", value: db.standingRules.length, updatedAt: "2026-07-14" },
  ];
}

import { deals } from "./deals";
import { renewals } from "./renewals";
import { properties } from "./properties";
import { pick, range } from "@/mock/seed";

export type ReportType = "underwriting" | "tenant-search" | "renewal";
export type ReportFormat = "docx" | "xlsx";

export interface Report {
  id: string;
  title: string;
  type: ReportType;
  propertyId?: string;
  dealId?: string;
  renewalId?: string;
  createdAt: string;
  authorName: string;
  format: ReportFormat;
}

const AUTHORS = ["Kyle Robitaille", "Marie Tremblay", "Simon Lévesque"];

function daysAgo(n: number): string {
  const d = new Date("2026-08-10");
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

const list: Report[] = [];
let idx = 0;

// Underwriting reports — one per underwritten/underwriting deal
for (const d of deals) {
  if (d.stage === "underwriting" || d.stage === "underwritten" || d.stage === "data-room-open") {
    idx++;
    list.push({
      id: `rep-${String(idx).padStart(3, "0")}`,
      title: `${d.propertyName} — Investment Memorandum`,
      type: "underwriting",
      dealId: d.id,
      createdAt: daysAgo(range(1, 21)),
      authorName: pick(AUTHORS),
      format: "docx",
    });
    idx++;
    list.push({
      id: `rep-${String(idx).padStart(3, "0")}`,
      title: `${d.propertyName} — Underwriting Model`,
      type: "underwriting",
      dealId: d.id,
      createdAt: daysAgo(range(1, 21)),
      authorName: pick(AUTHORS),
      format: "xlsx",
    });
  }
}

// Tenant-search reports
for (let i = 0; i < 4; i++) {
  idx++;
  const p = properties[range(0, properties.length - 1)];
  list.push({
    id: `rep-${String(idx).padStart(3, "0")}`,
    title: `${p.name} — Tenant Search Longlist`,
    type: "tenant-search",
    propertyId: p.id,
    createdAt: daysAgo(range(3, 45)),
    authorName: pick(AUTHORS),
    format: "xlsx",
  });
}

// Renewal reports
for (const r of renewals.slice(0, 4)) {
  idx++;
  list.push({
    id: `rep-${String(idx).padStart(3, "0")}`,
    title: `Renewal Analysis — Tenant ${r.tenantId}`,
    type: "renewal",
    renewalId: r.id,
    createdAt: daysAgo(range(2, 30)),
    authorName: pick(AUTHORS),
    format: "docx",
  });
}

// Trim / fill to exactly 14
const trimmed = list.slice(0, 14);
while (trimmed.length < 14) {
  idx++;
  const p = properties[(idx * 7) % properties.length];
  trimmed.push({
    id: `rep-${String(idx).padStart(3, "0")}`,
    title: `${p.name} — Market Note`,
    type: "tenant-search",
    propertyId: p.id,
    createdAt: daysAgo(range(2, 60)),
    authorName: pick(AUTHORS),
    format: "docx",
  });
}

export const reports: Report[] = trimmed;

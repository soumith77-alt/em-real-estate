import type { LeaseDoc, LeaseDocType, Clause, ClauseKind } from "@/types";
import { tenants } from "./tenants";
import { rng, range, pick, chance } from "@/mock/seed";

// Deterministic seeding of documents per tenant + a special-case narrative
// tenant (Bulk Barn at prop-11 Drummondville) with a 15-year history.

const leaseDocsOut: LeaseDoc[] = [];
const clausesOut: Clause[] = [];

function isoDate(y: number, m: number, d: number) {
  return new Date(Date.UTC(y, m - 1, d)).toISOString().slice(0, 10);
}

// -- Helpers to generate clauses per tenant --
const CLAUSE_KINDS: ClauseKind[] = [
  "exclusivity",
  "co-tenancy",
  "assignment",
  "percentage-rent",
  "renewal-option",
  "demolition",
  "relocation",
  "cam-cap",
];

function clauseText(kind: ClauseKind, brand: string): string {
  switch (kind) {
    case "exclusivity":
      return `Landlord shall not lease other premises in the Shopping Centre to a tenant whose primary business is the sale of the same product category as ${brand} (as defined in Schedule "B"). Any breach shall entitle the Tenant to Alternate Rent equal to 50% of Minimum Rent until cured.`;
    case "co-tenancy":
      return `If the Anchor Tenant (currently a supermarket of not less than 25,000 sq ft) ceases operation and is not replaced within twelve (12) months, Tenant may pay Alternate Rent equal to 3% of Gross Sales and, if such condition persists for a further six (6) months, terminate this Lease on 60 days' notice.`;
    case "assignment":
      return `Tenant may assign this Lease to (i) a parent, subsidiary or affiliate; (ii) any purchaser of substantially all of Tenant's assets; or (iii) any successor by merger or consolidation, in each case without Landlord's consent, provided that the assignee assumes all obligations hereunder.`;
    case "percentage-rent":
      return `In addition to Minimum Rent, Tenant shall pay Percentage Rent equal to six percent (6%) of Gross Sales in excess of the Breakpoint ($1,850,000 per Lease Year), payable within ninety (90) days after the close of each Lease Year.`;
    case "renewal-option":
      return `Tenant shall have two (2) successive options to renew this Lease, each for a further term of five (5) years, on the same terms and conditions save that Minimum Rent shall be adjusted to fair market rent as reasonably determined by the parties.`;
    case "demolition":
      return `Landlord may terminate this Lease upon twelve (12) months' prior written notice for the purpose of demolishing or substantially redeveloping the Building. Landlord shall pay to Tenant an amount equal to the unamortized portion of Tenant's leasehold improvements.`;
    case "relocation":
      return `Landlord may, on not less than one hundred eighty (180) days' notice, relocate Tenant to comparable premises within the Shopping Centre of substantially the same size and prominence. Landlord shall bear all reasonable costs of the relocation including new leasehold improvements.`;
    case "cam-cap":
      return `Controllable Common Area Costs shall not increase by more than five percent (5%) in any Lease Year, compounded annually, over the amount payable in the Base Year (2018). Uncontrollable Costs (utilities, snow removal, insurance, taxes) are not subject to this cap.`;
  }
}

// Track tenants that should have "many docs" for the demo
const DEMO_MULTI_DOC_TENANTS = new Set<string>();
// Pick some tenants to be "heavy history" — at least 3 with 8+ docs spanning 15 years.
const bigTenantCandidates = tenants.filter((t) => t.status === "active");
const bigTenants = bigTenantCandidates.slice(0, 3).map((t) => t.id);
bigTenants.forEach((id) => DEMO_MULTI_DOC_TENANTS.add(id));

// The special demo tenant for the renewal workflow:
const RENEWAL_DEMO_TENANT = tenants.find(
  (t) => t.propertyId === "prop-11" && t.brand === "Bulk Barn",
);
if (RENEWAL_DEMO_TENANT) DEMO_MULTI_DOC_TENANTS.add(RENEWAL_DEMO_TENANT.id);

// Build docs for ~60 tenants total (deterministic)
const tenantsWithDocs = tenantsForDocs(60);

function tenantsForDocs(n: number) {
  const out = new Set<string>(DEMO_MULTI_DOC_TENANTS);
  for (const t of tenants) {
    if (out.size >= n) break;
    out.add(t.id);
  }
  return [...out];
}

const TYPES: LeaseDocType[] = [
  "original-lease",
  "amendment",
  "renewal",
  "assignment",
  "estoppel",
  "side-letter",
];

function titleFor(kind: LeaseDocType, brand: string, year: number): string {
  switch (kind) {
    case "original-lease":
      return `Original Lease — ${brand} (${year})`;
    case "amendment":
      return `Amendment — ${brand} (${year})`;
    case "renewal":
      return `Renewal — ${brand} (${year})`;
    case "assignment":
      return `Assignment — ${brand} (${year})`;
    case "estoppel":
      return `Estoppel Certificate — ${brand} (${year})`;
    case "side-letter":
      return `Side Letter — ${brand} (${year})`;
  }
}

// --- Special demo tenant: full 15-year story ---
if (RENEWAL_DEMO_TENANT) {
  const t = RENEWAL_DEMO_TENANT;
  const seq: Array<{ type: LeaseDocType; year: number; note?: string }> = [
    { type: "original-lease", year: 2009 },
    { type: "amendment", year: 2012 },
    { type: "amendment", year: 2018, note: "strikes co-tenancy" },
    { type: "renewal", year: 2019 },
    { type: "side-letter", year: 2021 },
    { type: "estoppel", year: 2023 },
    { type: "renewal", year: 2024 },
  ];
  // Also throw in one assignment doc so total >= 8
  seq.push({ type: "assignment", year: 2016 });

  // Establish the base "co-tenancy" clause on the original lease
  const originalId = `ld-${t.propertyId}-${t.id}-2009-01`;
  const amendment2018Id = `ld-${t.propertyId}-${t.id}-2018-01`;

  for (const s of seq) {
    const idBase = `ld-${t.propertyId}-${t.id}-${s.year}-01`;
    leaseDocsOut.push({
      id: idBase,
      tenantId: t.id,
      type: s.type,
      title: titleFor(s.type, t.brand, s.year),
      signedOn: isoDate(s.year, range(1, 12), range(1, 28)),
      pages: s.type === "original-lease" ? range(70, 120) : range(4, 24),
      fileUrl: `/mock-files/${idBase}.pdf`,
      ...(s.note === "strikes co-tenancy"
        ? { supersedes: [`clause-${t.id}-co-tenancy-original`] }
        : {}),
    });
  }

  clausesOut.push({
    id: `clause-${t.id}-co-tenancy-original`,
    tenantId: t.id,
    kind: "co-tenancy",
    text: clauseText("co-tenancy", t.brand),
    sourceDocId: originalId,
    sourcePage: 47,
    status: "superseded",
    supersededBy: {
      docId: amendment2018Id,
      page: 6,
      date: leaseDocsOut.find((d) => d.id === amendment2018Id)?.signedOn ?? "2018-06-01",
    },
  });
  // Add a few other active clauses
  const activeKinds: ClauseKind[] = ["exclusivity", "renewal-option", "cam-cap", "percentage-rent"];
  for (const k of activeKinds) {
    clausesOut.push({
      id: `clause-${t.id}-${k}`,
      tenantId: t.id,
      kind: k,
      text: clauseText(k, t.brand),
      sourceDocId: originalId,
      sourcePage: range(20, 90),
      status: "active",
    });
  }
}

// --- Generic docs for the remaining tenants (skip demo tenant already handled) ---
for (const tid of tenantsWithDocs) {
  if (RENEWAL_DEMO_TENANT && tid === RENEWAL_DEMO_TENANT.id) continue;
  const t = tenants.find((x) => x.id === tid);
  if (!t) continue;
  const isBig = bigTenants.includes(tid);
  const count = isBig ? range(8, 12) : range(3, 6);
  const startYear = 2009 + range(0, 6);
  // Always start with original-lease
  const originalYear = Math.min(startYear, new Date(t.startDate).getUTCFullYear());
  const originalId = `ld-${t.propertyId}-${t.id}-${originalYear}-01`;
  leaseDocsOut.push({
    id: originalId,
    tenantId: t.id,
    type: "original-lease",
    title: titleFor("original-lease", t.brand, originalYear),
    signedOn: isoDate(originalYear, range(1, 12), range(1, 28)),
    pages: range(60, 130),
    fileUrl: `/mock-files/${originalId}.pdf`,
  });
  // Subsequent docs
  let yearCursor = originalYear + 1;
  for (let i = 1; i < count; i++) {
    const type = pick(TYPES.filter((tp) => tp !== "original-lease"));
    yearCursor += range(1, 3);
    if (yearCursor > 2024) yearCursor = 2009 + range(1, 15);
    const yy = yearCursor;
    const id = `ld-${t.propertyId}-${t.id}-${yy}-${String(i + 1).padStart(2, "0")}`;
    leaseDocsOut.push({
      id,
      tenantId: t.id,
      type,
      title: titleFor(type, t.brand, yy),
      signedOn: isoDate(yy, range(1, 12), range(1, 28)),
      pages: range(3, 32),
      fileUrl: `/mock-files/${id}.pdf`,
    });
  }
  // 1–2 clauses per tenant on the original lease
  const nClauses = range(1, 2);
  for (let i = 0; i < nClauses; i++) {
    const k = pick(CLAUSE_KINDS);
    const id = `clause-${t.id}-${k}-${i}`;
    // ~15% chance the clause is superseded and has metadata
    const superseded = chance(0.14);
    let extra = {};
    if (superseded) {
      const later = leaseDocsOut.filter((d) => d.tenantId === t.id && d.type !== "original-lease");
      const supDoc = later.length > 0 ? pick(later) : undefined;
      if (supDoc) {
        extra = {
          status: "superseded" as const,
          supersededBy: {
            docId: supDoc.id,
            page: range(1, supDoc.pages ?? 12),
            date: supDoc.signedOn,
          },
        };
      }
    }
    clausesOut.push({
      id,
      tenantId: t.id,
      kind: k,
      text: clauseText(k, t.brand),
      sourceDocId: originalId,
      sourcePage: range(10, 90),
      status: "active",
      ...extra,
    });
  }
}

// Trim clause count to roughly 120
while (clausesOut.length > 130) clausesOut.pop();

export const leaseDocs: LeaseDoc[] = leaseDocsOut;
export const clauses: Clause[] = clausesOut;

// silence unused
void rng;

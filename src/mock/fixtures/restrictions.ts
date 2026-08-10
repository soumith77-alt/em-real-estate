import type { Restriction } from "@/types";
import { properties } from "./properties";
import { tenants } from "./tenants";
import { rng, range, pick, chance } from "@/mock/seed";

interface Template {
  kind: Restriction["kind"];
  category: string;
  clause: (brand: string) => string;
}

const TEMPLATES: Template[] = [
  {
    kind: "exclusive-use",
    category: "pharmacy",
    clause: (b) =>
      `Landlord shall not lease any premises within the Shopping Centre to any other tenant for the operation of a retail pharmacy or dispensary, so long as ${b} is open for business under this Lease. This exclusive extends to any tenant whose principal business is the filling of prescriptions.`,
  },
  {
    kind: "exclusive-use",
    category: "coffee",
    clause: (b) =>
      `Landlord grants Tenant the exclusive right within the Shopping Centre to sell brewed coffee and espresso beverages as a primary use, excepting ancillary sales of coffee by full-service restaurants (defined as premises exceeding 3,500 square feet). This exclusive shall not restrict ${b}'s ability to sell coffee.`,
  },
  {
    kind: "exclusive-use",
    category: "dollar-store",
    clause: (b) =>
      `No other premises in the Shopping Centre shall be leased to a tenant operating a "dollar store" or "value store" concept, defined as any store deriving more than 50% of gross sales from merchandise priced at $10 or less. ${b}'s exclusive.`,
  },
  {
    kind: "prohibited-use",
    category: "gym",
    clause: () =>
      `The following uses are expressly prohibited within the Shopping Centre: adult entertainment; auction house; carnival or amusement park; funeral parlour; massage parlour; pawn shop; second-hand store; tattoo parlour; and any fitness centre exceeding 8,000 square feet.`,
  },
  {
    kind: "exclusive-use",
    category: "quick-service-restaurant",
    clause: (b) =>
      `${b} shall have the exclusive right within the Shopping Centre to operate a quick-service restaurant selling coffee, donuts and breakfast sandwiches as a primary use. Excludes any full-service restaurant.`,
  },
  {
    kind: "co-tenancy",
    category: "grocery",
    clause: (b) =>
      `In the event the Anchor Tenant (currently a full-line supermarket of not less than 25,000 square feet) ceases operations and is not replaced within twelve (12) months by a comparable operator, ${b} shall be entitled to pay Alternate Rent equal to the lesser of Minimum Rent and 3% of Gross Sales, and, if such condition continues for a further six (6) months, terminate this Lease on 60 days' notice.`,
  },
  {
    kind: "exclusive-use",
    category: "liquor",
    clause: () =>
      `No other premises shall be leased for the retail sale of packaged wine, spirits or beer for off-premises consumption. Nothing herein restricts the SAQ or a provincially-mandated liquor board outlet.`,
  },
  {
    kind: "prohibited-use",
    category: "veterinary",
    clause: () =>
      `No premises shall be used as a veterinary clinic, animal boarding facility, or kennel. This restriction is imposed at the request of the Anchor Tenant and shall run for the full term of said tenant's lease.`,
  },
  {
    kind: "exclusive-use",
    category: "medical",
    clause: (b) =>
      `${b} shall have the exclusive right within the Shopping Centre to operate a walk-in medical clinic. Family medicine practices under 2,000 sq ft and physiotherapy uses are excepted.`,
  },
  {
    kind: "prohibited-use",
    category: "cannabis",
    clause: () =>
      `No premises within the Shopping Centre shall be used for the sale of cannabis or cannabis-derived products, whether by public or private operator, without the prior written consent of the Anchor Tenant.`,
  },
  {
    kind: "exclusive-use",
    category: "banking",
    clause: (b) =>
      `${b} shall be the sole tenant operating a full-service retail bank branch within the Shopping Centre. Automated banking machines operated by other tenants for the convenience of their customers are permitted.`,
  },
  {
    kind: "radius",
    category: "pharmacy",
    clause: (b) =>
      `${b} shall not, directly or indirectly, own or operate a competing pharmacy within a radius of five (5) kilometres of the Shopping Centre for the duration of the Term.`,
  },
];

const CATEGORY_TO_BRAND: Record<string, string[]> = {
  pharmacy: ["Jean Coutu", "Pharmaprix", "Familiprix", "Uniprix", "Brunet"],
  coffee: ["Starbucks", "Second Cup", "Tim Hortons"],
  "dollar-store": ["Dollarama", "Rossy", "Giant Tiger"],
  gym: [],
  "quick-service-restaurant": ["Tim Hortons", "McDonald's", "A&W", "Subway"],
  grocery: ["Loblaws", "Metro", "Sobeys", "IGA", "Maxi", "Provigo", "Walmart Supercentre"],
  liquor: ["SAQ"],
  veterinary: [],
  medical: [],
  cannabis: [],
  banking: [],
};

function tenantForCategory(propId: string, category: string): string | null {
  const brands = CATEGORY_TO_BRAND[category] ?? [];
  const propTenants = tenants.filter((t) => t.propertyId === propId);
  const matches = propTenants.filter((t) => brands.includes(t.brand));
  if (matches.length > 0) return pick(matches).id;
  // Anchor for grocery co-tenancy
  if (category === "grocery") {
    const anchor = propTenants.find((t) => t.category === "grocery");
    if (anchor) return anchor.id;
  }
  // Any tenant on that property (prohibited-use style)
  if (propTenants.length > 0) return pick(propTenants).id;
  return null;
}

export const restrictions: Restriction[] = [];

// The demo-critical one first: Jean Coutu exclusivity at prop-05 (Chicoutimi)
const chicoutimiJC = tenants.find(
  (t) => t.propertyId === "prop-05" && t.brand === "Jean Coutu",
);
if (chicoutimiJC) {
  restrictions.push({
    id: `restr-prop-05-pharm`,
    propertyId: "prop-05",
    kind: "exclusive-use",
    category: "pharmacy",
    grantedToTenantId: chicoutimiJC.id,
    sourceDocId: `ld-prop-05-${chicoutimiJC.id}`,
    sourcePage: range(18, 42),
    clauseText: TEMPLATES[0].clause("Jean Coutu"),
  });
}

// Then ~94 more spread across the 42 properties
const TARGET = 95;
let counter = 1;
const perProp = new Map<string, number>();
for (const p of properties) perProp.set(p.id, 0);

while (restrictions.length < TARGET) {
  const p = pick(properties);
  const currentForProp = perProp.get(p.id) ?? 0;
  if (currentForProp >= 4 && chance(0.7)) continue;
  const tpl = pick(TEMPLATES);
  const tenantId = tenantForCategory(p.id, tpl.category);
  if (!tenantId) continue;
  // avoid duplicating our demo-critical pharm restriction
  if (p.id === "prop-05" && tpl.category === "pharmacy") continue;
  const tenant = tenants.find((t) => t.id === tenantId);
  if (!tenant) continue;
  restrictions.push({
    id: `restr-${p.id}-${String(counter++).padStart(3, "0")}`,
    propertyId: p.id,
    kind: tpl.kind,
    category: tpl.category,
    grantedToTenantId: tenantId,
    sourceDocId: `ld-${p.id}-${tenantId}`,
    sourcePage: range(6, 68),
    clauseText: tpl.clause(tenant.brand),
    ...(chance(0.15) ? { expiresOn: `${2028 + range(0, 6)}-${String(range(1, 12)).padStart(2, "0")}-01` } : {}),
  });
  perProp.set(p.id, currentForProp + 1);
  // safety cap on iterations
  if (counter > 400) break;
}

// silence unused
void rng;

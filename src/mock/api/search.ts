import { db } from "@/mock/db";
import { mockDelay } from "@/mock/delay";

export interface SearchResult {
  id: string;
  group: string;
  title: string;
  subtitle: string;
  href: string;
}

export async function search(q: string): Promise<SearchResult[]> {
  await mockDelay(60, 160);
  const query = q.trim().toLowerCase();
  const out: SearchResult[] = [];

  const add = (
    group: string,
    id: string,
    title: string,
    subtitle: string,
    href: string,
  ) => {
    if (!query || title.toLowerCase().includes(query) || subtitle.toLowerCase().includes(query)) {
      out.push({ id, group, title, subtitle, href });
    }
  };

  for (const p of db.properties.slice(0, 60)) {
    add(
      "Properties",
      p.id,
      p.name,
      `${p.town}, ${p.province}`,
      `/knowledge/properties/${p.id}`,
    );
  }
  for (const t of db.tenants.slice(0, 80)) {
    add(
      "Tenants",
      t.id,
      t.brand,
      t.category,
      `/vault/${t.id}`,
    );
  }
  for (const r of db.retailers.slice(0, 60)) {
    add(
      "Retailers",
      r.id,
      r.brand,
      r.category,
      `/knowledge/retailers/${r.id}`,
    );
  }
  for (const d of db.deals) {
    add(
      "Deals",
      d.id,
      d.propertyName,
      `${d.town}, ${d.province}`,
      `/acquisitions/${d.id}`,
    );
  }
  for (const r of db.reports) {
    add("Reports", r.id, r.title, r.type, `/reports`);
  }

  return out.slice(0, 40);
}

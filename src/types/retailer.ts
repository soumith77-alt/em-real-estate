import type { MarketTier, UnitFeature, UnitFormat } from "./property";

export interface Volatile<T> {
  value: T;
  asOf: string;
  source: string;
  correctedByUser?: { at: string; by: string };
}

export type ExpansionStatus = "expanding" | "stable" | "dormant" | "closing";

export interface Retailer {
  id: string;
  brand: string;
  parentCompany: string;
  category: string;
  subcategory: string;
  // STABLE
  sizeMin: number;
  sizeMid: number;
  sizeMax: number;
  formatsAccepted: UnitFormat[];
  requiredFeatures: UnitFeature[];
  tiersOperated: MarketTier[];
  operatesInQuebec: boolean;
  // VOLATILE
  locationsCanada: Volatile<number>;
  locationsByProvince: Volatile<Record<string, number>>;
  expansionStatus: Volatile<ExpansionStatus>;
  realEstateContact?: { name: string; title: string; email: string };
}

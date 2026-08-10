export type Province = "QC" | "ON" | "NB" | "NS" | "PE" | "NL";
export type MarketTier = "small-town" | "mid-market" | "major-city";
export type UnitFormat =
  | "inline"
  | "end-cap"
  | "freestanding"
  | "anchor"
  | "pad";
export type UnitFeature =
  | "drive-thru"
  | "rear-receiving"
  | "exterior-entrance"
  | "grease-trap"
  | "mezzanine"
  | "patio"
  | "loading-dock";
export type UnitStatus = "occupied" | "vacant" | "notice-given";

export interface Property {
  id: string;
  name: string;
  town: string;
  province: Province;
  tier: MarketTier;
  gla: number;
  yearBuilt: number;
  anchor: string | null;
  population: number;
  type: "strip-centre" | "community-centre" | "freestanding" | "power-centre";
  occupancy: number;
}

export interface Unit {
  id: string;
  propertyId: string;
  unitNo: string;
  gla: number;
  frontageFt: number;
  format: UnitFormat;
  features: UnitFeature[];
  status: UnitStatus;
  vacantSince?: string;
  currentTenantId?: string;
  askingRentPsf?: number;
}

export interface Restriction {
  id: string;
  propertyId: string;
  kind: "exclusive-use" | "prohibited-use" | "co-tenancy" | "radius";
  category: string; // e.g. 'pharmacy'
  grantedToTenantId: string;
  sourceDocId: string;
  sourcePage: number;
  clauseText: string;
  expiresOn?: string;
}

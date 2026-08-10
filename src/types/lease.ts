export interface Tenant {
  id: string;
  brand: string;
  category: string;
  propertyId: string;
  unitId: string;
  startDate: string;
  endDate: string;
  baseRentPsf: number;
  camPsf: number;
  optionsToRenew: number;
  escalationPct: number;
  status: "active" | "notice-given" | "holdover" | "expired";
}

export type LeaseDocType =
  | "original-lease"
  | "amendment"
  | "renewal"
  | "assignment"
  | "estoppel"
  | "side-letter";

export interface LeaseDoc {
  id: string;
  tenantId: string;
  type: LeaseDocType;
  title: string;
  signedOn: string;
  pages: number;
  fileUrl: string; // stand-in PDF
  supersedes?: string[]; // ids of clauses this document strikes out
}

export type ClauseKind =
  | "exclusivity"
  | "co-tenancy"
  | "assignment"
  | "percentage-rent"
  | "renewal-option"
  | "demolition"
  | "relocation"
  | "cam-cap";

export interface Clause {
  id: string;
  tenantId: string;
  kind: ClauseKind;
  text: string;
  sourceDocId: string;
  sourcePage: number;
  status: "active" | "superseded";
  supersededBy?: { docId: string; page: number; date: string };
}

export type DealStage =
  | "brochure-received"
  | "nda-signed"
  | "data-room-open"
  | "underwriting"
  | "underwritten"
  | "bid-submitted"
  | "won"
  | "passed";

export interface Deal {
  id: string;
  propertyName: string;
  town: string;
  province: string;
  askingPrice: number;
  gla: number;
  capRate: number;
  stage: DealStage;
  bidDeadline?: string;
  ndaSignedOn?: string;
  lastActivity: string;
  brokerName: string;
  brokerFirm: string;
}

export type FileStatus = "indexed" | "queued" | "needs-ocr" | "failed";

export interface DataRoomFile {
  id: string;
  dealId: string;
  path: string; // e.g. "01 Financials/Rent Roll/RENT ROLL final v3 (2).xlsx"
  name: string;
  ext: string;
  sizeKB: number;
  pages?: number;
  status: FileStatus;
  failureReason?: string;
}

export interface ExtractedField {
  key: string;
  label: string;
  value: string | number;
  sourceFileId?: string;
  sourcePage?: number;
}

export interface RedFlag {
  id: string;
  severity: "high" | "medium" | "low";
  title: string;
  detail: string;
  sourceFileId?: string;
  sourcePage?: number;
}

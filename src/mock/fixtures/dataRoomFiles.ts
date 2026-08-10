import type { DataRoomFile, FileStatus } from "@/types";
import { rng, range, pick, chance } from "@/mock/seed";

interface FolderSpec {
  top: string;
  sub?: string[];
  files: Array<{
    name: string;
    ext: "pdf" | "xlsx" | "docx" | "jpg" | "png" | "dwg" | "eml";
    weight?: number; // relative frequency
  }>;
}

const FOLDERS: FolderSpec[] = [
  {
    top: "01 Financials",
    sub: ["Rent Roll", "Operating Statements", "Budget", "T-12", "AR Aging"],
    files: [
      { name: "RENT ROLL final v3 (2).xlsx", ext: "xlsx" },
      { name: "RENT ROLL - 2026-06-30.xlsx", ext: "xlsx" },
      { name: "Operating Statement 2024.pdf", ext: "pdf" },
      { name: "Operating Statement 2025.pdf", ext: "pdf" },
      { name: "T-12 through June 2026.xlsx", ext: "xlsx" },
      { name: "2026 Budget - working.xlsx", ext: "xlsx" },
      { name: "AR Aging 2026-07.xlsx", ext: "xlsx" },
      { name: "CAM Reconciliation 2024.pdf", ext: "pdf" },
      { name: "CAM Reconciliation 2025 - DRAFT.pdf", ext: "pdf" },
      { name: "Tax Recovery Schedule.xlsx", ext: "xlsx" },
    ],
  },
  {
    top: "02 Leases",
    sub: ["Executed", "Amendments", "Estoppels", "SNDA", "Correspondence"],
    files: [
      { name: "Estoppel - Dollarama - signed.pdf", ext: "pdf" },
      { name: "Estoppel - Jean Coutu - signed.pdf", ext: "pdf" },
      { name: "Estoppel - Tim Hortons - signed.pdf", ext: "pdf" },
      { name: "Lease - Dollarama - Original 2016.pdf", ext: "pdf" },
      { name: "Lease - Jean Coutu - Original 2014.pdf", ext: "pdf" },
      { name: "Amendment 1 - Dollarama - 2019.pdf", ext: "pdf" },
      { name: "Amendment 2 - Bulk Barn - 2018.pdf", ext: "pdf" },
      { name: "Renewal - Marks - 2023.pdf", ext: "pdf" },
      { name: "SNDA - Bank of Nova Scotia.pdf", ext: "pdf" },
      { name: "Lease Abstract Summary.xlsx", ext: "xlsx" },
      { name: "Broker email re: co-tenancy question.eml", ext: "eml" },
      { name: "Side letter - Rôtisserie St-Hubert.pdf", ext: "pdf" },
      { name: "Lease Assignment - Reitmans.pdf", ext: "pdf" },
    ],
  },
  {
    top: "03 Environmental",
    sub: ["Phase I", "Phase II", "Records Review"],
    files: [
      { name: "Phase I ESA - 2022-04.pdf", ext: "pdf" },
      { name: "Phase II ESA - DO NOT DISTRIBUTE.pdf", ext: "pdf" },
      { name: "MOECC records review.pdf", ext: "pdf" },
      { name: "UST removal certification 1998.pdf", ext: "pdf" },
    ],
  },
  {
    top: "04 Surveys",
    files: [
      { name: "Plan of Survey - 2003 (scanned).pdf", ext: "pdf" },
      { name: "Topographic Survey - updated 2024.pdf", ext: "pdf" },
      { name: "Reference Plan 55R-19488.pdf", ext: "pdf" },
    ],
  },
  {
    top: "05 Tax",
    files: [
      { name: "Property Tax Bill 2025.pdf", ext: "pdf" },
      { name: "Property Tax Bill 2026 - interim.pdf", ext: "pdf" },
      { name: "MPAC Assessment Notice 2024.pdf", ext: "pdf" },
      { name: "Property Tax Appeal Decision.pdf", ext: "pdf" },
    ],
  },
  {
    top: "06 Zoning",
    files: [
      { name: "Zoning By-law C4-2 excerpt.pdf", ext: "pdf" },
      { name: "Zoning compliance letter 2025.pdf", ext: "pdf" },
      { name: "Site plan agreement 1998.pdf", ext: "pdf" },
      { name: "Variance decision 2015.pdf", ext: "pdf" },
    ],
  },
  {
    top: "07 Insurance",
    files: [
      { name: "COI - current.pdf", ext: "pdf" },
      { name: "Loss run report 2021-2026.pdf", ext: "pdf" },
      { name: "Roof warranty summary.pdf", ext: "pdf" },
    ],
  },
  {
    top: "08 Title",
    files: [
      { name: "Title search - abstract.pdf", ext: "pdf" },
      { name: "Reciprocal easement agreement 1994.pdf", ext: "pdf" },
      { name: "Restrictive covenant.pdf", ext: "pdf" },
      { name: "Encumbrance summary.pdf", ext: "pdf" },
    ],
  },
  {
    top: "09 Property Condition",
    sub: ["PCA", "Roof", "HVAC", "Parking Lot"],
    files: [
      { name: "PCA Report - 2024-11.pdf", ext: "pdf" },
      { name: "Roof inspection 2023.pdf", ext: "pdf" },
      { name: "HVAC inventory.xlsx", ext: "xlsx" },
      { name: "Parking lot asphalt report.pdf", ext: "pdf" },
      { name: "Capital plan 5-year.xlsx", ext: "xlsx" },
    ],
  },
  {
    top: "10 CIM",
    files: [
      { name: "CIM_v6_confidential.pdf", ext: "pdf" },
      { name: "OM Executive Summary.pdf", ext: "pdf" },
      { name: "Investment Highlights.pdf", ext: "pdf" },
    ],
  },
  {
    top: "11 Broker Info",
    files: [
      { name: "Confidentiality Agreement - executed.pdf", ext: "pdf" },
      { name: "Bid Instructions.pdf", ext: "pdf" },
      { name: "Data Room Index.xlsx", ext: "xlsx" },
      { name: "Broker cover letter.docx", ext: "docx" },
    ],
  },
  {
    top: "12 Photos",
    sub: ["Exterior", "Interior", "Aerials"],
    files: [
      { name: "IMG_0142.jpg", ext: "jpg" },
      { name: "IMG_0143.jpg", ext: "jpg" },
      { name: "IMG_0144.jpg", ext: "jpg" },
      { name: "Aerial drone shot 2024-08.jpg", ext: "jpg" },
      { name: "Anchor entrance.jpg", ext: "jpg" },
      { name: "Pylon signage.jpg", ext: "jpg" },
      { name: "Site aerial - annotated.png", ext: "png" },
    ],
  },
  {
    top: "13 Third Party Reports",
    files: [
      { name: "Market Study - Cushman 2024.pdf", ext: "pdf" },
      { name: "Appraisal - Colliers 2025.pdf", ext: "pdf" },
      { name: "Trade area demographics.pdf", ext: "pdf" },
      { name: "Traffic count study 2023.pdf", ext: "pdf" },
    ],
  },
];

const MESSY: string[] = [
  "Scan_20240712_0001.pdf",
  "Scan_20230904_0007.pdf",
  "FINAL_final_v2.pdf",
  "PLEASE READ FIRST.docx",
];

function randomFileFromFolder(folder: FolderSpec): {
  name: string;
  ext: DataRoomFile["ext"];
} {
  // Occasionally inject a messy scan or note
  if (chance(0.08) && folder.top !== "12 Photos") {
    const n = pick(MESSY);
    return { name: n, ext: n.endsWith(".docx") ? "docx" : "pdf" };
  }
  const f = pick(folder.files);
  return { name: f.name, ext: f.ext };
}

function buildFilesForDeal(dealId: string, count: number, opts: { includeFailures?: boolean }): DataRoomFile[] {
  const out: DataRoomFile[] = [];
  let fileNum = 0;
  const folderCounts = new Map<string, number>();
  // Ensure each folder has at least 1
  for (const folder of FOLDERS) {
    fileNum++;
    const f = randomFileFromFolder(folder);
    const sub = folder.sub && chance(0.6) ? pick(folder.sub) : undefined;
    const path = sub
      ? `${folder.top}/${sub}/${f.name}`
      : `${folder.top}/${f.name}`;
    const sizeKB = range(40, 68_000);
    const pages = f.ext === "pdf" ? range(1, 88) : undefined;
    const status: FileStatus = chance(0.06) ? "queued" : "indexed";
    out.push({
      id: `${dealId}-file-${String(fileNum).padStart(4, "0")}`,
      dealId,
      path,
      name: f.name,
      ext: f.ext,
      sizeKB,
      ...(pages ? { pages } : {}),
      status,
    });
    folderCounts.set(folder.top, 1);
  }
  while (out.length < count) {
    const folder = pick(FOLDERS);
    fileNum++;
    const f = randomFileFromFolder(folder);
    const sub = folder.sub && chance(0.55) ? pick(folder.sub) : undefined;
    const path = sub
      ? `${folder.top}/${sub}/${f.name}`
      : `${folder.top}/${f.name}`;
    const sizeKB = range(40, 68_000);
    const pages = f.ext === "pdf" ? range(1, 200) : undefined;
    const status: FileStatus = chance(0.05) ? "queued" : "indexed";
    out.push({
      id: `${dealId}-file-${String(fileNum).padStart(4, "0")}`,
      dealId,
      path,
      name: f.name,
      ext: f.ext,
      sizeKB,
      ...(pages ? { pages } : {}),
      status,
    });
  }
  if (opts.includeFailures) {
    // Two required failures for the open deal
    const target1 = out.find((f) => f.ext === "pdf" && f.status === "indexed");
    if (target1) {
      target1.status = "failed";
      target1.failureReason =
        "Password-protected — no password on file. Ask the broker for it or forward to admin.";
      target1.name = "CIM_v6_confidential.pdf";
      target1.path = "10 CIM/CIM_v6_confidential.pdf";
    }
    const target2 = out.find((f) => f.ext === "pdf" && f.status === "indexed" && f !== target1);
    if (target2) {
      target2.status = "needs-ocr";
      target2.failureReason =
        "Scan without a text layer. Send for OCR to include this file.";
      target2.name = "Scan_20240712_0001.pdf";
      target2.path = "04 Surveys/Scan_20240712_0001.pdf";
    }
  }
  return out;
}

const files: DataRoomFile[] = [];
// Open deal — 90 files, includes required failures
files.push(...buildFilesForDeal("deal-open", 90, { includeFailures: true }));
// Underwriting deals — ~20 each
files.push(...buildFilesForDeal("deal-5", 20, {}));
files.push(...buildFilesForDeal("deal-6", 20, {}));
// One underwritten — 20
files.push(...buildFilesForDeal("deal-7", 20, {}));

export const dataRoomFiles: DataRoomFile[] = files;

// silence unused
void rng;

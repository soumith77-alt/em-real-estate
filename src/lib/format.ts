import { format, differenceInDays, parseISO } from "date-fns";

const cad = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  maximumFractionDigits: 0,
});

const cadCents = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const intNum = new Intl.NumberFormat("en-CA", { maximumFractionDigits: 0 });

const pct = new Intl.NumberFormat("en-CA", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 2,
});

export const fmtCAD = (n: number | null | undefined) =>
  n == null || Number.isNaN(n) ? "—" : cad.format(n);

export const fmtPSF = (n: number | null | undefined) =>
  n == null || Number.isNaN(n) ? "—" : `${cadCents.format(n)}/sf`;

export const fmtSqft = (n: number | null | undefined) =>
  n == null || Number.isNaN(n) ? "—" : `${intNum.format(n)} sf`;

export const fmtInt = (n: number | null | undefined) =>
  n == null || Number.isNaN(n) ? "—" : intNum.format(n);

export const fmtPct = (n: number | null | undefined, digits = 2) => {
  if (n == null || Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("en-CA", {
    style: "percent",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(n);
};

export const fmtPctPoints = (n: number | null | undefined, digits = 2) => {
  if (n == null || Number.isNaN(n)) return "—";
  return `${n.toFixed(digits)}%`;
};

export const fmtRatio = (n: number | null | undefined, digits = 2) =>
  n == null || Number.isNaN(n) ? "—" : n.toFixed(digits);

export const fmtDate = (iso: string | undefined | null) => {
  if (!iso) return "—";
  return format(parseISO(iso), "d MMM yyyy");
};

export const fmtShortDate = (iso: string | undefined | null) => {
  if (!iso) return "—";
  return format(parseISO(iso), "d MMM");
};

export const daysUntil = (iso: string | undefined | null) => {
  if (!iso) return null;
  return differenceInDays(parseISO(iso), new Date("2026-08-10"));
};

export const fmtDaysUntil = (iso: string | undefined | null) => {
  const d = daysUntil(iso);
  if (d == null) return "—";
  if (d === 0) return "today";
  if (d > 0) return `in ${d}d`;
  return `${Math.abs(d)}d ago`;
};

// pct helper only used in a few spots
export { pct };

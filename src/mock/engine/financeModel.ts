export interface FinanceInputs {
  purchasePrice: number;
  ltv: number; // 0..1
  interestRate: number; // annual, decimal (e.g. 0.0625)
  amortYears: number;
  termYears: number;
  goingInCap: number; // decimal
  exitCap: number; // decimal
  holdYears: number;
  rentGrowth: number; // decimal
  vacancyAllowance: number; // decimal
  camRecoveryRate: number; // decimal (0..1)
  capexReservePsf: number;
  closingCostsPct: number; // decimal
  gla: number;
}

export interface FinanceOutputs {
  loanAmount: number;
  equityRequired: number;
  annualDebtService: number;
  dscr: number;
  inPlaceNoi: number;
  stabilizedNoi: number;
  cashOnCashByYear: number[];
  irr: number;
  equityMultiple: number;
  exitValue: number;
  breakEvenOccupancy: number;
}

/** Standard fixed-rate mortgage payment (annual). */
function annualDebtService(principal: number, annualRate: number, amortYears: number): number {
  const n = amortYears * 12;
  const i = annualRate / 12;
  if (i === 0) return principal / amortYears;
  const monthly = (principal * i) / (1 - Math.pow(1 + i, -n));
  return monthly * 12;
}

/** Newton's-method IRR on a cashflow series [C0, C1, …, Cn]. */
function irr(cashflows: number[], guess = 0.08): number {
  const npv = (rate: number) =>
    cashflows.reduce((acc, cf, t) => acc + cf / Math.pow(1 + rate, t), 0);
  const dnpv = (rate: number) =>
    cashflows.reduce((acc, cf, t) => acc - (t * cf) / Math.pow(1 + rate, t + 1), 0);
  let r = guess;
  for (let iter = 0; iter < 100; iter++) {
    const f = npv(r);
    const df = dnpv(r);
    if (Math.abs(df) < 1e-12) break;
    const rNext = r - f / df;
    if (!isFinite(rNext)) break;
    if (Math.abs(rNext - r) < 1e-8) return rNext;
    r = rNext;
    if (r < -0.99) r = -0.5;
    if (r > 10) r = 1;
  }
  return r;
}

function remainingLoanBalance(
  principal: number,
  annualRate: number,
  amortYears: number,
  yearsElapsed: number,
): number {
  const n = amortYears * 12;
  const k = Math.min(yearsElapsed * 12, n);
  const i = annualRate / 12;
  if (i === 0) return principal * (1 - k / n);
  const monthly = (principal * i) / (1 - Math.pow(1 + i, -n));
  const balance =
    principal * Math.pow(1 + i, k) - (monthly * (Math.pow(1 + i, k) - 1)) / i;
  return Math.max(0, balance);
}

export function computeScenario(i: FinanceInputs): FinanceOutputs {
  const loanAmount = i.purchasePrice * i.ltv;
  const closingCosts = i.purchasePrice * i.closingCostsPct;
  const equityRequired = i.purchasePrice - loanAmount + closingCosts;
  const annualDebt = annualDebtService(loanAmount, i.interestRate, i.amortYears);

  const inPlaceNoi = i.purchasePrice * i.goingInCap;
  const capexReserveAnnual = i.capexReservePsf * i.gla;

  // Stabilized NOI: base NOI net of vacancy plus assumed CAM recovery uplift.
  const stabilizedNoi =
    inPlaceNoi * (1 - i.vacancyAllowance) * (1 + i.camRecoveryRate * 0.05);

  const noiByYear: number[] = [];
  for (let y = 1; y <= i.holdYears; y++) {
    const grown = inPlaceNoi * Math.pow(1 + i.rentGrowth, y - 1);
    const netOfVacancy = grown * (1 - i.vacancyAllowance);
    const noi = netOfVacancy - capexReserveAnnual;
    noiByYear.push(noi);
  }

  const cashOnCashByYear = noiByYear.map(
    (noi) => (noi - annualDebt) / (equityRequired || 1),
  );

  const nextYearNoi =
    inPlaceNoi * Math.pow(1 + i.rentGrowth, i.holdYears) * (1 - i.vacancyAllowance) -
    capexReserveAnnual;
  const exitValue = i.exitCap > 0 ? nextYearNoi / i.exitCap : 0;

  const remainingBalance = remainingLoanBalance(
    loanAmount,
    i.interestRate,
    i.amortYears,
    i.holdYears,
  );
  const saleProceeds = exitValue - remainingBalance;

  const cfs: number[] = [];
  cfs.push(-equityRequired);
  for (let y = 0; y < noiByYear.length; y++) {
    const cf = noiByYear[y] - annualDebt;
    if (y === noiByYear.length - 1) {
      cfs.push(cf + saleProceeds);
    } else {
      cfs.push(cf);
    }
  }
  const irrValue = irr(cfs, 0.1);

  const totalDistributions = cfs.slice(1).reduce((a, b) => a + b, 0);
  const equityMultiple =
    equityRequired > 0 ? totalDistributions / equityRequired : 0;

  const dscr = annualDebt > 0 ? noiByYear[0] / annualDebt : Infinity;
  const breakEvenOccupancy =
    inPlaceNoi > 0
      ? (annualDebt + capexReserveAnnual) / (inPlaceNoi + capexReserveAnnual)
      : 0;

  return {
    loanAmount,
    equityRequired,
    annualDebtService: annualDebt,
    dscr,
    inPlaceNoi,
    stabilizedNoi,
    cashOnCashByYear,
    irr: irrValue,
    equityMultiple,
    exitValue,
    breakEvenOccupancy,
  };
}

/**
 * IRR sensitivity matrix: rows correspond to exitCaps, columns to rentGrowths.
 */
export function sensitivity(
  base: FinanceInputs,
  exitCaps: number[],
  rentGrowths: number[],
): number[][] {
  return exitCaps.map((exitCap) =>
    rentGrowths.map((rentGrowth) => {
      const scenario = computeScenario({ ...base, exitCap, rentGrowth });
      return scenario.irr;
    }),
  );
}

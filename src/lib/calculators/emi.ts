/**
 * EMI math — pure, framework-free, unit-testable.
 *
 * Standard reducing-balance EMI:
 *   EMI = P · r · (1+r)^n / ((1+r)^n − 1)
 * where r = monthly rate (annual% / 12 / 100) and n = tenure in months.
 *
 * No React, no I/O — shared by /home-loan-emi and (later) the loan
 * eligibility checker, which inverts this to solve for principal.
 */

export interface EmiInput {
  /** Loan principal in rupees. */
  principal: number;
  /** Annual interest rate as a percentage, e.g. 8.5 for 8.5% p.a. */
  annualRatePct: number;
  /** Tenure in months. */
  tenureMonths: number;
}

export interface EmiResult {
  /** Monthly instalment in rupees. */
  emi: number;
  /** Total interest paid over the full tenure. */
  totalInterest: number;
  /** Principal + total interest. */
  totalPayment: number;
}

/** Compute the monthly EMI and totals. Returns zeros for non-positive inputs
 * so the UI can render a calm empty state rather than NaN/Infinity. */
export function computeEmi({
  principal,
  annualRatePct,
  tenureMonths,
}: EmiInput): EmiResult {
  if (
    !Number.isFinite(principal) ||
    !Number.isFinite(annualRatePct) ||
    !Number.isFinite(tenureMonths) ||
    principal <= 0 ||
    tenureMonths <= 0
  ) {
    return { emi: 0, totalInterest: 0, totalPayment: 0 };
  }

  const r = annualRatePct / 12 / 100;
  // Zero-interest edge case: straight-line repayment, avoids 0/0.
  const emi =
    r === 0
      ? principal / tenureMonths
      : (principal * r * Math.pow(1 + r, tenureMonths)) /
        (Math.pow(1 + r, tenureMonths) - 1);

  const totalPayment = emi * tenureMonths;
  return {
    emi,
    totalInterest: totalPayment - principal,
    totalPayment,
  };
}

/** Indian-format rupee string, no decimals: 1234567 → "₹12,34,567". */
export function formatINR(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return "₹" + Math.round(value).toLocaleString("en-IN");
}

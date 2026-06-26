/** Shared number formatting for the calculator tools. */

/** Indian-format rupee string, no decimals: 1234567 → "₹12,34,567". */
export function formatINR(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return "₹" + Math.round(value).toLocaleString("en-IN");
}

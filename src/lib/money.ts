/**
 * Money helpers — PLAN.md §11.4: "All money in paise as integers.
 * Format only at render. Never float arithmetic on currency."
 * Every fare, fee and refund figure in the app must flow through
 * these two functions and nowhere else.
 */

/** Format paise as a rupee string, e.g. 459860 -> "₹4,598.60". */
export function formatRupees(paise: number): string {
  const isNegative = paise < 0;
  const abs = Math.abs(paise);
  const rupees = Math.floor(abs / 100);
  const paiseRemainder = abs % 100;
  const grouped = groupIndian(rupees);
  return `${isNegative ? '-' : ''}\u20B9${grouped}.${String(paiseRemainder).padStart(2, '0')}`;
}

/** Indian digit grouping: 4598 -> "4,598"; 123456 -> "1,23,456". */
function groupIndian(n: number): string {
  const s = String(n);
  if (s.length <= 3) return s;
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3);
  const restGrouped = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return `${restGrouped},${last3}`;
}

/** Convert a rupee amount (may have paise) to an integer paise value. Avoids float drift. */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

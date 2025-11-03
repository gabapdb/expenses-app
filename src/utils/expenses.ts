/**
 * Utility helpers for expense formatting and aggregation.
 */

/** Get month name by index (0–11) */
export const getMonthName = (monthIndex: number): string =>
  new Date(0, monthIndex).toLocaleString("default", { month: "long" });

/** Format peso currency */
export const peso = (n: number): string =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(n);

/** Safe sum for number arrays */
export const sumAmounts = (arr: number[]): number =>
  arr.reduce((a, b) => a + b, 0);

/** Return all month labels Jan–Dec */
export const allMonths = Array.from({ length: 12 }, (_, i) => getMonthName(i));

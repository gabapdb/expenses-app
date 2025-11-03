import type { Expense } from "@/domain/models";

/**
 * Utility helpers for expense formatting, aggregation, and ordering.
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

function parseDateToTimestamp(value: string | undefined | null): number | null {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function fallbackMonthTimestamp(yyyyMM: string): number {
  const year = Number(yyyyMM.slice(0, 4));
  const month = Number(yyyyMM.slice(4, 6));
  if (!Number.isFinite(year) || !Number.isFinite(month)) {
    return 0;
  }
  // Months are 1-indexed in yyyyMM, but Date.UTC expects 0-indexed.
  return Date.UTC(year, month - 1, 1, 0, 0, 0, 0);
}

export function getPaymentTimestamp(expense: Expense): number {
  const paidTs = parseDateToTimestamp(expense.datePaid);
  if (paidTs !== null) {
    return paidTs;
  }

  const invoiceTs = parseDateToTimestamp(expense.invoiceDate);
  if (invoiceTs !== null) {
    return invoiceTs;
  }

  return fallbackMonthTimestamp(expense.yyyyMM);
}

export function compareExpensesByPaymentDate(a: Expense, b: Expense): number {
  const diff = getPaymentTimestamp(a) - getPaymentTimestamp(b);
  if (diff !== 0) {
    return diff;
  }

  return (a.createdAt ?? 0) - (b.createdAt ?? 0);
}

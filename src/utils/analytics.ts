import { z } from "zod";
import { ExpenseSchema, type Expense } from "@/domain/models";

// Define array schema for runtime validation
const ExpensesArraySchema = z.array(ExpenseSchema);

/**
 * Safely computes total spend per month.
 * Input is a Record<string, unknown[]> but parsed to Expense[].
 */
export function totalPerMonth(
  raw: Record<string, unknown[]>
): { month: string; total: number }[] {
  const out: { month: string; total: number }[] = [];

  for (const [month, values] of Object.entries(raw)) {
    // Validate each month's array
    const expenses = ExpensesArraySchema.parse(values);
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    out.push({ month, total });
  }

  // Sort ascending by month (YYYYMM)
  return out.sort((a, b) => a.month.localeCompare(b.month));
}

/**
 * Safely aggregates total spend per category for one month.
 * Accepts unknown input and ensures all elements are valid Expense objects.
 */
export function totalPerCategory(raw: unknown): { category: string; total: number }[] {
  const expenses = ExpensesArraySchema.parse(raw);

  const categoryMap = new Map<string, number>();
  for (const e of expenses) {
    categoryMap.set(e.category, (categoryMap.get(e.category) || 0) + e.amount);
  }

  return [...categoryMap.entries()].map(([category, total]) => ({ category, total }));
}

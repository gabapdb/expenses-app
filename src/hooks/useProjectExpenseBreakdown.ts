"use client";

import { useMemo } from "react";

import type { Expense } from "@/domain/models";
import { useProjectExpensesCollection } from "./useProjectExpensesCollection";

interface BreakdownRow {
  category: string;
  subCategory: string;
  total: number;
}

interface ExpenseBreakdownState {
  data: BreakdownRow[];
  totalAmount: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

function aggregateBreakdown(expenses: Expense[]): Pick<ExpenseBreakdownState, "data" | "totalAmount"> {
  const totals = new Map<string, number>();

  for (const expense of expenses) {
    const key = `${expense.category}::${expense.subCategory}`;
    totals.set(key, (totals.get(key) ?? 0) + expense.amount);
  }

  const data: BreakdownRow[] = Array.from(totals.entries())
    .map(([key, total]) => {
      const [category, subCategory] = key.split("::");
      return { category, subCategory, total };
    })
    .sort((a, b) => {
      if (b.total !== a.total) {
        return b.total - a.total;
      }
      const categoryCompare = a.category.localeCompare(b.category);
      if (categoryCompare !== 0) {
        return categoryCompare;
      }
      return a.subCategory.localeCompare(b.subCategory);
    });

  const totalAmount = data.reduce((sum, row) => sum + row.total, 0);

  return { data, totalAmount };
}

/**
 * Aggregates all expenses for a given projectId across all months/years.
 */
export function useProjectExpenseBreakdown(projectId: string): ExpenseBreakdownState {
  const { data: expenses, loading, error, refetch } = useProjectExpensesCollection(projectId);

  const aggregates = useMemo(() => aggregateBreakdown(expenses), [expenses]);

  return { ...aggregates, loading, error, refetch };
}

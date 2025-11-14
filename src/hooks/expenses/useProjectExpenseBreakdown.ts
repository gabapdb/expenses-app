"use client";

import { useMemo } from "react";

import type { Expense } from "@/domain/models";
import { useProjectExpensesCollection } from "./useProjectExpensesCollection";

export interface ProjectExpenseBreakdownScope {
  clientId?: string;
  projectId?: string;
  year?: string;
  month?: string;
  yyyyMM?: string;
}

interface ResolvedBreakdownScope {
  clientId: string;
  projectId: string;
  year: string;
  month: string;
  yyyyMM: string;
}

function normalize(value: string | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

function resolveBreakdownScope(
  scopeOrProjectId: string | ProjectExpenseBreakdownScope
): ResolvedBreakdownScope {
  if (typeof scopeOrProjectId === "string") {
    const projectId = normalize(scopeOrProjectId);
    return { clientId: "", projectId, year: "", month: "", yyyyMM: "" };
  }

  const clientId = normalize(scopeOrProjectId.clientId);
  const projectId = normalize(scopeOrProjectId.projectId);
  const year = normalize(scopeOrProjectId.year);
  const month = normalize(scopeOrProjectId.month);
  const providedYYYYMM = normalize(scopeOrProjectId.yyyyMM);
  const resolvedYear = year || (providedYYYYMM ? providedYYYYMM.slice(0, 4) : "");
  const resolvedMonth = month || (providedYYYYMM ? providedYYYYMM.slice(4, 6) : "");
  const yyyyMM =
    providedYYYYMM ||
    (resolvedYear && resolvedMonth ? `${resolvedYear}${resolvedMonth}` : "");

  return { clientId, projectId, year: resolvedYear, month: resolvedMonth, yyyyMM };
}

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
export function useProjectExpenseBreakdown(
  scopeOrProjectId: string | ProjectExpenseBreakdownScope
): ExpenseBreakdownState {
  const resolvedScope = useMemo(
    () => resolveBreakdownScope(scopeOrProjectId),
    [scopeOrProjectId]
  );

  const { projectId } = resolvedScope;

  const {
    data: expenses,
    loading,
    error,
    refetch,
  } = useProjectExpensesCollection(projectId ? resolvedScope : null);

  const aggregates = useMemo(() => aggregateBreakdown(expenses), [expenses]);

  return { ...aggregates, loading, error, refetch };
}

"use client";

import { useMemo } from "react";

import type { Expense } from "@/domain/models";
import { allMonths, getMonthName, getPaymentTimestamp } from "@/utils/expenses";
import { useProjectExpensesCollection } from "./useProjectExpensesCollection";

export interface ProjectExpensesByYearScope {
  clientId?: string;
  projectId?: string;
  year?: string;
  month?: string;
  yyyyMM?: string;
}

interface ResolvedYearScope {
  clientId: string;
  projectId: string;
  year: string;
  month: string;
  yyyyMM: string;
}

function normalize(value: string | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

function resolveYearScope(
  scopeOrProjectId: string | ProjectExpensesByYearScope
): ResolvedYearScope {
  if (typeof scopeOrProjectId === "string") {
    const projectId = normalize(scopeOrProjectId);
    return { clientId: "", projectId, year: "", month: "", yyyyMM: "" };
  }

  const clientId = normalize(scopeOrProjectId.clientId);
  const projectId = normalize(scopeOrProjectId.projectId);
  const providedYear = normalize(scopeOrProjectId.year);
  const providedMonth = normalize(scopeOrProjectId.month);
  const providedYYYYMM = normalize(scopeOrProjectId.yyyyMM);
  const resolvedYear =
    providedYear || (providedYYYYMM ? providedYYYYMM.slice(0, 4) : "");
  const resolvedMonth =
    providedMonth || (providedYYYYMM ? providedYYYYMM.slice(4, 6) : "");
  const yyyyMM =
    providedYYYYMM ||
    (resolvedYear && resolvedMonth ? `${resolvedYear}${resolvedMonth}` : "");

  return {
    clientId,
    projectId,
    year: resolvedYear,
    month: resolvedMonth,
    yyyyMM,
  };
}

interface AggregatedExpenseData {
  byMonth: Record<string, Record<string, number>>;
  byCategory: Record<string, number>;
  totalsByMonth: Record<string, number>;
  grandTotal: number;
  availableYears: number[];
  loading: boolean;
  error: string | null;
  resolvedYear: number;
}

/**
 * Aggregates all expenses for a project by month & category for a specific year.
 * Uses datePaid as the time source.
 */
export function useProjectExpensesByYear(
  scopeOrProjectId: string | ProjectExpensesByYearScope,
  requestedYear: number
): AggregatedExpenseData {
  const resolvedScope = useMemo(
    () => resolveYearScope(scopeOrProjectId),
    [scopeOrProjectId]
  );

  const { projectId } = resolvedScope;

  const {
    data: allExpenses,
    loading,
    error,
  } = useProjectExpensesCollection(projectId ? resolvedScope : null);

  const aggregates = useMemo(() => {
    const expensesByYear = new Map<number, Expense[]>();
    const yearSet = new Set<number>();

    for (const expense of allExpenses) {
      const timestamp = getPaymentTimestamp(expense);
      if (!Number.isFinite(timestamp)) continue;

      const paymentDate = new Date(timestamp);
      if (Number.isNaN(paymentDate.getTime())) continue;

      const paymentYear = paymentDate.getFullYear();
      yearSet.add(paymentYear);

      const bucket = expensesByYear.get(paymentYear);
      if (bucket) {
        bucket.push(expense);
      } else {
        expensesByYear.set(paymentYear, [expense]);
      }
    }

    if (yearSet.size === 0 && Number.isFinite(requestedYear)) {
      yearSet.add(requestedYear);
    }

    const availableYears = Array.from(yearSet).sort((a, b) => b - a);
    const resolvedYear = availableYears.includes(requestedYear)
      ? requestedYear
      : availableYears[0] ?? requestedYear;

    const targetExpenses = expensesByYear.get(resolvedYear) ?? [];

    const byMonth: Record<string, Record<string, number>> = {};
    const categoryTotals: Record<string, number> = {};
    const totalsByMonth: Record<string, number> = {};

    for (const expense of targetExpenses) {
      const timestamp = getPaymentTimestamp(expense);
      const paymentDate = new Date(timestamp);
      const monthName = getMonthName(paymentDate.getMonth());
      const category = expense.category || "Uncategorized";

      byMonth[monthName] ??= {};
      byMonth[monthName][category] = (byMonth[monthName][category] ?? 0) + expense.amount;

      totalsByMonth[monthName] = (totalsByMonth[monthName] ?? 0) + expense.amount;
      categoryTotals[category] = (categoryTotals[category] ?? 0) + expense.amount;
    }

    for (const month of allMonths) {
      totalsByMonth[month] ??= 0;
      byMonth[month] ??= {};
    }

    const sortedCategoryEntries = Object.entries(categoryTotals).sort((a, b) =>
      a[0].localeCompare(b[0])
    );
    const byCategory: Record<string, number> = {};
    for (const [category, total] of sortedCategoryEntries) {
      byCategory[category] = total;
    }

    const grandTotal = Object.values(totalsByMonth).reduce((sum, value) => sum + value, 0);

    return { byMonth, byCategory, totalsByMonth, grandTotal, availableYears, resolvedYear };
  }, [allExpenses, requestedYear]);

  return { ...aggregates, loading, error };
}

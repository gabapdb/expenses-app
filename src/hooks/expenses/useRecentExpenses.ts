"use client";

import { useMemo } from "react";

import type { Expense } from "@/domain/models";
import { compareExpensesByPaymentDate } from "@/utils/expenses";
import { useProjectExpensesCollection } from "./useProjectExpensesCollection";

export interface RecentExpensesScope {
  clientId?: string;
  projectId?: string;
  year?: string;
  month?: string;
  yyyyMM?: string;
}

interface ResolvedRecentScope {
  clientId: string;
  projectId: string;
  year: string;
  month: string;
  yyyyMM: string;
}

function normalize(value: string | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

function resolveRecentScope(
  scopeOrProjectId: string | RecentExpensesScope | null | undefined
): ResolvedRecentScope {
  if (typeof scopeOrProjectId === "string") {
    const projectId = normalize(scopeOrProjectId);
    return { clientId: "", projectId, year: "", month: "", yyyyMM: "" };
  }

  if (!scopeOrProjectId) {
    return { clientId: "", projectId: "", year: "", month: "", yyyyMM: "" };
  }

  const clientId = normalize(scopeOrProjectId.clientId);
  const projectId = normalize(scopeOrProjectId.projectId);
  const providedYear = normalize(scopeOrProjectId.year);
  const providedMonth = normalize(scopeOrProjectId.month);
  const providedYYYYMM = normalize(scopeOrProjectId.yyyyMM);
  const year = providedYear || (providedYYYYMM ? providedYYYYMM.slice(0, 4) : "");
  const month = providedMonth || (providedYYYYMM ? providedYYYYMM.slice(4, 6) : "");
  const yyyyMM =
    providedYYYYMM || (year && month ? `${year}${month}` : "");

  return { clientId, projectId, year, month, yyyyMM };
}

interface RecentExpensesState {
  data: Expense[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useRecentExpenses(
  scopeOrProjectId?: string | RecentExpensesScope | null,
  limit = 5
): RecentExpensesState {
  const resolvedScope = useMemo(
    () => resolveRecentScope(scopeOrProjectId ?? null),
    [scopeOrProjectId]
  );

  const { projectId } = resolvedScope;

  const {
    data: expenses,
    loading,
    error,
    refetch,
  } = useProjectExpensesCollection(projectId ? resolvedScope : null);

  const recentExpenses = useMemo(() => {
    if (!Array.isArray(expenses) || expenses.length === 0 || limit <= 0) {
      return [];
    }

    const sorted = expenses.slice().sort(compareExpensesByPaymentDate);
    return sorted.slice(-limit).reverse();
  }, [expenses, limit]);

  return useMemo(
    () => ({ data: recentExpenses, loading, error, refetch }),
    [recentExpenses, loading, error, refetch]
  );
}

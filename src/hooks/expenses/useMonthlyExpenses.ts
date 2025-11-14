"use client";

import { useRealtimeExpenses } from "@/hooks/expenses/useRealtimeExpenses";
import type { Expense } from "@/domain/models";

export interface MonthlyExpenseScope {
  clientId?: string;
  projectId?: string;
  year?: string;
  month?: string;
  yyyyMM?: string;
}

/**
 * useMonthlyExpenses()
 * --------------------
 * A simple wrapper around useRealtimeExpenses() for backward compatibility.
 * Returns { data, loading, error } directly from the realtime hook.
 */
export function useMonthlyExpenses(
  scopeOrYyyyMM: string | MonthlyExpenseScope
): {
  data: Expense[];
  loading: boolean;
  error: string | null;
} {
  return useRealtimeExpenses(scopeOrYyyyMM);
}

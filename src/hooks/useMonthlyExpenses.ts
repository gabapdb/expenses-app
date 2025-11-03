"use client";

import { useRealtimeExpenses } from "@/hooks/useRealtimeExpenses";
import type { Expense } from "@/domain/models";

/**
 * useMonthlyExpenses()
 * --------------------
 * A simple wrapper around useRealtimeExpenses() for backward compatibility.
 * Returns { data, loading, error } directly from the realtime hook.
 */
export function useMonthlyExpenses(yyyyMM: string): {
  data: Expense[];
  loading: boolean;
  error: string | null;
} {
  return useRealtimeExpenses(yyyyMM);
}

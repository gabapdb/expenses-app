"use client";

import { useEffect, useState, useMemo } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { ExpenseZod, type ExpenseZodType } from "@/domain/validation/expenseSchema";
import { allMonths, getMonthName } from "@/utils/expenses";

interface AggregatedExpenseData {
  byMonth: Record<string, Record<string, number>>;
  byCategory: Record<string, number>;
  totalsByMonth: Record<string, number>;
  grandTotal: number;
  availableYears: number[];
  loading: boolean;
  error: string | null;
}

/**
 * Aggregates all expenses for a project by month & category for a specific year.
 * Uses datePaid as the time source.
 */
export function useProjectExpensesByYear(projectId: string, year: number): AggregatedExpenseData {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<ExpenseZodType[]>([]);

  useEffect(() => {
    if (!projectId) return;

    const db = getFirestore();

    async function fetchExpenses() {
      try {
        const allDocs: ExpenseZodType[] = [];

        // Loop through all 12 months in the selected year
        for (let m = 0; m < 12; m++) {
          const yyyyMM = `${year}${String(m + 1).padStart(2, "0")}`;
          const collRef = collection(db, "expenses", yyyyMM, "items");
          const snap = await getDocs(collRef);

          snap.forEach((doc) => {
            try {
              const parsed = ExpenseZod.parse(doc.data());
              if (parsed.projectId === projectId) {
                allDocs.push(parsed);
              }
            } catch {
              /* ignore malformed docs */
            }
          });
        }

        setExpenses(allDocs);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load expenses");
      } finally {
        setLoading(false);
      }
    }

    fetchExpenses();
  }, [projectId, year]);

  /** Derived aggregates */
  return useMemo(() => {
    const byMonth: Record<string, Record<string, number>> = {};
    const byCategory: Record<string, number> = {};
    const totalsByMonth: Record<string, number> = {};
    const yearSet = new Set<number>();

    for (const e of expenses) {
      const paid = e.datePaid ? new Date(e.datePaid) : null;
      if (!paid || paid.getFullYear() !== year) continue;

      const monthName = getMonthName(paid.getMonth());
      const cat = e.category || "Uncategorized";

      byMonth[monthName] ??= {};
      byMonth[monthName][cat] = (byMonth[monthName][cat] ?? 0) + e.amount;

      byCategory[cat] = (byCategory[cat] ?? 0) + e.amount;
      totalsByMonth[monthName] = (totalsByMonth[monthName] ?? 0) + e.amount;

      yearSet.add(paid.getFullYear());
    }

    const grandTotal = Object.values(totalsByMonth).reduce((a, b) => a + b, 0);
    const availableYears = Array.from(yearSet).sort((a, b) => b - a);

    // Ensure all months appear (even with 0s)
    for (const m of allMonths) {
      totalsByMonth[m] ??= 0;
      byMonth[m] ??= {};
    }

    return { byMonth, byCategory, totalsByMonth, grandTotal, availableYears, loading, error };
  }, [expenses, loading, error, year]);
}

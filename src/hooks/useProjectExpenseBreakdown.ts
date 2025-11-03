"use client";

import { useCallback, useEffect, useState } from "react";
import { db } from "@/core/firebase";
import { collectionGroup, getDocs, query, where } from "firebase/firestore";
import type { Expense } from "@/domain/models";
import { mapExpense } from "@/domain/mapping";
import { z } from "zod";

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

/**
 * Aggregates all expenses for a given projectId across all months/years.
 */
export function useProjectExpenseBreakdown(projectId: string): ExpenseBreakdownState {
  const [data, setData] = useState<BreakdownRow[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!projectId) return;

    setLoading(true);
    setError(null);

    try {
      const q = query(collectionGroup(db, "items"), where("projectId", "==", projectId));
      const snapshot = await getDocs(q);

      const expenses: Expense[] = snapshot.docs.map((docSnap) =>
        mapExpense(docSnap.id, docSnap.data())
      );

      // Group by category + subcategory
      const map = new Map<string, number>();
      for (const e of expenses) {
        const key = `${e.category}::${e.subCategory}`;
        map.set(key, (map.get(key) ?? 0) + e.amount);
      }

      // Convert to array
      const breakdown: BreakdownRow[] = Array.from(map.entries())
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

      const totalAmount = breakdown.reduce((sum, b) => sum + b.total, 0);

      setData(breakdown);
      setTotalAmount(totalAmount);
    } catch (err) {
      if (err instanceof z.ZodError) {
        console.error("[useProjectExpenseBreakdown] Zod validation error:", err.flatten());
        setError("Invalid expense format.");
      } else if (err instanceof Error) {
        console.error("[useProjectExpenseBreakdown] Error:", err.message);
        setError(err.message);
      } else {
        setError("Unknown error while fetching expenses.");
      }
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, totalAmount, loading, error, refetch: fetchData };
}

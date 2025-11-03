"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/core/firebase";
import { ExpenseSchema, type Expense } from "@/domain/models";
import { z } from "zod";

interface ExpenseState {
  data: Expense | null;
  loading: boolean;
  error: string | null;
}

/**
 * Loads a single expense document by ID for a specific month (YYYYMM).
 * Returns validated Expense or null if not found.
 */
export function useExpense(yyyyMM: string, expenseId: string): ExpenseState {
  const [data, setData] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!yyyyMM || !expenseId) return;

    let active = true;

    (async () => {
      try {
        const ref = doc(db, "expenses", yyyyMM, "items", expenseId);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          if (active) setData(null);
          return;
        }

        const parsed = ExpenseSchema.parse({ id: snap.id, ...snap.data() });
        if (active) setData(parsed);
      } catch (err) {
        if (err instanceof z.ZodError) {
          console.error("[useExpense] Schema error:", err.flatten());
          setError("Invalid expense data format.");
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Unknown error while loading expense.");
        }
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [yyyyMM, expenseId]);

  return { data, loading, error };
}

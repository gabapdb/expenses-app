"use client";

import { useEffect, useMemo, useState } from "react";
import { onSnapshot, query, collection, orderBy, where, FirestoreError } from "firebase/firestore";
import { db } from "@/core/firebase";
import { ExpenseSchema, type Expense } from "@/domain/models";

/**
 * useProjectExpenses()
 * --------------------
 * Real-time listener for all expenses belonging to a specific project
 * during a specific month (yyyyMM). Returns { data, loading, error }.
 */
export function useProjectExpenses(
  projectId: string,
  yyyyMM: string
): {
  data: Expense[];
  loading: boolean;
  error: string | null;
} {
  const [data, setData] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId || !yyyyMM) return;

    const ref = collection(db, "expenses", yyyyMM, "items");
    const q = query(ref, where("projectId", "==", projectId), orderBy("createdAt", "asc"));

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        try {
          const parsed: Expense[] = snapshot.docs
            .map((doc) => {
              const raw = doc.data();
              try {
                return ExpenseSchema.parse(raw);
              } catch (err) {
                console.error(`[useProjectExpenses] Invalid expense (${doc.id}):`, err);
                return null;
              }
            })
            .filter((x): x is Expense => x !== null);

          setData(parsed);
          setError(null);
        } catch (err) {
          console.error("[useProjectExpenses] Unexpected error:", err);
          setError("Failed to parse project expenses.");
        } finally {
          setLoading(false);
        }
      },
      (err: FirestoreError) => {
        console.error("[useProjectExpenses] Snapshot error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [projectId, yyyyMM]);

  // ✅ Memoize data to prevent unnecessary re-renders
  const memoized = useMemo(() => data, [data]);

  return { data: memoized, loading, error };
}

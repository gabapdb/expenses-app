"use client";

import { useEffect, useState } from "react";
import {
  onSnapshot,
  query,
  collection,
  orderBy,
  FirestoreError,
} from "firebase/firestore";
import { db } from "@/core/firebase";
import type { Expense } from "@/domain/models";
import { mapExpense } from "@/domain/mapping";
import { compareExpensesByPaymentDate } from "@/utils/expenses";

/**
 * useRealtimeExpenses()
 * ----------------------
 * Subscribes to Firestore expenses/{yyyyMM}/items in real time.
 * Returns { data, loading, error } for robust UI handling.
 */
export function useRealtimeExpenses(yyyyMM: string): {
  data: Expense[];
  loading: boolean;
  error: string | null;
} {
  const [data, setData] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!yyyyMM) return;

    const ref = collection(db, "expenses", yyyyMM, "items");
    const q = query(
      ref,
      orderBy("datePaid", "asc"),
      orderBy("invoiceDate", "asc"),
      orderBy("createdAt", "asc")
    );

    // Subscribe to Firestore changes
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        try {
          const parsed: Expense[] = snapshot.docs
            .map((doc) => {
              const raw = doc.data();
              try {
                return mapExpense(doc.id, raw);
              } catch (err) {
                console.error(
                  `[useRealtimeExpenses] Invalid expense document (${doc.id}):`,
                  err
                );
                return null;
              }
            })
            .filter((x): x is Expense => x !== null);

          const sorted = parsed.slice().sort(compareExpensesByPaymentDate);

          setData(sorted);
          setError(null);
        } catch (err) {
          console.error("[useRealtimeExpenses] Unexpected error:", err);
          setError("Failed to parse expense data.");
        } finally {
          setLoading(false);
        }
      },
      (err: FirestoreError) => {
        console.error("[useRealtimeExpenses] Snapshot error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [yyyyMM]);

  return { data, loading, error };
}

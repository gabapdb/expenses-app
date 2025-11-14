"use client";

import { useEffect, useMemo, useState } from "react";
import {
  onSnapshot,
  query,
  collection,
  orderBy,
  FirestoreError,
  getDocs,
} from "firebase/firestore";
import { db } from "@/core/firebase";
import type { Expense } from "@/domain/models";
import { mapExpense } from "@/domain/mapping";
import { compareExpensesByPaymentDate } from "@/utils/expenses";

interface RealtimeExpenseParams {
  clientId?: string;
  projectId?: string;
  year?: string;
  month?: string;
  yyyyMM?: string;
}

interface ResolvedRealtimeParams {
  clientId: string;
  projectId: string;
  year: string;
  month: string;
  yyyyMM: string;
}

function normalize(value: string | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

function resolveRealtimeParams(
  paramsOrYyyyMM: string | RealtimeExpenseParams
): ResolvedRealtimeParams {
  if (typeof paramsOrYyyyMM === "string") {
    const yyyyMM = normalize(paramsOrYyyyMM);
    return {
      clientId: "",
      projectId: "",
      year: yyyyMM.slice(0, 4),
      month: yyyyMM.slice(4, 6),
      yyyyMM,
    };
  }

  const clientId = normalize(paramsOrYyyyMM.clientId);
  const projectId = normalize(paramsOrYyyyMM.projectId);
  const providedYear = normalize(paramsOrYyyyMM.year);
  const providedMonth = normalize(paramsOrYyyyMM.month);
  const providedYYYYMM = normalize(paramsOrYyyyMM.yyyyMM);
  const year = providedYear || (providedYYYYMM ? providedYYYYMM.slice(0, 4) : "");
  const month =
    providedMonth || (providedYYYYMM ? providedYYYYMM.slice(4, 6) : "");
  const yyyyMM =
    providedYYYYMM || (year && month ? `${year}${month}` : "");

  return {
    clientId,
    projectId,
    year,
    month,
    yyyyMM,
  };
}

/**
 * useRealtimeExpenses()
 * ----------------------
 * Subscribes to Firestore expenses in real time.
 * Uses the project-scoped path when available, otherwise falls back to legacy.
 * Returns { data, loading, error } for robust UI handling.
 */
export function useRealtimeExpenses(
  paramsOrYyyyMM: string | RealtimeExpenseParams
): {
  data: Expense[];
  loading: boolean;
  error: string | null;
} {
  const [data, setData] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const resolved = useMemo(
    () => resolveRealtimeParams(paramsOrYyyyMM),
    [paramsOrYyyyMM]
  );

  const { clientId, projectId, year, month, yyyyMM } = resolved;

  useEffect(() => {
    if (!yyyyMM) {
      setData([]);
      setLoading(false);
      return;
    }

    let unsubscribe: (() => void) | undefined;
    let active = true;

    const attachListener = (...pathSegments: string[]) => {
      const ref = collection(db, ...pathSegments);
      const q = query(
        ref,
        orderBy("datePaid", "asc"),
        orderBy("invoiceDate", "asc"),
        orderBy("createdAt", "asc")
      );

      return onSnapshot(
        q,
        (snapshot) => {
          try {
            const parsed: Expense[] = snapshot.docs
              .map((docSnap) => {
                const raw = docSnap.data();
                try {
                  return mapExpense(docSnap.id, raw);
                } catch (err) {
                  console.error(
                    `[useRealtimeExpenses] Invalid expense document (${docSnap.id}):`,
                    err
                  );
                  return null;
                }
              })
              .filter((x): x is Expense => x !== null);

            const sorted = parsed.slice().sort(compareExpensesByPaymentDate);

            if (!active) {
              return;
            }

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
    };

    const subscribeToLegacy = () => {
      if (!active) return;
      unsubscribe?.();
      unsubscribe = attachListener("expenses", yyyyMM, "items");
    };

    (async () => {
      try {
        setLoading(true);
        setError(null);

        if (clientId && projectId && year && month) {
          const segments = [
            "clients",
            clientId,
            "projects",
            projectId,
            "expenses",
            year,
            month,
            "items",
          ];
          const scopedRef = collection(db, ...segments);
          const scopedSnapshot = await getDocs(scopedRef);

          if (!active) {
            return;
          }

          if (!scopedSnapshot.empty) {
            unsubscribe = attachListener(...segments);
            return;
          }
        }

        subscribeToLegacy();
      } catch (err) {
        console.error("[useRealtimeExpenses] Failed to attach listeners:", err);
        subscribeToLegacy();
      }
    })();

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [clientId, projectId, year, month, yyyyMM]);

  return { data, loading, error };
}

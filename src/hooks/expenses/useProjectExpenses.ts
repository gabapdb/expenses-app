"use client";

import { useEffect, useMemo, useState } from "react";
import {
  onSnapshot,
  query,
  collection,
  orderBy,
  where,
  FirestoreError,
  getDocs,
} from "firebase/firestore";
import { db } from "@/core/firebase";
import type { Expense } from "@/domain/models";
import { mapExpense } from "@/domain/mapping";
import { compareExpensesByPaymentDate } from "@/utils/expenses";

interface ProjectExpenseScope {
  clientId?: string;
  year?: string;
  month?: string;
  yyyyMM?: string;
}

interface ResolvedProjectExpenseScope {
  clientId: string;
  year: string;
  month: string;
  yyyyMM: string;
}

function normalize(value: string | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

function resolveProjectScope(
  yyyyMMOrScope: string | ProjectExpenseScope
): ResolvedProjectExpenseScope {
  if (typeof yyyyMMOrScope === "string") {
    const yyyyMM = normalize(yyyyMMOrScope);
    return {
      clientId: "",
      year: yyyyMM.slice(0, 4),
      month: yyyyMM.slice(4, 6),
      yyyyMM,
    };
  }

  const clientId = normalize(yyyyMMOrScope.clientId);
  const providedYear = normalize(yyyyMMOrScope.year);
  const providedMonth = normalize(yyyyMMOrScope.month);
  const providedYYYYMM = normalize(yyyyMMOrScope.yyyyMM);
  const year = providedYear || (providedYYYYMM ? providedYYYYMM.slice(0, 4) : "");
  const month =
    providedMonth || (providedYYYYMM ? providedYYYYMM.slice(4, 6) : "");
  const yyyyMM =
    providedYYYYMM || (year && month ? `${year}${month}` : "");

  return {
    clientId,
    year,
    month,
    yyyyMM,
  };
}

/**
 * useProjectExpenses()
 * --------------------
 * Real-time listener for all expenses belonging to a specific project
 * during a specific month (yyyyMM). Returns { data, loading, error }.
 */
export function useProjectExpenses(
  projectId: string,
  yyyyMMOrScope: string | ProjectExpenseScope
): {
  data: Expense[];
  loading: boolean;
  error: string | null;
} {
  const [data, setData] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { clientId, year, month, yyyyMM } = useMemo(
    () => resolveProjectScope(yyyyMMOrScope),
    [yyyyMMOrScope]
  );

  useEffect(() => {
    if (!projectId || !yyyyMM) {
      setData([]);
      setLoading(false);
      return;
    }

    let unsubscribe: (() => void) | undefined;
    let active = true;

    const attachListener = (pathSegments: string[], useProjectFilter: boolean) => {
      const ref = collection(db, ...pathSegments);
      const baseQuery = useProjectFilter
        ? query(
            ref,
            where("projectId", "==", projectId),
            orderBy("datePaid", "asc"),
            orderBy("invoiceDate", "asc"),
            orderBy("createdAt", "asc")
          )
        : query(
            ref,
            orderBy("datePaid", "asc"),
            orderBy("invoiceDate", "asc"),
            orderBy("createdAt", "asc")
          );

      return onSnapshot(
        baseQuery,
        (snapshot) => {
          try {
            const parsed: Expense[] = snapshot.docs
              .map((docSnap) => {
                const raw = docSnap.data();
                try {
                  return mapExpense(docSnap.id, raw);
                } catch (err) {
                  console.error(
                    `[useProjectExpenses] Invalid expense (${docSnap.id}):`,
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
    };

    const subscribeLegacy = () => {
      if (!active) return;
      unsubscribe?.();
      unsubscribe = attachListener(["expenses", yyyyMM, "items"], true);
    };

    (async () => {
      try {
        setLoading(true);
        setError(null);

        if (clientId && year && month) {
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
            unsubscribe = attachListener(segments, false);
            return;
          }
        }

        subscribeLegacy();
      } catch (err) {
        console.error("[useProjectExpenses] Failed to attach listeners:", err);
        subscribeLegacy();
      }
    })();

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [projectId, clientId, year, month, yyyyMM]);

  // ✅ Memoize data to prevent unnecessary re-renders
  const memoized = useMemo(() => data, [data]);

  return { data: memoized, loading, error };
}

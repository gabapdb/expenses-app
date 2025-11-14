"use client";

import { useEffect, useMemo, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/core/firebase";
import type { Expense } from "@/domain/models";
import { mapExpense } from "@/domain/mapping";
import { z } from "zod";

interface UseExpenseParams {
  clientId?: string;
  projectId?: string;
  year?: string;
  month?: string;
  yyyyMM?: string;
  expenseId: string;
}

interface ResolvedExpenseParams {
  clientId: string;
  projectId: string;
  year: string;
  month: string;
  yyyyMM: string;
  expenseId: string;
}

function normalizeScopeValue(value: string | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

function resolveExpenseParams(
  paramsOrYyyyMM: string | UseExpenseParams,
  legacyExpenseId?: string
): ResolvedExpenseParams {
  if (typeof paramsOrYyyyMM === "string") {
    const yyyyMM = normalizeScopeValue(paramsOrYyyyMM);
    const expenseId = normalizeScopeValue(legacyExpenseId);
    const year = yyyyMM.slice(0, 4);
    const month = yyyyMM.slice(4, 6);

    return {
      clientId: "",
      projectId: "",
      year,
      month,
      yyyyMM,
      expenseId,
    };
  }

  const clientId = normalizeScopeValue(paramsOrYyyyMM.clientId);
  const projectId = normalizeScopeValue(paramsOrYyyyMM.projectId);
  const providedYear = normalizeScopeValue(paramsOrYyyyMM.year);
  const providedMonth = normalizeScopeValue(paramsOrYyyyMM.month);
  const normalizedYYYYMM = normalizeScopeValue(paramsOrYyyyMM.yyyyMM);
  const derivedYear =
    providedYear || (normalizedYYYYMM ? normalizedYYYYMM.slice(0, 4) : "");
  const derivedMonth =
    providedMonth || (normalizedYYYYMM ? normalizedYYYYMM.slice(4, 6) : "");

  const yyyyMM =
    normalizedYYYYMM ||
    (derivedYear && derivedMonth ? `${derivedYear}${derivedMonth}` : "");

  return {
    clientId,
    projectId,
    year: derivedYear,
    month: derivedMonth,
    yyyyMM,
    expenseId: normalizeScopeValue(paramsOrYyyyMM.expenseId),
  };
}

interface ExpenseState {
  data: Expense | null;
  loading: boolean;
  error: string | null;
}

/**
 * Loads a single expense document by ID for a specific month.
 * Tries the project-scoped path first, then falls back to the legacy path.
 */
export function useExpense(
  paramsOrYyyyMM: string | UseExpenseParams,
  legacyExpenseId?: string
): ExpenseState {
  const [data, setData] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const resolvedParams = useMemo(
    () => resolveExpenseParams(paramsOrYyyyMM, legacyExpenseId),
    [paramsOrYyyyMM, legacyExpenseId]
  );

  const { clientId, projectId, year, month, yyyyMM, expenseId } = resolvedParams;

  useEffect(() => {
    if (!expenseId) {
      setLoading(false);
      setData(null);
      return;
    }

    let active = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        if (clientId && projectId && year && month) {
          const scopedRef = doc(
            db,
            "clients",
            clientId,
            "projects",
            projectId,
            "expenses",
            year,
            month,
            "items",
            expenseId
          );
          const scopedSnap = await getDoc(scopedRef);

          if (scopedSnap.exists()) {
            const parsedScoped = mapExpense(scopedSnap.id, scopedSnap.data());
            if (active) {
              setData(parsedScoped);
              setLoading(false);
            }
            return;
          }
        }

        if (!yyyyMM) {
          if (active) {
            setData(null);
            setLoading(false);
          }
          return;
        }

        const legacyRef = doc(db, "expenses", yyyyMM, "items", expenseId);
        const legacySnap = await getDoc(legacyRef);

        if (!legacySnap.exists()) {
          if (active) {
            setData(null);
            setLoading(false);
          }
          return;
        }

        const parsed = mapExpense(legacySnap.id, legacySnap.data());
        if (active) {
          setData(parsed);
          setLoading(false);
        }
      } catch (err) {
        if (err instanceof z.ZodError) {
          console.error("[useExpense] Schema error:", err.flatten());
          setError("Invalid expense data format.");
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Unknown error while loading expense.");
        }
        if (active) {
          setData(null);
          setLoading(false);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [clientId, projectId, year, month, yyyyMM, expenseId]);

  return { data, loading, error };
}

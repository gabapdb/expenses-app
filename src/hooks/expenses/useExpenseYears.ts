"use client";

import { useEffect, useMemo, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/core/firebase";

/* -------------------------------------------------------------------------- */
/* 🧠 Types                                                                   */
/* -------------------------------------------------------------------------- */
interface UseExpenseYearsResult {
  years: number[];
  loading: boolean;
  error: string | null;
}

interface UseExpenseYearsOptions {
  enabled?: boolean;
  clientId?: string;
  projectId?: string;
}

interface ExpenseYearsCache {
  years: number[];
}

interface ExpenseYearsScope {
  clientId?: string;
  projectId?: string;
}

const cachedExpenseYears = new Map<string, ExpenseYearsCache>();
const cachedExpenseYearsError = new Map<string, string | null>();
const pendingExpenseYears = new Map<string, Promise<ExpenseYearsCache>>();

function expenseScopeKey(scope: ExpenseYearsScope = {}): string {
  const clientId = scope.clientId?.trim();
  const projectId = scope.projectId?.trim();
  if (clientId && projectId) {
    return `${clientId}::${projectId}`;
  }
  return "__legacy__";
}

async function loadExpenseYears(scope: ExpenseYearsScope = {}): Promise<ExpenseYearsCache> {
  if (scope.clientId && scope.projectId) {
    try {
      const scopedRef = doc(
        db,
        "clients",
        scope.clientId,
        "projects",
        scope.projectId,
        "metadata",
        "expenseYears"
      );
      const scopedSnap = await getDoc(scopedRef);
      const scopedData = scopedSnap.data();

      if (scopedData && Array.isArray(scopedData.years)) {
        const scopedYears = scopedData.years.map(Number).sort((a, b) => b - a);
        return { years: scopedYears };
      }
    } catch (err) {
      console.error("[useExpenseYears] Failed scoped fetch, falling back:", err);
    }
  }

  const ref = doc(db, "metadata", "expenseYears");
  const snap = await getDoc(ref);
  const data = snap.data();

  if (!data || !Array.isArray(data.years)) {
    throw new Error("Invalid /metadata/expenseYears structure");
  }

  const years = data.years.map(Number).sort((a, b) => b - a);
  return { years };
}

export function invalidateExpenseYearsCache(scope?: ExpenseYearsScope): void {
  if (scope) {
    const key = expenseScopeKey(scope);
    cachedExpenseYears.delete(key);
    cachedExpenseYearsError.delete(key);
    pendingExpenseYears.delete(key);
    return;
  }

  cachedExpenseYears.clear();
  cachedExpenseYearsError.clear();
  pendingExpenseYears.clear();
}

function scheduleMicrotask(fn: () => void): void {
  if (typeof queueMicrotask === "function") {
    queueMicrotask(fn);
  } else {
    Promise.resolve().then(fn);
  }
}

/* -------------------------------------------------------------------------- */
/* 🧮 Hook                                                                    */
/* -------------------------------------------------------------------------- */
export function useExpenseYears(
  options: UseExpenseYearsOptions = {}
): UseExpenseYearsResult {
  const { enabled = true } = options;
  const normalizedScope = useMemo(
    () => ({
      clientId: options.clientId?.trim() || undefined,
      projectId: options.projectId?.trim() || undefined,
    }),
    [options.clientId, options.projectId]
  );
  const key = useMemo(
    () => expenseScopeKey(normalizedScope),
    [normalizedScope.clientId, normalizedScope.projectId]
  );

  const [years, setYears] = useState<number[]>(
    () => cachedExpenseYears.get(key)?.years ?? []
  );
  const [internalLoading, setInternalLoading] = useState<boolean>(
    enabled && !cachedExpenseYears.has(key) && !cachedExpenseYearsError.has(key)
  );
  const [internalError, setInternalError] = useState<string | null>(
    enabled ? cachedExpenseYearsError.get(key) ?? null : null
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let active = true;
    const cached = cachedExpenseYears.get(key);
    if (cached) {
      scheduleMicrotask(() => {
        if (!active) return;
        setYears(cached.years);
        setInternalError(null);
        setInternalLoading(false);
      });

      return () => {
        active = false;
      };
    }

    const cachedError = cachedExpenseYearsError.get(key);
    if (cachedError) {
      scheduleMicrotask(() => {
        if (!active) return;
        setInternalError(cachedError);
        setInternalLoading(false);
      });

      return () => {
        active = false;
      };
    }

    scheduleMicrotask(() => {
      if (!active) return;
      setInternalLoading(true);
      setInternalError(null);
    });

    const pending =
      pendingExpenseYears.get(key) ?? loadExpenseYears(normalizedScope);
    pendingExpenseYears.set(key, pending);

    pending
      .then((result) => {
        cachedExpenseYears.set(key, result);
        cachedExpenseYearsError.set(key, null);

        if (!active) return;

        setYears(result.years);
        setInternalError(null);
      })
      .catch((err) => {
        console.error("[useExpenseYears] Error:", err);

        const message = err instanceof Error ? err.message : "Unknown error";
        cachedExpenseYearsError.set(key, message);

        if (!active) return;

        setInternalError(message);
      })
      .finally(() => {
        if (pendingExpenseYears.get(key) === pending) {
          pendingExpenseYears.delete(key);
        }

        if (active) {
          setInternalLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [enabled, key, normalizedScope]);

  return {
    years,
    loading: enabled ? internalLoading : false,
    error: enabled ? internalError : null,
  };
}

"use client";

import { useEffect, useState } from "react";
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
}

interface ExpenseYearsCache {
  years: number[];
}

let cachedExpenseYears: ExpenseYearsCache | null = null;
let cachedExpenseYearsError: string | null = null;
let pendingExpenseYears: Promise<ExpenseYearsCache> | null = null;

async function loadExpenseYears(): Promise<ExpenseYearsCache> {
  const ref = doc(db, "metadata", "expenseYears");
  const snap = await getDoc(ref);
  const data = snap.data();

  if (!data || !Array.isArray(data.years)) {
    throw new Error("Invalid /metadata/expenseYears structure");
  }

  const years = data.years.map(Number).sort((a, b) => b - a);
  return { years };
}

export function invalidateExpenseYearsCache(): void {
  cachedExpenseYears = null;
  cachedExpenseYearsError = null;
  pendingExpenseYears = null;
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

  const [years, setYears] = useState<number[]>(
    () => cachedExpenseYears?.years ?? []
  );
  const [internalLoading, setInternalLoading] = useState<boolean>(
    enabled && !cachedExpenseYears && !cachedExpenseYearsError
  );
  const [internalError, setInternalError] = useState<string | null>(
    enabled ? cachedExpenseYearsError : null
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let active = true;
    if (cachedExpenseYears) {
      scheduleMicrotask(() => {
        if (!active) return;
        setYears(cachedExpenseYears!.years);
        setInternalError(null);
        setInternalLoading(false);
      });

      return () => {
        active = false;
      };
    }

    if (cachedExpenseYearsError) {
      scheduleMicrotask(() => {
        if (!active) return;
        setInternalError(cachedExpenseYearsError);
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

    const pending = pendingExpenseYears ?? loadExpenseYears();
    pendingExpenseYears = pending;

    pending
      .then((result) => {
        cachedExpenseYears = result;
        cachedExpenseYearsError = null;

        if (!active) return;

        setYears(result.years);
        setInternalError(null);
      })
      .catch((err) => {
        console.error("[useExpenseYears] Error:", err);

        const message = err instanceof Error ? err.message : "Unknown error";
        cachedExpenseYearsError = message;

        if (!active) return;

        setInternalError(message);
      })
      .finally(() => {
        if (pendingExpenseYears === pending) {
          pendingExpenseYears = null;
        }

        if (active) {
          setInternalLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [enabled]);

  return {
    years,
    loading: enabled ? internalLoading : false,
    error: enabled ? internalError : null,
  };
}

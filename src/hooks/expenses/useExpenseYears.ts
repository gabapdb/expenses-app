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

/* -------------------------------------------------------------------------- */
/* 🧮 Hook                                                                    */
/* -------------------------------------------------------------------------- */
export function useExpenseYears(
  options: UseExpenseYearsOptions = {}
): UseExpenseYearsResult {
  const { enabled = true } = options;

  const [years, setYears] = useState<number[]>([]);
  const [internalLoading, setInternalLoading] = useState<boolean>(false);
  const [internalError, setInternalError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let active = true;

    async function load() {
      setInternalLoading(true);
      setInternalError(null);

      try {
        const ref = doc(db, "metadata", "expenseYears");
        const snap = await getDoc(ref);
        const data = snap.data();
        if (!data || !Array.isArray(data.years)) {
          throw new Error("Invalid /metadata/expenseYears structure");
        }
        const sorted = data.years.map(Number).sort((a, b) => b - a);
        if (active) setYears(sorted);
      } catch (err) {
        console.error("[useExpenseYears] Error:", err);
        if (active)
          setInternalError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (active) setInternalLoading(false);
      }
    }

    void load();
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

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

/* -------------------------------------------------------------------------- */
/* 🧮 Hook                                                                    */
/* -------------------------------------------------------------------------- */
export function useExpenseYears(): UseExpenseYearsResult {
  const [years, setYears] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
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
          setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  return { years, loading, error };
}

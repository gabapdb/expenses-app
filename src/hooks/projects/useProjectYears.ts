"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/core/firebase";

/* -------------------------------------------------------------------------- */
/* 🧠 Types                                                                   */
/* -------------------------------------------------------------------------- */
interface UseProjectYearsResult {
  years: number[];
  loading: boolean;
  error: string | null;
}

/* -------------------------------------------------------------------------- */
/* 🧮 Hook                                                                    */
/* -------------------------------------------------------------------------- */
export function useProjectYears(): UseProjectYearsResult {
  const [years, setYears] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const snapshot = await getDocs(collection(db, "projects"));
        const found = new Set<number>();

        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Record<string, unknown>;
          const start = data.startDate ? new Date(String(data.startDate)) : null;
          const end = data.endDate ? new Date(String(data.endDate)) : null;
          if (start && !isNaN(start.getTime())) found.add(start.getFullYear());
          if (end && !isNaN(end.getTime())) found.add(end.getFullYear());
        });

        if (active) {
          setYears(Array.from(found).sort((a, b) => b - a));
          setLoading(false);
        }
      } catch (err) {
        console.error("[useProjectYears] Error:", err);
        if (active) {
          setError(err instanceof Error ? err.message : "Unknown error");
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  return { years, loading, error };
}

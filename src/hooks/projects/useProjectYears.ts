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

interface UseProjectYearsOptions {
  enabled?: boolean;
}

/* -------------------------------------------------------------------------- */
/* 🧮 Hook                                                                    */
/* -------------------------------------------------------------------------- */
export function useProjectYears(
  options: UseProjectYearsOptions = {}
): UseProjectYearsResult {
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
          setInternalLoading(false);
        }
      } catch (err) {
        console.error("[useProjectYears] Error:", err);
        if (active) {
          setInternalError(
            err instanceof Error ? err.message : "Unknown error"
          );
          setInternalLoading(false);
        }
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

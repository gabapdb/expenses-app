import { useEffect, useState } from "react";
import { getDoc, getDocs, doc, collection } from "firebase/firestore";
import { db } from "@/core/firebase";

/* -------------------------------------------------------------------------- */
/* 🧠 Types                                                                   */
/* -------------------------------------------------------------------------- */
export interface YearMonthInfo {
  year: number;
  months: string[]; // e.g. ["202501", "202506", "202610"]
}

interface UseAvailableExpenseYearsAndMonthsResult {
  info: YearMonthInfo[];
  latestYear?: number;
  latestMonth?: string;
  loading: boolean;
  error: string | null;
}

/* -------------------------------------------------------------------------- */
/* ⚙️ Hook                                                                    */
/* -------------------------------------------------------------------------- */
/**
 * Loads all available expense years & months.
 * Requires a Firestore document at `/metadata/expenseYears`
 * with structure: { years: [2024, 2025, 2026, ...] }
 */
export function useAvailableExpenseYearsAndMonths(): UseAvailableExpenseYearsAndMonthsResult {
  const [info, setInfo] = useState<YearMonthInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        // 1️⃣ Fetch list of available years
        const metaRef = doc(db, "metadata", "expenseYears");
        const metaSnap = await getDoc(metaRef);
        const data = metaSnap.data();
        if (!data || !Array.isArray(data.years)) {
          throw new Error("Missing or invalid /metadata/expenseYears document");
        }

        const years: number[] = data.years;

        // 2️⃣ Fetch the expenses collection once and bucket doc IDs by year
        const expensesRef = collection(db, "expenses");
        const snapshot = await getDocs(expensesRef);

        const monthsByYear = new Map<number, Set<string>>();
        snapshot.forEach((docSnap) => {
          const id = docSnap.id;
          if (!/^\d{6}$/.test(id)) {
            return;
          }

          const year = Number(id.slice(0, 4));
          if (!Number.isFinite(year)) {
            return;
          }

          if (!monthsByYear.has(year)) {
            monthsByYear.set(year, new Set());
          }
          monthsByYear.get(year)!.add(id);
        });

        // Ensure metadata years without documents are still represented
        const allYears = Array.from(
          new Set([...years, ...monthsByYear.keys()])
        ).sort((a, b) => a - b);

        const fetched: YearMonthInfo[] = allYears.map((year) => ({
          year,
          months: Array.from(monthsByYear.get(year) ?? [])
            .sort((a, b) => a.localeCompare(b)),
        }));

        if (active) {
          const sorted = fetched.sort((a, b) => b.year - a.year);

          setInfo(sorted);
          setLoading(false);
          setError(null);
        }
      } catch (err) {
        console.error("[useAvailableExpenseYearsAndMonths] Error:", err);
        if (active) {
          setError(
            err instanceof Error ? err.message : "Unknown error fetching years"
          );
          setLoading(false);
        }
      }
    }

    void loadData();
    return () => {
      active = false;
    };
  }, []);

  const latestYear = info[0]?.year;
  const latestMonth = info[0]?.months?.[info[0].months.length - 1];

  return {
    info,
    latestYear,
    latestMonth,
    loading,
    error,
  };
}

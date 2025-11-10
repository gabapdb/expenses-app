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
        const fetched: YearMonthInfo[] = [];

        // 2️⃣ For each year, list all months that have expenses
        for (const year of years) {
          const expensesRef = collection(db, "expenses");
          const snapshot = await getDocs(expensesRef);

          const months = new Set<string>();
          snapshot.forEach((docSnap) => {
            const id = docSnap.id;
            if (/^\d{6}$/.test(id) && id.startsWith(String(year))) {
              months.add(id);
            }
          });

          fetched.push({
            year,
            months: Array.from(months).sort((a, b) => a.localeCompare(b)),
          });
        }

        if (active) {
          const sorted = fetched.sort((a, b) => b.year - a.year);
          const latestYear = sorted[0]?.year;
          const latestMonth =
            sorted[0]?.months[sorted[0].months.length - 1] ?? undefined;

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

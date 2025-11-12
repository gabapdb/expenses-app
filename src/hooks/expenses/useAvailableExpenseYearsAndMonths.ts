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

interface YearMonthCache {
  info: YearMonthInfo[];
}

let cachedYearMonthInfo: YearMonthCache | null = null;
let cachedYearMonthError: string | null = null;
let pendingYearMonthRequest: Promise<YearMonthCache> | null = null;

async function fetchYearMonthInfo(): Promise<YearMonthCache> {
  const metaRef = doc(db, "metadata", "expenseYears");
  const metaSnap = await getDoc(metaRef);
  const data = metaSnap.data();
  if (!data || !Array.isArray(data.years)) {
    throw new Error("Missing or invalid /metadata/expenseYears document");
  }

  const years: number[] = data.years;

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

  const allYears = Array.from(new Set([...years, ...monthsByYear.keys()]))
    .sort((a, b) => a - b)
    .map((year) => ({
      year,
      months: Array.from(monthsByYear.get(year) ?? [])
        .sort((a, b) => a.localeCompare(b)),
    }));

  const sorted = allYears.sort((a, b) => b.year - a.year);

  return { info: sorted };
}

export function invalidateAvailableExpenseYearsCache(): void {
  cachedYearMonthInfo = null;
  cachedYearMonthError = null;
  pendingYearMonthRequest = null;
}

function scheduleMicrotask(fn: () => void): void {
  if (typeof queueMicrotask === "function") {
    queueMicrotask(fn);
  } else {
    Promise.resolve().then(fn);
  }
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
  const [info, setInfo] = useState<YearMonthInfo[]>(
    () => cachedYearMonthInfo?.info ?? []
  );
  const [loading, setLoading] = useState<boolean>(!cachedYearMonthInfo);
  const [error, setError] = useState<string | null>(cachedYearMonthError);

  useEffect(() => {
    let active = true;
    if (cachedYearMonthInfo) {
      scheduleMicrotask(() => {
        if (!active) return;
        setInfo(cachedYearMonthInfo!.info);
        setError(null);
        setLoading(false);
      });

      return () => {
        active = false;
      };
    }

    if (cachedYearMonthError) {
      scheduleMicrotask(() => {
        if (!active) return;
        setError(cachedYearMonthError);
        setLoading(false);
      });

      return () => {
        active = false;
      };
    }

    scheduleMicrotask(() => {
      if (!active) return;
      setLoading(true);
      setError(null);
    });

    const pending = pendingYearMonthRequest ?? fetchYearMonthInfo();
    pendingYearMonthRequest = pending;

    pending
      .then((result) => {
        cachedYearMonthInfo = result;
        cachedYearMonthError = null;

        if (!active) return;

        setInfo(result.info);
        setError(null);
      })
      .catch((err) => {
        console.error("[useAvailableExpenseYearsAndMonths] Error:", err);
        const message =
          err instanceof Error ? err.message : "Unknown error fetching years";
        cachedYearMonthError = message;

        if (!active) return;

        setError(message);
        setInfo([]);
      })
      .finally(() => {
        if (pendingYearMonthRequest === pending) {
          pendingYearMonthRequest = null;
        }

        if (active) {
          setLoading(false);
        }
      });

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

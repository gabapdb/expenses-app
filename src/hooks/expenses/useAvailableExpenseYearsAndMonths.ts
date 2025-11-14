import { useEffect, useMemo, useState } from "react";
import {
  getDoc,
  getDocs,
  doc,
  collection,
  collectionGroup,
  where,
  query,
} from "firebase/firestore";
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

export interface UseAvailableExpenseYearsAndMonthsOptions {
  clientId?: string;
  projectId?: string;
}

const cachedYearMonthInfo = new Map<string, YearMonthCache>();
const cachedYearMonthError = new Map<string, string | null>();
const pendingYearMonthRequest = new Map<string, Promise<YearMonthCache>>();

function scopeKey(options: UseAvailableExpenseYearsAndMonthsOptions = {}): string {
  const clientId = options.clientId?.trim();
  const projectId = options.projectId?.trim();
  if (clientId && projectId) {
    return `${clientId}::${projectId}`;
  }
  return "__legacy__";
}

async function fetchYearMonthInfo(
  options: UseAvailableExpenseYearsAndMonthsOptions = {}
): Promise<YearMonthCache> {
  if (options.clientId && options.projectId) {
    try {
      const { clientId, projectId } = options;
      const prefix = `clients/${clientId}/projects/${projectId}/expenses/`;

      const scopedMetaRef = doc(
        db,
        "clients",
        clientId,
        "projects",
        projectId,
        "metadata",
        "expenseYears"
      );
      const scopedMetaSnap = await getDoc(scopedMetaRef);
      const scopedMetaData = scopedMetaSnap.data();
      const scopedYears = Array.isArray(scopedMetaData?.years)
        ? scopedMetaData!.years.map(Number)
        : [];

      const scopedQuery = query(
        collectionGroup(db, "items"),
        where("projectId", "==", projectId)
      );
      const scopedSnapshot = await getDocs(scopedQuery);

      const monthsByYear = new Map<number, Set<string>>();
      scopedSnapshot.forEach((docSnap) => {
        if (!docSnap.ref.path.startsWith(prefix)) {
          return;
        }

        const yyyyMM = docSnap.get("yyyyMM");
        if (typeof yyyyMM !== "string" || !/^\d{6}$/.test(yyyyMM)) {
          return;
        }

        const yearNum = Number(yyyyMM.slice(0, 4));
        if (!Number.isFinite(yearNum)) {
          return;
        }

        if (!monthsByYear.has(yearNum)) {
          monthsByYear.set(yearNum, new Set());
        }
        monthsByYear.get(yearNum)!.add(yyyyMM);
      });

      if (monthsByYear.size > 0 || scopedYears.length > 0) {
        const combinedYears = new Set<number>(scopedYears);
        for (const year of monthsByYear.keys()) {
          combinedYears.add(year);
        }

        const info = Array.from(combinedYears)
          .sort((a, b) => b - a)
          .map((year) => ({
            year,
            months: Array.from(monthsByYear.get(year) ?? [])
              .sort((a, b) => a.localeCompare(b)),
          }));

        return { info };
      }
    } catch (err) {
      console.error(
        "[useAvailableExpenseYearsAndMonths] Failed scoped fetch, falling back:",
        err
      );
    }
  }

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

export function invalidateAvailableExpenseYearsCache(
  options?: UseAvailableExpenseYearsAndMonthsOptions
): void {
  if (options) {
    const key = scopeKey(options);
    cachedYearMonthInfo.delete(key);
    cachedYearMonthError.delete(key);
    pendingYearMonthRequest.delete(key);
    return;
  }

  cachedYearMonthInfo.clear();
  cachedYearMonthError.clear();
  pendingYearMonthRequest.clear();
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
export function useAvailableExpenseYearsAndMonths(
  options: UseAvailableExpenseYearsAndMonthsOptions = {}
): UseAvailableExpenseYearsAndMonthsResult {
  const normalizedOptions = useMemo(
    () => ({
      clientId: options.clientId?.trim() || undefined,
      projectId: options.projectId?.trim() || undefined,
    }),
    [options.clientId, options.projectId]
  );
  const key = useMemo(() => scopeKey(normalizedOptions), [normalizedOptions]);
  const { clientId: normalizedClientId, projectId: normalizedProjectId } =
    normalizedOptions;
  const [info, setInfo] = useState<YearMonthInfo[]>(
    () => cachedYearMonthInfo.get(key)?.info ?? []
  );
  const [loading, setLoading] = useState<boolean>(!cachedYearMonthInfo.has(key));
  const [error, setError] = useState<string | null>(
    cachedYearMonthError.get(key) ?? null
  );

  useEffect(() => {
    let active = true;
    const cached = cachedYearMonthInfo.get(key);
    if (cached) {
      scheduleMicrotask(() => {
        if (!active) return;
        setInfo(cached.info);
        setError(null);
        setLoading(false);
      });

      return () => {
        active = false;
      };
    }

    const cachedError = cachedYearMonthError.get(key);
    if (cachedError) {
      scheduleMicrotask(() => {
        if (!active) return;
        setError(cachedError);
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

    const pending =
      pendingYearMonthRequest.get(key) ??
      fetchYearMonthInfo({
        clientId: normalizedClientId,
        projectId: normalizedProjectId,
      });
    pendingYearMonthRequest.set(key, pending);

    pending
      .then((result) => {
        cachedYearMonthInfo.set(key, result);
        cachedYearMonthError.set(key, null);

        if (!active) return;

        setInfo(result.info);
        setError(null);
      })
      .catch((err) => {
        console.error("[useAvailableExpenseYearsAndMonths] Error:", err);
        const message =
          err instanceof Error ? err.message : "Unknown error fetching years";
        cachedYearMonthError.set(key, message);

        if (!active) return;

        setError(message);
        setInfo([]);
      })
      .finally(() => {
        if (pendingYearMonthRequest.get(key) === pending) {
          pendingYearMonthRequest.delete(key);
        }

        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
    // FIX: normalizedOptions is an object → unstable dependency
  }, [key, normalizedClientId, normalizedProjectId]);

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

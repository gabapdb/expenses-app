"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  useEffect,
} from "react";
import type { ReactNode, ChangeEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAvailableExpenseYearsAndMonths } from "@/hooks/expenses/useAvailableExpenseYearsAndMonths";

export interface ExpenseDateContextValue {
  selectedYear: number;
  selectedMonth: string;
  yyyyMM: string;
  availableYears: number[];
  loadingYears: boolean;
  yearError: string | null;
  setMonth: (yyyyMM: string) => void;
  setYear: (e: ChangeEvent<HTMLSelectElement>) => void;
}

export const ExpenseDateContext = createContext<ExpenseDateContextValue | null>(null);

const normalize = (val: string | null | undefined): string | null => {
  if (!val) return null;
  return /^\d{6}$/.test(val.trim()) ? val.trim() : null;
};

export function ExpenseDateProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const params = useParams<{ yyyyMM?: string }>();

  const now = useMemo(() => new Date(), []);
  const defaultYear = now.getFullYear();
  const defaultMonth = String(now.getMonth() + 1).padStart(2, "0");
  const defaultYYYYMM = `${defaultYear}${defaultMonth}`;

  const routeYYYYMM = normalize(typeof params?.yyyyMM === "string" ? params.yyyyMM : null);

  const [localYYYYMM, setLocalYYYYMM] = useState(() => routeYYYYMM ?? defaultYYYYMM);

  const activeYYYYMM = routeYYYYMM ?? localYYYYMM;
  const selectedYear = Number(activeYYYYMM.slice(0, 4));
  const selectedMonth = activeYYYYMM.slice(4, 6);

  const { info, latestYear, latestMonth, loading, error } =
    useAvailableExpenseYearsAndMonths();

  const availableYears = info.map((i) => i.year);

  const setMonth = useCallback(
    (nextYYYYMM: string) => {
      const valid = normalize(nextYYYYMM);
      if (!valid) return;
      setLocalYYYYMM(valid);
      router.push(`/expenses/${valid}`);
    },
    [router]
  );

  const setYear = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const y = Number(event.target.value);
      if (Number.isNaN(y)) return;

      const found = info.find((i) => i.year === y);
      const months = found?.months ?? [];
      const fallback = months.length > 0 ? months[months.length - 1] : `${y}01`;

      setLocalYYYYMM(fallback);
      router.push(`/expenses/${fallback}`);
    },
    [info, router]
  );

  useEffect(() => {
    if (loading || !latestYear || !latestMonth) return;

    const exists = info.some((i) => i.months.includes(activeYYYYMM));

    if (exists || activeYYYYMM === latestMonth) return;

    queueMicrotask(() => {
      setLocalYYYYMM(latestMonth);
      router.replace(`/expenses/${latestMonth}`);
    });
  }, [loading, latestYear, latestMonth, info, activeYYYYMM, router]);

  return (
    <ExpenseDateContext.Provider
      value={{
        selectedYear,
        selectedMonth,
        yyyyMM: activeYYYYMM,
        availableYears,
        loadingYears: loading,
        yearError: error,
        setMonth,
        setYear,
      }}
    >
      {children}
    </ExpenseDateContext.Provider>
  );
}

export function useExpenseDate(): ExpenseDateContextValue {
  const ctx = useContext(ExpenseDateContext);
  if (!ctx) throw new Error("useExpenseDate must be used inside ExpenseDateProvider");
  return ctx;
}

export function useOptionalExpenseDate(): ExpenseDateContextValue | null {
  return useContext(ExpenseDateContext);
}

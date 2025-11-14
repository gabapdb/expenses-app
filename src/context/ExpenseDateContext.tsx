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
import { useProject } from "@/hooks/projects/useProjects";

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

const paramToString = (value: string | string[] | undefined): string | null => {
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value) && value.length > 0) {
    return value[0] ?? null;
  }
  return null;
};

const trimToNull = (value: string | null): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export function ExpenseDateProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const params = useParams<{
    yyyyMM?: string | string[];
    projectId?: string | string[];
    year?: string | string[];
    month?: string | string[];
  }>();

  const projectParam = trimToNull(paramToString(params?.projectId));
  const yearParam = paramToString(params?.year);
  const monthParam = paramToString(params?.month);
  const yyyyMMParam = paramToString(params?.yyyyMM);

  const normalizedYear = yearParam ? yearParam.padStart(4, "0").slice(-4) : null;
  const normalizedMonth = monthParam ? monthParam.padStart(2, "0").slice(-2) : null;
  const nestedYYYYMM =
    normalizedYear && normalizedMonth ? `${normalizedYear}${normalizedMonth}` : null;

  const routeProjectId = projectParam;
  const routeYYYYMM = normalize(yyyyMMParam ?? nestedYYYYMM);

  const now = useMemo(() => new Date(), []);
  const defaultYear = now.getFullYear();
  const defaultMonth = String(now.getMonth() + 1).padStart(2, "0");
  const defaultYYYYMM = `${defaultYear}${defaultMonth}`;

  const [localYYYYMM, setLocalYYYYMM] = useState(() => routeYYYYMM ?? defaultYYYYMM);

  const activeYYYYMM = routeYYYYMM ?? localYYYYMM;
  const selectedYear = Number(activeYYYYMM.slice(0, 4));
  const selectedMonth = activeYYYYMM.slice(4, 6);

  const { data: activeProject } = useProject(routeProjectId ?? undefined);
  const scopedClientId = activeProject?.clientId?.trim();

  const { info, latestYear, latestMonth, loading, error } =
    useAvailableExpenseYearsAndMonths({
      projectId: routeProjectId ?? undefined,
      clientId: scopedClientId || undefined,
    });

  const availableYears = info.map((i) => i.year);

  const pathFor = useCallback(
    (targetYYYYMM: string) => {
      if (routeProjectId) {
        const nextYear = targetYYYYMM.slice(0, 4);
        const nextMonth = targetYYYYMM.slice(4, 6);
        return `/projects/${routeProjectId}/expenses/${nextYear}/${nextMonth}`;
      }
      return `/expenses/${targetYYYYMM}`;
    },
    [routeProjectId]
  );

  const setMonth = useCallback(
    (nextYYYYMM: string) => {
      const valid = normalize(nextYYYYMM);
      if (!valid) return;
      setLocalYYYYMM(valid);
      router.push(pathFor(valid));
    },
    [pathFor, router]
  );

  const setYear = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const y = Number(event.target.value);
      if (Number.isNaN(y)) return;

      const found = info.find((i) => i.year === y);
      const months = found?.months ?? [];
      const fallback = months.length > 0 ? months[months.length - 1] : `${y}01`;

      setLocalYYYYMM(fallback);
      router.push(pathFor(fallback));
    },
    [info, pathFor, router]
  );

  useEffect(() => {
    if (loading || !latestYear || !latestMonth) return;

    const exists = info.some((i) => i.months.includes(activeYYYYMM));

    if (exists || activeYYYYMM === latestMonth) return;

    queueMicrotask(() => {
      setLocalYYYYMM(latestMonth);
      router.replace(pathFor(latestMonth));
    });
  }, [loading, latestYear, latestMonth, info, activeYYYYMM, pathFor, router]);

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

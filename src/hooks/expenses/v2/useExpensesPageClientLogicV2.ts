import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { useRouter } from "next/navigation";

import { useAvailableExpenseYearsAndMonths } from "@/hooks/expenses/useAvailableExpenseYearsAndMonths";

export interface UseExpensesPageClientLogicV2Options {
  initialYYYYMM?: string;
}

export interface UseExpensesPageClientLogicV2Result {
  selectedYear: number;
  selectedMonth: string;
  gridYYYYMM: string;
  availableYears: number[];
  loadingYears: boolean;
  yearError: string | null;
  handleMonthChange: (nextYYYYMM: string) => void;
  handleYearChange: (event: ChangeEvent<HTMLSelectElement>) => void;
}

function normalizeYearMonth(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  if (!/^\d{6}$/.test(trimmed)) {
    return undefined;
  }

  return trimmed;
}

export function useExpensesPageClientLogicV2({
  initialYYYYMM,
}: UseExpensesPageClientLogicV2Options): UseExpensesPageClientLogicV2Result {
  const router = useRouter();
  const normalizedInitial = useMemo(
    () => normalizeYearMonth(initialYYYYMM),
    [initialYYYYMM]
  );

  const now = useMemo(() => new Date(), []);
  const currentYear = now.getFullYear();
  const currentMonth = String(now.getMonth() + 1).padStart(2, "0");

  const initialYear = normalizedInitial
    ? Number(normalizedInitial.slice(0, 4))
    : currentYear;
  const initialMonth = normalizedInitial
    ? normalizedInitial.slice(4, 6)
    : currentMonth;

  const [selectedYear, setSelectedYear] = useState<number>(initialYear);
  const [selectedMonth, setSelectedMonth] = useState<string>(initialMonth);

  const { info, latestYear, latestMonth, loading, error } =
    useAvailableExpenseYearsAndMonths();

  const handleMonthChange = useCallback(
    (nextYYYYMM: string) => {
      const normalized = normalizeYearMonth(nextYYYYMM);
      if (!normalized) {
        return;
      }

      setSelectedYear(Number(normalized.slice(0, 4)));
      setSelectedMonth(normalized.slice(4, 6));
      router.push(`/expenses/${normalized}`);
    },
    [router]
  );

  const handleYearChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const nextYear = Number(event.target.value);
      if (Number.isNaN(nextYear)) {
        return;
      }

      setSelectedYear(nextYear);

      const found = info.find((yearInfo) => yearInfo.year === nextYear);
      const months = found?.months ?? [];
      const latestForYear =
        months.length > 0 ? months[months.length - 1] : `${nextYear}01`;

      setSelectedMonth(latestForYear.slice(4, 6));
      router.push(`/expenses/${latestForYear}`);
    },
    [info, router]
  );

  useEffect(() => {
    if (loading || !latestYear || !latestMonth) {
      return;
    }

    const monthExists = info.some((yearInfo) =>
      yearInfo.months.includes(normalizedInitial ?? "")
    );

    if (monthExists || latestMonth === normalizedInitial) {
      return;
    }

    queueMicrotask(() => {
      setSelectedYear(latestYear);
      setSelectedMonth(latestMonth.slice(4, 6));
      router.replace(`/expenses/${latestMonth}`);
    });
  }, [info, latestMonth, latestYear, loading, normalizedInitial, router]);

  return {
    selectedYear,
    selectedMonth,
    gridYYYYMM: `${selectedYear}${selectedMonth}`,
    availableYears: info.map((yearInfo) => yearInfo.year),
    loadingYears: loading,
    yearError: error,
    handleMonthChange,
    handleYearChange,
  };
}

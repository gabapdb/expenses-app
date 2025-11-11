"use client";

import type { ChangeEvent, JSX } from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import ExpensesGrid from "@/features/expenses/components/ExpensesGrid";
import { useAvailableExpenseYearsAndMonths } from "@/hooks/expenses/useAvailableExpenseYearsAndMonths";

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

export default function ExpensesPageClient({
  initialYYYYMM,
}: {
  initialYYYYMM?: string;
}): JSX.Element {
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

  const handleMonthChange = (newYYYYMM: string): void => {
    const normalized = normalizeYearMonth(newYYYYMM);
    if (!normalized) {
      return;
    }

    setSelectedYear(Number(normalized.slice(0, 4)));
    setSelectedMonth(normalized.slice(4, 6));
    router.push(`/expenses/${normalized}`);
  };

  const handleYearChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    const newYear = Number(event.target.value);
    if (Number.isNaN(newYear)) {
      return;
    }

    setSelectedYear(newYear);

    const found = info.find((yearInfo) => yearInfo.year === newYear);
    const months = found?.months ?? [];
    const latestForYear =
      months.length > 0 ? months[months.length - 1] : `${newYear}01`;

    setSelectedMonth(latestForYear.slice(4, 6));
    router.push(`/expenses/${latestForYear}`);
  };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, latestYear, latestMonth, info, normalizedInitial]);

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-[#3a3a3a] pb-2">
        <h1 className="text-xl font-semibold text-[#e5e5e5]">Expenses</h1>
      </div>

      <ExpensesGrid
        yyyyMM={`${selectedYear}${selectedMonth}`}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        onMonthChange={handleMonthChange}
        onYearChange={handleYearChange}
        loadingYears={loading}
        yearError={error}
        availableYears={info.map((yearInfo) => yearInfo.year)}
      />
    </main>
  );
}

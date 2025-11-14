"use client";

import type { JSX } from "react";

import ExpensesGrid from "@/features/expenses/components/ExpensesGrid";
import { useExpensesPageClientLogicV2 } from "@/hooks/expenses/v2/useExpensesPageClientLogicV2";

export default function ExpensesPageClient({
  initialYYYYMM,
}: {
  initialYYYYMM?: string;
}): JSX.Element {
  const {
    selectedYear,
    selectedMonth,
    gridYYYYMM,
    availableYears,
    loadingYears,
    yearError,
    handleMonthChange,
    handleYearChange,
  } = useExpensesPageClientLogicV2({ initialYYYYMM });

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-[#3a3a3a] pb-2">
        <h1 className="text-xl font-semibold text-[#e5e5e5]">Expenses</h1>
      </div>

      <ExpensesGrid
        yyyyMM={gridYYYYMM}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        onMonthChange={handleMonthChange}
        onYearChange={handleYearChange}
        loadingYears={loadingYears}
        yearError={yearError}
        availableYears={availableYears}
      />
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAvailableExpenseYearsAndMonths } from "@/hooks/expenses/useAvailableExpenseYearsAndMonths";
import ExpensesGrid from "@/features/expenses/components/ExpensesGrid";

/* -------------------------------------------------------------------------- */
/* 🧩 Page Component                                                          */
/* -------------------------------------------------------------------------- */
export default function ExpensesPage({
  params,
}: {
  params: { yyyyMM: string };
}) {
  const router = useRouter();
  const { yyyyMM } = params;

  const { info, latestYear, latestMonth, loading, error } =
    useAvailableExpenseYearsAndMonths();

  /* 🧮 Derive current selections ------------------------------------------- */
  const currentYear = new Date().getFullYear();
  const derivedYear = Number(yyyyMM.slice(0, 4)) || latestYear || currentYear;
  const derivedMonth = yyyyMM.slice(4, 6);

  const [selectedYear, setSelectedYear] = useState<number>(derivedYear);
  const [selectedMonth, setSelectedMonth] = useState<string>(derivedMonth);

  /* 🧭 Navigation helpers --------------------------------------------------- */
  const handleMonthChange = (newYYYYMM: string): void => {
    setSelectedMonth(newYYYYMM.slice(4, 6));
    router.push(`/expenses/${newYYYYMM}`);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const newYear = Number(e.target.value);
    setSelectedYear(newYear);

    const found = info.find((y) => y.year === newYear);
    const months = found?.months ?? [];
    const latestForYear =
      months.length > 0 ? months[months.length - 1] : `${newYear}01`;

    setSelectedMonth(latestForYear.slice(4, 6));
    router.push(`/expenses/${latestForYear}`);
  };

  /* 🧠 Auto-jump when hook finishes loading -------------------------------- */
  useEffect(() => {
    if (loading || !latestYear || !latestMonth) {
      return;
    }

    const monthExists = info.some((yearInfo) =>
      yearInfo.months.includes(yyyyMM)
    );

    if (monthExists || latestMonth === yyyyMM) {
      return;
    }

    queueMicrotask(() => {
      setSelectedYear(latestYear);
      setSelectedMonth(latestMonth.slice(4, 6));
      router.replace(`/expenses/${latestMonth}`);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, latestYear, latestMonth, info, yyyyMM]);

  /* ------------------------------------------------------------------------ */
  /* 🖼️ Render                                                               */
  /* ------------------------------------------------------------------------ */
  return (
    <main className="p-6 space-y-6">
      {/* 🧭 Header */}
      <div className="flex items-center justify-between border-b border-[#3a3a3a] pb-2">
        <h1 className="text-xl font-semibold text-[#e5e5e5]">Expenses</h1>
      </div>

      {/* 🧩 Expenses Grid */}
      <ExpensesGrid
        yyyyMM={`${selectedYear}${selectedMonth}`}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        onMonthChange={handleMonthChange}
        onYearChange={handleYearChange}
        loadingYears={loading}
        yearError={error}
        availableYears={info.map((y) => y.year)}
      />
    </main>
  );
}

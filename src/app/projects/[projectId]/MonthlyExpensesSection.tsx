"use client";

import { useMemo, useState } from "react";
import ExpensePieChart from "@/components/charts/ExpensesPieChart";
import { useProjectExpensesByYear } from "@/hooks/useProjectExpensesByYear";
import { allMonths, peso } from "@/utils/expenses";
import { CATEGORY_LIST } from "@/config/categories";

/* -------------------------------------------------------------------------- */
/* 🧩 Types                                                                   */
/* -------------------------------------------------------------------------- */
type MonthlyBreakdown = Record<string, Record<string, number>>;

interface MonthlyExpensesSectionProps {
  projectId: string;
  startDate?: string;
  endDate?: string;
}

/* -------------------------------------------------------------------------- */
/* 🧮 Derive visible months                                                   */
/* -------------------------------------------------------------------------- */
function deriveVisibleMonths(
  allMonths: string[],
  byMonth: MonthlyBreakdown,
  startDate?: string,
  endDate?: string
): string[] {
  const parseMonthIndex = (value?: string): number | null => {
    if (!value) return null;

    // Support raw YYYYMM strings from Firestore
    if (/^\d{6}$/.test(value)) {
      const month = Number(value.slice(4, 6));
      return month >= 1 && month <= 12 ? month - 1 : null;
    }

    const parsed = Date.parse(value);
    if (Number.isNaN(parsed)) return null;
    const date = new Date(parsed);
    return Number.isNaN(date.getTime()) ? null : date.getMonth();
  };

  if (startDate || endDate) {
    const startIdx = parseMonthIndex(startDate) ?? 0;
    const endIdx = parseMonthIndex(endDate) ?? allMonths.length - 1;

    const normalizedStart = Math.max(0, Math.min(startIdx, allMonths.length - 1));
    const normalizedEnd = Math.max(0, Math.min(endIdx, allMonths.length - 1));

    if (normalizedStart <= normalizedEnd) {
      return allMonths.slice(normalizedStart, normalizedEnd + 1);
    }

    // Handle ranges that wrap across the year boundary (e.g., Oct → Feb)
    return [
      ...allMonths.slice(normalizedStart),
      ...allMonths.slice(0, normalizedEnd + 1),
    ];
  }

  const monthsWithData = Object.keys(byMonth)
    .filter((m) => {
      const total = Object.values(byMonth[m] || {}).reduce((a, b) => a + b, 0);
      return total > 0;
    })
    .sort((a, b) => allMonths.indexOf(a) - allMonths.indexOf(b));

  if (monthsWithData.length === 0) return [];
  const startIdx = allMonths.indexOf(monthsWithData[0]);
  const endIdx = allMonths.indexOf(monthsWithData[monthsWithData.length - 1]);
  return allMonths.slice(startIdx, endIdx + 1);
}

/* -------------------------------------------------------------------------- */
/* 🧩 Component                                                               */
/* -------------------------------------------------------------------------- */
export default function MonthlyExpensesSection({
  projectId,
  startDate,
  endDate,
}: MonthlyExpensesSectionProps) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<number>(currentYear);

  const {
    byMonth,
    byCategory,
    totalsByMonth,
    grandTotal,
    availableYears,
    resolvedYear,
    loading,
    error,
  } = useProjectExpensesByYear(projectId, year);

  const yearOptions = useMemo(
    () => (availableYears.length ? [...availableYears] : [currentYear]),
    [availableYears, currentYear]
  );

  const selectValue = yearOptions.includes(year) ? year : resolvedYear;

  const categories = useMemo(
    () =>
      CATEGORY_LIST.filter((c) => c !== "Additional Cabinet Labor").map(
        (c) => c as string
      ),
    []
  );

  const visibleMonths = useMemo(
    () => deriveVisibleMonths(allMonths, byMonth, startDate, endDate),
    [allMonths, byMonth, startDate, endDate]
  );

  const hasData = grandTotal > 0 && visibleMonths.length > 0;

  /* ------------------------------------------------------------------------ */
  /* 🖼️ Render                                                                */
  /* ------------------------------------------------------------------------ */
  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#3a3a3a] pb-2">
        <h2 className="text-lg font-semibold text-[#e5e5e5]">Monthly Expenses</h2>

        <div className="flex items-center gap-2 text-sm">
          <label htmlFor="year" className="text-[#9ca3af]">
            Year:
          </label>
          <select
            id="year"
            className="border border-[#3a3a3a] bg-[#1f1f1f] text-[#d1d5db] rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#4f4f4f]"
            value={selectValue}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading / Error states */}
      {loading && <div className="text-[#9ca3af] text-sm">Loading expenses…</div>}
      {error && <div className="text-[#f87171] text-sm">{error}</div>}

      {!loading && !error && (
        <>
          {/* Pie Chart */}
          <div className="border border-[#3a3a3a] rounded-xl p-4 bg-[#1f1f1f]">
            {grandTotal > 0 ? (
              <ExpensePieChart
                data={categories.map((category) => ({
                  category,
                  total: byCategory[category] ?? 0,
                }))}
              />
            ) : (
              <div className="text-[#9ca3af] text-sm text-center">
                No data available for {resolvedYear}.
              </div>
            )}
          </div>

          {/* Table */}
          {hasData ? (
            <div className="border border-[#3a3a3a] rounded-xl overflow-x-auto bg-[#1f1f1f]">
              <table className="min-w-full text-sm text-[#d1d5db] border-collapse">
                <thead className="bg-[#262626] border-b border-[#3a3a3a]">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-[#e5e5e5]">
                      Month
                    </th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-[#e5e5e5]">
                      Total
                    </th>
                    {categories.map((cat) => (
                      <th
                        key={cat}
                        className="px-4 py-2 text-right text-sm font-medium text-[#e5e5e5]"
                      >
                        {cat}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleMonths.map((month) => (
                    <tr
                      key={month}
                      className="border-b border-[#3a3a3a] hover:bg-[#2a2a2a]/70 transition-colors"
                    >
                      <td className="px-4 py-[6px]">{month}</td>
                      <td className="px-4 py-[6px] text-right font-medium">
                        {peso(totalsByMonth[month] ?? 0)}
                      </td>
                      {categories.map((cat) => (
                        <td key={cat} className="px-4 py-[6px] text-right">
                          {peso(byMonth[month]?.[cat] ?? 0)}
                        </td>
                      ))}
                    </tr>
                  ))}

                  <tr className="bg-[#2a2a2a] font-semibold border-t border-[#3a3a3a]">
                    <td className="px-4 py-2 text-left text-[#e5e5e5] uppercase tracking-wide">
                      Total
                    </td>
                    <td className="px-4 py-2 text-right text-[#f3f4f6]">
                      {peso(grandTotal)}
                    </td>
                    {categories.map((cat) => (
                      <td
                        key={cat}
                        className="px-4 py-2 text-right text-[#f3f4f6]"
                      >
                        {peso(byCategory[cat] ?? 0)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-xl border border-[#3a3a3a] bg-[#1f1f1f] p-6 text-center text-sm text-[#9ca3af]">
              No monthly data yet — add your first expense to start tracking.
            </div>
          )}
        </>
      )}
    </section>
  );
}

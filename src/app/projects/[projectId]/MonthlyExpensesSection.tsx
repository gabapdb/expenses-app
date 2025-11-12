"use client";

import { useMemo } from "react";
import { useProjectExpensesByYear } from "@/hooks/expenses/useProjectExpensesByYear";
import { allMonths, peso } from "@/utils/expenses";
import { CATEGORY_LIST } from "@/config/categories";

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
  const {
    byMonth,
    byCategory,
    totalsByMonth,
    grandTotal,
    loading,
    error,
  } = useProjectExpensesByYear(projectId, new Date().getFullYear());

  const categories = useMemo(
    () =>
      CATEGORY_LIST.filter((c) => c !== "Additional Cabinet Labor").map(
        (c) => c as string
      ),
    []
  );

  const visibleMonths = useMemo(
    () => deriveVisibleMonths(allMonths, byMonth, startDate, endDate),
    [byMonth, startDate, endDate]
  );

  const hasData = grandTotal > 0 && visibleMonths.length > 0;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#3a3a3a] pb-2">
        <h2 className="text-lg font-semibold text-[#e5e5e5]">Monthly Expenses</h2>
      </div>

      {loading && <div className="text-[#9ca3af] text-sm">Loading expenses…</div>}
      {error && <div className="text-[#f87171] text-sm">{error}</div>}

      {!loading && !error && hasData ? (
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
                  <td key={cat} className="px-4 py-2 text-right text-[#f3f4f6]">
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
    </section>
  );
}

"use client";

import { useMemo, useState } from "react";
import ExpensePieChart from "@/components/charts/ExpensesPieChart";
import { useProjectExpensesByYear } from "@/hooks/useProjectExpensesByYear";
import { allMonths, peso } from "@/utils/expenses";

interface MonthlyExpensesSectionProps {
  projectId: string;
}

export default function MonthlyExpensesSection({ projectId }: MonthlyExpensesSectionProps) {
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

  const pieData = useMemo(
    () =>
      Object.entries(byCategory).map(([category, total]) => ({
        category,
        total,
      })),
    [byCategory]
  );

  const categories = useMemo(() => Object.keys(byCategory).sort(), [byCategory]);

  return (
    <section className="space-y-4">
      {/* Toolbar */}
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

      {/* States */}
      {loading && <div className="text-[#9ca3af] text-sm">Loading expenses…</div>}
      {error && <div className="text-[#f87171] text-sm">{error}</div>}

      {!loading && !error && (
        <>
          {/* Pie Chart */}
          <div className="border border-[#3a3a3a] rounded-xl p-4 bg-[#1f1f1f]">
            {pieData.length > 0 ? (
              <ExpensePieChart data={pieData} />
            ) : (
              <div className="text-[#9ca3af] text-sm text-center">
                No data available for {resolvedYear}.
              </div>
            )}
          </div>

          {/* Table */}
          <div className="border border-[#3a3a3a] rounded-xl overflow-x-auto bg-[#1f1f1f]">
            <table className="min-w-full border-collapse text-sm text-[#d1d5db]">
              <thead className="bg-[#262626] border-b border-[#3a3a3a]">
                <tr>
                  <th className="p-3 font-medium text-left">Month</th>
                  <th className="p-3 font-medium text-right">Total</th>
                  {categories.map((cat) => (
                    <th key={cat} className="p-3 font-medium text-right">
                      {cat}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allMonths.map((month) => (
                  <tr
                    key={month}
                    className="border-b border-[#3a3a3a] last:border-0 hover:bg-[#2a2a2a]/60 transition-colors"
                  >
                    <td className="p-3">{month}</td>
                    <td className="p-3 text-right font-medium">
                      {peso(totalsByMonth[month] ?? 0)}
                    </td>
                    {categories.map((cat) => (
                      <td key={cat} className="p-3 text-right">
                        {peso(byMonth[month]?.[cat] ?? 0)}
                      </td>
                    ))}
                  </tr>
                ))}

                <tr className="bg-[#2a2a2a] font-semibold border-t border-[#3a3a3a]">
                  <td className="p-3">TOTAL</td>
                  <td className="p-3 text-right">{peso(grandTotal)}</td>
                  {categories.map((cat) => (
                    <td key={cat} className="p-3 text-right">
                      {peso(byCategory[cat] ?? 0)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

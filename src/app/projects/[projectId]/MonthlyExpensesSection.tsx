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

  const yearOptions = useMemo(() => {
    if (availableYears.length > 0) {
      return [...availableYears];
    }
    return [currentYear];
  }, [availableYears, currentYear]);

  const selectValue = yearOptions.includes(year) ? year : resolvedYear;

  /** Build data for Pie Chart */
  const pieData = useMemo(
    () =>
      Object.entries(byCategory).map(([category, total]) => ({
        category,
        total,
      })),
    [byCategory]
  );

  /** Build list of all categories in sorted order */
  const categories = useMemo(() => Object.keys(byCategory).sort(), [byCategory]);

  return (
    <section className="space-y-4">
      {/* Toolbar header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
        <h2 className="text-lg font-semibold">Monthly Expenses</h2>

        <div className="flex items-center gap-2 text-sm">
          <label htmlFor="year" className="text-gray-600">
            Year:
          </label>
          <select
            id="year"
            className="border border-gray-300 rounded-md px-2 py-1 text-sm"
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

      {/* Loading & error states */}
      {loading && <div className="text-gray-500 text-sm">Loading expenses…</div>}
      {error && <div className="text-red-600 text-sm">{error}</div>}

      {!loading && !error && (
        <>
          {/* Pie Chart */}
          <div className="border border-gray-200 rounded-lg p-4">
            {pieData.length > 0 ? (
              <ExpensePieChart data={pieData} />
            ) : (
              <div className="text-gray-500 text-sm text-center">
                No data available for {resolvedYear}.
              </div>
            )}
          </div>

          {/* Table */}
          <div className="border border-gray-200 rounded-lg overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-900 text-left border-b">
                  <th className="p-2 font-medium">Month</th>
                  <th className="p-2 font-medium text-right">Total</th>
                  {categories.map((cat) => (
                    <th key={cat} className="p-2 font-medium text-right">
                      {cat}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allMonths.map((month) => (
                  <tr key={month} className="border-b last:border-0">
                    <td className="p-2">{month}</td>
                    <td className="p-2 text-right font-medium">
                      {peso(totalsByMonth[month] ?? 0)}
                    </td>
                    {categories.map((cat) => (
                      <td key={cat} className="p-2 text-right">
                        {peso(byMonth[month]?.[cat] ?? 0)}
                      </td>
                    ))}
                  </tr>
                ))}

                {/* Totals Row */}
                <tr className="bg-gray-900 font-semibold">
                  <td className="p-2">TOTAL</td>
                  <td className="p-2 text-right">{peso(grandTotal)}</td>
                  {categories.map((cat) => (
                    <td key={cat} className="p-2 text-right">
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

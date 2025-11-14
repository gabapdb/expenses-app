"use client";

import { useMonthlyExpensesSectionLogicV2 } from "@/hooks/expenses/v2/useMonthlyExpensesSectionLogicV2";

interface MonthlyExpensesSectionProps {
  projectId: string;
  startDate?: string;
  endDate?: string;
}

export default function MonthlyExpensesSection({
  projectId,
  startDate,
  endDate,
}: MonthlyExpensesSectionProps) {
  const { loading, error, hasData, categories, months, grandTotal } =
    useMonthlyExpensesSectionLogicV2({ projectId, startDate, endDate });

  return (
    <section className="space-y-6">
  

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
                {categories.map((category) => (
                  <th
                    key={category.name}
                    className="px-4 py-2 text-right text-sm font-medium text-[#e5e5e5]"
                  >
                    {category.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {months.map((month) => (
                <tr
                  key={month.month}
                  className="border-b border-[#3a3a3a] hover:bg-[#2a2a2a]/70 transition-colors"
                >
                  <td className="px-4 py-[6px]">{month.month}</td>
                  <td className="px-4 py-[6px] text-right font-medium">
                    {month.total}
                  </td>
                  {month.categories.map((category) => (
                    <td key={category.name} className="px-4 py-[6px] text-right">
                      {category.total}
                    </td>
                  ))}
                </tr>
              ))}

              <tr className="bg-[#2a2a2a] font-semibold border-t border-[#3a3a3a]">
                <td className="px-4 py-2 text-left text-[#e5e5e5] uppercase tracking-wide">
                  Total
                </td>
                <td className="px-4 py-2 text-right text-[#f3f4f6]">
                  {grandTotal}
                </td>
                {categories.map((category) => (
                  <td key={category.name} className="px-4 py-2 text-right text-[#f3f4f6]">
                    {category.total}
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

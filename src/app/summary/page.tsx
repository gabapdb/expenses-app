"use client";

import { useEffect, useState } from "react";
import { allMonths, expensesForMonth } from "@/data/summary.repo";
import MonthlyTrendChart from "@/components/charts/MonthlyTrendChart";
import CategoryPieChart from "@/components/charts/CategoryPieChart";
import TotalsBar from "@/components/TotalsBar";
import CategoryBreakdown from "@/components/CategoryBreakdown";
import { totalPerMonth, totalPerCategory } from "@/utils/analytics";
import Card from "@/components/ui/Card";
import { peso } from "@/utils/format";
import type { Expense } from "@/domain/models";

// Safe state shape for the month-wise map
interface MonthExpenseMap {
  [month: string]: Expense[];
}

export default function SummaryPage() {
  const [months, setMonths] = useState<string[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [dataByMonth, setDataByMonth] = useState<MonthExpenseMap>({});
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Load all month IDs once
  useEffect(() => {
    (async () => {
      const m = await allMonths();
      setMonths(m);
      if (m.length) setSelected(m[m.length - 1]);
    })();
  }, []);

  // Fetch expenses for the selected month
  useEffect(() => {
    (async () => {
      if (!selected) return;
      const ex = await expensesForMonth(selected);
      setExpenses(ex);
      setDataByMonth((prev) => ({ ...prev, [selected]: ex }));
    })();
  }, [selected]);

  const monthlyTotals = totalPerMonth(dataByMonth);
  const categoryTotals = totalPerCategory(expenses);
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-lg font-semibold">Summary</h1>

      <Card>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm text-gray-700">Month:</label>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            {months.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </Card>

      <TotalsBar
        totalProjects={1}
        totalSpent={totalSpent}
        perCategory={categoryTotals}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MonthlyTrendChart data={monthlyTotals} />
        <CategoryPieChart data={categoryTotals} />
      </div>

      <CategoryBreakdown data={categoryTotals} />
    </div>
  );
}

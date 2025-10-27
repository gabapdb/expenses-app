"use client";
import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import CategoryBreakdown from "@/components/CategoryBreakdown";
import TotalsBar from "@/components/TotalsBar";
import { allMonths, expensesForMonth } from "@/data/summary.repo";
import { expensesByCategory } from "@/domain/compute";
import { peso } from "@/utils/format";

export default function SummaryPage() {
  const [months, setMonths] = useState<string[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [spent, setSpent] = useState<number>(0);
  const [byCat, setByCat] = useState<{ category: string; total: number }[]>([]);

  useEffect(() => {
    allMonths().then((ms) => {
      setMonths(ms);
      if (ms.length > 0) setSelected(ms[ms.length - 1]);
    });
  }, []);

  useEffect(() => {
    if (!selected) return;
    (async () => {
      const ex = await expensesForMonth(selected);
      setSpent(ex.reduce((s, e) => s + e.amount, 0));
      setByCat(expensesByCategory(ex));
    })();
  }, [selected]);

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center gap-3">
          <div className="text-sm">Month</div>
          <select
            className="rounded-lg border px-2 py-1 text-sm"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            {months.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <div className="ml-auto text-sm">
            Spent: <span className="font-semibold">{peso(spent)}</span>
          </div>
        </div>
      </Card>
      <CategoryBreakdown data={byCat} />
      <TotalsBar totalProjects={0} totalSpent={spent} perCategory={byCat} />
    </div>
  );
}

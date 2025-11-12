"use client";

import { useMemo, useState } from "react";
import { useProjects } from "@/hooks/projects/useProjects";
import { useCategories } from "@/hooks/expenses/useCategories";
import { CATEGORY_MAP } from "@/config/categories";
import { useRealtimeExpenses } from "@/hooks/expenses/useRealtimeExpenses";
import { deleteExpense, updateExpensePaid } from "@/data/expenses.repo";
import { invalidateProjectExpenses } from "@/hooks/expenses/useProjectExpensesCollection";
import { getFirstZodError } from "@/utils/zodHelpers";
import type { Expense } from "@/domain/models";

import ExpensesTable from "@/features/expenses/components/ExpensesTable";
import ExpenseForm from "@/features/expenses/components/ExpenseForm";
import ExpenseEditModal from "@/features/expenses/components/ExpenseEditModal";
import MonthTabs from "@/features/expenses/components/MonthTabs";
import YearPicker from "@/components/ui/YearPicker";

/* -------------------------------------------------------------------------- */
/* 🧩 Props                                                                   */
/* -------------------------------------------------------------------------- */
export interface ExpensesGridProps {
  yyyyMM: string;
  selectedYear: number;
  selectedMonth: string;
  availableYears: number[];
  onMonthChange: (yyyyMM: string) => void;
  onYearChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  loadingYears: boolean;
  yearError?: string | null;
}

/* -------------------------------------------------------------------------- */
/* 🧱 Component                                                               */
/* -------------------------------------------------------------------------- */
export default function ExpensesGrid({
  yyyyMM,
  selectedYear,
  selectedMonth,
  onMonthChange,
  onYearChange,
  loadingYears,
  yearError,
}: ExpensesGridProps) {
  const { data: projects } = useProjects();
  const { categoryMap } = useCategories();
  const { data: expenses, loading } = useRealtimeExpenses(yyyyMM);

  const [error, setError] = useState<string | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const categorySource =
    Object.keys(categoryMap).length > 0 ? categoryMap : CATEGORY_MAP;

  const months = useMemo(
    () =>
      Array.from({ length: 12 }, (_, m) => ({
        name: new Date(0, m).toLocaleString("default", { month: "long" }),
        value: `${selectedYear}${String(m + 1).padStart(2, "0")}`,
      })),
    [selectedYear]
  );

  async function handleTogglePaid(expense: Expense) {
    try {
      await updateExpensePaid(yyyyMM, expense.id, !expense.paid, {});
      void invalidateProjectExpenses(expense.projectId);
    } catch (err) {
      const msg = getFirstZodError(err) ?? "Failed to toggle paid state.";
      setError(msg);
      console.error("[ExpensesGrid] togglePaid error:", msg);
    }
  }

  async function handleDelete(expense: Expense) {
    try {
      await deleteExpense(yyyyMM, expense.id);
      void invalidateProjectExpenses(expense.projectId);
    } catch (err) {
      const msg = getFirstZodError(err) ?? "Failed to delete expense.";
      setError(msg);
      console.error("[ExpensesGrid] deleteExpense error:", msg);
    }
  }

  /* ---------------------------------------------------------------------- */
  /* 🖼️ Render                                                              */
  /* ---------------------------------------------------------------------- */
  return (
    <div className="space-y-8 text-[#e5e5e5]">
      <ExpenseForm
        yyyyMM={yyyyMM}
        projects={projects}
        categorySource={categorySource}
        onError={setError}
      />

      {/* --- Month Tabs + Year Picker --- */}
      <div className="flex items-end justify-between border-b border-[#3a3a3a] bg-[#1f1f1f]">
        <MonthTabs
          months={months}
          currentMonth={selectedMonth}
          onChange={(val: string) => onMonthChange(val)}
        />

        <div className="px-4 pb-[6px]">
          {loadingYears ? (
            <div className="text-[#9ca3af] text-sm">Loading…</div>
          ) : yearError ? (
            <div className="text-[#f87171] text-sm">{yearError}</div>
          ) : (
            <YearPicker
              value={selectedYear}
              onChange={(y) =>
                onYearChange({
                  target: { value: y.toString() },
                } as React.ChangeEvent<HTMLSelectElement>)
              }
              mode="expenses"
              className="w-28"
            />
          )}
        </div>
      </div>

      <ExpensesTable
        expenses={expenses}
        projects={projects}
        loading={loading}
        onTogglePaid={handleTogglePaid}
        onEdit={(e) => setEditingExpense(e)}
        onDelete={handleDelete}
      />

      {error && <div className="text-sm text-[#f87171] font-medium">{error}</div>}

      {editingExpense && (
        <ExpenseEditModal
          yyyyMM={editingExpense.yyyyMM ?? yyyyMM}
          expense={editingExpense}
          projects={projects}
          categorySource={categorySource}
          onClose={() => setEditingExpense(null)}
          onSaved={() => setEditingExpense(null)}
        />
      )}
    </div>
  );
}

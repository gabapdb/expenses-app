"use client";

import { useMemo, useState } from "react";
import { useProjects } from "@/hooks/useProjects";
import { useCategories } from "@/hooks/useCategories";
import { CATEGORY_MAP } from "@/config/categories";
import { useRealtimeExpenses } from "@/hooks/useRealtimeExpenses";
import { deleteExpense, updateExpensePaid } from "@/data/expenses.repo";
import { invalidateProjectExpenses } from "@/hooks/useProjectExpensesCollection";
import { getFirstZodError } from "@/utils/zodHelpers";

import type { Expense } from "@/domain/models";
import ExpensesTable from "@/components/ExpensesTable";
import ExpenseForm from "@/components/ExpenseForm";
import MonthTabs from "@/components/MonthTabs";
import ExpenseEditModal from "@/components/ExpenseEditModal";

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */
export default function ExpensesGrid({ yyyyMM }: { yyyyMM: string }) {
  const { data: projects } = useProjects();
  const { categoryMap } = useCategories();
  const { data: expenses, loading } = useRealtimeExpenses(yyyyMM);

  const [error, setError] = useState<string | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  /* ---------------------------------------------------------------------- */
  /* Derived state                                                          */
  /* ---------------------------------------------------------------------- */
  const categorySource =
    Object.keys(categoryMap).length > 0 ? categoryMap : CATEGORY_MAP;

  const year = useMemo(() => yyyyMM.slice(0, 4), [yyyyMM]);
  const months = useMemo(
    () =>
      Array.from({ length: 12 }, (_, m) => ({
        name: new Date(0, m).toLocaleString("default", { month: "long" }),
        value: `${year}${String(m + 1).padStart(2, "0")}`,
      })),
    [year]
  );
  const currentMonth = yyyyMM.slice(4, 6);

  /* ---------------------------------------------------------------------- */
  /* Handlers                                                               */
  /* ---------------------------------------------------------------------- */
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
  /* Render                                                                 */
  /* ---------------------------------------------------------------------- */
  return (
    <div className="space-y-8 text-[#e5e5e5]">
      {/* --- Add Form --- */}
      <ExpenseForm
        yyyyMM={yyyyMM}
        projects={projects}
        categorySource={categorySource}
        onError={setError}
      />

      {/* --- Month Tabs --- */}
      <MonthTabs months={months} currentMonth={currentMonth} />

      {/* --- Table --- */}
      <ExpensesTable
  expenses={expenses}
  projects={projects}
  loading={loading}
  onTogglePaid={handleTogglePaid}
  onEdit={(e) => setEditingExpense(e)}
  onDelete={handleDelete} // ✅ new
/>

      {/* --- Error Banner --- */}
      {error && (
        <div className="text-sm text-[#f87171] font-medium">{error}</div>
      )}

      {/* --- Edit Modal --- */}
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

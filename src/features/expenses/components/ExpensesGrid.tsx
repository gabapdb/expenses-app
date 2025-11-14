"use client";

import ExpensesTable from "@/features/expenses/components/ExpensesTable";
import ExpenseForm from "@/features/expenses/components/ExpenseForm";
import ExpenseEditModal from "@/features/expenses/components/ExpenseEditModal";
import MonthTabs from "@/features/expenses/components/MonthTabs";
import YearPicker from "@/components/ui/YearPicker";
import { useExpensesGridLogicV2 } from "@/hooks/expenses/v2/useExpensesGridLogicV2";
import { useExpenseDate } from "@/context/ExpenseDateContext";

/* -------------------------------------------------------------------------- */
/* 🧩 Props                                                                   */
/* -------------------------------------------------------------------------- */
export interface ExpensesGridProps {
  yyyyMM: string;
  projectId?: string;
}

/* -------------------------------------------------------------------------- */
/* 🧱 Component                                                               */
/* -------------------------------------------------------------------------- */
export default function ExpensesGrid({
  yyyyMM,
  projectId,
}: ExpensesGridProps) {
  const { selectedYear, loadingYears, yearError } = useExpenseDate();

  const {
    projects,
    expenses,
    expensesLoading,
    categorySource,
    error,
    setError,
    isEditModalOpen,
    editingExpense,
    openEdit,
    closeEdit,
    handleTogglePaid,
    handleDelete,
  } = useExpensesGridLogicV2({
    yyyyMM,
    selectedYear,
    projectId,
  });

  /* ---------------------------------------------------------------------- */
  /* 🖼️ Render                                                              */
  /* ---------------------------------------------------------------------- */
  return (
    <div className="space-y-2 text-[#e5e5e5]">
      <ExpenseForm
        yyyyMM={yyyyMM}
        projects={projects}
        categorySource={categorySource}
        onError={setError}
      />

      {/* --- Month Tabs + Year Picker --- */}
      <div className="flex items-end justify-between border-b border-[#3a3a3a] bg-[#121212]">
        <MonthTabs />

        <div className="px-0 pb-[2px]">
          {loadingYears ? (
            <div className="text-[#9ca3af] text-sm">Loading…</div>
          ) : yearError ? (
            <div className="text-[#f87171] text-sm">{yearError}</div>
          ) : (
            <YearPicker mode="expenses" className="w-28" />
          )}
        </div>
      </div>

      <ExpensesTable
        expenses={expenses}
        projects={projects}
        loading={expensesLoading}
        onTogglePaid={handleTogglePaid}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      {error && <div className="text-sm text-[#f87171] font-medium">{error}</div>}

      {isEditModalOpen && editingExpense && (
        <ExpenseEditModal
          yyyyMM={editingExpense.yyyyMM ?? yyyyMM}
          expense={editingExpense}
          projects={projects}
          categorySource={categorySource}
          onClose={closeEdit}
          onSaved={closeEdit}
        />
      )}
    </div>
  );
}

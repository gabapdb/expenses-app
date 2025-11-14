"use client";

import ExpensesTable from "@/features/expenses/components/ExpensesTable";
import ExpenseForm from "@/features/expenses/components/ExpenseForm";
import ExpenseEditModal from "@/features/expenses/components/ExpenseEditModal";
import MonthTabs from "@/features/expenses/components/MonthTabs";
import YearPicker from "@/components/ui/YearPicker";
import { useExpensesGridLogicV2 } from "@/hooks/expenses/v2/useExpensesGridLogicV2";

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
  availableYears,
  onMonthChange,
  onYearChange,
  loadingYears,
  yearError,
}: ExpensesGridProps) {
  const {
    projects,
    expenses,
    expensesLoading,
    categorySource,
    months,
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
        <MonthTabs
          months={months}
          currentMonth={selectedMonth}
          onChange={(val: string) => onMonthChange(val)}
        />

        <div className="px-0 pb-[2px]">
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
              years={availableYears}
            />
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

"use client";

import type { Expense } from "@/domain/models";
import Checkbox from "@/components/ui/Checkbox";
import Button from "@/components/ui/Button";
import ExpenseEditModal from "@/features/expenses/components/ExpenseEditModal";
import { useExpenseRowLogicV2 } from "@/hooks/expenses/v2/useExpenseRowLogicV2";

interface ExpenseRowProps {
  yyyyMM: string;
  expense?: Expense;
  projectId?: string;
  onChange?: () => void;
  projects?: { id: string; name: string }[];
  categorySource?: Record<string, readonly string[]>;
}

export default function ExpenseRow({
  yyyyMM,
  expense,
  projectId,
  onChange,
  projects,
  categorySource,
}: ExpenseRowProps) {
  const {
    paid,
    formatted,
    canCreate,
    newExpenseDraft,
    isAdding,
    isEditing,
    isToggling,
    onTogglePaid,
    onEdit,
    openAdd,
    closeAdd,
    handleAddSaved,
    closeEdit,
    handleEditSaved,
  } = useExpenseRowLogicV2({
    expense,
    yyyyMM,
    projectId,
    onChange,
  });

  if (!expense) {
    return (
      <div className="border-b py-3 flex items-center justify-center">
        <Button
          type="button"
          className="bg-black text-white px-4 py-2 rounded hover:bg-black"
          onClick={openAdd}
          disabled={!canCreate}
        >
          + Add new expense
        </Button>

        {isAdding && newExpenseDraft && (
          <ExpenseEditModal
            yyyyMM={yyyyMM}
            expense={newExpenseDraft}
            projects={projects}
            categorySource={categorySource}
            onClose={closeAdd}
            onSaved={() => {
              handleAddSaved();
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-6 gap-2 items-center border-b py-2 text-sm">
      <div className="truncate">{expense.payee}</div>
      <div className="truncate">{expense.category}</div>
      <div className="truncate">{expense.details ?? "—"}</div>
      <div className="text-right">{formatted.amount}</div>
      <div className="flex items-center justify-center">
        <Checkbox
          name="paid"
          checked={paid}
          onChange={() => {
            void onTogglePaid();
          }}
          disabled={isToggling}
        />
      </div>
      <div className="flex justify-end">
        <Button
          type="button"
          className="bg-gray-200 text-gray-800 hover:bg-gray-200 px-2 py-1 rounded"
          disabled={isToggling}
          onClick={onEdit}
        >
          Edit
        </Button>
      </div>

      {isEditing && (
        <ExpenseEditModal
          yyyyMM={yyyyMM}
          expense={expense}
          projects={projects}
          categorySource={categorySource}
          onClose={closeEdit}
          onSaved={() => {
            handleEditSaved();
          }}
        />
      )}
    </div>
  );
}


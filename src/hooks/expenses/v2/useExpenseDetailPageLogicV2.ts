import { useEffect, useMemo, useReducer, useState } from "react";
import { useParams } from "next/navigation";

import type { Expense } from "@/domain/models";
import { useExpense } from "@/hooks/expenses/useExpense";
import { peso } from "@/utils/format";

interface FieldEntry {
  label: string;
  value: string;
}

export interface UseExpenseDetailPageLogicV2Result {
  loading: boolean;
  error: string | null;
  expense: Expense | null;
  yyyyMM: string;
  expenseId: string;
  fields: FieldEntry[];
  subtitle: string;
  editing: boolean;
  openEdit: () => void;
  closeEdit: () => void;
  handleSaved: (updated: Expense) => void;
}

type ExpenseAction =
  | { type: "sync"; payload: Expense | null }
  | { type: "update"; payload: Expense };

function expenseStateReducer(
  state: Expense | null,
  action: ExpenseAction
): Expense | null {
  switch (action.type) {
    case "sync": {
      const next = action.payload;
      if (!next) return null;
      if (!state) return next;
      if (state.id !== next.id) return next;
      if ((state.updatedAt ?? 0) >= (next.updatedAt ?? 0)) return state;
      return next;
    }
    case "update":
      return action.payload;
    default:
      return state;
  }
}

export function useExpenseDetailPageLogicV2(): UseExpenseDetailPageLogicV2Result {
  const params = useParams<{ yyyyMM: string; expenseId: string }>();
  const yyyyMM = params?.yyyyMM ?? "";
  const expenseId = params?.expenseId ?? "";

  const { data: fetchedExpense, loading, error } = useExpense(yyyyMM, expenseId);
  const [expense, dispatchExpense] = useReducer(expenseStateReducer, null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    dispatchExpense({ type: "sync", payload: fetchedExpense ?? null });
  }, [fetchedExpense]);

  const fields = useMemo<FieldEntry[]>(() => {
    if (!expense) {
      return [];
    }

    return [
      { label: "Payee", value: expense.payee },
      { label: "Category", value: expense.category },
      { label: "Sub-Category", value: expense.subCategory ?? "—" },
      { label: "Details", value: expense.details ?? "—" },
      { label: "Mode of Payment", value: expense.modeOfPayment ?? "—" },
      { label: "Invoice Date", value: expense.invoiceDate },
      { label: "Date Paid", value: expense.datePaid ?? "—" },
      { label: "Amount", value: peso(expense.amount) },
      { label: "Paid", value: expense.paid ? "✅ Yes" : "❌ No" },
    ];
  }, [expense]);

  const subtitle = expense?.payee ?? "";

  const openEdit = (): void => setEditing(true);
  const closeEdit = (): void => setEditing(false);
  const handleSaved = (updated: Expense): void => {
    dispatchExpense({ type: "update", payload: updated });
    setEditing(false);
  };

  return {
    loading,
    error,
    expense,
    yyyyMM,
    expenseId,
    fields,
    subtitle,
    editing,
    openEdit,
    closeEdit,
    handleSaved,
  };
}

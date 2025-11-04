"use client";

import { useEffect, useReducer, useState } from "react";
import { useParams } from "next/navigation";
import { useExpense } from "@/hooks/useExpense";
import Card from "@/components/ui/Card";
import { peso } from "@/utils/format";
import ExpenseEditModal from "@/components/ExpenseEditModal";
import type { Expense } from "@/domain/models";

export default function ExpenseDetailPage() {
  const params = useParams<{ yyyyMM: string; expenseId: string }>();
  const yyyyMM = params?.yyyyMM ?? "";
  const expenseId = params?.expenseId ?? "";

  const { data: fetchedExpense, loading, error } = useExpense(yyyyMM, expenseId);
  const [expense, dispatchExpense] = useReducer(expenseStateReducer, null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    dispatchExpense({ type: "sync", payload: fetchedExpense ?? null });
  }, [fetchedExpense]);

  if (loading) return <div className="p-6 text-gray-500">Loading expense…</div>;
  if (error) return <div className="p-6 text-red-500 text-sm">{error}</div>;
  if (!expense)
    return (
      <div className="p-6 text-gray-500 text-sm">
        No expense found with ID {expenseId}.
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">Expense Details</h1>
        <button
          onClick={() => setEditing(true)}
          className="text-sm bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-black"
        >
          ✏️ Edit
        </button>
      </div>

      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <Field label="Payee" value={expense.payee} />
          <Field label="Category" value={expense.category} />
          <Field label="Sub-Category" value={expense.subCategory ?? "—"} />
          <Field label="Details" value={expense.details ?? "—"} />
          <Field label="Mode of Payment" value={expense.modeOfPayment ?? "—"} />
          <Field label="Invoice Date" value={expense.invoiceDate} />
          <Field label="Date Paid" value={expense.datePaid ?? "—"} />
          <Field label="Amount" value={peso(expense.amount)} />
          <Field label="Paid" value={expense.paid ? "✅ Yes" : "❌ No"} />
        </div>
      </Card>

      {editing && (
        <ExpenseEditModal
          yyyyMM={yyyyMM}
          expense={expense}
          onClose={() => setEditing(false)}
          onSaved={(updated) => {
            dispatchExpense({ type: "update", payload: updated });
            setEditing(false);
          }}
        />
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="font-medium text-gray-900 break-words">{value}</div>
    </div>
  );
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
      if (!next) {
        return null;
      }

      if (!state) {
        return next;
      }

      if (state.id !== next.id) {
        return next;
      }

      if ((state.updatedAt ?? 0) >= (next.updatedAt ?? 0)) {
        return state;
      }

      return next;
    }
    case "update":
      return action.payload;
    default:
      return state;
  }
}

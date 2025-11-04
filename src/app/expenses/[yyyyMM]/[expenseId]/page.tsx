"use client";

import { useEffect, useReducer, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useExpense } from "@/hooks/useExpense";
import Card from "@/components/ui/Card";
import { peso } from "@/utils/format";
import ExpenseEditModal from "@/components/ExpenseEditModal";
import SectionHeader from "@/components/ui/SectionHeader";
import type { Expense } from "@/domain/models";
import "@/styles/pages.css";

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

  if (loading)
    return <div className="panel text-muted">Loading expense…</div>;
  if (error)
    return <div className="panel text-error text-sm">{error}</div>;
  if (!expense)
    return (
      <div className="panel text-muted text-sm">
        No expense found with ID {expenseId}.
      </div>
    );

  return (
    <motion.div
      className="page-container"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <SectionHeader title="Expense Details" subtitle={expense.payee ?? ""} />

      <div className="panel mt-4 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-base font-semibold text-gray-100">Expense Info</h1>
          <button
            onClick={() => setEditing(true)}
            className="text-xs bg-gray-800 text-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-700"
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
    </motion.div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-gray-400">{label}</div>
      <div className="font-medium text-gray-200 break-words">{value}</div>
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

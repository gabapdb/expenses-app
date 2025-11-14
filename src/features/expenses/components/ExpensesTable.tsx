"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { peso } from "@/utils/format";
import type { Expense } from "@/domain/models";
import { useExpensesTableLogicV2 } from "@/hooks/expenses/v2/useExpensesTableLogicV2";

const fmtDateInput = (iso?: string) =>
  iso ? new Date(iso).toISOString().slice(0, 10) : "";

export default function ExpensesTable({
  expenses,
  projects,
  loading,
  onTogglePaid,
  onEdit,
  onDelete,
}: {
  expenses: Expense[];
  projects: { id: string; name: string }[];
  loading: boolean;
  onTogglePaid: (expense: Expense) => void;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}) {
  const { rows, isEmpty } = useExpensesTableLogicV2({ expenses, projects });
  const [pendingDelete, setPendingDelete] = useState<Expense | null>(null);

  if (loading)
    return (
      <div className="text-[#9ca3af] text-sm px-4 pb-4">Loading expenses…</div>
    );

  if (isEmpty)
    return (
      <div className="text-[#9ca3af] text-sm px-4 pb-4">
        No expenses yet for this month.
      </div>
    );

  return (
    <div className="overflow-x-auto border border-[#3a3a3a] bg-[#242424] rounded-md shadow-sm">
      <div className="px-2">
        <table className="min-w-full text-sm border-collapse text-[#e5e5e5] table-fixed">
          <thead>
            <tr className="bg-[#242424] border-b border-[#3a3a3a] text-left">
              {["Project", "Invoice Date", "Date Paid", "Mode", "Payee", "Category", "Subcategory", "Details", "Amount", "Paid", "Actions"].map(
                (h) => (
                  <th
                    key={h}
                    className="p-2 text-[#9ca3af] text-left font-normal"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            {rows.map(({ expense: rowExpense, projectName }) => (
              <tr
                key={rowExpense.id}
                onClick={() => onEdit(rowExpense)}
                className="border-b border-[#3a3a3a] hover:bg-[#2a2a2a] transition-colors cursor-pointer"
              >
                <td className="p-2 text-left">{projectName}</td>
                <td className="p-2 text-left">{fmtDateInput(rowExpense.invoiceDate)}</td>
                <td className="p-2 text-left">{fmtDateInput(rowExpense.datePaid)}</td>
                <td className="p-2 text-left">{rowExpense.modeOfPayment || "—"}</td>
                <td className="p-2 text-left">{rowExpense.payee || "—"}</td>
                <td className="p-2 text-left">{rowExpense.category || "—"}</td>
                <td className="p-2 text-left">{rowExpense.subCategory || "—"}</td>
                <td className="p-2 text-left">{rowExpense.details || "—"}</td>
                <td className="p-2 text-left">{peso(rowExpense.amount)}</td>
                <td
                  className="p-2 text-left"
                  onClick={(evt) => evt.stopPropagation()}
                >
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!rowExpense.paid}
                      onChange={() => onTogglePaid(rowExpense)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-[#3a3a3a] rounded-full peer-checked:bg-[#6366f1] transition-all" />
                    <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-[#e5e5e5] rounded-full transition-transform peer-checked:translate-x-4" />
                  </label>
                </td>
                <td
                  className="p-2 text-left"
                  onClick={(evt) => evt.stopPropagation()}
                >
                  <Button
                    type="button"
                    onClick={() => setPendingDelete(rowExpense)}
                    className="bg-[#b91c1c] text-white hover:bg-[#dc2626] text-xs px-2 py-0.5 rounded-md"
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!pendingDelete}
        danger
        title="Delete Expense"
        message={`Are you sure you want to delete ${
          pendingDelete?.details || "this expense"
        }? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={() => {
          if (pendingDelete) onDelete(pendingDelete);
          setPendingDelete(null);
        }}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}


"use client";

import { useEffect, useMemo, useState } from "react";
import { updateExpensePaid } from "@/data/expenses.repo";
import { invalidateProjectExpenses } from "@/hooks/useProjectExpensesCollection";
import type { Expense } from "@/domain/models";
import Checkbox from "@/components/ui/Checkbox";
import Button from "@/components/ui/Button";
import { peso } from "@/utils/format";
import ExpenseEditModal from "@/components/ExpenseEditModal";

interface ExpenseRowProps {
  yyyyMM: string;
  expense?: Expense;
  projectId?: string;
  onChange?: () => void;
}

export default function ExpenseRow({
  yyyyMM,
  expense,
  projectId,
  onChange,
}: ExpenseRowProps) {
  const [paid, setPaid] = useState<boolean>(expense?.paid ?? false);
  const [saving, setSaving] = useState<boolean>(false);
  const [adding, setAdding] = useState<boolean>(false);
  const [editing, setEditing] = useState<boolean>(false);

  const resolvedProjectId = useMemo(
    () => expense?.projectId ?? projectId ?? "",
    [expense?.projectId, projectId]
  );

  useEffect(() => {
    setPaid(expense?.paid ?? false);
  }, [expense?.id, expense?.paid]);

  const handlePaid = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;

    if (!expense?.id || !yyyyMM) {
      console.warn("⚠️ Missing expense.id or yyyyMM", { expense, yyyyMM });
      return;
    }

    try {
      setSaving(true);
      setPaid(checked);
      await updateExpensePaid(yyyyMM, expense.id, checked, {});
      void invalidateProjectExpenses(resolvedProjectId);
      onChange?.();
    } catch (err) {
      console.error("[ExpenseRow] Failed to update paid state:", err);
      setPaid(!checked);
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- Add-new button variant ---------------- */
  if (!expense) {
    const canCreate = Boolean(resolvedProjectId);

    return (
      <div className="border-b py-3 flex items-center justify-center">
        <Button
          type="button"
          className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-black"
          onClick={() => {
            if (!canCreate) {
              console.error(
                "[ExpenseRow] Cannot create expense without a projectId"
              );
              return;
            }

            setAdding(true);
          }}
          disabled={!canCreate}
        >
          + Add new expense
        </Button>

        {adding && (
          <ExpenseEditModal
            yyyyMM={yyyyMM}
            expense={{
                id: crypto.randomUUID(),
                projectId: resolvedProjectId,
                yyyyMM,
                payee: "",
                category: "",
                subCategory: "",
                details: "",
                modeOfPayment: "",
                invoiceDate: "",
                datePaid: "",
                amount: 0,
                paid: false,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            } as Expense}
            onClose={() => setAdding(false)}
            onSaved={() => {
              setAdding(false);
              onChange?.();
            }}
          />
        )}
      </div>
    );
  }

  /* ---------------- Existing expense row ---------------- */
  return (
    <div className="grid grid-cols-6 gap-2 items-center border-b py-2 text-sm">
      <div className="truncate">{expense.payee}</div>
      <div className="truncate">{expense.category}</div>
      <div className="truncate">{expense.details ?? "—"}</div>
      <div className="text-right">{peso(expense.amount)}</div>
      <div className="flex items-center justify-center">
        <Checkbox
          name="paid"
          checked={paid}
          onChange={handlePaid}
          disabled={saving}
        />
      </div>
      <div className="flex justify-end">
        <Button
          type="button"
          className="bg-gray-100 text-gray-800 hover:bg-gray-200 px-2 py-1 rounded"
          disabled={saving}
          onClick={() => setEditing(true)}
        >
          Edit
        </Button>
      </div>

      {editing && (
        <ExpenseEditModal
          yyyyMM={yyyyMM}
          expense={expense}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            onChange?.();
          }}
        />
      )}
    </div>
  );
}

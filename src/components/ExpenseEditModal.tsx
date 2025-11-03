"use client";

import { useState } from "react";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { z } from "zod";
import { db } from "@/core/firebase";
import { ExpenseSchema, type Expense } from "@/domain/models";
import Input from "@/components/ui/Input";
import Checkbox from "@/components/ui/Checkbox";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { isoDateToYYYYMM } from "@/utils/time";

interface ExpenseEditModalProps {
  yyyyMM: string;
  expense: Expense;
  onClose: () => void;
  onSaved?: (saved: Expense) => void;
}

export default function ExpenseEditModal({
  yyyyMM,
  expense,
  onClose,
  onSaved,
}: ExpenseEditModalProps) {
  const [values, setValues] = useState<Expense>(expense);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target;
    const { name, value } = target;
    const isCheckbox =
      target instanceof HTMLInputElement && target.type === "checkbox";
    const newValue = isCheckbox
      ? (target as HTMLInputElement).checked
      : value;

    setValues((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const trimmedProjectId = values.projectId?.trim();
      if (!trimmedProjectId) {
        throw new Error("Project is required.");
      }

      const trimmedCategory = values.category?.trim() ?? "";
      if (!trimmedCategory) {
        throw new Error("Category is required.");
      }

      const trimmedSubCategory = values.subCategory?.trim() ?? "";
      if (!trimmedSubCategory) {
        throw new Error("Sub-category is required.");
      }

      // ✅ Normalize values before Zod validation
      const targetMonth =
        isoDateToYYYYMM(values.datePaid) ??
        isoDateToYYYYMM(values.invoiceDate) ??
        yyyyMM;

      const normalized = {
        ...values,
        projectId: trimmedProjectId,
        category: trimmedCategory,
        subCategory: trimmedSubCategory,
        yyyyMM: targetMonth,
        amount: Number(values.amount) || 0,
        paid: Boolean(values.paid),
        updatedAt: Date.now(),
        createdAt: values.createdAt ?? Date.now(),
      };

      // ✅ Validate shape via Zod
      const parsed = ExpenseSchema.parse(normalized);

      const destinationRef = doc(db, "expenses", parsed.yyyyMM, "items", parsed.id);

      // ✅ Save to Firestore (move document when month changes)
      await setDoc(destinationRef, parsed, { merge: true });

      if (parsed.yyyyMM !== yyyyMM) {
        const sourceRef = doc(db, "expenses", yyyyMM, "items", parsed.id);
        await deleteDoc(sourceRef);
      }

      onSaved?.(parsed);
      onClose();
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError("Please fill in all required fields.");
        console.error(
          "[ExpenseEditModal] Zod validation error:",
          err.flatten().fieldErrors
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unknown error saving expense.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <Card className="w-full max-w-lg bg-white p-6 relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Edit Expense</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 text-sm"
          >
            ✕
          </button>
        </div>

        {error && <div className="text-red-500 text-sm mb-3">{error}</div>}

        <div className="space-y-3">
          <Input
            name="payee"
            placeholder="Payee"
            value={values.payee ?? ""}
            onChange={handleChange}
          />
          <Input
            name="category"
            placeholder="Category"
            value={values.category ?? ""}
            onChange={handleChange}
          />
          <Input
            name="subCategory"
            placeholder="Sub-Category"
            value={values.subCategory ?? ""}
            onChange={handleChange}
          />
          <Input
            name="details"
            placeholder="Details"
            value={values.details ?? ""}
            onChange={handleChange}
          />
          <Input
            name="modeOfPayment"
            placeholder="Mode of Payment"
            value={values.modeOfPayment ?? ""}
            onChange={handleChange}
          />
          <Input
            name="invoiceDate"
            type="date"
            placeholder="Invoice Date"
            value={(values.invoiceDate ?? "").slice(0, 10)}
            onChange={handleChange}
          />
          <Input
            name="datePaid"
            type="date"
            placeholder="Date Paid"
            value={(values.datePaid ?? "").slice(0, 10)}
            onChange={handleChange}
          />
          <Input
            name="amount"
            type="number"
            placeholder="Amount"
            value={String(values.amount ?? 0)}
            onChange={handleChange}
          />

          <div className="flex items-center gap-2">
            <Checkbox
              name="paid"
              checked={!!values.paid}
              onChange={handleChange}
            />
            <span className="text-sm text-gray-700">Paid</span>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button
            type="button"
            onClick={onClose}
            className="bg-gray-200 text-gray-800 hover:bg-gray-300"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="bg-gray-900 text-white hover:bg-black"
          >
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

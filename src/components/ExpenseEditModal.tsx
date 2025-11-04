"use client";

import { useEffect, useMemo, useState } from "react";
import { doc, setDoc, writeBatch } from "firebase/firestore";
import { z } from "zod";
import { db } from "@/core/firebase";
import { ExpenseSchema, type Expense } from "@/domain/models";
import Input from "@/components/ui/Input";
import Checkbox from "@/components/ui/Checkbox";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { isoDateToYYYYMM } from "@/utils/time";
import { invalidateProjectExpenses } from "@/hooks/useProjectExpensesCollection";

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
  const [isDirty, setIsDirty] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState(expense.updatedAt ?? 0);

  const memoizedTrimmedFields = useMemo(
    () => ({
      projectId: values.projectId?.trim() ?? "",
      category: values.category?.trim() ?? "",
      subCategory: values.subCategory?.trim() ?? "",
    }),
    [values.projectId, values.category, values.subCategory]
  );

  const memoizedValidationHints = useMemo(() => {
    const missing: string[] = [];

    if (!memoizedTrimmedFields.projectId) {
      missing.push("Project");
    }
    if (
      typeof values.invoiceDate !== "string" ||
      values.invoiceDate.trim().length === 0
    ) {
      missing.push("Invoice Date");
    }
    if (!memoizedTrimmedFields.category) {
      missing.push("Category");
    }
    if (!memoizedTrimmedFields.subCategory) {
      missing.push("Sub-category");
    }

    if (!Number.isFinite(values.amount) || values.amount < 0) {
      missing.push("Amount");
    }

    return {
      missing,
      isValid: missing.length === 0,
    };
  }, [memoizedTrimmedFields, values.amount, values.invoiceDate]);

  useEffect(() => {
    const incomingUpdatedAt = expense.updatedAt ?? 0;

    if (expense.id !== values.id) {
      setValues(expense);
      setIsDirty(false);
      setLastSyncedAt(incomingUpdatedAt);
      return;
    }

    if (!isDirty) {
      setValues(expense);
      setLastSyncedAt(incomingUpdatedAt);
      return;
    }

    if (incomingUpdatedAt > lastSyncedAt) {
      setValues(expense);
      setIsDirty(false);
      setLastSyncedAt(incomingUpdatedAt);
    }
  }, [expense, isDirty, lastSyncedAt, values.id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target;
    const { name, value } = target;
    const isCheckbox =
      target instanceof HTMLInputElement && target.type === "checkbox";

    setValues((prev) => {
      const next = { ...prev };
      let changed = false;

      switch (name) {
        case "paid":
          {
            const nextPaid = isCheckbox
              ? (target as HTMLInputElement).checked
              : Boolean(value);
            if (nextPaid !== prev.paid) {
              next.paid = nextPaid;
              changed = true;
            }
          }
          break;
        case "amount": {
          if (typeof value === "string" && value.trim() === "") {
            if (prev.amount !== 0) {
              next.amount = 0;
              changed = true;
            }
          } else {
            const numeric = Number(value);
            if (Number.isFinite(numeric) && numeric !== prev.amount) {
              next.amount = numeric;
              changed = true;
            }
          }
          break;
        }
        default:
          if ((next as Record<string, unknown>)[name] !== value) {
            (next as Record<string, unknown>)[name] = value;
            changed = true;
          }
      }

      if (!changed) {
        return prev;
      }

      if (!isDirty) {
        setIsDirty(true);
      }

      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      if (!memoizedValidationHints.isValid) {
        throw new Error(
          `Please complete the following before saving: ${memoizedValidationHints.missing.join(", ")}`
        );
      }

      const trimmedProjectId = memoizedTrimmedFields.projectId;
      if (!trimmedProjectId) {
        throw new Error("Project is required.");
      }

      const trimmedInvoiceDate =
        typeof values.invoiceDate === "string"
          ? values.invoiceDate.trim()
          : "";
      if (!trimmedInvoiceDate) {
        throw new Error("Invoice date is required.");
      }

      const trimmedCategory = memoizedTrimmedFields.category;
      if (!trimmedCategory) {
        throw new Error("Category is required.");
      }

      const trimmedSubCategory = memoizedTrimmedFields.subCategory;
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
        invoiceDate: trimmedInvoiceDate,
        yyyyMM: targetMonth,
        amount: Number(values.amount) || 0,
        paid: Boolean(values.paid),
        updatedAt: Date.now(),
        createdAt: values.createdAt ?? Date.now(),
      };

      // ✅ Validate shape via Zod
      const parsed = ExpenseSchema.parse(normalized);

      const fieldsToCompare: (keyof Expense)[] = [
        "projectId",
        "yyyyMM",
        "payee",
        "category",
        "subCategory",
        "details",
        "modeOfPayment",
        "invoiceDate",
        "datePaid",
        "amount",
        "paid",
      ];

      const hasChanges = fieldsToCompare.some((key) => parsed[key] !== expense[key]);

      if (!hasChanges && parsed.yyyyMM === yyyyMM) {
        onSaved?.(expense);
        onClose();
        return;
      }

      const destinationRef = doc(db, "expenses", parsed.yyyyMM, "items", parsed.id);

      // ✅ Save to Firestore (move document when month changes)
      if (parsed.yyyyMM === yyyyMM) {
        await setDoc(destinationRef, parsed, { merge: true });
      } else {
        const sourceRef = doc(db, "expenses", yyyyMM, "items", parsed.id);
        const batch = writeBatch(db);
        batch.set(destinationRef, parsed, { merge: true });
        batch.delete(sourceRef);
        await batch.commit();
      }

      const projectsToInvalidate = new Set<string>();
      if (expense.projectId) {
        projectsToInvalidate.add(expense.projectId);
      }
      if (parsed.projectId) {
        projectsToInvalidate.add(parsed.projectId);
      }

      projectsToInvalidate.forEach((projectId) => {
        void invalidateProjectExpenses(projectId);
      });

      onSaved?.(parsed);
      setIsDirty(false);
      setLastSyncedAt(parsed.updatedAt ?? Date.now());
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

        {!memoizedValidationHints.isValid && (
          <div className="text-sm text-amber-600 mt-4">
            Complete required fields: {memoizedValidationHints.missing.join(", ")}
          </div>
        )}

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
            disabled={saving || !memoizedValidationHints.isValid}
            className="bg-gray-900 text-white hover:bg-black"
          >
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

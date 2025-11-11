"use client";

import { useEffect, useMemo, useState } from "react";
import { doc, setDoc, writeBatch } from "firebase/firestore";
import { z } from "zod";
import { db } from "@/core/firebase";
import { ExpenseSchema, type Expense } from "@/domain/models";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { isoDateToYYYYMM } from "@/utils/time";
import { invalidateProjectExpenses } from "@/hooks/useProjectExpensesCollection";
import { getFirstZodError } from "@/utils/zodHelpers";
import { useAutoCategorize } from "@/utils/autoCategorize"; // 🧩 NEW
import DetailsAutocomplete from "@/components/DetailsAutocomplete"; // 🧩 NEW

interface ExpenseEditModalProps {
  yyyyMM: string;
  expense: Expense;
   projects?: { id: string; name: string }[]; // 🧩 now optional
  categorySource?: Record<string, readonly string[]>; // 🧩 now optional
  onClose: () => void;
  onSaved?: (saved: Expense) => void;
}

const fmtDateInput = (iso?: string) =>
  iso ? new Date(iso).toISOString().slice(0, 10) : "";

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */
export default function ExpenseEditModal({
  yyyyMM,
  expense,
  projects = [], // 🧩 default empty array
  categorySource = {}, // 🧩 default empty map
  onClose,
  onSaved,
}: ExpenseEditModalProps) {
  const [values, setValues] = useState<Expense>(expense);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState(expense.updatedAt ?? 0);

  const [highlightCat, setHighlightCat] = useState(false);
  const [highlightSub, setHighlightSub] = useState(false);

  const autoCategorize = useAutoCategorize(); // 🧩 hook
  const catSrc = categorySource as Record<string, readonly string[]>;

  /* ------------------------- Sync with live updates ------------------------ */
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

  /* --------------------------- Derived validation -------------------------- */
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
    if (!memoizedTrimmedFields.projectId) missing.push("Project");
    if (!values.invoiceDate?.trim()) missing.push("Invoice Date");
    if (!memoizedTrimmedFields.category) missing.push("Category");
    if (!memoizedTrimmedFields.subCategory) missing.push("Subcategory");
    if (!Number.isFinite(values.amount) || values.amount < 0)
      missing.push("Amount");
    return { missing, isValid: missing.length === 0 };
  }, [memoizedTrimmedFields, values.amount, values.invoiceDate]);

  /* ------------------------------ Field change ----------------------------- */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setValues((prev) => {
      const next = { ...prev };
      if ((next as Record<string, unknown>)[name] !== value) {
        (next as Record<string, unknown>)[name] = value;
        if (!isDirty) setIsDirty(true);
      }
      return next;
    });
  };

  /* ------------------------------ AutoCategorize ---------------------------- */
  async function handleDetailsBlur(nextDetails: string) {
    const details = nextDetails.trim();
    if (!details) return;

    const { suggestion } = await autoCategorize({
      details,
      category: values.category ?? "",
      subCategory: values.subCategory ?? "",
    });
    if (suggestion) {
      setValues((current) => ({
        ...current,
        category: suggestion.category,
        subCategory: suggestion.subCategory,
      }));
      setHighlightCat(true);
      setHighlightSub(true);
      setTimeout(() => {
        setHighlightCat(false);
        setHighlightSub(false);
      }, 1000);
    }
  }

  /* ------------------------------- Save logic ------------------------------ */
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
      const trimmedCategory = memoizedTrimmedFields.category;
      const trimmedSubCategory = memoizedTrimmedFields.subCategory;
      const trimmedInvoiceDate = values.invoiceDate?.trim() ?? "";

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
        updatedAt: Date.now(),
        createdAt: values.createdAt ?? Date.now(),
      };

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
      ];

      const hasChanges = fieldsToCompare.some(
        (key) => parsed[key] !== expense[key]
      );

      if (!hasChanges && parsed.yyyyMM === yyyyMM) {
        onSaved?.(expense);
        onClose();
        return;
      }

      // 🧠 Learn mapping before saving
try {
  const { learn } = await autoCategorize({
    details: values.details ?? "",
    category: values.category ?? "",
    subCategory: values.subCategory ?? "",
  });
  await learn(values.category ?? "", values.subCategory ?? "");
  console.log("[AutoCategorize] Learned item:", values.details);
} catch (e) {
  console.warn("[AutoCategorize] Learn failed:", e);
}


      const destinationRef = doc(db, "expenses", parsed.yyyyMM, "items", parsed.id);
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
      if (expense.projectId) projectsToInvalidate.add(expense.projectId);
      if (parsed.projectId) projectsToInvalidate.add(parsed.projectId);
      projectsToInvalidate.forEach((pid) => void invalidateProjectExpenses(pid));

      onSaved?.(parsed);
      setIsDirty(false);
      setLastSyncedAt(parsed.updatedAt ?? Date.now());
      onClose();
    } catch (err) {
      const first = getFirstZodError(err);
      if (first) setError(first);
      else if (err instanceof Error) setError(err.message);
      else setError("Unknown error saving expense.");
    } finally {
      setSaving(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="w-full max-w-3xl rounded-xl border border-[#3a3a3a] bg-[#1f1f1f] p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-[#e5e5e5]">Edit Expense</h2>
          <button
            onClick={onClose}
            className="text-[#9ca3af] hover:text-[#e5e5e5] text-sm"
          >
            ✕
          </button>
        </div>

        {error && <div className="text-[#f87171] text-sm mb-3">{error}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* Project */}
          <FormField label="Project">
            <select
              name="projectId"
              className="input-dark"
              value={values.projectId ?? ""}
              onChange={handleChange}
            >
              <option value="">Select project…</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </FormField>

          {/* Dates */}
          <FormField label="Invoice Date">
            <Input
              name="invoiceDate"
              type="date"
              value={fmtDateInput(values.invoiceDate)}
              onChange={handleChange}
              className="input-dark"
            />
          </FormField>

          <FormField label="Date Paid">
            <Input
              name="datePaid"
              type="date"
              value={fmtDateInput(values.datePaid)}
              onChange={handleChange}
              className="input-dark"
            />
          </FormField>

          {/* Mode of Payment */}
          <FormField label="Mode of Payment">
            <Input
              name="modeOfPayment"
              placeholder="Cash / Bank"
              value={values.modeOfPayment ?? ""}
              onChange={handleChange}
              className="input-dark"
            />
          </FormField>

          {/* Payee */}
          <FormField label="Payee">
            <Input
              name="payee"
              placeholder="Payee name"
              value={values.payee ?? ""}
              onChange={handleChange}
              className="input-dark"
            />
          </FormField>

          {/* 🧩 DETAILS BEFORE CATEGORY */}
          <FormField label="Details">
  <DetailsAutocomplete
    value={values.details ?? ""}
    onChange={(val) =>
      setValues((prev) => ({
        ...prev,
        details: val,
      }))
    }
    onSelectSuggestion={(item) => {
      setValues((prev) => ({
        ...prev,
        details: item.name,
        category: item.category,
        subCategory: item.subCategory,
      }));
      setHighlightCat(true);
      setHighlightSub(true);
      setTimeout(() => {
        setHighlightCat(false);
        setHighlightSub(false);
      }, 1000);
    }}
    onBlurAutoCategorize={handleDetailsBlur}
  />
</FormField>

          {/* Category */}
          <FormField label="Category">
            <select
              name="category"
              className={`input-dark transition-colors duration-300 ${
                highlightCat ? "bg-[#374151]/60 border-[#6366f1]" : ""
              }`}
              value={values.category ?? ""}
              onChange={(e) =>
                setValues((prev) => ({
                  ...prev,
                  category: e.target.value,
                  subCategory: "",
                }))
              }
            >
              <option value="">Select category…</option>
              {Object.keys(catSrc).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </FormField>

          {/* Subcategory */}
          <FormField label="Subcategory">
            <select
              name="subCategory"
              className={`input-dark disabled:opacity-50 transition-colors duration-300 ${
                highlightSub ? "bg-[#374151]/60 border-[#6366f1]" : ""
              }`}
              value={values.subCategory ?? ""}
              onChange={handleChange}
              disabled={!values.category}
            >
              <option value="">
                {values.category
                  ? "Select subcategory…"
                  : "(choose category first)"}
              </option>
              {(catSrc[values.category ?? ""] ?? []).map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </FormField>

          {/* Amount */}
          <FormField label="Amount">
            <Input
              name="amount"
              type="number"
              value={String(values.amount ?? 0)}
              onChange={handleChange}
              className="input-dark text-right"
            />
          </FormField>
        </div>

        {!memoizedValidationHints.isValid && (
          <div className="text-sm text-amber-500 mt-4">
            Complete required fields:{" "}
            {memoizedValidationHints.missing.join(", ")}
          </div>
        )}

        <div className="flex justify-end gap-2 mt-6">
          <Button
            type="button"
            onClick={onClose}
            className="bg-[#2a2a2a] text-[#e5e5e5] hover:bg-[#3a3a3a]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving || !memoizedValidationHints.isValid}
            className="bg-[#6366f1] text-white hover:bg-[#4f46e5]"
          >
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- Helper --------------------------------- */
function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <label className="mb-1 text-xs text-[#9ca3af]">{label}</label>
      {children}
    </div>
  );
}

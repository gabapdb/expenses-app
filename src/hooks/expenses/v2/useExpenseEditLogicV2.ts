import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, Dispatch, SetStateAction } from "react";
import { doc, setDoc, writeBatch } from "firebase/firestore";
import { db } from "@/core/firebase";
import { ExpenseSchema, type Expense } from "@/domain/models";
import type { ItemRecord } from "@/domain/items";
import { isoDateToYYYYMM } from "@/utils/time";
import { invalidateProjectExpenses } from "@/hooks/expenses/useProjectExpensesCollection";
import { getFirstZodError } from "@/utils/zodHelpers";
import { useAutoCategorize } from "@/utils/autoCategorize";

export interface UseExpenseEditLogicOptions {
  yyyyMM: string;
  initialExpense: Expense;
  categorySource: Record<string, readonly string[]>;
}

export interface UseExpenseEditLogicResult {
  values: Expense;
  setValues: Dispatch<SetStateAction<Expense>>;

  isDirty: boolean;
  saving: boolean;
  error: string | null;

  validation: {
    missing: string[];
    isValid: boolean;
  };

  highlightCat: boolean;
  highlightSub: boolean;

  handleFieldChange: (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  handleCategoryChange: (category: string) => void;
  handleSubCategoryChange: (subCategory: string) => void;

  handleDetailsChange: (nextDetails: string) => void;
  handleDetailsSuggestionSelect: (item: ItemRecord) => void;
  handleDetailsBlur: (nextDetails: string) => Promise<void>;

  handleSave: (args?: {
    onSaved?: (saved: Expense) => void;
  }) => Promise<void>;

  fmtDateInput: (iso?: string) => string;
}

const fmtDateInput = (iso?: string) =>
  iso ? new Date(iso).toISOString().slice(0, 10) : "";

export function useExpenseEditLogicV2(
  options: UseExpenseEditLogicOptions
): UseExpenseEditLogicResult {
  const { yyyyMM, initialExpense } = options;

  const [values, setValues] = useState<Expense>(initialExpense);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState(initialExpense.updatedAt ?? 0);

  const [highlightCat, setHighlightCat] = useState(false);
  const [highlightSub, setHighlightSub] = useState(false);

  const autoCategorize = useAutoCategorize();

  useEffect(() => {
    const incoming = options.initialExpense;
    const incomingUpdatedAt = incoming.updatedAt ?? 0;

    if (incoming.id !== values.id) {
      setValues(incoming);
      setIsDirty(false);
      setLastSyncedAt(incomingUpdatedAt);
      return;
    }

    if (!isDirty) {
      setValues(incoming);
      setLastSyncedAt(incomingUpdatedAt);
      return;
    }

    if (incomingUpdatedAt > lastSyncedAt) {
      setValues(incoming);
      setIsDirty(false);
      setLastSyncedAt(incomingUpdatedAt);
    }
  }, [options.initialExpense, isDirty, lastSyncedAt, values.id]);

  const memoizedTrimmedFields = useMemo(
    () => ({
      projectId: values.projectId?.trim() ?? "",
      category: values.category?.trim() ?? "",
      subCategory: values.subCategory?.trim() ?? "",
    }),
    [values.projectId, values.category, values.subCategory]
  );

  const validation = useMemo(() => {
    const missing: string[] = [];
    if (!memoizedTrimmedFields.projectId) missing.push("Project");
    if (!values.invoiceDate?.trim()) missing.push("Invoice Date");
    if (!memoizedTrimmedFields.category) missing.push("Category");
    if (!memoizedTrimmedFields.subCategory) missing.push("Subcategory");
    if (!Number.isFinite(values.amount) || values.amount < 0)
      missing.push("Amount");
    return { missing, isValid: missing.length === 0 };
  }, [memoizedTrimmedFields, values.amount, values.invoiceDate]);

  const triggerHighlight = () => {
    setHighlightCat(true);
    setHighlightSub(true);
    setTimeout(() => {
      setHighlightCat(false);
      setHighlightSub(false);
    }, 1000);
  };

  const handleFieldChange = (
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

  const handleCategoryChange = (category: string) => {
    setValues((prev) => ({
      ...prev,
      category,
      subCategory: "",
    }));
  };

  const handleSubCategoryChange = (subCategory: string) => {
    setValues((prev) => ({
      ...prev,
      subCategory,
    }));
  };

  const handleDetailsChange = (nextDetails: string) => {
    setValues((prev) => ({
      ...prev,
      details: nextDetails,
    }));
  };

  const handleDetailsSuggestionSelect = (item: ItemRecord) => {
    setValues((prev) => ({
      ...prev,
      details: item.name,
      category: item.category,
      subCategory: item.subCategory,
    }));
    triggerHighlight();
  };

  const handleDetailsBlur = async (nextDetails: string) => {
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
      triggerHighlight();
    }
  };

  const handleSave = async (args?: { onSaved?: (saved: Expense) => void }) => {
    setSaving(true);
    setError(null);
    try {
      if (!validation.isValid) {
        throw new Error(
          `Please complete the following before saving: ${validation.missing.join(", ")}`
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

      const normalized: Expense = {
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
        (key) => parsed[key] !== options.initialExpense[key]
      );

      if (!hasChanges && parsed.yyyyMM === yyyyMM) {
        args?.onSaved?.(options.initialExpense);
        return;
      }

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
      if (options.initialExpense.projectId)
        projectsToInvalidate.add(options.initialExpense.projectId);
      if (parsed.projectId) projectsToInvalidate.add(parsed.projectId);
      projectsToInvalidate.forEach((pid) => void invalidateProjectExpenses(pid));

      args?.onSaved?.(parsed);
      setIsDirty(false);
      setLastSyncedAt(parsed.updatedAt ?? Date.now());
    } catch (err) {
      const first = getFirstZodError(err);
      if (first) setError(first);
      else if (err instanceof Error) setError(err.message);
      else setError("Unknown error saving expense.");
    } finally {
      setSaving(false);
    }
  };

  return {
    values,
    setValues,
    isDirty,
    saving,
    error,
    validation,
    highlightCat,
    highlightSub,
    handleFieldChange,
    handleCategoryChange,
    handleSubCategoryChange,
    handleDetailsChange,
    handleDetailsSuggestionSelect,
    handleDetailsBlur,
    handleSave,
    fmtDateInput,
  };
}

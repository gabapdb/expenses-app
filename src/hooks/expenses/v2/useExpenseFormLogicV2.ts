import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChangeEvent, Dispatch, SetStateAction } from "react";
import { uuid } from "@/utils/id";
import {
  normalizeExpenseForWrite,
  saveExpense,
} from "@/data/expenses.v2.repo";
import { isoDateToYYYYMM } from "@/utils/time";
import { invalidateProjectExpenses } from "@/hooks/expenses/useProjectExpensesCollection";
import { getFirstZodError } from "@/utils/zodHelpers";
import { useAutoCategorize } from "@/utils/autoCategorize";
import type { Expense } from "@/domain/models";
import type { ItemRecord } from "@/domain/items";

export interface UseExpenseFormLogicOptions {
  yyyyMM: string;
  categorySource: Record<string, readonly string[]>;
  onError?: (err: string | null) => void;
}

export interface UseExpenseFormLogicResult {
  values: Expense;
  setValues: Dispatch<SetStateAction<Expense>>;

  validation: {
    missing: string[];
    isValid: boolean;
  };

  saving: boolean;
  error: string | null;
  isDirty: boolean;

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

  handleSubmit: () => Promise<void>;

  fmtDateInput: (iso?: string) => string;
}

const fmtDateInput = (iso?: string) =>
  iso ? new Date(iso).toISOString().slice(0, 10) : "";

const todayISO = () => new Date().toISOString().slice(0, 10);

const createInitialExpense = (yyyyMM: string): Expense => ({
  id: uuid(),
  projectId: "",
  yyyyMM,
  payee: "",
  category: "",
  subCategory: "",
  details: "",
  modeOfPayment: "",
  invoiceDate: todayISO(),
  datePaid: todayISO(),
  amount: 0,
  paid: false,
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

export function useExpenseFormLogicV2({
  yyyyMM,
  categorySource,
  onError,
}: UseExpenseFormLogicOptions): UseExpenseFormLogicResult {
  const [values, setValues] = useState<Expense>(() => createInitialExpense(yyyyMM));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [highlightCat, setHighlightCat] = useState(false);
  const [highlightSub, setHighlightSub] = useState(false);

  const autoCategorize = useAutoCategorize();

  const memoizedTrimmedFields = useMemo(
    () => ({
      projectId: values.projectId?.trim() ?? "",
      category: values.category?.trim() ?? "",
      subCategory: values.subCategory?.trim() ?? "",
    }),
    [values.projectId, values.category, values.subCategory]
  );

  useEffect(() => {
    const subs = categorySource[values.category] ?? [];
    if (!values.subCategory) return;
    if (subs.length === 0) return;
    if (!subs.includes(values.subCategory)) {
      setValues((prev) => {
        if (prev.subCategory === "") return prev;
        return {
          ...prev,
          subCategory: "",
        };
      });
      if (!isDirty) setIsDirty(true);
    }
  }, [categorySource, isDirty, values.category, values.subCategory]);

  useEffect(() => {
    setValues((prev) => ({
      ...prev,
      yyyyMM,
    }));
  }, [yyyyMM]);

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

  const triggerHighlight = useCallback(() => {
    setHighlightCat(true);
    setHighlightSub(true);
    setTimeout(() => {
      setHighlightCat(false);
      setHighlightSub(false);
    }, 1000);
  }, []);

  const handleFieldChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name } = e.target;
      if (!name) return;

      const rawValue =
        e.target instanceof HTMLInputElement && e.target.type === "checkbox"
          ? e.target.checked
          : e.target.value;

      setValues((prev) => {
        const prevValue = (prev as Record<string, unknown>)[name];
        let nextValue: unknown = rawValue;

        if (name === "amount") {
          const numeric = Number(rawValue);
          nextValue = Number.isFinite(numeric) ? numeric : 0;
        } else if (name === "invoiceDate" || name === "datePaid") {
          const strValue = String(rawValue ?? "");
          nextValue = strValue ? strValue : todayISO();
        } else if (typeof rawValue === "string") {
          nextValue = rawValue;
        }

        if (prevValue === nextValue) {
          return prev;
        }

        if (!isDirty) setIsDirty(true);

        return {
          ...prev,
          [name]: nextValue,
        } as Expense;
      });
    },
    [isDirty]
  );

  const handleCategoryChange = useCallback(
    (category: string) => {
      setValues((prev) => {
        if (prev.category === category && prev.subCategory === "") {
          return prev;
        }
        if (!isDirty) setIsDirty(true);
        return {
          ...prev,
          category,
          subCategory: "",
        };
      });
    },
    [isDirty]
  );

  const handleSubCategoryChange = useCallback(
    (subCategory: string) => {
      setValues((prev) => {
        if (prev.subCategory === subCategory) {
          return prev;
        }
        if (!isDirty) setIsDirty(true);
        return {
          ...prev,
          subCategory,
        };
      });
    },
    [isDirty]
  );

  const handleDetailsChange = useCallback(
    (nextDetails: string) => {
      setValues((prev) => {
        if (prev.details === nextDetails) {
          return prev;
        }
        if (!isDirty) setIsDirty(true);
        return {
          ...prev,
          details: nextDetails,
        };
      });
    },
    [isDirty]
  );

  const handleDetailsSuggestionSelect = useCallback(
    (item: ItemRecord) => {
      setValues((prev) => ({
        ...prev,
        details: item.name,
        category: item.category,
        subCategory: item.subCategory,
      }));
      if (!isDirty) setIsDirty(true);
      triggerHighlight();
    },
    [isDirty, triggerHighlight]
  );

  const handleDetailsBlur = useCallback(
    async (nextDetails: string) => {
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
    },
    [autoCategorize, triggerHighlight, values.category, values.subCategory]
  );

  const resetForm = useCallback(() => {
    setValues(createInitialExpense(yyyyMM));
    setIsDirty(false);
    setHighlightCat(false);
    setHighlightSub(false);
  }, [yyyyMM]);

  const handleSubmit = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      if (!validation.isValid) {
        const message = `Please complete the following before saving: ${validation.missing.join(", ")}`;
        setError(message);
        onError?.(message);
        return;
      }

      const trimmedProjectId = memoizedTrimmedFields.projectId;
      const trimmedCategory = memoizedTrimmedFields.category;
      const trimmedSubCategory = memoizedTrimmedFields.subCategory;
      const trimmedInvoiceDate = values.invoiceDate?.trim() || todayISO();
      const trimmedDatePaid = values.datePaid?.trim() ?? "";

      const targetMonth =
        isoDateToYYYYMM(trimmedDatePaid) ??
        isoDateToYYYYMM(trimmedInvoiceDate) ??
        yyyyMM;

      const normalized = normalizeExpenseForWrite({
        ...values,
        id: values.id || uuid(),
        projectId: trimmedProjectId,
        category: trimmedCategory,
        subCategory: trimmedSubCategory,
        invoiceDate: trimmedInvoiceDate,
        datePaid: trimmedDatePaid,
        yyyyMM: targetMonth,
        amount: values.amount,
        paid: values.paid,
        createdAt: values.createdAt,
      });

      try {
        const { learn } = await autoCategorize({
          details: normalized.details ?? "",
          category: normalized.category ?? "",
          subCategory: normalized.subCategory ?? "",
        });
        await learn(normalized.category ?? "", normalized.subCategory ?? "");
        console.log("[AutoCategorize] Learned item:", normalized.details);
      } catch (learnErr) {
        console.warn("[AutoCategorize] Learn failed:", learnErr);
      }

      const saved = await saveExpense(normalized);
      if (saved.projectId) {
        void invalidateProjectExpenses({ projectId: saved.projectId });
      }

      setError(null);
      onError?.(null);
      resetForm();
    } catch (err) {
      const first = getFirstZodError(err);
      const message = first || (err instanceof Error ? err.message : "Failed to save expense.");
      setError(message);
      onError?.(message);
    } finally {
      setSaving(false);
    }
  }, [
    autoCategorize,
    memoizedTrimmedFields,
    onError,
    resetForm,
    validation.isValid,
    validation.missing,
    values,
    yyyyMM,
  ]);

  return {
    values,
    setValues,
    validation,
    saving,
    error,
    isDirty,
    highlightCat,
    highlightSub,
    handleFieldChange,
    handleCategoryChange,
    handleSubCategoryChange,
    handleDetailsChange,
    handleDetailsSuggestionSelect,
    handleDetailsBlur,
    handleSubmit,
    fmtDateInput,
  };
}

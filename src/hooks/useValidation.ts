import { useState } from "react";
import type { Expense } from "@/domain/models";
import { parse, isValid } from "date-fns";

export interface ValidationErrors {
  projectId?: string;
  payee?: string;
  category?: string;
  invoiceDate?: string;
  datePaid?: string;
  amount?: string;
  [key: string]: string | undefined;
}

export function useValidation() {
  const [errors, setErrors] = useState<ValidationErrors>({});

  function isValidDateFormat(value?: string): boolean {
    if (!value) return true; // allow empty optional dates
    const parsed = parse(value, "MM/dd/yyyy", new Date());
    return isValid(parsed);
  }

  /**
   * Validate a partial Expense (draft) before saving.
   * Returns `true` if valid; otherwise populates `errors`.
   */
  function validateExpense(data: Partial<Expense>): boolean {
    const newErrors: ValidationErrors = {};

    if (!data.projectId?.trim()) newErrors.projectId = "Project is required.";
    if (!data.payee?.trim()) newErrors.payee = "Payee is required.";
    if (!data.category?.trim()) newErrors.category = "Category is required.";

    if (data.invoiceDate && !isValidDateFormat(data.invoiceDate)) {
      newErrors.invoiceDate = "Invalid date (use MM/dd/yyyy).";
    }

    if (data.datePaid && !isValidDateFormat(data.datePaid)) {
      newErrors.datePaid = "Invalid date (use MM/dd/yyyy).";
    }

    if (data.amount === undefined || isNaN(Number(data.amount))) {
      newErrors.amount = "Amount must be a number.";
    } else if (Number(data.amount) < 0) {
      newErrors.amount = "Amount cannot be negative.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function clearErrors() {
    setErrors({});
  }

  return { errors, validateExpense, clearErrors };
}

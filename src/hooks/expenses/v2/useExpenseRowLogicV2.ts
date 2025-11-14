"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { deleteExpense, togglePaid } from "@/data/expenses.v2.repo";
import { invalidateProjectExpenses } from "@/hooks/expenses/useProjectExpensesCollection";
import { getFirstZodError } from "@/utils/zodHelpers";
import { peso } from "@/utils/format";
import type { Expense } from "@/domain/models";

const fmtDateInput = (iso?: string) =>
  iso ? new Date(iso).toISOString().slice(0, 10) : "";

export interface UseExpenseRowLogicV2Options {
  expense?: Expense;
  yyyyMM: string;
  projectId?: string;
  onChange?: () => void;
  onEditRequested?: (expense: Expense) => void;
}

export interface UseExpenseRowLogicV2Result {
  formatted: {
    datePaid: string;
    invoiceDate: string;
    amount: string;
  };
  paid: boolean;
  canCreate: boolean;
  newExpenseDraft: Expense | null;
  isAdding: boolean;
  isEditing: boolean;
  isDeleting: boolean;
  isToggling: boolean;
  onTogglePaid: () => Promise<void>;
  onDelete: () => Promise<void>;
  onEdit: () => void;
  openAdd: () => void;
  closeAdd: () => void;
  handleAddSaved: () => void;
  closeEdit: () => void;
  handleEditSaved: () => void;
}

export function useExpenseRowLogicV2({
  expense,
  yyyyMM,
  projectId,
  onChange,
  onEditRequested,
}: UseExpenseRowLogicV2Options): UseExpenseRowLogicV2Result {
  const [paid, setPaid] = useState<boolean>(expense?.paid ?? false);
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newExpenseDraft, setNewExpenseDraft] = useState<Expense | null>(null);

  useEffect(() => {
    setPaid(expense?.paid ?? false);
  }, [expense?.id, expense?.paid]);

  const resolvedProjectId = useMemo(() => {
    return expense?.projectId ?? projectId ?? "";
  }, [expense?.projectId, projectId]);

  const formatted = useMemo(() => {
    if (!expense) {
      return {
        datePaid: "",
        invoiceDate: "",
        amount: peso(0),
      };
    }

    return {
      datePaid: fmtDateInput(expense.datePaid),
      invoiceDate: fmtDateInput(expense.invoiceDate),
      amount: peso(expense.amount ?? 0),
    };
  }, [expense]);

  const canCreate = useMemo(() => resolvedProjectId.length > 0, [resolvedProjectId]);

  const onTogglePaid = useCallback(async () => {
    if (!expense?.id) {
      console.warn("[ExpenseRow] Cannot toggle paid without an expense id");
      return;
    }

    setIsToggling(true);
    const nextPaid = !paid;
    setPaid(nextPaid);

    try {
      await togglePaid(yyyyMM, expense.id, nextPaid);
      if (resolvedProjectId) {
        void invalidateProjectExpenses(resolvedProjectId);
      }
      onChange?.();
    } catch (err) {
      const message = getFirstZodError(err) ?? "Failed to update paid state.";
      console.error("[ExpenseRow] toggle paid error:", message);
      setPaid((prev) => !prev);
    } finally {
      setIsToggling(false);
    }
  }, [expense?.id, onChange, paid, resolvedProjectId, yyyyMM]);

  const onDelete = useCallback(async () => {
    if (!expense?.id) {
      console.warn("[ExpenseRow] Cannot delete without an expense id");
      return;
    }

    setIsDeleting(true);
    try {
      await deleteExpense(yyyyMM, expense.id);
      if (resolvedProjectId) {
        void invalidateProjectExpenses(resolvedProjectId);
      }
      onChange?.();
    } catch (err) {
      const message = getFirstZodError(err) ?? "Failed to delete expense.";
      console.error("[ExpenseRow] delete expense error:", message);
    } finally {
      setIsDeleting(false);
    }
  }, [expense?.id, onChange, resolvedProjectId, yyyyMM]);

  const openAdd = useCallback(() => {
    if (!resolvedProjectId) {
      console.error("[ExpenseRow] Cannot create expense without a projectId");
      return;
    }

    const now = Date.now();
    setNewExpenseDraft({
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
      createdAt: now,
      updatedAt: now,
    });
    setIsAdding(true);
  }, [resolvedProjectId, yyyyMM]);

  const closeAdd = useCallback(() => {
    setIsAdding(false);
    setNewExpenseDraft(null);
  }, []);

  const handleAddSaved = useCallback(() => {
    closeAdd();
    onChange?.();
  }, [closeAdd, onChange]);

  const onEdit = useCallback(() => {
    if (!expense) return;
    setIsEditing(true);
    onEditRequested?.(expense);
  }, [expense, onEditRequested]);

  const closeEdit = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleEditSaved = useCallback(() => {
    closeEdit();
    onChange?.();
  }, [closeEdit, onChange]);

  return {
    formatted,
    paid,
    canCreate,
    newExpenseDraft,
    isAdding,
    isEditing,
    isDeleting,
    isToggling,
    onTogglePaid,
    onDelete,
    onEdit,
    openAdd,
    closeAdd,
    handleAddSaved,
    closeEdit,
    handleEditSaved,
  };
}


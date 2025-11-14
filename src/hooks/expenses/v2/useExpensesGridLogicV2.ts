"use client";

import {
  useCallback,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { CATEGORY_MAP } from "@/config/categories";
import { useCategories } from "@/hooks/expenses/useCategories";
import { useRealtimeExpenses } from "@/hooks/expenses/useRealtimeExpenses";
import { invalidateProjectExpenses } from "@/hooks/expenses/useProjectExpensesCollection";
import { useProjects } from "@/hooks/projects/useProjects";
import { deleteExpense, togglePaid } from "@/data/expenses.v2.repo";
import { getFirstZodError } from "@/utils/zodHelpers";
import type { Expense } from "@/domain/models";
import type { Project } from "@/hooks/projects/useProjects";

export interface UseExpensesGridLogicV2Options {
  yyyyMM: string;
  selectedYear: number;
  projectId?: string | null;
}

export interface UseExpensesGridLogicV2Result {
  projects: Project[];
  projectsLoading: boolean;
  expenses: Expense[];
  expensesLoading: boolean;
  months: { name: string; value: string }[];
  categorySource: Record<string, readonly string[]>;
  error: string | null;
  setError: Dispatch<SetStateAction<string | null>>;
  editingExpense: Expense | null;
  isEditModalOpen: boolean;
  openEdit: (expense: Expense) => void;
  closeEdit: () => void;
  handleTogglePaid: (expense: Expense) => Promise<void>;
  handleDelete: (expense: Expense) => Promise<void>;
  totals: {
    totalAmount: number;
  };
}

export function useExpensesGridLogicV2({
  yyyyMM,
  selectedYear,
  projectId,
}: UseExpensesGridLogicV2Options): UseExpensesGridLogicV2Result {
  const { data: projects, loading: projectsLoading } = useProjects();
  const { categoryMap } = useCategories();
  const projectClientId = useMemo(() => {
    if (!projectId) return null;
    const match = projects.find((project) => project.id === projectId);
    const cid = match?.clientId?.trim();
    return cid && cid.length > 0 ? cid : null;
  }, [projectId, projects]);
  const realtimeScope = useMemo(() => {
    if (!projectId) return yyyyMM;
    return {
      projectId,
      clientId: projectClientId ?? undefined,
      yyyyMM,
    };
  }, [projectId, projectClientId, yyyyMM]);
  const {
    data: rawExpenses,
    loading: expensesLoading,
    error: expensesError,
  } = useRealtimeExpenses(realtimeScope);
  const expenses = useMemo(
    () =>
      projectId
        ? rawExpenses.filter((expense) => expense.projectId === projectId)
        : rawExpenses,
    [projectId, rawExpenses]
  );

  const [localError, setLocalError] = useState<string | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const months = useMemo(
    () =>
      Array.from({ length: 12 }, (_, m) => ({
        name: new Date(0, m).toLocaleString("default", { month: "long" }),
        value: `${selectedYear}${String(m + 1).padStart(2, "0")}`,
      })),
    [selectedYear]
  );

  const categorySource = useMemo(() => {
    if (categoryMap && Object.keys(categoryMap).length > 0) {
      return Object.fromEntries(
        Object.entries(categoryMap).map(([cat, subs]) => [cat, [...subs]])
      ) as Record<string, readonly string[]>;
    }
    return CATEGORY_MAP;
  }, [categoryMap]);

  const openEdit = useCallback((expense: Expense) => {
    setEditingExpense(expense);
  }, []);

  const closeEdit = useCallback(() => {
    setEditingExpense(null);
  }, []);

  const handleTogglePaid = useCallback(
    async (expense: Expense) => {
      try {
        await togglePaid(yyyyMM, expense.id, !expense.paid);
        if (expense.projectId) {
          void invalidateProjectExpenses({ projectId: expense.projectId });
        }
      } catch (err) {
        const msg = getFirstZodError(err) ?? "Failed to toggle paid state.";
        setLocalError(msg);
        console.error("[ExpensesGrid] togglePaid error:", msg);
      }
    },
    [yyyyMM]
  );

  const handleDelete = useCallback(
    async (expense: Expense) => {
      try {
        await deleteExpense(yyyyMM, expense.id);
        if (expense.projectId) {
          void invalidateProjectExpenses({ projectId: expense.projectId });
        }
      } catch (err) {
        const msg = getFirstZodError(err) ?? "Failed to delete expense.";
        setLocalError(msg);
        console.error("[ExpensesGrid] deleteExpense error:", msg);
      }
    },
    [yyyyMM]
  );

  const totals = useMemo(() => {
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    return { totalAmount };
  }, [expenses]);

  return {
    projects,
    projectsLoading,
    expenses,
    expensesLoading,
    months,
    categorySource,
    error: localError ?? expensesError ?? null,
    setError: setLocalError,
    editingExpense,
    isEditModalOpen: editingExpense !== null,
    openEdit,
    closeEdit,
    handleTogglePaid,
    handleDelete,
    totals,
  };
}


"use client";

import { useMemo } from "react";
import type { Expense } from "@/domain/models";
import type { Project } from "@/hooks/projects/useProjects";

export interface UseExpensesTableLogicV2Options {
  expenses: Expense[];
  projects: Project[];
}

export interface UseExpensesTableLogicV2Result {
  rows: Array<{
    expense: Expense;
    projectName: string;
  }>;
  isEmpty: boolean;
}

export function useExpensesTableLogicV2({
  expenses,
  projects,
}: UseExpensesTableLogicV2Options): UseExpensesTableLogicV2Result {
  const projectNameMap = useMemo(() => {
    return new Map(projects.map((project) => [project.id, project.name]));
  }, [projects]);

  const rows = useMemo(
    () =>
      expenses.map((expense) => ({
        expense,
        projectName: projectNameMap.get(expense.projectId ?? "") ?? "—",
      })),
    [expenses, projectNameMap]
  );

  return {
    rows,
    isEmpty: expenses.length === 0,
  };
}


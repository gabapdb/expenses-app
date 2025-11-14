"use client";

import { useMemo } from "react";
import type { Expense } from "@/domain/models";

export interface UseCategoryBreakdownLogicV2Options {
  expenses: Expense[];
  categorySource: Record<string, readonly string[]>;
}

export interface UseCategoryBreakdownLogicV2Result {
  categories: Array<{
    category: string;
    total: number;
    sub: Array<{
      subCategory: string;
      total: number;
    }>;
  }>;
  grandTotal: number;
}

const UNCATEGORIZED = "Uncategorized";

export function useCategoryBreakdownLogicV2({
  expenses,
  categorySource,
}: UseCategoryBreakdownLogicV2Options): UseCategoryBreakdownLogicV2Result {
  const breakdown = useMemo(() => {
    const categoryTotals = new Map<string, Map<string, number>>();

    expenses.forEach((expense) => {
      const category = expense.category?.trim() || UNCATEGORIZED;
      const subCategory = expense.subCategory?.trim() || UNCATEGORIZED;

      if (!categoryTotals.has(category)) {
        categoryTotals.set(category, new Map());
      }
      const subMap = categoryTotals.get(category)!;
      subMap.set(subCategory, (subMap.get(subCategory) ?? 0) + expense.amount);
    });

    Object.entries(categorySource).forEach(([category, subs]) => {
      if (!categoryTotals.has(category)) {
        categoryTotals.set(category, new Map());
      }
      const subMap = categoryTotals.get(category)!;
      subs.forEach((sub) => {
        if (!subMap.has(sub)) {
          subMap.set(sub, 0);
        }
      });
    });

    const categories = Array.from(categoryTotals.entries()).map(
      ([category, subMap]) => {
        const sub = Array.from(subMap.entries())
          .map(([subCategory, total]) => ({ subCategory, total }))
          .sort((a, b) => b.total - a.total);

        const total = sub.reduce((sum, entry) => sum + entry.total, 0);

        return { category, total, sub };
      }
    );

    categories.sort((a, b) => b.total - a.total);

    const grandTotal = categories.reduce((sum, entry) => sum + entry.total, 0);

    return { categories, grandTotal };
  }, [expenses, categorySource]);

  return breakdown;
}


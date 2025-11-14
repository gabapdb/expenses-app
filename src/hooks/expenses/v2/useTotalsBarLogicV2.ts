"use client";

import { useMemo } from "react";
import type { Expense } from "@/domain/models";

export interface UseTotalsBarLogicV2Options {
  expenses: Expense[];
}

export interface UseTotalsBarLogicV2Result {
  totals: {
    total: number;
    paid: number;
    unpaid: number;
  };
}

export function useTotalsBarLogicV2({
  expenses,
}: UseTotalsBarLogicV2Options): UseTotalsBarLogicV2Result {
  const totals = useMemo(() => {
    return expenses.reduce(
      (acc, expense) => {
        const amount = expense.amount ?? 0;
        acc.total += amount;
        if (expense.paid) {
          acc.paid += amount;
        } else {
          acc.unpaid += amount;
        }
        return acc;
      },
      { total: 0, paid: 0, unpaid: 0 }
    );
  }, [expenses]);

  return { totals };
}


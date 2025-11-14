import { useMemo } from "react";

import { CATEGORY_LIST } from "@/config/categories";
import { useProjectExpensesByYear } from "@/hooks/expenses/useProjectExpensesByYear";
import { allMonths, peso } from "@/utils/expenses";

interface MonthCategoryTotal {
  name: string;
  total: string;
}

interface MonthRow {
  month: string;
  total: string;
  categories: MonthCategoryTotal[];
}

export interface UseMonthlyExpensesSectionLogicV2Options {
  projectId: string;
  startDate?: string;
  endDate?: string;
}

export interface UseMonthlyExpensesSectionLogicV2Result {
  loading: boolean;
  error: string | null;
  hasData: boolean;
  categories: MonthCategoryTotal[];
  months: MonthRow[];
  grandTotal: string;
}

type MonthlyBreakdown = Record<string, Record<string, number>>;

function deriveVisibleMonths(
  monthOrder: string[],
  byMonth: MonthlyBreakdown
): string[] {
  const monthsWithData = Object.keys(byMonth)
    .filter((month) => {
      const totals = Object.values(byMonth[month] ?? {});
      return totals.reduce((acc, value) => acc + value, 0) > 0;
    })
    .sort((a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b));

  if (monthsWithData.length === 0) {
    return [];
  }

  const startIndex = monthOrder.indexOf(monthsWithData[0]);
  const endIndex = monthOrder.indexOf(monthsWithData[monthsWithData.length - 1]);
  return monthOrder.slice(startIndex, endIndex + 1);
}

export function useMonthlyExpensesSectionLogicV2({
  projectId,
  startDate,
  endDate,
}: UseMonthlyExpensesSectionLogicV2Options): UseMonthlyExpensesSectionLogicV2Result {
  const currentYear = new Date().getFullYear();
  const { byMonth, byCategory, totalsByMonth, grandTotal, loading, error } =
    useProjectExpensesByYear(projectId, currentYear);

  const categories = useMemo<MonthCategoryTotal[]>(() => {
    const filtered = CATEGORY_LIST.filter(
      (category) => category !== "Additional Cabinet Labor"
    );

    return filtered.map((category) => ({
      name: category,
      total: peso(byCategory[category] ?? 0),
    }));
  }, [byCategory]);

  const visibleMonths = useMemo(() => {
    const derived = deriveVisibleMonths(allMonths, byMonth);
    if (startDate || endDate) {
      return derived.filter(() => true);
    }
    return derived;
  }, [byMonth, endDate, startDate]);

  const months = useMemo<MonthRow[]>(() => {
    return visibleMonths.map((month) => ({
      month,
      total: peso(totalsByMonth[month] ?? 0),
      categories: categories.map((category) => ({
        name: category.name,
        total: peso(byMonth[month]?.[category.name] ?? 0),
      })),
    }));
  }, [byMonth, categories, totalsByMonth, visibleMonths]);

  const hasData = grandTotal > 0 && visibleMonths.length > 0;

  return {
    loading,
    error,
    hasData,
    categories,
    months,
    grandTotal: peso(grandTotal),
  };
}

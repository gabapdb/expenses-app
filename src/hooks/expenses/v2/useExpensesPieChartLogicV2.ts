import { useMemo } from "react";

import { peso } from "@/utils/expenses";

export interface ExpensesPieChartDatum
  extends Record<string, string | number> {
  category: string;
  total: number;
}

export interface UseExpensesPieChartLogicV2Options {
  data: ExpensesPieChartDatum[];
}

export interface UseExpensesPieChartLogicV2Result {
  chartData: ExpensesPieChartDatum[];
  colors: string[];
  tooltipFormatter: (value: unknown) => string;
}

const COLORS = [
  "#2563eb",
  "#16a34a",
  "#f97316",
  "#a855f7",
  "#dc2626",
  "#0ea5e9",
  "#84cc16",
  "#f59e0b",
  "#9333ea",
  "#ea580c",
];

export function useExpensesPieChartLogicV2({
  data,
}: UseExpensesPieChartLogicV2Options): UseExpensesPieChartLogicV2Result {
  const chartData = useMemo(() => data, [data]);

  const tooltipFormatter = (value: unknown): string =>
    peso(typeof value === "number" ? value : 0);

  return {
    chartData,
    colors: COLORS,
    tooltipFormatter,
  };
}

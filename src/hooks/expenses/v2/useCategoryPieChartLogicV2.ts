import { useMemo } from "react";
import type { PieLabelRenderProps } from "recharts";

import { peso, pct } from "@/utils/format";

export interface CategoryPieChartDatum {
  category: string;
  total: number;
}

export interface UseCategoryPieChartLogicV2Options {
  data: CategoryPieChartDatum[];
}

type ChartDatum = {
  name: string;
  value: number;
} & Record<string, string | number>;

export interface UseCategoryPieChartLogicV2Result {
  chartData: ChartDatum[];
  colors: string[];
  labelRenderer: (props: PieLabelRenderProps) => string;
  tooltipFormatter: (value: unknown) => string;
}

const COLORS = ["#111827", "#4B5563", "#9CA3AF", "#D1D5DB", "#E5E7EB"];

export function useCategoryPieChartLogicV2({
  data,
}: UseCategoryPieChartLogicV2Options): UseCategoryPieChartLogicV2Result {
  const chartData = useMemo<ChartDatum[]>(
    () =>
      data.map((datum) => ({
        name: datum.category,
        value: datum.total,
      })),
    [data]
  );

  const grandTotal = useMemo(
    () => data.reduce((sum, datum) => sum + datum.total, 0) || 1,
    [data]
  );

  const labelRenderer = (props: PieLabelRenderProps): string => {
    const { name, value } = props;
    const numericValue = typeof value === "number" ? value : 0;
    const percent = pct((numericValue / grandTotal) * 100);
    return `${name}: ${percent}`;
  };

  const tooltipFormatter = (value: unknown): string =>
    peso(typeof value === "number" ? value : 0);

  return {
    chartData,
    colors: COLORS,
    labelRenderer,
    tooltipFormatter,
  };
}

import { useMemo } from "react";

import { peso } from "@/utils/format";

export interface MonthlyTrendChartDatum
  extends Record<string, string | number> {
  month: string;
  total: number;
}

export interface UseMonthlyTrendChartLogicV2Options {
  data: MonthlyTrendChartDatum[];
}

export interface UseMonthlyTrendChartLogicV2Result {
  chartData: MonthlyTrendChartDatum[];
  yTickFormatter: (value: number) => string;
  tooltipFormatter: (value: number) => string;
  tooltipLabelFormatter: (label: string) => string;
}

export function useMonthlyTrendChartLogicV2({
  data,
}: UseMonthlyTrendChartLogicV2Options): UseMonthlyTrendChartLogicV2Result {
  const chartData = useMemo(() => data, [data]);

  const yTickFormatter = (value: number): string => peso(value).replace("₱", "");
  const tooltipFormatter = (value: number): string => peso(value);
  const tooltipLabelFormatter = (label: string): string => `Month ${label}`;

  return {
    chartData,
    yTickFormatter,
    tooltipFormatter,
    tooltipLabelFormatter,
  };
}

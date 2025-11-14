"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

import { useExpensesPieChartLogicV2 } from "@/hooks/expenses/v2/useExpensesPieChartLogicV2";

export default function ExpensePieChart({
  data,
}: {
  data: { category: string; total: number }[];
}) {
  const { chartData, colors, tooltipFormatter } = useExpensesPieChartLogicV2({
    data,
  });

  return (
    <div className="w-full h-72">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="total"
            nameKey="category"
            cx="50%"
            cy="50%"
            outerRadius={110}
            label
          >
            {chartData.map((datum, index) => (
              <Cell
                key={`cell-${datum.category}`}
                fill={colors[index % colors.length]}
              />
            ))}
          </Pie>
          <Tooltip formatter={tooltipFormatter} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

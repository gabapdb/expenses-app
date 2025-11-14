"use client";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

import Card from "@/components/ui/Card";
import { useCategoryPieChartLogicV2 } from "@/hooks/expenses/v2/useCategoryPieChartLogicV2";

export default function CategoryPieChart({
  data,
}: {
  data: { category: string; total: number }[];
}) {
  const { chartData, colors, labelRenderer, tooltipFormatter } =
    useCategoryPieChartLogicV2({ data });

  return (
    <Card>
      <div className="text-sm font-medium mb-3">Category Distribution</div>
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
              labelLine={false}
              label={labelRenderer}
            >
              {chartData.map((datum, index) => (
                <Cell key={datum.name} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip formatter={tooltipFormatter} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

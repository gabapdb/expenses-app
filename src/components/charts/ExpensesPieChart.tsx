"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { peso } from "@/utils/expenses";

interface ExpensePieChartProps {
  data: { category: string; total: number }[];
}

const COLORS = [
  "#2563eb", "#16a34a", "#f97316", "#a855f7", "#dc2626",
  "#0ea5e9", "#84cc16", "#f59e0b", "#9333ea", "#ea580c"
];

export default function ExpensePieChart({ data }: ExpensePieChartProps) {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="total"
            nameKey="category"
            cx="50%"
            cy="50%"
            outerRadius={110}
            label
          >
            {data.map((entry, i) => (
              <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => peso(v as number)} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

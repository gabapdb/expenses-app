"use client";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import Card from "@/components/ui/Card";
import { peso } from "@/utils/format";

export default function MonthlyTrendChart({
  data,
}: {
  data: { month: string; total: number }[];
}) {
  return (
    <Card>
      <div className="text-sm font-medium mb-3">Monthly Spend Trend</div>
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(v) => peso(v).replace("₱", "")} tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(v: number) => peso(v)}
              labelFormatter={(l) => `Month ${l}`}
              contentStyle={{ fontSize: "0.85rem" }}
            />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#111827"
              strokeWidth={2}
              dot={{ r: 2 }}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

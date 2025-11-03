"use client";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  type PieLabelRenderProps,
} from "recharts";
import Card from "@/components/ui/Card";
import { peso, pct } from "@/utils/format";

const COLORS = ["#111827", "#4B5563", "#9CA3AF", "#D1D5DB", "#E5E7EB"];

interface CategoryDatum {
  category: string;
  total: number;
}

export default function CategoryPieChart({ data }: { data: CategoryDatum[] }) {
  const grand = data.reduce((s, d) => s + d.total, 0) || 1;

  return (
    <Card>
      <div className="text-sm font-medium mb-3">Category Distribution</div>
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data.map((d) => ({ name: d.category, value: d.total }))}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
              labelLine={false}
              // ✅ Explicitly type the label renderer
              label={(props: PieLabelRenderProps) => {
                const { name, value } = props;
                const numericValue = typeof value === "number" ? value : 0;
                const percent = pct((numericValue / grand) * 100);
                return `${name}: ${percent}`;
              }}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v: unknown) => peso(typeof v === "number" ? v : 0)} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

import Card from "./ui/Card";
import { peso, pct } from "@/utils/format";


export default function CategoryBreakdown({ data }: { data: { category: string; total: number }[] }) {
const grand = data.reduce((s, d) => s + d.total, 0) || 1;
return (
<Card>
<div className="text-sm font-medium mb-3">Category Breakdown</div>
<div className="space-y-2">
{data.map((d) => (
<div key={d.category} className="flex items-center justify-between">
<div className="text-sm text-gray-700">{d.category}</div>
<div className="text-sm tabular-nums">
{peso(d.total)} <span className="text-gray-500">({pct((d.total / grand) * 100)})</span>
</div>
</div>
))}
</div>
</Card>
);
}
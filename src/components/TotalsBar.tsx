import Card from "./ui/Card";
import { peso } from "@/utils/format";


export default function TotalsBar({ totalProjects, totalSpent, perCategory }: {
totalProjects: number;
totalSpent: number;
perCategory: { category: string; total: number }[];
}) {
return (
<Card>
<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
<div>
<div className="text-xs text-gray-500">Projects</div>
<div className="text-lg font-semibold">{totalProjects}</div>
</div>
<div>
<div className="text-xs text-gray-500">Total Spent</div>
<div className="text-lg font-semibold">{peso(totalSpent)}</div>
</div>
<div>
<div className="text-xs text-gray-500">Top Categories</div>
<div className="text-sm text-gray-700 truncate">
{perCategory
.slice(0, 3)
.map((c) => `${c.category} (${peso(c.total)})`)
.join(" · ")}
</div>
</div>
</div>
</Card>
);
}
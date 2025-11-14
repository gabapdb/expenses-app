import Card from "@/components/ui/Card";
import { peso } from "@/utils/format";
import type { Expense } from "@/domain/models";
import { useTotalsBarLogicV2 } from "@/hooks/expenses/v2/useTotalsBarLogicV2";

interface TotalsBarProps {
  totalProjects: number;
  expenses: Expense[];
  perCategory: { category: string; total: number }[];
}

export default function TotalsBar({
  totalProjects,
  expenses,
  perCategory,
}: TotalsBarProps) {
  const { totals } = useTotalsBarLogicV2({ expenses });

  return (
    <Card>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <div className="text-xs text-gray-500">Projects</div>
          <div className="text-lg font-semibold">{totalProjects}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Total Spent</div>
          <div className="text-lg font-semibold">{peso(totals.total)}</div>
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


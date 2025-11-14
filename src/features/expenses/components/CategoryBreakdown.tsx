import Card from "@/components/ui/Card";
import { peso, pct } from "@/utils/format";
import type { Expense } from "@/domain/models";
import { useCategoryBreakdownLogicV2 } from "@/hooks/expenses/v2/useCategoryBreakdownLogicV2";

interface CategoryBreakdownProps {
  expenses: Expense[];
  categorySource: Record<string, readonly string[]>;
}

export default function CategoryBreakdown({
  expenses,
  categorySource,
}: CategoryBreakdownProps) {
  const { categories, grandTotal } = useCategoryBreakdownLogicV2({
    expenses,
    categorySource,
  });

  const safeGrand = grandTotal || 1;

  return (
    <Card>
      <div className="mb-3 text-sm font-medium">Category Breakdown</div>
      <div className="space-y-4">
        {categories.map(({ category, total, sub }) => (
          <div key={category} className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">{category}</div>
              <div className="text-sm tabular-nums">
                {peso(total)}{" "}
                <span className="text-gray-500">
                  ({pct((total / safeGrand) * 100)})
                </span>
              </div>
            </div>
            {sub.length > 0 && (
              <div className="ml-2 space-y-1 text-xs text-gray-500">
                {sub.map(({ subCategory, total: subTotal }) => (
                  <div
                    key={`${category}-${subCategory}`}
                    className="flex items-center justify-between"
                  >
                    <span>{subCategory}</span>
                    <span className="tabular-nums">{peso(subTotal)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}


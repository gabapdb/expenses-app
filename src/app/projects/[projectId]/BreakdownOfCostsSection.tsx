"use client";

import { useState } from "react";
import { useProjectExpenseBreakdown } from "@/hooks/useProjectExpenseBreakdown";
import { peso } from "@/utils/expenses";
import { RotateCw } from "lucide-react";

interface BreakdownOfCostsSectionProps {
  projectId: string;
}

export default function BreakdownOfCostsSection({ projectId }: BreakdownOfCostsSectionProps) {
  const { data, totalAmount, loading, error, refetch } =
    useProjectExpenseBreakdown(projectId);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const handleRefresh = async () => {
    await refetch();
    setLastUpdated(
      new Date().toLocaleString("en-PH", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
    );
  };

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
        <h2 className="text-lg font-semibold">Breakdown of Costs</h2>

        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-gray-500">
              Last updated: {lastUpdated}
            </span>
          )}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 text-sm text-gray-700 hover:text-black transition disabled:opacity-50"
          >
            <RotateCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      {/* States */}
      {loading && <div className="text-gray-500 text-sm">Loading breakdown…</div>}
      {error && <div className="text-red-500 text-sm">{error}</div>}
      {!loading && !error && !data.length && (
        <div className="text-gray-500 text-sm">No expenses yet.</div>
      )}

      {/* Table */}
      {!loading && !error && data.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-gray-50 text-left border-b">
              <tr>
                <th className="p-2 font-medium">Category</th>
                <th className="p-2 font-medium">Subcategory</th>
                <th className="p-2 font-medium text-right">Total</th>
                <th className="p-2 font-medium text-right">% of Total</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => {
                const pct = totalAmount > 0 ? (row.total / totalAmount) * 100 : 0;
                return (
                  <tr
                    key={`${row.category}-${row.subCategory}`}
                    className="border-b last:border-0"
                  >
                    <td className="p-2">{row.category}</td>
                    <td className="p-2">{row.subCategory}</td>
                    <td className="p-2 text-right">{peso(row.total)}</td>
                    <td className="p-2 text-right">{pct.toFixed(1)}%</td>
                  </tr>
                );
              })}
              <tr className="bg-gray-50 font-semibold">
                <td className="p-2">TOTAL</td>
                <td className="p-2">—</td>
                <td className="p-2 text-right">{peso(totalAmount)}</td>
                <td className="p-2 text-right">100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

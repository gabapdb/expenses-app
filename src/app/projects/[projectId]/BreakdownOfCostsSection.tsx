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
      <div className="flex items-center justify-between border-b border-[#3a3a3a] pb-2">
        <h2 className="text-lg font-semibold text-[#e5e5e5]">Breakdown of Costs</h2>

        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-[#9ca3af]">
              Last updated: {lastUpdated}
            </span>
          )}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 text-sm text-[#d1d5db] hover:text-white transition disabled:opacity-50"
          >
            <RotateCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      {/* States */}
      {loading && <div className="text-[#9ca3af] text-sm">Loading breakdown…</div>}
      {error && <div className="text-[#f87171] text-sm">{error}</div>}
      {!loading && !error && !data.length && (
        <div className="text-[#9ca3af] text-sm">No expenses yet.</div>
      )}

      {/* Table */}
      {!loading && !error && data.length > 0 && (
        <div className="border border-[#3a3a3a] rounded-xl overflow-x-auto bg-[#1f1f1f]">
          <table className="min-w-full border-collapse text-sm text-[#d1d5db]">
            <thead className="bg-[#262626] border-b border-[#3a3a3a]">
              <tr>
                <th className="p-3 font-medium text-left">Category</th>
                <th className="p-3 font-medium text-left">Subcategory</th>
                <th className="p-3 font-medium text-right">Total</th>
                <th className="p-3 font-medium text-right">% of Total</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => {
                const pct = totalAmount > 0 ? (row.total / totalAmount) * 100 : 0;
                return (
                  <tr
                    key={`${row.category}-${row.subCategory}`}
                    className="border-b border-[#3a3a3a] last:border-0 hover:bg-[#2a2a2a]/60 transition-colors"
                  >
                    <td className="p-3">{row.category}</td>
                    <td className="p-3">{row.subCategory}</td>
                    <td className="p-3 text-right">{peso(row.total)}</td>
                    <td className="p-3 text-right">{pct.toFixed(1)}%</td>
                  </tr>
                );
              })}
              <tr className="bg-[#2a2a2a] font-semibold border-t border-[#3a3a3a]">
                <td className="p-3">TOTAL</td>
                <td className="p-3">—</td>
                <td className="p-3 text-right">{peso(totalAmount)}</td>
                <td className="p-3 text-right">100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

"use client";

import { useMemo } from "react";
import ExpensePieChart from "@/features/expenses/components/charts/ExpensesPieChart";
import { useProjectExpensesByYear } from "@/hooks/expenses/useProjectExpensesByYear";
import { CATEGORY_LIST } from "@/config/categories";
import type { Project } from "@/hooks/projects/useProjects";

export default function ProjectOverviewSection({ project }: { project: Project }) {

  // Aggregate yearly expenses for chart
  const { byCategory, grandTotal, loading, error } = useProjectExpensesByYear(
    { projectId: project.id },
    new Date().getFullYear()
  );

  // Filter valid categories only (exclude Additional Cabinet Labor)
  const categories = useMemo(
    () =>
      CATEGORY_LIST.filter((c) => c !== "Additional Cabinet Labor").map(
        (c) => c as string
      ),
    []
  );

  return (
    <section className="flex flex-col items-start gap-6 lg:flex-row">
      {/* 🧮 Pie Chart (right, smaller and centered) */}
      <div className="flex-1 flex flex-col border border-[#3a3a3a] bg-[#1f1f1f] rounded-xl p-5 justify-between max-h-[360px] self-start">
        <div className="flex items-center justify-center flex-1">
          {loading ? (
            <div className="text-[#9ca3af] text-sm">Loading chart…</div>
          ) : error ? (
            <div className="text-[#f87171] text-sm">{error}</div>
          ) : grandTotal > 0 ? (
            <div className="max-h-[260px] w-full flex items-center justify-center">
              <ExpensePieChart
                data={categories.map((category) => ({
                  category,
                  total: byCategory[category] ?? 0,
                }))}
              />
            </div>
          ) : (
            <div className="text-[#9ca3af] text-sm">No expense data yet.</div>
          )}
        </div>
      </div>
    </section>
  );
}

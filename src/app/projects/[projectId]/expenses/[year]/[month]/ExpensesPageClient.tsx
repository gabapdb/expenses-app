"use client";

import type { JSX } from "react";

import ExpensesGrid from "@/features/expenses/components/ExpensesGrid";
import { useExpenseDate } from "@/context/ExpenseDateContext";

interface ExpensesPageClientProps {
  projectId: string;
  yyyyMM: string;
}

export default function ExpensesPageClient({
  projectId,
  yyyyMM,
}: ExpensesPageClientProps): JSX.Element {
  const { yyyyMM: contextYYYYMM } = useExpenseDate();
  const gridYYYYMM = contextYYYYMM ?? yyyyMM;

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-[#3a3a3a] pb-2">
        <h1 className="text-xl font-semibold text-[#e5e5e5]">Expenses</h1>
      </div>

      <ExpensesGrid projectId={projectId} yyyyMM={gridYYYYMM} />
    </main>
  );
}

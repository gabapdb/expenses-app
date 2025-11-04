"use client";

import ExpensesGrid from "@/components/ExpensesGrid";

export default function ExpensesPage({
  params,
}: {
  params: { yyyyMM: string };
}) {
  const yyyyMM = params.yyyyMM;

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Expenses</h1>
      <ExpensesGrid yyyyMM={yyyyMM} />
    </main>
  );
}

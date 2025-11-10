"use client";

import { use } from "react";
import ExpensesGrid from "@/components/ExpensesGrid";

export default function ExpensesPage({
  params,
}: {
  params: Promise<{ yyyyMM: string }>;
}) {
  // ✅ unwrap the async params
  const { yyyyMM } = use(params);

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Expenses</h1>
      <ExpensesGrid yyyyMM={yyyyMM} />
    </main>
  );
}
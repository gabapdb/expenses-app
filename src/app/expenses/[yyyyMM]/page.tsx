import { use } from "react";

import ExpensesPageClient from "./ExpensesPageClient";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAvailableExpenseYearsAndMonths } from "@/hooks/expenses/useAvailableExpenseYearsAndMonths";
import ExpensesGrid from "@/features/expenses/components/ExpensesGrid";


export default function ExpensesPage({
  params,
}: {
  params: { yyyyMM: string };
}) {
  const { yyyyMM } = use(params);

  return <ExpensesPageClient initialYYYYMM={yyyyMM} />;
}

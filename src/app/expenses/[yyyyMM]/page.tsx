import { use } from "react";

import ExpensesPageClient from "./ExpensesPageClient";

export default function ExpensesPage({
  params,
}: {
  params: Promise<{ yyyyMM: string }>;
}) {
  const { yyyyMM } = use(params);

  return <ExpensesPageClient initialYYYYMM={yyyyMM} />;
}

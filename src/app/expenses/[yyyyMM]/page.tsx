import ExpensesPageClient from "./ExpensesPageClient";

export default async function ExpensesPage({
  params,
}: {
  params: Promise<{ yyyyMM: string }>;
}) {
  const { yyyyMM } = await params;

  return <ExpensesPageClient initialYYYYMM={yyyyMM} />;
}

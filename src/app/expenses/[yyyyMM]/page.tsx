import ExpensesPageClient from "./ExpensesPageClient";

export default async function ExpensesPage({
  params,
}: {
  params: { yyyyMM: string };
}) {
  const { yyyyMM } = await params;

  return <ExpensesPageClient initialYYYYMM={yyyyMM} />;
}

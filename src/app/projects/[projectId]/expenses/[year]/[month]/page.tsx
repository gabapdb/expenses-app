import { ExpenseDateProvider } from "@/context/ExpenseDateContext";

import ExpensesPageClient from "./ExpensesPageClient";

interface ExpensesPageProps {
  params: {
    projectId: string;
    year: string;
    month: string;
  };
}

export default function ExpensesPage({ params }: ExpensesPageProps) {
  const { projectId, year, month } = params;
  const normalizedYear = year.padStart(4, "0").slice(-4);
  const normalizedMonth = month.padStart(2, "0").slice(-2);
  const yyyyMM = `${normalizedYear}${normalizedMonth}`;

  return (
    <ExpenseDateProvider>
      <ExpensesPageClient projectId={projectId} yyyyMM={yyyyMM} />
    </ExpenseDateProvider>
  );
}

import { redirect } from "next/navigation";
import { format } from "date-fns";

export default function ExpensesIndexPage() {
  const currentMonthId = format(new Date(), "yyyyMM");
  redirect(`/expenses/${currentMonthId}`);
}

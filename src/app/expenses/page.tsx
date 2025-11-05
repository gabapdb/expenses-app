import { redirect } from "next/navigation";
import { toYYYYMM } from "@/utils/time";

export default function ExpensesIndexPage() {
  redirect(`/expenses/${toYYYYMM()}`);
}

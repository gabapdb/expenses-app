import { redirect } from "next/navigation";
import { toYYYYMM } from "@/utils/time";

export default function ExpensesIndexPage() {
  // Fallback for legacy `/expenses` links/bookmarks. The sidebar now links
  // directly to `/expenses/<yyyyMM>`, but we keep this redirect so hitting the
  // bare route still lands on the latest month.
  redirect(`/expenses/${toYYYYMM()}`);
}

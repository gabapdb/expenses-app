"use client";

import { ExpenseDateProvider } from "@/context/ExpenseDateContext";

export default function ExpensesLayout({ children }: { children: React.ReactNode }) {
  return <ExpenseDateProvider>{children}</ExpenseDateProvider>;
}

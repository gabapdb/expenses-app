"use client";

import ExpensesGrid from "@/components/ExpensesGrid";
import AuthButtons from "@/components/AuthButtons";
import { useAuthUser } from "@/hooks/useAuthUser";

export default function ExpensesPage({
  params,
}: {
  params: { yyyyMM: string };
}) {
  const yyyyMM = params.yyyyMM;
  const { user, loading } = useAuthUser();

  if (loading) {
    return (
      <main className="p-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-gray-300">
          Checking your workspace access…
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="p-6 space-y-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-gray-300">
          You need to be signed in to view the expenses ledger. Please sign in with
          your APDB account to continue.
        </div>
        <AuthButtons />
      </main>
    );
  }

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Expenses</h1>
      <ExpensesGrid yyyyMM={yyyyMM} />
    </main>
  );
}

"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CircleDollarSign,
  FileText,
  Folder,
  Home,
  LifeBuoy,
  Mail,
  Plus,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useRealtimeExpenses } from "@/hooks/useRealtimeExpenses";
import { peso } from "@/utils/format";
import { compareExpensesByPaymentDate } from "@/utils/expenses";

const quickPrompts = [
  "Summarize this month’s spending",
  "Prepare vendor payment schedule",
  "List invoices without receipts",
  "Show project variances",
];

export default function HomePage() {
  const now = new Date();
  const currentMonthId = format(now, "yyyyMM");
  const { data: expenses, loading } = useRealtimeExpenses(currentMonthId);

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Projects", href: "/projects", icon: Folder },
    { label: "Expenses", href: `/expenses/${currentMonthId}`, icon: CircleDollarSign },
    { label: "Summary", href: "/summary", icon: BarChart3 },
  ];

  const quickLinks = [
    {
      title: "Project pipeline",
      description: "Overview budgets and schedule milestones",
      href: "/projects",
      icon: Folder,
    },
    {
      title: "Month view",
      description: "Dive into this month’s expense feed",
      href: `/expenses/${currentMonthId}`,
      icon: CircleDollarSign,
    },
    {
      title: "Analytics",
      description: "See trends across projects and suppliers",
      href: "/summary",
      icon: TrendingUp,
    },
  ];

  const tools = [
    { label: "Image generation", icon: Sparkles },
    { label: "Reports", icon: FileText },
    { label: "Follow-ups", icon: Mail },
  ];

  const { totalPaid, outstandingTotal, paidCount, outstandingCount } = useMemo(() => {
    const paid = expenses.filter((expense) => expense.paid);
    const outstanding = expenses.filter((expense) => !expense.paid);

    const sum = (items: typeof expenses) =>
      items.reduce((acc, expense) => acc + (Number(expense.amount) || 0), 0);

    return {
      totalPaid: sum(paid),
      outstandingTotal: sum(outstanding),
      paidCount: paid.length,
      outstandingCount: outstanding.length,
    };
  }, [expenses]);

  const upcomingExpenses = useMemo(() => {
    return expenses
      .filter((expense) => !expense.paid)
      .filter((expense) => expense.invoiceDate)
      .map((expense) => {
        const invoiceDate = parseISO(expense.invoiceDate);
        if (Number.isNaN(invoiceDate.getTime())) {
          return null;
        }

        return { expense, invoiceDate };
      })
      .filter((entry): entry is { expense: typeof expenses[number]; invoiceDate: Date } => Boolean(entry?.invoiceDate))
      .sort((a, b) => a.invoiceDate.getTime() - b.invoiceDate.getTime())
      .slice(0, 4);
  }, [expenses]);

  const topCategories = useMemo(() => {
    const totals = new Map<string, number>();

    expenses.forEach((expense) => {
      const key = `${expense.category} • ${expense.subCategory}`;
      totals.set(key, (totals.get(key) ?? 0) + (Number(expense.amount) || 0));
    });

    return Array.from(totals.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);
  }, [expenses]);

  const recentPaid = useMemo(() => {
    return expenses
      .filter((expense) => expense.paid && expense.datePaid)
      .slice()
      .sort((a, b) => compareExpensesByPaymentDate(b, a))
      .slice(0, 4);
  }, [expenses]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-[#02050b] via-[#050b16] to-[#0a1629] text-slate-100">
      <div className="mx-auto flex h-full max-w-[1400px] gap-6 px-4 py-8 sm:px-6 lg:px-10">
        <aside className="hidden w-60 flex-col justify-between rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg shadow-[0_25px_80px_-45px_rgba(3,7,18,0.85)] lg:flex">
          <div className="space-y-8">
            <div className="space-y-2">
              <div className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Workspace</div>
              <p className="text-lg font-semibold text-white">Toolbox Expenses</p>
              <p className="text-xs text-slate-500">{format(now, "MMMM d, yyyy")}</p>
            </div>

            <nav className="space-y-6 text-sm">
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Navigation</p>
                <ul className="space-y-1">
                  {navItems.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="flex items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-slate-300 transition-colors hover:border-white/10 hover:bg-white/5 hover:text-white"
                      >
                        <item.icon className="h-4 w-4 text-slate-500" />
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Workspace tools</p>
                <ul className="space-y-1 text-slate-500">
                  {tools.map((tool) => (
                    <li key={tool.label} className="flex items-center gap-3 rounded-xl px-3 py-2">
                      <tool.icon className="h-4 w-4" />
                      {tool.label}
                    </li>
                  ))}
                </ul>
              </div>
            </nav>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
            <p className="text-sm font-semibold text-white">Need help?</p>
            <p className="mt-1 text-xs text-slate-400">
              Visit the knowledge base or reach out for onboarding support anytime.
            </p>
            <Button className="mt-4 w-full gap-2 rounded-xl border border-white/10 bg-white/10 text-xs font-semibold text-white hover:bg-white/20">
              <LifeBuoy className="h-4 w-4" />
              Help center
            </Button>
          </div>
        </aside>

        <main className="flex-1 space-y-8">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_25px_80px_-45px_rgba(3,7,18,0.85)] backdrop-blur-lg sm:p-10">
            <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
              <div className="space-y-4">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-slate-200">
                  <Sparkles className="h-4 w-4 text-emerald-300" />
                  Expense copilot
                </span>
                <h1 className="text-3xl font-semibold text-white sm:text-4xl">
                  How can Toolbox assist with your finances today?
                </h1>
                <p className="text-sm text-slate-300">
                  Ask anything about invoices, upload receipts, or jump into the latest project spend. Everything stays in sync across your workspace.
                </p>
              </div>

              <Card className="w-full rounded-[32px] border border-white/10 bg-[#0c1426]/80 p-6 text-left shadow-[0_20px_60px_-45px_rgba(6,13,31,0.9)]">
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">Start a request</label>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <Button className="flex-1 justify-center gap-2 rounded-2xl bg-white text-sm font-semibold text-slate-950 hover:bg-slate-100">
                    <Plus className="h-4 w-4" />
                    Add a new expense
                  </Button>
                  <Button className="flex-1 justify-center gap-2 rounded-2xl border border-white/15 bg-transparent text-sm font-semibold text-white hover:bg-white/10">
                    <Mail className="h-4 w-4" />
                    Draft a follow-up
                  </Button>
                </div>
                <div className="mt-6 grid gap-3 text-left sm:grid-cols-2">
                  {quickPrompts.map((prompt) => (
                    <Link
                      key={prompt}
                      href={`/expenses/${currentMonthId}`}
                      className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 transition hover:border-white/20 hover:bg-white/10"
                    >
                      <span>{prompt}</span>
                      <ArrowRight className="h-4 w-4 text-slate-500 transition group-hover:translate-x-1 group-hover:text-slate-200" />
                    </Link>
                  ))}
                </div>
              </Card>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">Recent activity</h2>
              <Link
                href={`/expenses/${currentMonthId}`}
                className="text-xs font-semibold text-slate-400 transition hover:text-white"
              >
                View expenses
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {recentPaid.length === 0 ? (
                <Card className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-400">
                  Payments will appear here as soon as you mark invoices paid in the expenses tab.
                </Card>
              ) : (
                recentPaid.map((expense) => (
                  <Card key={expense.id} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                    <p className="text-sm font-semibold text-white">{expense.payee || expense.subCategory}</p>
                    <p className="mt-2 text-xs text-slate-400">
                      Paid {expense.datePaid ? format(parseISO(expense.datePaid), "MMM d") : "—"}
                    </p>
                    <p className="mt-4 text-lg font-semibold text-emerald-300">{peso(Number(expense.amount) || 0)}</p>
                  </Card>
                ))
              )}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-base font-semibold text-white">Quick links</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {quickLinks.map((link) => (
                <Link key={link.title} href={link.href} className="group">
                  <Card className="flex h-full flex-col justify-between rounded-3xl border border-white/10 bg-white/5 p-5 transition duration-150 group-hover:-translate-y-0.5 group-hover:border-white/20 group-hover:bg-white/10">
                    <div className="flex items-center justify-between">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                        <link.icon className="h-5 w-5 text-emerald-300" />
                      </span>
                      <ArrowRight className="h-4 w-4 text-slate-500 transition group-hover:translate-x-1 group-hover:text-slate-200" />
                    </div>
                    <div className="mt-6 space-y-2 text-left">
                      <p className="text-base font-semibold text-white">{link.title}</p>
                      <p className="text-sm text-slate-400">{link.description}</p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        </main>

        <aside className="hidden w-80 flex-col gap-4 lg:flex">
          <Card className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Workspace pulse</h2>
              <span className="text-[11px] text-slate-500">{loading ? "Syncing…" : `${expenses.length} records`}</span>
            </div>
            <div className="mt-6 grid gap-4">
              <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/15 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-emerald-200/80">Paid this month</p>
                    <p className="mt-2 text-xl font-semibold text-white">{peso(totalPaid)}</p>
                  </div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-200">
                    <Wallet className="h-5 w-5" />
                  </span>
                </div>
                <p className="mt-3 text-xs text-emerald-100/70">{paidCount} invoice{paidCount === 1 ? "" : "s"} cleared.</p>
              </div>

              <div className="rounded-2xl border border-rose-400/30 bg-rose-500/15 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-rose-100/80">Outstanding</p>
                    <p className="mt-2 text-xl font-semibold text-white">{peso(outstandingTotal)}</p>
                  </div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/25 text-rose-100">
                    <TrendingUp className="h-5 w-5" />
                  </span>
                </div>
                <p className="mt-3 text-xs text-rose-100/70">{outstandingCount} invoice{outstandingCount === 1 ? "" : "s"} awaiting payment.</p>
              </div>
            </div>
          </Card>

          <Card className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Next to follow up</h3>
            <ul className="mt-4 space-y-3">
              {upcomingExpenses.length === 0 && (
                <li className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-400">
                  All caught up! Any new unpaid expenses will appear here.
                </li>
              )}
              {upcomingExpenses.map(({ expense, invoiceDate }) => (
                <li
                  key={expense.id}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                >
                  <div>
                    <p className="font-medium text-white">{expense.payee || expense.subCategory}</p>
                    <p className="text-xs text-slate-400">Due {format(invoiceDate, "MMM d")}</p>
                  </div>
                  <span className="text-sm font-semibold text-slate-200">{peso(Number(expense.amount) || 0)}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Top categories</h3>
            <ul className="mt-4 space-y-3">
              {topCategories.length === 0 && (
                <li className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-400">
                  Add expenses to see which categories drive the most spend.
                </li>
              )}
              {topCategories.map(([label, value]) => (
                <li
                  key={label}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                >
                  <span className="font-medium text-white">{label}</span>
                  <span className="text-sm font-semibold text-slate-200">{peso(value)}</span>
                </li>
              ))}
            </ul>
          </Card>
        </aside>
      </div>
    </div>
  );
}

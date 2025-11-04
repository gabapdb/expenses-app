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
    <div className="min-h-[calc(100vh-4rem)] bg-[#f7f7f8] text-slate-900">
      <div className="mx-auto flex h-full max-w-[1400px] gap-6 px-4 py-8 sm:px-6 lg:px-10">
        <aside className="hidden w-60 flex-col justify-between rounded-3xl border border-slate-200 bg-[#202123] p-6 text-slate-200 shadow-lg lg:flex">
          <div className="space-y-8">
            <div className="space-y-2">
              <div className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Workspace</div>
              <p className="text-lg font-semibold text-white">Toolbox Expenses</p>
              <p className="text-xs text-slate-400">{format(now, "MMMM d, yyyy")}</p>
            </div>

            <nav className="space-y-6 text-sm">
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Navigation</p>
                <ul className="space-y-1">
                  {navItems.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="flex items-center gap-3 rounded-xl px-3 py-2 text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
                      >
                        <item.icon className="h-4 w-4 text-slate-400" />
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Workspace tools</p>
                <ul className="space-y-1 text-slate-400">
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

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-semibold text-white">Need help?</p>
            <p className="mt-1 text-xs text-slate-300">
              Visit the knowledge base or reach out for onboarding support anytime.
            </p>
            <Button className="mt-4 w-full gap-2 rounded-xl bg-white/10 text-xs font-semibold text-white hover:bg-white/20">
              <LifeBuoy className="h-4 w-4" />
              Help center
            </Button>
          </div>
        </aside>

        <main className="flex-1 space-y-8">
          <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-6">
              <div className="rounded-[32px] border border-[#dcdce5] bg-gradient-to-br from-[#f0f0f5] via-white to-[#f9f9fb] p-10 shadow-sm">
                <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
                  <div className="space-y-4">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/60 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                      <Sparkles className="h-4 w-4 text-emerald-500" />
                      Expense copilot
                    </span>
                    <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
                      How can Toolbox assist with your finances today?
                    </h1>
                    <p className="text-sm text-slate-600">
                      Ask anything about invoices, upload receipts, or jump into the latest project spend. Everything stays in sync across your workspace.
                    </p>
                  </div>

                  <Card className="w-full rounded-3xl border border-slate-200 bg-white/90 p-6 text-left shadow-sm">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Start a request</label>
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                      <Button className="flex-1 justify-center gap-2 rounded-2xl bg-gray-900 text-sm font-semibold text-white hover:bg-black">
                        <Plus className="h-4 w-4" />
                        New expense
                      </Button>
                      <Button className="flex-1 justify-center gap-2 rounded-2xl bg-white text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-100">
                        <FileText className="h-4 w-4" />
                        Upload receipt
                      </Button>
                    </div>
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      {quickPrompts.map((prompt) => (
                        <button
                          key={prompt}
                          className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2 text-left text-sm font-medium text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900"
                        >
                          <span>{prompt}</span>
                          <ArrowRight className="h-4 w-4 text-slate-400" />
                        </button>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>

              <Card className="rounded-3xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Quick links</h2>
                    <p className="text-sm text-slate-500">Jump back into popular areas of the workspace.</p>
                  </div>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {quickLinks.map((link) => (
                    <Link
                      key={link.title}
                      href={link.href}
                      className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-md"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                        <link.icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="font-semibold text-slate-900 group-hover:text-slate-950">{link.title}</p>
                        <p className="text-sm text-slate-500">{link.description}</p>
                      </div>
                      <ArrowRight className="ml-auto h-4 w-4 text-slate-300" />
                    </Link>
                  ))}
                </div>
              </Card>
            </div>

            <div className="space-y-4">
              <Card className="rounded-3xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">Paid this month</p>
                    <p className="mt-1 text-2xl font-semibold text-slate-900">{peso(totalPaid)}</p>
                  </div>
                  <Wallet className="h-6 w-6 text-emerald-500" />
                </div>
                <p className="mt-4 text-sm text-slate-500">{paidCount} expenses marked as paid.</p>
              </Card>

              <Card className="rounded-3xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">Outstanding</p>
                    <p className="mt-1 text-2xl font-semibold text-slate-900">{peso(outstandingTotal)}</p>
                  </div>
                  <CircleDollarSign className="h-6 w-6 text-amber-500" />
                </div>
                <p className="mt-4 text-sm text-slate-500">{outstandingCount} invoices awaiting payment.</p>
              </Card>

              <Card className="rounded-3xl border border-slate-200">
                <h3 className="text-sm font-semibold text-slate-500">Upcoming invoices</h3>
                <ul className="mt-4 space-y-3">
                  {loading && <li className="text-sm text-slate-500">Loading…</li>}
                  {!loading && upcomingExpenses.length === 0 && (
                    <li className="text-sm text-slate-500">No upcoming invoices.</li>
                  )}
                  {upcomingExpenses.map(({ expense, invoiceDate }) => (
                    <li key={expense.id} className="flex items-center justify-between text-sm text-slate-600">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-slate-900">{expense.payee || expense.details || "Untitled"}</p>
                        <p className="text-xs text-slate-500">{expense.category} • {expense.subCategory}</p>
                      </div>
                      <span className="ml-4 text-xs font-semibold text-slate-500">{format(invoiceDate, "MMM d")}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="rounded-3xl border border-slate-200">
                <h3 className="text-sm font-semibold text-slate-500">Recent payments</h3>
                <ul className="mt-4 space-y-3">
                  {loading && <li className="text-sm text-slate-500">Loading…</li>}
                  {!loading && recentPaid.length === 0 && (
                    <li className="text-sm text-slate-500">No recent payments recorded.</li>
                  )}
                  {recentPaid.map((expense) => (
                    <li key={expense.id} className="flex items-center justify-between text-sm text-slate-600">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-slate-900">{expense.payee || expense.details || "Untitled"}</p>
                        <p className="text-xs text-slate-500">{expense.category} • {expense.subCategory}</p>
                      </div>
                      <span className="ml-4 text-xs font-semibold text-slate-500">
                        {expense.datePaid ? format(parseISO(expense.datePaid), "MMM d") : "—"}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="rounded-3xl border border-slate-200">
                <h3 className="text-sm font-semibold text-slate-500">Top categories</h3>
                <ul className="mt-4 space-y-3">
                  {loading && <li className="text-sm text-slate-500">Loading…</li>}
                  {!loading && topCategories.length === 0 && (
                    <li className="text-sm text-slate-500">No spending recorded.</li>
                  )}
                  {topCategories.map(([key, amount]) => (
                    <li key={key} className="flex items-center justify-between text-sm text-slate-600">
                      <span className="font-medium text-slate-900">{key}</span>
                      <span className="text-xs font-semibold text-slate-500">{peso(amount)}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

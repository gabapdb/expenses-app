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
    <div className="min-h-[calc(100vh-4rem)] bg-[#07090f] px-4 py-8 text-slate-100 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row">
        <aside className="rounded-3xl border border-white/5 bg-white/[0.03] p-6 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.6)] lg:sticky lg:top-8 lg:h-[calc(100vh-6rem)] lg:w-64">
          <div className="flex h-full flex-col gap-8">
            <div className="space-y-1">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Workspace</div>
              <p className="text-lg font-semibold text-white">Toolbox Expenses</p>
              <p className="text-xs text-slate-500">{format(now, "MMMM d, yyyy")}</p>
            </div>

            <nav className="flex-1 space-y-6 overflow-y-auto pr-1">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Navigation</p>
                <ul className="space-y-1">
                  {navItems.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                      >
                        <item.icon className="h-4 w-4 text-slate-500" />
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tools</p>
                <ul className="space-y-1">
                  {tools.map((tool) => (
                    <li key={tool.label}>
                      <span className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-500">
                        <tool.icon className="h-4 w-4 text-slate-600" />
                        {tool.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>

            <div className="rounded-2xl border border-white/5 bg-white/[0.04] p-4">
              <p className="text-sm font-semibold text-white">Need help?</p>
              <p className="mt-1 text-xs text-slate-400">
                Visit the knowledge base or reach out for onboarding support anytime.
              </p>
              <Button className="mt-4 w-full gap-2 rounded-xl border border-white/10 bg-white/10 text-xs font-semibold text-white hover:bg-white/20">
                <LifeBuoy className="h-4 w-4" />
                Help center
              </Button>
            </div>
          </div>
        </aside>

        <main className="flex-1 space-y-8 lg:pr-6">
          <div className="rounded-3xl border border-white/5 bg-gradient-to-br from-[#111620] via-[#0c0f17] to-[#0b0e15] p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row">
              <div className="flex-1 space-y-6">
                <div>
                  <p className="text-sm font-medium text-emerald-300">Welcome back</p>
                  <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
                    What will you create today?
                  </h1>
                  <p className="mt-3 max-w-xl text-sm text-slate-400">
                    Attach receipts, plan follow-ups, and keep every project budget in one streamlined workspace.
                  </p>
                </div>

                <Card className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                  <p className="text-sm font-medium text-slate-300">Message Toolbox.ai</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <Button className="flex items-center justify-center gap-2 rounded-xl bg-white/90 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-white">
                      <Plus className="h-4 w-4" />
                      Attach receipt
                    </Button>
                    <Button className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-transparent px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">
                      <Mail className="h-4 w-4" />
                      Send follow-up
                    </Button>
                  </div>
                </Card>
              </div>

              <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-sm text-emerald-100 lg:w-64">
                <p className="text-xs uppercase tracking-wide text-emerald-300">Live summary</p>
                <p className="mt-3 text-lg font-semibold text-white">
                  {loading ? "Syncing data…" : `${expenses.length} active expenses`}
                </p>
                <p className="mt-2 text-xs text-emerald-200/80">
                  Data refreshes instantly whenever you add or update an expense from any month tab.
                </p>
                <Link
                  href={`/expenses/${currentMonthId}`}
                  className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-emerald-300 hover:text-emerald-200"
                >
                  View current month
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {quickLinks.map((link) => (
              <Link key={link.title} href={link.href} className="group">
                <Card className="flex h-full flex-col justify-between rounded-3xl border border-white/5 bg-white/[0.04] p-6 transition-transform duration-150 group-hover:-translate-y-1 group-hover:border-white/20">
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                      <link.icon className="h-5 w-5 text-emerald-300" />
                    </span>
                    <ArrowRight className="h-4 w-4 text-slate-500 transition-transform group-hover:translate-x-1" />
                  </div>
                  <div className="mt-6 space-y-2">
                    <p className="text-base font-semibold text-white">{link.title}</p>
                    <p className="text-sm text-slate-400">{link.description}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Recent activity</h2>
              <Link href={`/expenses/${currentMonthId}`} className="text-xs font-semibold text-slate-400 hover:text-white">
                See all
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {recentPaid.length === 0 ? (
                <Card className="rounded-3xl border border-white/5 bg-white/[0.03] p-6 text-sm text-slate-400">
                  Payments will appear here as soon as you mark invoices paid in the expenses tab.
                </Card>
              ) : (
                recentPaid.map((expense) => (
                  <Card key={expense.id} className="rounded-3xl border border-white/5 bg-white/[0.04] p-6">
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
        </main>

        <aside className="lg:w-80">
          <div className="space-y-4">
            <Card className="rounded-3xl border border-white/5 bg-white/[0.04] p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Dashboard</h2>
                <span className="text-xs text-slate-500">{loading ? "Syncing…" : `${expenses.length} records`}</span>
              </div>
              <div className="mt-6 grid gap-4">
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-emerald-200/80">Paid this month</p>
                      <p className="mt-2 text-xl font-semibold text-white">{peso(totalPaid)}</p>
                    </div>
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-200">
                      <Wallet className="h-5 w-5" />
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-emerald-200/70">{paidCount} invoice{paidCount === 1 ? "" : "s"} cleared.</p>
                </div>

                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-rose-200/80">Outstanding</p>
                      <p className="mt-2 text-xl font-semibold text-white">{peso(outstandingTotal)}</p>
                    </div>
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-200">
                      <TrendingUp className="h-5 w-5" />
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-rose-100/70">{outstandingCount} invoice{outstandingCount === 1 ? "" : "s"} awaiting payment.</p>
                </div>
              </div>
            </Card>

            <Card className="rounded-3xl border border-white/5 bg-white/[0.04] p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Next to follow up</h3>
              <ul className="mt-4 space-y-3">
                {upcomingExpenses.length === 0 && (
                  <li className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-xs text-slate-500">
                    All caught up! Any new unpaid expenses will appear here.
                  </li>
                )}
                {upcomingExpenses.map(({ expense, invoiceDate }) => (
                  <li
                    key={expense.id}
                    className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3 text-sm"
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

            <Card className="rounded-3xl border border-white/5 bg-white/[0.04] p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Top categories</h3>
              <ul className="mt-4 space-y-3">
                {topCategories.length === 0 && (
                  <li className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-xs text-slate-500">
                    Add expenses to see which categories drive the most spend.
                  </li>
                )}
                {topCategories.map(([label, value]) => (
                  <li
                    key={label}
                    className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3 text-sm"
                  >
                    <span className="font-medium text-white">{label}</span>
                    <span className="text-sm font-semibold text-slate-200">{peso(value)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </aside>
      </div>
    </div>
  );
}

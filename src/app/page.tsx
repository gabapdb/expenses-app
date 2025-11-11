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
import { format } from "date-fns";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useRealtimeExpenses } from "@/hooks/expenses/useRealtimeExpenses";
import { peso } from "@/utils/format";

const quickPrompts = [
  "Summarize this month’s spending",
  "Prepare vendor payment schedule",
  "List invoices without receipts",
  "Show project variances",
];

export default function HomePage() {
  const now = new Date();
  const currentMonthId = format(now, "yyyyMM");
  const { data: expenses } = useRealtimeExpenses(currentMonthId);

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
    const sum = (items: typeof expenses) => items.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

    return {
      totalPaid: sum(paid),
      outstandingTotal: sum(outstanding),
      paidCount: paid.length,
      outstandingCount: outstanding.length,
    };
  }, [expenses]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#181818] text-[#e6e6e6]">
      <div className="mx-auto flex h-full max-w-[1400px] gap-6 px-4 py-8 sm:px-6 lg:px-10">
        {/* Sidebar */}
        <aside className="hidden w-60 flex-col justify-between rounded-3xl border border-[#2f2f2f] bg-[#1f1f1f] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.5)] lg:flex">
          <div className="space-y-8">
            <div className="space-y-2">
              <div className="text-[10px] uppercase tracking-[0.3em] text-gray-500">Workspace</div>
              <p className="text-lg font-semibold text-white">APDB Project and Expenses Manager</p>
              <p className="text-xs text-gray-500">{format(now, "MMMM d, yyyy")}</p>
            </div>

            <nav className="space-y-6 text-sm">
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Navigation</p>
                <ul className="space-y-1">
                  {navItems.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="flex items-center gap-3 rounded-xl px-3 py-2 text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
                      >
                        <item.icon className="h-4 w-4 text-gray-400" />
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Workspace tools</p>
                <ul className="space-y-1 text-gray-400">
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

          <div className="rounded-2xl border border-[#2f2f2f] bg-[#2a2a2a] p-4">
            <p className="text-sm font-semibold text-white">Need help?</p>
            <p className="mt-1 text-xs text-gray-400">
              Visit the knowledge base or reach out for onboarding support anytime.
            </p>
            <Button className="mt-4 w-full gap-2 rounded-xl bg-[#3a3a3a] text-xs font-semibold text-white hover:bg-[#4a4a4a]">
              <LifeBuoy className="h-4 w-4" />
              Help center
            </Button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 space-y-8">
          <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-6">
              {/* Header section */}
              <div className="rounded-[32px] border border-[#2f2f2f] bg-[#1f1f1f] p-10 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
                  <div className="space-y-4">
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#333] bg-[#2a2a2a] px-4 py-1 text-xs font-semibold uppercase tracking-wide text-gray-300">
                      <Sparkles className="h-4 w-4 text-emerald-400" />
                      APDB
                    </span>
                    <p className="text-sm text-gray-400">Projects and Expenses Manager.</p>
                  </div>

                  <Card className="w-full rounded-3xl border border-[#3a3a3a] bg-[#2a2a2a] p-6 text-left shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Start a request
                    </label>
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                      <Button className="flex-1 justify-center gap-2 rounded-2xl bg-[#3a3a3a] text-sm font-semibold text-white hover:bg-[#4a4a4a]">
                        <Plus className="h-4 w-4" />
                        New expense
                      </Button>
                      <Button className="flex-1 justify-center gap-2 rounded-2xl bg-[#2a2a2a] text-sm font-semibold text-[#e6e6e6] border border-[#3a3a3a] hover:bg-[#383838]">
                        <FileText className="h-4 w-4" />
                        Upload receipt
                      </Button>
                    </div>

                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      {quickPrompts.map((prompt) => (
                        <button
                          key={prompt}
                          className="flex items-center justify-between rounded-xl border border-[#3a3a3a] bg-[#2a2a2a] px-4 py-2 text-left text-sm font-medium text-[#d6d6d6] hover:bg-[#3a3a3a]"
                        >
                          <span>{prompt}</span>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        </button>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>

              {/* Quick links */}
              <Card className="rounded-3xl border border-[#3a3a3a] bg-[#2a2a2a]">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-[#e6e6e6]">Quick links</h2>
                    <p className="text-sm text-gray-400">Jump back into popular areas of the workspace.</p>
                  </div>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {quickLinks.map((link) => (
                    <Link
                      key={link.title}
                      href={link.href}
                      className="group flex items-start gap-4 rounded-2xl border border-[#3a3a3a] bg-[#2a2a2a] p-4 hover:border-[#4a4a4a] hover:bg-[#333]"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3a3a3a] text-gray-300">
                        <link.icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="font-semibold text-[#e6e6e6] group-hover:text-white">{link.title}</p>
                        <p className="text-sm text-gray-400">{link.description}</p>
                      </div>
                      <ArrowRight className="ml-auto h-4 w-4 text-gray-500" />
                    </Link>
                  ))}
                </div>
              </Card>
            </div>

            {/* Side summary cards */}
            <div className="space-y-4">
              <Card className="rounded-3xl border border-[#3a3a3a] bg-[#2a2a2a] text-[#e6e6e6]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-400">Paid this month</p>
                    <p className="mt-1 text-2xl font-semibold text-white">{peso(totalPaid)}</p>
                  </div>
                  <Wallet className="h-6 w-6 text-emerald-400" />
                </div>
                <p className="mt-4 text-sm text-gray-500">{paidCount} expenses marked as paid.</p>
              </Card>

              <Card className="rounded-3xl border border-[#3a3a3a] bg-[#2a2a2a] text-[#e6e6e6]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-400">Outstanding</p>
                    <p className="mt-1 text-2xl font-semibold text-white">{peso(outstandingTotal)}</p>
                  </div>
                  <CircleDollarSign className="h-6 w-6 text-amber-400" />
                </div>
                <p className="mt-4 text-sm text-gray-500">{outstandingCount} invoices awaiting payment.</p>
              </Card>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

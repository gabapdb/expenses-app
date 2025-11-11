"use client";

import { Folder, CreditCard, PieChart, Coins } from "lucide-react";
import SummaryCard from "@/components/ui/SummaryCard";
import SectionHeader from "@/components/ui/SectionHeader";
import ExpensesTable from "@/components/ui/ExpensesTable";
import "@/styles/dashboard.css";

export default function DashboardPage() {
  return (
    <main className="dashboard-container">
      {/* === Summary Section === */}
      <SectionHeader title="Overview" subtitle="Project and Expense Summary" />

      <div className="summary-grid">
        <SummaryCard
          title="Total Projects"
          value="18"
          icon={<Folder size={28} />}
          color="blue"
        />
        <SummaryCard
          title="Total Expenses"
          value="₱1,230,450"
          icon={<CreditCard size={28} />}
          color="violet"
        />
        <SummaryCard
          title="Pending Liquidations"
          value="7"
          icon={<Coins size={28} />}
          color="amber"
        />
        <SummaryCard
          title="Remaining Budget"
          value="₱540,000"
          icon={<PieChart size={28} />}
          color="emerald"
        />
      </div>

      {/* === Recent Expenses === */}
      <SectionHeader
        title="Recent Expenses"
        subtitle="Latest submitted transactions"
      />

      <div className="table-wrapper">
        <ExpensesTable />
      </div>
    </main>
  );
}

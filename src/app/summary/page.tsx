"use client";

import { useState } from "react";
import YearPicker from "@/components/ui/YearPicker";
import SummaryByMonth from "@/features/summary/components/SummaryByMonth";
import SummaryByProjectYear from "@/features/summary/components/SummaryByProjectYear";

/* -------------------------------------------------------------------------- */
/* 🧩 Component                                                               */
/* -------------------------------------------------------------------------- */
export default function SummaryPage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<number>(currentYear);
  const [activeTab, setActiveTab] = useState<"monthly" | "yearly">("monthly");

  /* ------------------------------------------------------------------------ */
  /* 🖼️ Render                                                               */
  /* ------------------------------------------------------------------------ */
  return (
    <main className="min-h-screen flex flex-col bg-[#121212] text-[#e5e5e5] p-6 space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-xl font-semibold">Summary of Expenses</h1>
        <p className="text-sm text-[#9ca3af]">
          View project expenses by month, category, or yearly totals.
        </p>
      </div>

      {/* Tabs Header */}
      <div className="flex items-center justify-between border-b border-[#3a3a3a] bg-[#121212]">
        {/* Left: Tabs */}
        <div className="flex gap-4">
          {[
            { key: "monthly", label: "Monthly Expenses" },
            { key: "yearly", label: "Yearly Totals" },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key as "monthly" | "yearly")}
              className={`px-4 py-2 text-sm font-medium rounded-t-md transition-all ${
                activeTab === key
                  ? "bg-[#242424] text-[#e5e5e5] border border-[#3a3a3a] border-b-0 shadow-inner"
                  : "text-[#9ca3af] hover:text-[#e5e5e5] hover:bg-[#2a2a2a] border border-transparent"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Right: Year Picker */}
        <div className="pr-2 w-30 ">
          <YearPicker
            value={year}
            onChange={setYear}
            label=""
            mode="merged"
          />
        </div>
      </div>

      {/* Active Tab Content */}
      <div>
        {activeTab === "monthly" && <SummaryByMonth year={year} />}
        {activeTab === "yearly" && <SummaryByProjectYear year={year} />}
      </div>
    </main>
  );
}

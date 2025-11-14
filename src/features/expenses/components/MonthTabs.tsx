"use client";

import React from "react";
import { useExpenseDate } from "@/context/ExpenseDateContext";

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */
export default function MonthTabs() {
  const { selectedMonth, selectedYear, setMonth, loadingYears } = useExpenseDate();
  const months = React.useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        name: new Date(0, i).toLocaleString("default", { month: "long" }),
        value: `${selectedYear}${String(i + 1).padStart(2, "0")}`,
      })),
    [selectedYear]
  );

  return (
    <div className="flex flex-wrap items-end gap-1 border-[#3a3a3a] bg-[#121212]">
      {months.map((m) => {
        const isActive = m.value.slice(4, 6) === selectedMonth;

        return (
          <button
            key={m.value}
            type="button"
            onClick={() => !loadingYears && setMonth(m.value)}
            className={`px-4 py-2 text-sm font-medium rounded-t-md transition-all ${
              isActive
                ? "bg-[#242424] text-[#e5e5e5] border border-[#3a3a3a] border-b-0 shadow-inner"
                : "text-[#9ca3af] hover:text-[#e5e5e5] hover:bg-[#2a2a2a] border border-transparent"
            } ${loadingYears ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {m.name}
          </button>
        );
      })}
    </div>
  );
}

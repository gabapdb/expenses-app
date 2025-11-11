"use client";

import React from "react";

/* -------------------------------------------------------------------------- */
/* Props                                                                      */
/* -------------------------------------------------------------------------- */
export interface MonthTabsProps {
  months: { name: string; value: string }[];
  currentMonth: string;
  onChange?: (value: string) => void;
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */
export default function MonthTabs({ months, currentMonth, onChange }: MonthTabsProps) {
  return (
    <div className="flex flex-wrap items-end gap-1 border-[#3a3a3a] bg-[#1f1f1f]">
      {months.map((m) => {
        const isActive = m.value.slice(4, 6) === currentMonth;

        return (
          <button
            key={m.value}
            type="button"
            onClick={() => onChange?.(m.value)}
            className={`px-4 py-2 text-sm font-medium rounded-t-md transition-all ${
              isActive
                ? "bg-[#242424] text-[#e5e5e5] border border-[#3a3a3a] border-b-0 shadow-inner"
                : "text-[#9ca3af] hover:text-[#e5e5e5] hover:bg-[#2a2a2a] border border-transparent"
            }`}
          >
            {m.name}
          </button>
        );
      })}
    </div>
  );
}

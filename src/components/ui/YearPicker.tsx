"use client";

import { useMemo } from "react";
import { useExpenseYears } from "@/hooks/expenses/useExpenseYears";
import { useProjectYears } from "@/hooks/projects/useProjectYears";

/* -------------------------------------------------------------------------- */
/* 🧠 Types                                                                   */
/* -------------------------------------------------------------------------- */
interface YearPickerProps {
  value: number;
  onChange: (year: number) => void;
  label?: string;
  className?: string;
  mode?: "expenses" | "projects" | "merged";
}

/* -------------------------------------------------------------------------- */
/* 🧮 Helper                                                                  */
/* -------------------------------------------------------------------------- */
function mergeYears(a: number[], b: number[]): number[] {
  return Array.from(new Set([...a, ...b])).sort((x, y) => y - x);
}

/* -------------------------------------------------------------------------- */
/* 🧱 Component                                                               */
/* -------------------------------------------------------------------------- */
export default function YearPicker({
  value,
  onChange,
  label,
  className,
  mode = "merged",
}: YearPickerProps) {
  const expense = useExpenseYears();
  const project = useProjectYears();

  const years = useMemo(() => {
    const expYears = expense.years ?? [];
    const projYears = project.years ?? [];
    if (mode === "expenses") return expYears;
    if (mode === "projects") return projYears;
    return mergeYears(expYears, projYears);
  }, [expense.years, project.years, mode]);

  const loading = expense.loading || project.loading;
  const error = expense.error || project.error;

  return (
    <div className={`relative inline-block ${className ?? ""}`}>
      {label && (
        <label className="block mb-1 text-sm text-gray-400">{label}</label>
      )}

      {loading ? (
        <div className="text-sm text-gray-500">Loading years…</div>
      ) : error ? (
        <div className="text-sm text-red-400">Error: {error}</div>
      ) : years.length === 0 ? (
        <div className="text-sm text-gray-500">No years found.</div>
      ) : (
        <div className="relative w-20">
          <select
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="
              w-full
              appearance-none
              bg-[#1f1f1f]
              border border-[#3a3a3a]
              rounded-t-md
              px-3 py-[6px]
              text-sm text-[#e5e5e5]
              text-left
              hover:bg-[#2a2a2a]
              focus:outline-none focus:ring-1 focus:ring-[#3b82f6]
            "
            style={{ marginBottom: "2px" }}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          {/* ▼ Arrow */}
          <div
            className="
              pointer-events-none
              absolute
              inset-y-0
              right-3
              flex
              items-center
              text-[#9ca3af]
            "
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={2}
              stroke='currentColor'
              className='w-4 h-4'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M19 9l-7 7-7-7'
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}

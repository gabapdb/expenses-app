"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { peso, allMonths } from "@/utils/expenses";
import { listProjects } from "@/data/projects.repo";
import { useProjectExpensesByYear } from "@/hooks/expenses/useProjectExpensesByYear";
import type { Project } from "@/domain/models";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/core/firebase";
import { TEAM_OPTIONS, type TeamOption } from "@/config/teams";
import { normalizeTeam } from "@/utils/normalizeTeam";

/* -------------------------------------------------------------------------- */
/* 🧩 Types + Constants                                                       */
/* -------------------------------------------------------------------------- */
interface SummaryByProjectYearProps {
  year: number;
}

const CATEGORY_KEYS = [
  "Materials",
  "Salary",
  "Transport",
  "Cabinets",
  "Others",
] as const;
type MainCategory = (typeof CATEGORY_KEYS)[number];

interface YearlyData {
  id: string;
  totalSpent: number;
  totalCost: number;
  profit: number;
  categories: Record<MainCategory, number>;
}

const TEAM_COLORS = [
  "text-yellow-400",
  "text-blue-400",
  "text-green-400",
  "text-purple-400",
  "text-pink-400",
  "text-orange-400",
  "text-teal-400",
];

const TEAM_COLOR: Record<TeamOption, string> = TEAM_OPTIONS.reduce(
  (acc, team, index) => {
    acc[team] = TEAM_COLORS[index % TEAM_COLORS.length] ?? "text-gray-200";
    return acc;
  },
  {} as Record<TeamOption, string>
);

const getTeamColor = (team?: string | null) => {
  const normalized = normalizeTeam(team);
  return TEAM_COLOR[normalized] ?? "text-gray-200";
};

/* -------------------------------------------------------------------------- */
/* 🧮 Main Component                                                          */
/* -------------------------------------------------------------------------- */
export default function SummaryByProjectYear({ year }: SummaryByProjectYearProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [rows, setRows] = useState<YearlyData[]>([]);

  useEffect(() => {
    void listProjects().then(setProjects).catch(console.error);
  }, []);

  useEffect(() => {
    const loadYears = async () => {
      try {
        const ref = doc(db, "metadata", "expenseYears");
        await getDoc(ref);
      } catch (err) {
        console.error("[Summary] Failed to load expense years:", err);
      }
    };
    void loadYears();
  }, []);

  const sortedProjects = useMemo(
    () =>
      [...projects].sort((a, b) => {
        const t1 = normalizeTeam(a.team);
        const t2 = normalizeTeam(b.team);
        return (
          TEAM_OPTIONS.indexOf(t1) -
          TEAM_OPTIONS.indexOf(t2)
        );
      }),
    [projects]
  );

  /* 🧮 Collect totals from child rows */
  const handleData = useCallback((data: YearlyData) => {
    setRows((prev) => {
      const idx = prev.findIndex((r) => r.id === data.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = data;
        return copy;
      }
      return [...prev, data];
    });
  }, []);

  const totals = useMemo(() => {
    if (rows.length === 0) {
      return {
        totalCost: 0,
        totalSpent: 0,
        profit: 0,
        totalCats: {
          Materials: 0,
          Salary: 0,
          Transport: 0,
          Cabinets: 0,
          Others: 0,
        } as Record<MainCategory, number>,
      };
    }

    const totalCats: Record<MainCategory, number> = {
      Materials: 0,
      Salary: 0,
      Transport: 0,
      Cabinets: 0,
      Others: 0,
    };

    const totalCost = rows.reduce((a, b) => a + b.totalCost, 0);
    const totalSpent = rows.reduce((a, b) => a + b.totalSpent, 0);
    const profit = totalCost - totalSpent;

    for (const row of rows) {
      for (const k of CATEGORY_KEYS) {
        totalCats[k] += row.categories[k];
      }
    }

    return { totalCost, totalSpent, profit, totalCats };
  }, [rows]);

  return (
    <div className="border border-[#2f2f2f] bg-[#1a1a1a] rounded-md overflow-x-auto">
      <table className="min-w-max w-full text-[13px] text-[#d5d5d5]">
        <thead className="sticky top-0 bg-[#202020] text-[11px] uppercase tracking-wider text-[#a6a6a6] z-10 shadow-[0_2px_6px_#00000060]">
          <tr>
            <th className="px-3 py-2 font-semibold text-left">Project</th>
            <th className="px-3 py-2 font-semibold text-left">Start Date</th>
            <th className="px-3 py-2 font-semibold text-right">Project Cost</th>
            <th className="px-3 py-2 font-semibold text-right">Total Spent</th>
            <th className="px-3 py-2 font-semibold text-right">Profit</th>
            {CATEGORY_KEYS.map((key) => (
              <th key={key} className="px-3 py-2 font-semibold text-right">
                {key}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {sortedProjects.map((project) => (
            <ProjectYearRow
              key={project.id}
              project={project}
              year={year}
              onData={handleData}
            />
          ))}

          {rows.length > 0 && (
            <tr className="bg-[#272727] border-t border-[#333] font-semibold">
              <td className="px-3 py-2 text-left text-[#f5f5f5]">Total</td>
              <td className="px-3 py-2 text-left">—</td>
              <td className="px-3 py-2 text-right">{peso(totals.totalCost)}</td>
              <td className="px-3 py-2 text-right">{peso(totals.totalSpent)}</td>
              <td
                className={`px-3 py-2 text-right ${
                  totals.profit < 0
                    ? "text-red-400"
                    : totals.profit > 0
                    ? "text-green-400"
                    : "text-gray-300"
                }`}
              >
                {peso(totals.profit)}
              </td>
              {CATEGORY_KEYS.map((k) => (
                <td key={k} className="px-3 py-2 text-right">
                  {peso(totals.totalCats[k])}
                </td>
              ))}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 🧾 Project Row (child)                                                     */
/* -------------------------------------------------------------------------- */
function ProjectYearRow({
  project,
  year,
  onData,
}: {
  project: Project;
  year: number;
  onData: (data: YearlyData) => void;
}) {
  const data = useProjectExpensesByYear({ projectId: project.id }, year);
  const { byMonth, totalsByMonth } = data;

  const totalSpent = useMemo(
    () => Object.values(totalsByMonth).reduce((a, b) => a + b, 0),
    [totalsByMonth]
  );

  const catTotals = useMemo(() => {
    const totals: Record<MainCategory, number> = {
      Materials: 0,
      Salary: 0,
      Transport: 0,
      Cabinets: 0,
      Others: 0,
    };
    allMonths.forEach((m) => {
      for (const k of CATEGORY_KEYS) {
        totals[k] += byMonth[m]?.[k] ?? 0;
      }
    });
    return totals;
  }, [byMonth]);

  const profit =
    project.projectCost && project.projectCost > 0
      ? project.projectCost - totalSpent
      : 0;

  // Send data up for grand totals
  useEffect(() => {
    onData({
      id: project.id,
      totalSpent,
      totalCost: project.projectCost ?? 0,
      profit,
      categories: catTotals,
    });
  }, [onData, project.id, project.projectCost, totalSpent, catTotals, profit]);

  const textColor = getTeamColor(project.team);

  return (
    <tr className="border-t border-[#2e2e2e] hover:bg-[#222] transition">
      <td className={`px-3 py-1.5 font-medium ${textColor}`}>{project.name}</td>
      <td className="px-3 py-1.5 text-left">
        {project.startDate
          ? new Date(project.startDate).toLocaleDateString("en-PH", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "—"}
      </td>
      <td className="px-3 py-1.5 text-right">
        {project.projectCost ? peso(project.projectCost) : "—"}
      </td>
      <td className="px-3 py-1.5 text-right font-medium">
        {peso(totalSpent)}
      </td>
      <td
        className={`px-3 py-1.5 text-right font-semibold ${
          profit < 0
            ? "text-red-400"
            : profit > 0
            ? "text-green-400"
            : "text-gray-300"
        }`}
      >
        {peso(profit)}
      </td>

      {CATEGORY_KEYS.map((k) => (
        <td key={k} className="px-3 py-1.5 text-right">
          {peso(catTotals[k])}
        </td>
      ))}
    </tr>
  );
}

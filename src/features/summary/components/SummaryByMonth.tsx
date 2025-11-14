"use client";

import {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
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
interface SummaryByMonthProps {
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
type CategoryTotals = Record<MainCategory, number>;

type ProjectYearData = ReturnType<typeof useProjectExpensesByYear>;
type ProjectYearEnvelope = { id: string } & ProjectYearData;

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
export default function SummaryByMonth({ year }: SummaryByMonthProps) {
  const [projects, setProjects] = useState<Project[]>([]);

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

  return (
    <div className="space-y-2">
      {allMonths.map((month) => (
        <MonthSection
          key={month}
          month={month}
          projects={sortedProjects}
          year={year}
        />
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 📅 Month Section                                                           */
/* -------------------------------------------------------------------------- */
function MonthSection({
  month,
  projects,
  year,
}: {
  month: string;
  projects: Project[];
  year: number;
}) {
  const [monthExpenses, setMonthExpenses] = useState<ProjectYearEnvelope[]>([]);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  /* 🧮 Filter visible projects */
  const visibleProjects = useMemo(() => {
    const monthIndex = allMonths.indexOf(month);
    const monthStart = new Date(year, monthIndex, 1);

    return projects.filter((p) => {
      if (!p.startDate) return false;
      const start = new Date(p.startDate);
      const end = p.endDate ? new Date(p.endDate) : null;

      const startedThisMonth =
        start.getFullYear() === year && start.getMonth() === monthIndex;
      const ongoing = start < monthStart && (!end || end >= monthStart);
      const endsThisMonth =
        end &&
        end.getFullYear() === year &&
        end.getMonth() === monthIndex;

      return startedThisMonth || ongoing || endsThisMonth;
    });
  }, [projects, month, year]);

  const hasProjects = visibleProjects.length > 0;

  /* 🧠 Automatically open months that have projects */
  useEffect(() => {
    setOpen(hasProjects);
  }, [hasProjects]);

  /* 🧭 Prevent page jump on collapse */
  const handleToggle = useCallback(() => {
    if (!containerRef.current) {
      setOpen((o) => !o);
      return;
    }

    const { top } = containerRef.current.getBoundingClientRect();
    const scrollY = window.scrollY + top;

    setOpen((o) => !o);
    requestAnimationFrame(() => {
      window.scrollTo({ top: scrollY, behavior: "instant" });
    });
  }, []);

  const handleProjectData = useCallback((id: string, data: ProjectYearData) => {
    setMonthExpenses((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      const wrapped: ProjectYearEnvelope = { id, ...data };
      if (idx >= 0) {
        const prevTotals = prev[idx].totalsByMonth;
        const nextTotals = data.totalsByMonth;
        const changed = Object.keys(nextTotals).some(
          (k) => prevTotals[k] !== nextTotals[k]
        );
        if (!changed) return prev;
        const copy = [...prev];
        copy[idx] = wrapped;
        return copy;
      }
      return [...prev, wrapped];
    });
  }, []);

  /* 🎨 Shadow effect when scrolling table */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => setScrolled(el.scrollTop > 5);
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const totals = useMemo(() => {
    const totalCats: CategoryTotals = {
      Materials: 0,
      Salary: 0,
      Transport: 0,
      Cabinets: 0,
      Others: 0,
    };
    let spent = 0;

    for (const entry of monthExpenses) {
      spent += entry.totalsByMonth[month] ?? 0;
      for (const k of CATEGORY_KEYS) {
        totalCats[k] += entry.byMonth[month]?.[k] ?? 0;
      }
    }

    return { spent, totalCats };
  }, [monthExpenses, month]);

  return (
    <div
      ref={containerRef}
      className={`rounded-md transition-all duration-200 ${
        open
          ? "border border-[#2f2f2f] bg-[#1a1a1a]"
          : "border border-[#222] bg-[#151515] hover:bg-[#191919]"
      }`}
    >
      {/* Month Header */}
      <button
        onClick={handleToggle}
        className="w-full flex justify-between items-center px-3 py-1.5 text-left text-[#dcdcdc] hover:bg-[#232323] transition-colors"
      >
        <span className="text-sm font-medium tracking-wide">{month}</span>
        <span className="text-xs text-[#777]">{open ? "▼" : "▶"}</span>
      </button>

      {/* Table Section */}
      {open && (
        <div
          ref={scrollRef}
          className="relative overflow-x-auto max-h-[60vh] border-t border-[#242424] transition-[max-height] duration-300 ease-in-out"
        >
          {!hasProjects ? (
            <div className="p-3 text-center text-[#8b8b8b] text-[13px] italic">
              No projects this month
            </div>
          ) : (
            <table className="min-w-max w-full text-[13px] text-[#d5d5d5] border-t border-[#2c2c2c]">
              <thead
                className={`sticky top-0 bg-[#202020] text-[11px] uppercase tracking-wider text-[#a6a6a6] z-10 transition-shadow ${
                  scrolled ? "shadow-[0_2px_6px_#00000060]" : "shadow-none"
                }`}
              >
                <tr>
                  <th className="px-3 py-2 font-semibold text-left whitespace-nowrap">
                    Project
                  </th>
                  <th className="px-3 py-2 font-semibold text-right whitespace-nowrap">
                    Spent
                  </th>
                  <th className="px-3 py-2 font-semibold text-right whitespace-nowrap">
                    % of Cost
                  </th>
                  <th className="px-3 py-2 font-semibold text-right whitespace-nowrap">
                    Running Bal.
                  </th>
                  <th className="px-3 py-2 font-semibold text-right whitespace-nowrap">
                    Remaining %
                  </th>
                  {CATEGORY_KEYS.map((key) => (
                    <th
                      key={key}
                      className="px-3 py-2 font-semibold text-right whitespace-nowrap"
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {visibleProjects.map((project) => (
                  <ProjectWithExpenses
                    key={project.id}
                    project={project}
                    year={year}
                    month={month}
                    onData={handleProjectData}
                  />
                ))}

                {totals.spent > 0 && (
                  <tr className="bg-[#2a2a2a] font-semibold border-t border-[#303030]">
                    <td className="px-3 py-1.5 text-left text-[#f0f0f0]">Total</td>
                    <td className="px-3 py-1.5 text-right">{peso(totals.spent)}</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    {CATEGORY_KEYS.map((k) => (
                      <td key={k} className="px-3 py-1.5 text-right">
                        {peso(totals.totalCats[k])}
                      </td>
                    ))}
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 🧩 Stable Hook Sync                                                       */
/* -------------------------------------------------------------------------- */
function useStableProjectSync(
  id: string,
  data: ProjectYearData,
  onData: (id: string, data: ProjectYearData) => void
) {
  const lastTotals = useRef<Record<string, number>>({});

  useEffect(() => {
    const changed = Object.keys(data.totalsByMonth).some(
      (k) => data.totalsByMonth[k] !== lastTotals.current[k]
    );
    if (changed) {
      lastTotals.current = data.totalsByMonth;
      onData(id, data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, onData]);
}

/* -------------------------------------------------------------------------- */
/* 🧩 Wrapper Component                                                       */
/* -------------------------------------------------------------------------- */
function ProjectWithExpenses({
  project,
  year,
  month,
  onData,
}: {
  project: Project;
  year: number;
  month: string;
  onData: (id: string, data: ProjectYearData) => void;
}) {
  const scope = useMemo(
    () => ({
      projectId: project.id,
      clientId: project.clientId,
    }),
    [project.clientId, project.id]
  );
  const data = useProjectExpensesByYear(scope, year);
  useStableProjectSync(project.id, data, onData);

  return <ProjectRow project={project} data={data} month={month} />;
}

/* -------------------------------------------------------------------------- */
/* 🧾 Project Row                                                             */
/* -------------------------------------------------------------------------- */
function ProjectRow({
  project,
  data,
  month,
}: {
  project: Project;
  data: ProjectYearData;
  month: string;
}) {
  const { byMonth, totalsByMonth } = data;
  const spent = totalsByMonth[month] ?? 0;

  const running = Object.entries(totalsByMonth)
    .filter(([m]) => allMonths.indexOf(m) <= allMonths.indexOf(month))
    .reduce<number>((a, [, v]) => a + v, 0);

  const remainingPct =
    project.projectCost && project.projectCost > 0
      ? ((project.projectCost - running) / project.projectCost) * 100
      : 0;

  const percentOfCost =
    project.projectCost && project.projectCost > 0
      ? (spent / project.projectCost) * 100
      : null;

  const byCat: CategoryTotals = {
    Materials: byMonth[month]?.Materials ?? 0,
    Salary: byMonth[month]?.Salary ?? 0,
    Transport: byMonth[month]?.Transport ?? 0,
    Cabinets: byMonth[month]?.Cabinets ?? 0,
    Others: byMonth[month]?.Others ?? 0,
  };

  const textColor = getTeamColor(project.team);

  return (
    <tr className="border-t border-[#2e2e2e] hover:bg-[#222] transition">
      <td className={`px-3 py-1.5 font-medium ${textColor}`}>{project.name}</td>
      <td className="px-3 py-1.5 text-right font-medium">{peso(spent)}</td>
      <td className="px-3 py-1.5 text-right">
        {percentOfCost !== null ? `${percentOfCost.toFixed(1)}%` : "–"}
      </td>
      <td className="px-3 py-1.5 text-right">{peso(running)}</td>
      <td className="px-3 py-1.5 text-right">{remainingPct.toFixed(1)}%</td>

      {CATEGORY_KEYS.map((k) => (
        <td key={k} className="px-3 py-1.5 text-right">
          {peso(byCat[k])}
        </td>
      ))}
    </tr>
  );
}

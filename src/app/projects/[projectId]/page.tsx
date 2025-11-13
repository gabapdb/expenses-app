"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { useProject } from "@/hooks/projects/useProjects";
import ProjectInfoSection from "./ProjectInfoSection";
import ProjectOverviewSection from "./ProjectOverviewSection";
import MonthlyExpensesSection from "./MonthlyExpensesSection";
import BreakdownOfCostsSection from "./BreakdownOfCostsSection";
import { normalizeTeam } from "@/utils/normalizeTeam";

/* -------------------------------------------------------------------------- */
/* 🧩 Component                                                               */
/* -------------------------------------------------------------------------- */
export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project, loading, error } = useProject(projectId);
  const [activeTab, setActiveTab] = useState<"monthly" | "breakdown">("monthly");

  if (loading)
    return <div className="p-6 text-[#9ca3af] text-sm">Loading project…</div>;
  if (error)
    return <div className="p-6 text-[#f87171] text-sm">{error}</div>;
  if (!project)
    return <div className="p-6 text-[#9ca3af] text-sm">No project found.</div>;

  // ✅ Normalize here once for all subcomponents
  const normalizedProject = {
    ...project,
    team: normalizeTeam(project.team),
    developer: project.developer ?? "",
    city: project.city ?? "",
    startDate: project.startDate ?? "",
    endDate: project.endDate ?? "",
    projectSize: project.projectSize ?? "",
    siteEngineer: project.siteEngineer ?? "",
    designer: project.designer ?? "",
    createdAt: project.createdAt ?? 0,
  };

  return (
    <main className="p-6 space-y-8 text-[#e5e5e5]">
      <h1 className="text-xl font-semibold">{normalizedProject.name}</h1>

      {/* Info + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1.2fr] gap-6">
        <ProjectInfoSection project={normalizedProject} />
        <ProjectOverviewSection project={normalizedProject} />
      </div>

      {/* Tabs Header */}
      <div className="flex gap-4 border-b border-[#3a3a3a] bg-[#121212]">
        {[
          { key: "monthly", label: "Monthly Expenses" },
          { key: "breakdown", label: "Breakdown of Costs" },
        ].map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key as "monthly" | "breakdown")}
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

      {/* Active Tab Content */}
      <div>
        {activeTab === "monthly" && (
          <MonthlyExpensesSection projectId={normalizedProject.id} />
        )}

        {activeTab === "breakdown" && (
          <BreakdownOfCostsSection projectId={normalizedProject.id} />
        )}

      </div>
    </main>
  );
}

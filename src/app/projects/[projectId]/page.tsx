"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { useProject } from "@/hooks/projects/useProjects";
import ProjectInfoSection from "./ProjectInfoSection";
import MonthlyExpensesSection from "./MonthlyExpensesSection";
import BreakdownOfCostsSection from "./BreakdownOfCostsSection";
import RequirementsSection from "@/features/requirements/components/RequirementsSection";

/* -------------------------------------------------------------------------- */
/* 🧩 Component                                                               */
/* -------------------------------------------------------------------------- */
export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project, loading, error } = useProject(projectId);
  const [activeTab, setActiveTab] = useState<
    "monthly" | "breakdown" | "requirements"
  >("monthly");

  if (loading)
    return <div className="p-6 text-[#9ca3af] text-sm">Loading project…</div>;
  if (error)
    return <div className="p-6 text-[#f87171] text-sm">{error}</div>;
  if (!project)
    return <div className="p-6 text-[#9ca3af] text-sm">No project found.</div>;

  /* ------------------------------------------------------------------------ */
  /* 🖼️ Render                                                               */
  /* ------------------------------------------------------------------------ */
  return (
    <main className="p-6 space-y-8 text-[#e5e5e5]">
      {/* Page Title */}
      <h1 className="text-xl font-semibold">{project.name}</h1>

      {/* Project Info */}
      <ProjectInfoSection project={project} />

      {/* Tabs Header */}
      <div className="flex gap-4 border-b border-[#3a3a3a] bg-[#1f1f1f]">
        {[
          { key: "monthly", label: "Monthly Expenses" },
          { key: "breakdown", label: "Breakdown of Costs" },
          { key: "requirements", label: "Requirements" },
        ].map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() =>
              setActiveTab(key as "monthly" | "breakdown" | "requirements")
            }
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
          <MonthlyExpensesSection projectId={project.id} />
        )}

        {activeTab === "breakdown" && (
          <BreakdownOfCostsSection projectId={project.id} />
        )}

        {activeTab === "requirements" && (
          <RequirementsSection projectId={project.id} />
        )}
      </div>
    </main>
  );
}

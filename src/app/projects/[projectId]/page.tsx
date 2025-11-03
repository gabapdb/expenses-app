"use client";

import { useParams } from "next/navigation";
import { useProject } from "@/hooks/useProjects";
import ProjectInfoSection from "./ProjectInfoSection";
import MonthlyExpensesSection from "./MonthlyExpensesSection";
import BreakdownOfCostsSection from "./BreakdownOfCostsSection";

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project, loading, error } = useProject(projectId); // ✅ FIX

  if (loading) return <div className="p-6 text-gray-500">Loading project...</div>;
  if (error) return <div className="p-6 text-red-500 text-sm">{error}</div>;
  if (!project) return <div className="p-6 text-gray-500">No project found.</div>;

  return (
    <main className="p-6 space-y-8">
      {/* Page Title */}
      <h1 className="text-xl font-semibold">{project.name}</h1>

      {/* Section 1: Project Info */}
      <ProjectInfoSection project={project} />

      {/* Section 2: Monthly Expenses */}
      <MonthlyExpensesSection projectId={project.id} />

      {/* Section 3: Breakdown of Costs */}
      <BreakdownOfCostsSection projectId={project.id} />
    </main>
  );
}

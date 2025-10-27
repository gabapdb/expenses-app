"use client";
import { useParams } from "next/navigation";
import { useProject } from "@/hooks/useProjects";
import ProjectInfoCard from "@/components/ProjectInfoCard";

export default function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const project = useProject(projectId);

  if (!project) return <div className="p-4 text-gray-500">Loading project...</div>;

  return (
    <div className="space-y-4">
      <ProjectInfoCard
        name={project.name}
        team={project.team}
        projectCost={project.projectCost}
        developer={project.developer}
        city={project.city}
        startDate={project.startDate}
        endDate={project.endDate}
        projectSize={project.projectSize}
      />
    </div>
  );
}

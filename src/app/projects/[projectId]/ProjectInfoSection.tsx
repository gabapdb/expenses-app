"use client";

import Card from "@/components/ui/Card";
import type { Project } from "@/hooks/useProjects";

interface ProjectInfoSectionProps {
  project: Project;
}

export default function ProjectInfoSection({ project }: ProjectInfoSectionProps) {
  return (
    <Card>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
        <Field label="Project Name" value={project.name} />
        <Field label="Developer" value={project.developer ?? "—"} />
        <Field label="Team" value={project.team ?? "—"} />
        <Field label="City" value={project.city ?? "—"} />
        <Field label="Start Date" value={formatDate(project.startDate)} />
        <Field label="End Date" value={formatDate(project.endDate)} />
        <Field label="Project Size" value={project.projectSize ?? "—"} />
        <Field
          label="Project Cost"
          value={project.projectCost ? peso(project.projectCost) : "—"}
        />
      </div>
    </Card>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="font-medium text-gray-900">{value}</div>
    </div>
  );
}

function formatDate(date?: string): string {
  if (!date) return "—";
  const parsed = new Date(date);
  return !isNaN(parsed.getTime())
    ? parsed.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : "—";
}

function peso(n: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(n);
}

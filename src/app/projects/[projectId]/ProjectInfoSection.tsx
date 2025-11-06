"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import type { Project } from "@/hooks/useProjects";
import ProjectEditModal from "@/components/ProjectEditModal";

interface ProjectInfoSectionProps {
  project: Project;
}

export default function ProjectInfoSection({ project }: ProjectInfoSectionProps) {
  const [editing, setEditing] = useState(false);

  const handleOpen = () => setEditing(true);
  const handleClose = () => setEditing(false);

  return (
    <>
      <div
        className="cursor-pointer transition-all duration-200 hover:bg-[#2a2a2a] rounded-xl"
        onClick={handleOpen}
      >
        <Card className="rounded-xl border border-[#3a3a3a] bg-[#1f1f1f] p-6">
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
      </div>

      {editing && (
        <ProjectEditModal
          project={{
            ...project,
            team: project.team ?? "",
            developer: project.developer ?? "",
            city: project.city ?? "",
            projectSize: project.projectSize ?? "",
            startDate: project.startDate ?? "",
            endDate: project.endDate ?? "",
            createdAt: project.createdAt ?? 0, // ✅ safe default (handled at save)
          }}
          onClose={handleClose}
          onSaved={handleClose}
        />
      )}
    </>
  );
}

/* --------------------------------- Helpers -------------------------------- */
function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-gray-400">{label}</div>
      <div className="font-medium text-gray-100">{value}</div>
    </div>
  );
}

function formatDate(date?: string): string {
  if (!date) return "—";
  const parsed = new Date(date);
  return !isNaN(parsed.getTime())
    ? parsed.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";
}

function peso(n: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(n);
}

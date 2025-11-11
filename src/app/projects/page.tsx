"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, CalendarDays, MapPin, Users } from "lucide-react";
import Link from "next/link";
import SectionHeader from "@/components/ui/SectionHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ProjectCreateModal from "@/features/projects/components/ProjectCreateModal";
import ProjectEditModal from "@/features/projects/components/ProjectEditModal";
import { useProjects, type Project } from "@/hooks/projects/useProjects";
import { peso } from "@/utils/format";
import "@/styles/dashboard.css";

export default function ProjectsPage() {
  const { data: projects, loading, error } = useProjects();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const hasProjects = projects.length > 0;

  return (
    <main className="dashboard-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <SectionHeader
          title="Projects"
          subtitle="Manage and view all active projects"
        />
        <Button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-[#1f1f1f] border border-[#3a3a3a] hover:bg-[#2a2a2a] text-[#e5e5e5]"
        >
          <Plus size={16} />
          New Project
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <ProjectsSkeleton />
      ) : error ? (
        <div className="rounded-2xl border border-[#3a3a3a] bg-[#262626]/30 p-6 text-sm text-[#f87171]">
          {error}
        </div>
      ) : !hasProjects ? (
        <EmptyProjectsState />
      ) : (
        <motion.div
          className="projects-grid"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={() => setEditingProject(project)}
            />
          ))}
        </motion.div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <ProjectCreateModal onClose={() => setShowCreateModal(false)} />
      )}
      {editingProject && (
        <ProjectEditModal
          project={{
            ...editingProject,
            team: editingProject.team ?? "",
            developer: editingProject.developer ?? "",
            city: editingProject.city ?? "",
            projectSize: editingProject.projectSize ?? "",
            startDate: editingProject.startDate ?? "",
            endDate: editingProject.endDate ?? "",
            createdAt: editingProject.createdAt ?? 0,
          }}
          onClose={() => setEditingProject(null)}
          onSaved={() => setEditingProject(null)}
        />
      )}
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Subcomponents                                                              */
/* -------------------------------------------------------------------------- */

function ProjectCard({
  project,
  onEdit,
}: {
  project: Project;
  onEdit: () => void;
}) {
  const timeline = buildTimeline(project.startDate, project.endDate);
  const projectCost =
    typeof project.projectCost === "number" ? peso(project.projectCost) : "—";

  return (
    <Link href={`/projects/${project.id}`} className="group block h-full">
      <Card className="relative flex flex-col justify-between h-full rounded-2xl border border-[#3a3a3a] bg-[#1f1f1f] p-6 shadow-sm transition-all duration-200 hover:-translate-y-[3px] hover:border-[#4b4b4b] hover:bg-[#252525] hover:shadow-md">
        
        {/* Edit Button - top right */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onEdit();
          }}
          className="absolute top-4 right-4 text-[#d1d5db] hover:text-white bg-[#2b2b2b] hover:bg-[#3a3a3a] rounded-md px-3 py-[2px] text-xs border border-[#3a3a3a] transition-colors"
        >
          Edit
        </button>

        {/* Team */}
        <div className="flex items-center justify-start gap-2 mb-3">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d1d5db]">
            <Users size={12} />
            {project.team || "Unassigned"}
          </span>
        </div>

        {/* Project Name + City */}
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#e5e5e5] group-hover:text-white leading-tight">
            {project.name}
          </h2>
          {project.city && (
            <span className="inline-flex items-center gap-1 rounded-full border border-[#4a4a4a] bg-[#2a2a2a]/50 px-2 py-[2px] text-[11px] text-[#bfbfbf]">
              <MapPin size={12} />
              {project.city}
            </span>
          )}
        </div>

        {/* Details */}
        <div className="space-y-1.5 text-sm text-[#9ca3af] flex-1">
          {project.developer && (
            <p>
              <span className="text-[#a1a1a1]">Developer:</span>{" "}
              {project.developer}
            </p>
          )}
          {timeline && (
            <p className="flex items-center gap-2 text-xs uppercase tracking-wide">
              <CalendarDays size={12} />
              {timeline}
            </p>
          )}
          {project.projectSize && (
            <p className="text-xs">Project Size: {project.projectSize}</p>
          )}
        </div>

        {/* Footer Cost Section */}
        <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-[#3a3a3a] bg-[#262626]/40 px-4 py-3 text-sm text-center">
          <p className="text-xs uppercase tracking-wide text-[#9ca3af]">
            Project Cost
          </p>
          <p className="text-base font-semibold text-[#f3f4f6] mt-1">
            {projectCost}
          </p>
        </div>
      </Card>
    </Link>
  );
}



/* --------------------------- Helper functions --------------------------- */

function buildTimeline(start?: string, end?: string) {
  const formattedStart = formatDate(start);
  const formattedEnd = formatDate(end);

  if (!formattedStart && !formattedEnd) return null;
  if (formattedStart && formattedEnd) return `${formattedStart} – ${formattedEnd}`;
  return formattedStart ?? formattedEnd;
}

function formatDate(input?: string) {
  if (!input) return null;
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

/* --------------------------- Skeleton & Empty --------------------------- */

function ProjectsSkeleton() {
  return (
    <div className="projects-grid">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card
          key={`project-skeleton-${index}`}
          className="h-full animate-pulse rounded-2xl border border-[#3a3a3a] bg-[#2a2a2a]/60 p-6"
        >
          <div className="h-6 w-2/3 rounded bg-[#262626]/40" />
          <div className="mt-4 space-y-3">
            <div className="h-5 w-full rounded bg-[#262626]/40" />
            <div className="h-5 w-5/6 rounded bg-[#262626]/40" />
            <div className="h-5 w-4/5 rounded bg-[#262626]/40" />
          </div>
          <div className="mt-8 h-12 rounded-xl bg-[#262626]/30" />
        </Card>
      ))}
    </div>
  );
}

function EmptyProjectsState() {
  return (
    <Card className="flex flex-col items-start gap-4 rounded-2xl border border-dashed border-[#3a3a3a] bg-[#2a2a2a]/70 p-8 text-sm text-[#d1d5db]">
      <p>No projects have been created yet.</p>
      <p className="text-xs text-[#9ca3af]">
        Use the “New Project” button to add your first record and start tracking
        expenses in real time.
      </p>
    </Card>
  );
}

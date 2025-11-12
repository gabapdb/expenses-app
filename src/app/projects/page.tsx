"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";
import ProjectCreateModal from "@/features/projects/components/ProjectCreateModal";
import ProjectEditModal from "@/features/projects/components/ProjectEditModal";
import ProjectsTabs from "@/features/projects/components/ProjectsTabs";
import { useProjects } from "@/hooks/projects/useProjects";
import { normalizeTeam } from "@/utils/normalizeTeam";
import type { TeamOption } from "@/config/teams";
import "@/styles/dashboard.css";

/* -------------------------------------------------------------------------- */
/* 🧱 Types                                                                   */
/* -------------------------------------------------------------------------- */
interface NormalizedProject {
  id: string;
  name: string;
  team: TeamOption;
  projectCost: number;
  developer: string;
  city: string;
  projectSize: string;
  startDate: string;
  endDate: string;
  siteEngineer: string;
  designer: string;
  createdAt: number;
}

/* -------------------------------------------------------------------------- */
/* 🧩 Page Component                                                          */
/* -------------------------------------------------------------------------- */
export default function ProjectsPage() {
  const { data: projects, loading, error } = useProjects();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProject, setEditingProject] = useState<NormalizedProject | null>(
    null
  );

  // ✅ Normalize Firestore results to a safe, UI-friendly shape
  const normalizedProjects = useMemo<NormalizedProject[]>(
    () =>
      projects.map((p) => ({
        id: p.id,
        name: p.name ?? "",
        team: normalizeTeam(p.team),
        projectCost: p.projectCost ?? 0,
        developer: p.developer ?? "",
        city: p.city ?? "",
        projectSize: p.projectSize ?? "",
        startDate: p.startDate ?? "",
        endDate: p.endDate ?? "",
        siteEngineer: p.siteEngineer ?? "",
        designer: p.designer ?? "",
        createdAt: p.createdAt ?? 0,
      })),
    [projects]
  );

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
        <div className="text-sm text-[#9ca3af]">Loading projects…</div>
      ) : error ? (
        <div className="rounded-2xl border border-[#3a3a3a] bg-[#262626]/30 p-6 text-sm text-[#f87171]">
          {error}
        </div>
      ) : normalizedProjects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#3a3a3a] bg-[#2a2a2a]/70 p-8 text-sm text-[#d1d5db]">
          No projects yet. Click “New Project” to start.
        </div>
      ) : (
        <ProjectsTabs
          projects={normalizedProjects}
          onEdit={(p) => setEditingProject(p)}
        />
      )}

      {/* Modals */}
      {showCreateModal && (
        <ProjectCreateModal onClose={() => setShowCreateModal(false)} />
      )}
      {editingProject && (
        <ProjectEditModal
          project={editingProject}
          onClose={() => setEditingProject(null)}
          onSaved={() => setEditingProject(null)}
        />
      )}
    </main>
  );
}

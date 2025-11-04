"use client";

import { useState } from "react";
import { Plus, Folder } from "lucide-react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import ProjectCreateModal from "@/components/ProjectCreateModal";
import { useProjects } from "@/hooks/useProjects";

export default function ProjectsPage() {
  const { push } = useRouter();
  const { data: projects, loading, error } = useProjects();
  const [showCreate, setShowCreate] = useState(false);

  const closeModal = () => setShowCreate(false);

  return (
    <main className="relative p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Projects</h1>
          <p className="text-sm text-slate-500">Manage the initiatives your expenses roll up to.</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 bg-slate-900 text-white hover:bg-black">
          <Plus className="h-4 w-4" />
          New project
        </Button>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500">Loading projects…</div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">{error}</div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <Folder className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-slate-900">No projects yet</h2>
            <p className="text-sm text-slate-500">Create your first project to start tracking budgets and spend.</p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 bg-slate-900 text-white hover:bg-black">
            <Plus className="h-4 w-4" />
            Create project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {projects.map((project) => (
            <button
              key={project.id}
              type="button"
              onClick={() => push(`/projects/${project.id}`)}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900/10 text-slate-700">
                <Folder className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{project.name}</p>
                <p className="truncate text-xs text-slate-500">{project.developer || "Unassigned developer"}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {showCreate ? <ProjectCreateModal onClose={closeModal} /> : null}
    </main>
  );
}

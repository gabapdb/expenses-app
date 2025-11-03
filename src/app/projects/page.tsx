"use client";

import { useRouter } from "next/navigation";
import { useProjects } from "@/hooks/useProjects";
import { Folder } from "lucide-react";

export default function ProjectsPage() {
  const { push } = useRouter();
  const { data: projects, loading, error } = useProjects(); // ✅ destructure properly

  if (loading) return <div className="p-6 text-gray-500">Loading projects…</div>;
  if (error) return <div className="p-6 text-red-500 text-sm">{error}</div>;
  if (!projects || projects.length === 0)
    return <div className="p-6 text-gray-500">No projects yet.</div>;

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Projects</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {projects.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-3 border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition"
            onClick={() => push(`/projects/${p.id}`)}
          >
            <Folder className="w-8 h-8 text-gray-600" />
            <div className="flex flex-col">
              <span className="font-medium">{p.name}</span>
              <span className="text-xs text-gray-500">{p.developer ?? "—"}</span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

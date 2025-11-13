"use client";

import { useParams, useSearchParams } from "next/navigation";

import RequirementsSection from "@/features/requirements/components/RequirementsSection";
import { useProject } from "@/hooks/projects/useProjects";

export default function ClientConstructionRequirementsPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const hasProjectContext = Boolean(projectId);

  const projectState = useProject(hasProjectContext ? projectId ?? undefined : undefined);
  const project = hasProjectContext ? projectState.data : null;
  const projectLoading = hasProjectContext ? projectState.loading : false;
  const projectError = hasProjectContext ? projectState.error : null;

  if (!clientId) {
    return (
      <main className="p-6 text-[#e5e5e5] space-y-4">
        <h1 className="text-xl font-semibold">Requirements</h1>
        <p className="text-sm text-red-400">Missing client identifier.</p>
      </main>
    );
  }

  const title = hasProjectContext
    ? projectLoading
      ? "Loading project…"
      : project?.name ?? "Project"
    : "Requirements";

  return (
    <main className="p-6 space-y-6 text-[#e5e5e5]">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">{title}</h1>
        {hasProjectContext && projectError && (
          <p className="text-sm text-red-400">{projectError}</p>
        )}
        {hasProjectContext && !projectLoading && !projectError && !project && (
          <p className="text-sm text-[#9ca3af]">Project not found.</p>
        )}
        {!hasProjectContext && (
          <p className="text-sm text-[#9ca3af]">
            Requirements are stored at the client level. Provide a projectId query parameter to
            show its details.
          </p>
        )}
      </header>

      <RequirementsSection clientId={clientId} />
    </main>
  );
}

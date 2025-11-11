"use client";

import { useState, useMemo } from "react";
import { useRequirements } from "@/hooks/requirements/useRequirements";
import RequirementsTable from "./RequirementsTable";
import AddRequirementForm from "./AddRequirementForm";
import RequirementEditModal from "./RequirementEditModal";
import type { Requirement } from "@/domain/validation/requirementSchema";

/* -------------------------------------------------------------------------- */
/* 🧱 Component                                                               */
/* -------------------------------------------------------------------------- */

interface RequirementsSectionProps {
  projectId: string;
}

export default function RequirementsSection({ projectId }: RequirementsSectionProps) {
  const { data: allRequirements, loading, refresh } = useRequirements(projectId);
  const [activeArea, setActiveArea] = useState<string>("all");
  const [editing, setEditing] = useState<Requirement | null>(null);

  /* ---------------------------------------------------------------------- */
  /* 🧮 Derive unique areas                                                 */
  /* ---------------------------------------------------------------------- */
  const areaList = useMemo(() => {
    const areas = new Set<string>();
    allRequirements.forEach((r) => {
      if (r.area && r.area.trim() !== "") areas.add(r.area);
    });
    return Array.from(areas).sort((a, b) => a.localeCompare(b));
  }, [allRequirements]);

  const filtered = useMemo(() => {
    if (activeArea === "all") return allRequirements;
    return allRequirements.filter((r) => r.area === activeArea);
  }, [allRequirements, activeArea]);

  /* ---------------------------------------------------------------------- */
  /* 🧭 UI                                                                  */
  /* ---------------------------------------------------------------------- */

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold text-white">Requirements</h2>

      {/* Add Requirement Form */}
      <AddRequirementForm
        projectId={projectId}
        initialArea={activeArea === "all" ? "" : activeArea}
        availableAreas={areaList}
        onAdded={refresh}
      />

      {/* Tabs */}
      <div className="border-b border-[#333] flex space-x-4 mt-8 overflow-x-auto">
        <button
          onClick={() => setActiveArea("all")}
          className={`pb-2 text-sm font-medium ${
            activeArea === "all"
              ? "text-blue-400 border-b-2 border-blue-500"
              : "text-[#aaa] hover:text-white"
          }`}
        >
          All
        </button>
        {areaList.map((area) => (
          <button
            key={area}
            onClick={() => setActiveArea(area)}
            className={`pb-2 text-sm font-medium capitalize ${
              activeArea === area
                ? "text-blue-400 border-b-2 border-blue-500"
                : "text-[#aaa] hover:text-white"
            }`}
          >
            {area}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-[#999] text-sm">Loading requirements...</p>
      ) : (
        <RequirementsTable
          projectId={projectId}
          area={activeArea}
          requirements={filtered}
          onUpdated={refresh}
          onRowClick={setEditing}
        />
      )}

      {/* Edit Modal */}
      {editing && (
        <RequirementEditModal
          projectId={projectId}
          requirement={editing}
          onClose={() => setEditing(null)}
          onUpdated={refresh}
        />
      )}
    </section>
  );
}

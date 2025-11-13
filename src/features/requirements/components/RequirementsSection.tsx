"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";

import { getAllAreas, getAllScopes } from "@/data/areas.repo";
import { useRequirements } from "@/hooks/requirements/useRequirements";
import RequirementsTable from "./RequirementsTable";
import AddRequirementForm from "./AddRequirementForm";
import RequirementEditModal from "./RequirementEditModal";
import type { Requirement } from "@/domain/validation/requirementSchema";
import type { Area } from "@/domain/validation/areaSchema";
import type { ScopeOfWork } from "@/domain/validation/scopeOfWorkSchema";

/* -------------------------------------------------------------------------- */
/* 🧱 Component                                                               */
/* -------------------------------------------------------------------------- */

interface RequirementsSectionProps {
  clientId: string;
}

type ScopeMap = Record<string, ScopeOfWork[]>;

export default function RequirementsSection({ clientId }: RequirementsSectionProps) {
  const searchParams = useSearchParams();
  const projectIdParam = searchParams.get("projectId") ?? "";

  const { data: allRequirements, loading, refresh } = useRequirements(clientId);
  const [activeAreaId, setActiveAreaId] = useState<string>("all");
  const [editing, setEditing] = useState<Requirement | null>(null);
  const [areas, setAreas] = useState<Area[]>([]);
  const [scopesByArea, setScopesByArea] = useState<ScopeMap>({});

  const projectId = useMemo(() => {
    if (projectIdParam) return projectIdParam;
    if (allRequirements.length > 0) {
      return allRequirements[0]?.projectId ?? "";
    }
    return "";
  }, [projectIdParam, allRequirements]);

  const loadAreas = useCallback(async (): Promise<Area[]> => {
    try {
      return await getAllAreas(clientId);
    } catch (err) {
      console.error("[RequirementsSection] Failed to load areas", err);
      return [];
    }
  }, [clientId]);

  const refreshAreas = useCallback(async (): Promise<void> => {
    const list = await loadAreas();
    setAreas(list);
  }, [loadAreas]);

  useEffect(() => {
    let active = true;
    void (async () => {
      const list = await loadAreas();
      if (!active) return;
      setAreas(list);
    })();

    return () => {
      active = false;
    };
  }, [loadAreas]);

  const ensureScopes = useCallback(
    async (areaId: string, options: { force?: boolean } = {}): Promise<ScopeOfWork[]> => {
      if (!areaId) return [];
      if (!options.force && scopesByArea[areaId]) {
        return scopesByArea[areaId];
      }

      try {
        const scopes = await getAllScopes(clientId, areaId);
        setScopesByArea((prev) => ({ ...prev, [areaId]: scopes }));
        return scopes;
      } catch (err) {
        console.error("[RequirementsSection] Failed to load scopes", err);
        return [];
      }
    },
    [clientId, scopesByArea]
  );

  useEffect(() => {
    const areaIds = Array.from(
      new Set(allRequirements.map((requirement) => requirement.areaId).filter(Boolean))
    );

    areaIds.forEach((areaId) => {
      void ensureScopes(areaId);
    });
  }, [allRequirements, ensureScopes]);

  /* ---------------------------------------------------------------------- */
  /* 🧮 Derive unique areas                                                 */
  /* ---------------------------------------------------------------------- */
  const areaLookup = useMemo(() => {
    const map = new Map<string, string>();
    areas.forEach((area) => map.set(area.id, area.name));
    return map;
  }, [areas]);

  const scopeLookup = useMemo(() => {
    const map = new Map<string, string>();
    Object.values(scopesByArea).forEach((list) => {
      list.forEach((scope) => map.set(scope.id, scope.name));
    });
    return map;
  }, [scopesByArea]);

  const areaTabs = useMemo(() => {
    const entries = new Map<string, string>();
    areas.forEach((area) => entries.set(area.id, area.name));
    allRequirements.forEach((requirement) => {
      if (requirement.areaId && !entries.has(requirement.areaId)) {
        entries.set(requirement.areaId, requirement.areaId);
      }
    });

    return Array.from(entries.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [areas, allRequirements]);

  const filtered = useMemo(() => {
    if (activeAreaId === "all") return allRequirements;
    return allRequirements.filter((requirement) => requirement.areaId === activeAreaId);
  }, [allRequirements, activeAreaId]);

  const initialAreaId = activeAreaId === "all" ? "" : activeAreaId;

  /* ---------------------------------------------------------------------- */
  /* 🧭 UI                                                                  */
  /* ---------------------------------------------------------------------- */

  return (
    <section className="space-y-6">

      {/* Add Requirement Form */}
      <AddRequirementForm
        clientId={clientId}
        projectId={projectId}
        initialAreaId={initialAreaId}
        areas={areas}
        scopesByArea={scopesByArea}
        ensureScopes={ensureScopes}
        onAreasRefresh={refreshAreas}
        onRequirementCreated={async (areaId) => {
          await refresh();
          if (areaId) {
            setActiveAreaId(areaId);
          }
        }}
      />

      {/* Tabs */}
      <div className="border-b border-[#333] flex space-x-4 mt-8 overflow-x-auto">
        <button
          onClick={() => setActiveAreaId("all")}
          className={`pb-2 text-sm font-medium ${
            activeAreaId === "all"
              ? "text-blue-400 border-b-2 border-blue-500"
              : "text-[#aaa] hover:text-white"
          }`}
        >
          All
        </button>
        {areaTabs.map((area) => (
          <button
            key={area.id}
            onClick={() => setActiveAreaId(area.id)}
            className={`pb-2 text-sm font-medium capitalize ${
              activeAreaId === area.id
                ? "text-blue-400 border-b-2 border-blue-500"
                : "text-[#aaa] hover:text-white"
            }`}
          >
            {area.name}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-[#999] text-sm">Loading requirements...</p>
      ) : (
        <RequirementsTable
          clientId={clientId}
          requirements={filtered}
          areaLookup={areaLookup}
          scopeLookup={scopeLookup}
          onUpdated={refresh}
          onRowClick={setEditing}
        />
      )}

      {/* Edit Modal */}
      {editing && (
        <RequirementEditModal
          clientId={clientId}
          projectId={projectId}
          requirement={editing}
          areas={areas}
          scopesByArea={scopesByArea}
          ensureScopes={ensureScopes}
          onClose={() => setEditing(null)}
          onUpdated={refresh}
        />
      )}
    </section>
  );
}

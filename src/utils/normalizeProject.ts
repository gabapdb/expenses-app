import type { Project } from "@/domain/models";
import type { NormalizedProject } from "@/domain/types/NormalizedProject";

export function normalizeProject(raw: Partial<Project>): NormalizedProject {
  return {
    id: raw.id ?? "",
    name: raw.name ?? "",
    team:
      raw.team === "Team 1" || raw.team === "Team 2"
        ? raw.team
        : "Team 1", // default fallback
    projectCost: raw.projectCost ?? 0,
    developer: raw.developer ?? "",
    city: raw.city ?? "",
    projectSize: raw.projectSize ?? "",
    startDate: raw.startDate ?? "",
    endDate: raw.endDate ?? "",
    siteEngineer: raw.siteEngineer ?? "",
    designer: raw.designer ?? "",
    createdAt: raw.createdAt ?? 0,
  };
}

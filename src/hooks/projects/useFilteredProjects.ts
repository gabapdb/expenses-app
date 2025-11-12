import { useMemo } from "react";
import type { Project } from "@/domain/models";

export function useFilteredProjects(projects: Project[]) {
  return useMemo(() => {
    const pending = projects.filter((p) => !p.startDate && !p.endDate);
    const ongoing = projects.filter((p) => !!p.startDate && !p.endDate);
    const completed = projects.filter((p) => !!p.endDate);

    // collect all start years for Completed tab filter
    const yearSet = new Set<number>();
    for (const p of projects) {
      if (p.startDate) yearSet.add(new Date(p.startDate).getFullYear());
    }

    // ensure current year always appears first
    const years = Array.from(yearSet).sort((a, b) => b - a);
    const currentYear = new Date().getFullYear();
    if (!years.includes(currentYear)) years.unshift(currentYear);

    return { pending, ongoing, completed, availableYears: years };
  }, [projects]);
}

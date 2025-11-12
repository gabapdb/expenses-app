import type { TeamOption } from "@/config/teams";

export interface NormalizedProject {
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

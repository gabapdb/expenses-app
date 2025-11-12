import { TEAM_OPTIONS, type TeamOption } from "@/config/teams";

/** Ensures team is always 'Team 1' or 'Team 2' */
export function normalizeTeam(value?: string | null): TeamOption {
  return TEAM_OPTIONS.includes(value as TeamOption)
    ? (value as TeamOption)
    : "Team 1";
}

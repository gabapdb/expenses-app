/* -------------------------------------------------------------------------- */
/* 🧱 Team Config                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Standard list of teams available for project assignment.
 * Extend this if new teams are added (e.g. "Team 3").
 */
export const TEAM_OPTIONS = ["Team 1", "Team 2"] as const;

export type TeamOption = (typeof TEAM_OPTIONS)[number];

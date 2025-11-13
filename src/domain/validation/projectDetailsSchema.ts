import { TEAM_OPTIONS } from "@/config/teams";
import { z } from "zod";

export const projectDetailsSchema = z.object({
  projectId: z.string(),
  projectName: z.string(),
  projectAddress: z.string(),
  developer: z.string().optional().default(""),
  city: z.string().optional().default(""),
  projectSize: z.string().optional().default(""),
  projectCost: z.number().nullable().optional(),
  team: z
    .enum(TEAM_OPTIONS)
    .refine((val) => TEAM_OPTIONS.includes(val), {
      message: "Team must be one of the allowed options",
    })
    .optional()
    .default(TEAM_OPTIONS[0]),
  engineer: z.string().optional().default(""),
  designer: z.string().optional().default(""),
  startDate: z.string().optional().default(""),
  endDate: z.string().optional().default(""),
  createdAt: z.number().optional(),
});

export type ProjectDetails = z.infer<typeof projectDetailsSchema>;

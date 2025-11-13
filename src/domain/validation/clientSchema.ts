import { z } from "zod";
import { TEAM_OPTIONS } from "@/config/teams";
import { costEstimateSchema } from "@/domain/validation/costEstimateSchema";

const ClientProjectSchema = z.object({
  id: z.string(),
  name: z.string().min(1),

  projectSize: z.string().optional().default(""),
  projectCost: z.number().nullable().optional(),
  developer: z.string().optional().default(""),
  city: z.string().optional().default(""),
  designer: z.string().optional().default(""),
  engineer: z.string().optional().default(""),
  startDate: z.string().optional().default(""),
  endDate: z.string().optional().default(""),

  team: z
    .enum(TEAM_OPTIONS)
    .refine((v) => TEAM_OPTIONS.includes(v))
    .optional()
    .default(TEAM_OPTIONS[0]),

  designPhase: z
    .object({
      costEstimates: costEstimateSchema.optional().default({}),
    })
    .default({}),

  constructionPhase: z.object({}).default({}),
});

export const clientSchema = z.object({
  id: z.string(),
  name: z.string(),

  projectDetails: z.object({
    projectId: z.string(),
    projectName: z.string(),
    projectAddress: z.string(),

    developer: z.string().optional().default(""),
    city: z.string().optional().default(""),

    projectSize: z.string().optional().default(""),
    projectCost: z.number().nullable().optional(),

    team: z
      .enum(TEAM_OPTIONS)
      .refine((val) => TEAM_OPTIONS.includes(val))
      .optional()
      .default(TEAM_OPTIONS[0]),

    engineer: z.string().optional().default(""),
    designer: z.string().optional().default(""),

    startDate: z.string().optional().default(""),
    endDate: z.string().optional().default(""),

    createdAt: z.number().optional(),
  }),

  projects: z
    .record(ClientProjectSchema)
    .default({})
    .transform(
      (val) => val as Record<string, z.infer<typeof ClientProjectSchema>>
    ),
});

export type Client = z.infer<typeof clientSchema>;

import { z } from "zod";
import { TEAM_OPTIONS } from "@/config/teams";
import { costEstimateSchema } from "@/domain/validation/costEstimateSchema";

export const clientSchema = z.object({
  id: z.string(), // Firestore document ID
  name: z.string(), // Client name (Design phase)

  projectDetails: z.object({
    projectId: z.string(), // UUID used by expenses + linking
    projectName: z.string(), // used in construction UI
    projectAddress: z.string(), // required

    developer: z.string().optional().default(""),
    city: z.string().optional().default(""),

    projectSize: z.string().optional().default(""), // replaces old 'area'

    projectCost: z.number().nullable().optional(),

    // 🚀 Correct TEAM_OPTIONS enum
    team: z
      .enum(TEAM_OPTIONS)
      .refine((val) => TEAM_OPTIONS.includes(val), {
        message: "Team must be one of the allowed options",
      })
      .optional()
      .default(TEAM_OPTIONS[0]),

    engineer: z.string().optional().default(""), // was siteEngineer
    designer: z.string().optional().default(""),

    startDate: z.string().optional().default(""),
    endDate: z.string().optional().default(""),

    createdAt: z.number().optional(), // Firestore ms timestamp
  }),

  projects: z
    .record(
      z.object({
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
          .default(() => ({ costEstimates: {} })),

        constructionPhase: z.object({}).default(() => ({})),
      })
    )
    .default(() => ({})),
});

export type Client = z.infer<typeof clientSchema>;

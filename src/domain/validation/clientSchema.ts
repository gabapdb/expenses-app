import { z } from "zod";
import { TEAM_OPTIONS } from "@/config/teams";

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

  // ✔ CE must now live under designPhase
  designPhase: z
    .object({
      costEstimates: z.record(z.number()).optional(),
    })
    .default({}),

  // Construction fields added later
  constructionPhase: z.object({}).default({}),
});

export type Client = z.infer<typeof clientSchema>;

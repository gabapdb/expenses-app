import { z } from "zod";

export const costEstimateSchema = z.object({
  carpentry: z.number().nonnegative().optional(),
  electrical: z.number().nonnegative().optional(),
  tiles: z.number().nonnegative().optional(),
  plumbing: z.number().nonnegative().optional(),
  paint: z.number().nonnegative().optional(),
  flooring: z.number().nonnegative().optional(),
  miscellaneous: z.number().nonnegative().optional(),
  toolsEquipment: z.number().nonnegative().optional(),
  ceiling: z.number().nonnegative().optional(),
  transport: z.number().nonnegative().optional(),
});

export type CostEstimates = z.infer<typeof costEstimateSchema>;

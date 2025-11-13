import { z } from "zod";

export const areaSchema = z.object({
  id: z.string(),
  name: z.string(),
  order: z.number().int().nonnegative().optional(),
  source: z.enum(["global", "client"]).default("global"),
});

export type Area = z.infer<typeof areaSchema>;

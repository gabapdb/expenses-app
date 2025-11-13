import { z } from "zod";

export const scopeOfWorkSchema = z.object({
  id: z.string(),
  areaId: z.string(),
  name: z.string(),
  order: z.number().int().nonnegative().optional(),
  source: z.enum(["global", "client"]).default("global"),
});

export type ScopeOfWork = z.infer<typeof scopeOfWorkSchema>;

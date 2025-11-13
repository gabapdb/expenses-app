import { z } from "zod";

import { projectDetailsSchema, type ProjectDetails } from "./projectDetailsSchema";

export const clientSchema = z.object({
  id: z.string(),
  name: z.string(),
  projectDetails: projectDetailsSchema,
});

export type Client = z.infer<typeof clientSchema>;
export type { ProjectDetails };

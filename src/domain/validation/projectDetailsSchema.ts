import { Timestamp } from "firebase/firestore";
import { z } from "zod";

export const projectDetailsSchema = z.object({
  projectName: z.string(),
  projectAddress: z.string(),
  developer: z.string(),
  city: z.string(),
  area: z.string(),
  startDate: z.instanceof(Timestamp),
  endDate: z.instanceof(Timestamp).nullable(),
  projectCost: z.number().nullable(),
  engineer: z.string().nullable(),
  designer: z.string().nullable(),
});

export type ProjectDetails = z.infer<typeof projectDetailsSchema>;

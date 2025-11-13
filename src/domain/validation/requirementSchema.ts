import { z } from "zod";
import {
  REQUIREMENT_TYPE_LIST,
  REQUIREMENT_STATUS_LIST,
  type RequirementType,
  type RequirementStatus,
} from "@/config/requirements";

/* -------------------------------------------------------------------------- */
/* 🧩 Full Requirement Schema (Domain Model)                                 */
/* -------------------------------------------------------------------------- */
export const requirementSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  projectId: z.string(),
  areaId: z.string(),
  scopeId: z.string(),
  store: z.string().optional().default(""),
  item: z.string().optional().default(""),
  type: z.enum(REQUIREMENT_TYPE_LIST),
  dimensions: z.string().optional().default(""),
  approved: z.boolean().optional().default(false),
  notApproved: z.boolean().optional().default(false),
  status: z.enum(REQUIREMENT_STATUS_LIST),
  notes: z.string().optional().default(""),
  createdAt: z.number().default(() => Date.now()),
  updatedAt: z.number().optional(),
});

export type Requirement = z.infer<typeof requirementSchema>;
export type { RequirementType, RequirementStatus };

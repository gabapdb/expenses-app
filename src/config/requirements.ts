import { z } from "zod";

/* -------------------------------------------------------------------------- */
/* 🧩 Requirement Types                                                       */
/* -------------------------------------------------------------------------- */
export const REQUIREMENT_TYPES = [
  "Furniture",
  "Appliances",
  "Tiles",
  "Plumbing",
  "Electrical",
  "Blinds/Curtains/Upholstery",
  "Glass",
  "Decor",
  "Countertop",
  "Paint",
  "Wall Cladding",
  "Cabinets",
  "Waterproofing",
  "Smoke Detector",
  "Lighting",
] as const;

export type RequirementType = (typeof REQUIREMENT_TYPES)[number];

/* -------------------------------------------------------------------------- */
/* 🧩 Requirement Statuses                                                    */
/* -------------------------------------------------------------------------- */
export const REQUIREMENT_STATUS = [
  "COMPLETED",
  "DELIVERED/IN PROGRESS",
  "SUBMITTED/DONE OCULAR",
  "PAID",
] as const;

export type RequirementStatus = (typeof REQUIREMENT_STATUS)[number];

/* -------------------------------------------------------------------------- */
/* 🧩 Validation Schema (Zod) — Compatible with Zod v3                        */
/* -------------------------------------------------------------------------- */
export const RequirementMetaSchema = z.object({
  type: z.enum(REQUIREMENT_TYPES).describe("Requirement type is required"),
  status: z.enum(REQUIREMENT_STATUS).describe("Status is required"),
});

/* -------------------------------------------------------------------------- */
/* 🧩 Derived Lists for UI Dropdowns                                          */
/* -------------------------------------------------------------------------- */
export const REQUIREMENT_TYPE_LIST = [...REQUIREMENT_TYPES];
export const REQUIREMENT_STATUS_LIST = [...REQUIREMENT_STATUS];

/* -------------------------------------------------------------------------- */
/* 🧩 Type Guards / Utility Helpers                                           */
/* -------------------------------------------------------------------------- */
export function isValidRequirementType(value: string): value is RequirementType {
  return (REQUIREMENT_TYPES as readonly string[]).includes(value);
}

export function isValidRequirementStatus(value: string): value is RequirementStatus {
  return (REQUIREMENT_STATUS as readonly string[]).includes(value);
}

import { z } from "zod";

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Project name is required"),
  team: z.string().min(1, "Team is required"),
  projectCost: z.number().nonnegative("Project cost must be 0 or higher"),

  // Optional fields
  developer: z.string().optional().default(""),
  city: z.string().optional().default(""),
  startDate: z.string().optional().default(""),
  endDate: z.string().optional().default(""),
  projectSize: z.string().optional().default(""),

  // 🆕 Added fields
  siteEngineer: z.string().optional().default(""),
  designer: z.string().optional().default(""),

  createdAt: z.number(),
});
/** Project type derived from schema */

export type Project = z.infer<typeof ProjectSchema>;

export const ExpenseSchema = z.object({
  id: z.string().min(1, "Missing expense ID"),

  // 🔹 Linking fields
  projectId: z.string().min(1, "Missing project ID"),
  yyyyMM: z.string().regex(/^\d{6}$/, "Invalid yyyyMM format (expected YYYYMM)"),

  // 🔹 Basic info
  payee: z.string().default(""),
  category: z.string().min(1, "Category is required"),
  subCategory: z.string().min(1, "Sub-category is required"),
  details: z.string().default(""),

  // 🔹 Payment info
  modeOfPayment: z.string().default(""),
  invoiceDate: z.string().min(1, "Invoice date is required"),
  datePaid: z.string().default(""),

  // 🔹 Financials
  amount: z.coerce.number().min(0, "Amount must be ≥ 0"), // coerce from string
  paid: z.boolean().default(false),

  // 🔹 Metadata
  createdAt: z.coerce.number(),
  updatedAt: z.coerce.number(),
});

/** Expense type derived from schema */
export type Expense = z.infer<typeof ExpenseSchema>;


// ✨ NEW – safe extension for CE
export const CostEstimatesZ = z
.object({
carpentry: z.number().optional().default(0),
electrical: z.number().optional().default(0),
tiles: z.number().optional().default(0),
plumbing: z.number().optional().default(0),
paint: z.number().optional().default(0),
flooring: z.number().optional().default(0),
miscellaneous: z.number().optional().default(0),
toolsEquipment: z.number().optional().default(0),
ceiling: z.number().optional().default(0),
transport: z.number().optional().default(0),
})
.partial()
.default({});


export const ProjectWithCE = ProjectSchema.extend({
costEstimates: CostEstimatesZ.optional().default({}),
});


export type ProjectWithCEType = z.infer<typeof ProjectWithCE>;
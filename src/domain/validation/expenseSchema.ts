import { z } from "zod";

/**
 * Canonical Zod schema for Firestore expense documents.
 * Used across hooks, components, and data layers.
 */
export const ExpenseZod = z.object({
  id: z.string(),
  projectId: z.string(),
  category: z.string(),
  subCategory: z.string().optional(),
  amount: z.number(),
  datePaid: z.string().optional(),
  invoiceDate: z.string().optional(),
  modeOfPayment: z.string().optional(),
  payee: z.string().optional(),
  paid: z.boolean(),
  yyyyMM: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type ExpenseZodType = z.infer<typeof ExpenseZod>;

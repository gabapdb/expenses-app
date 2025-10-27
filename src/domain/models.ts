import { z } from "zod";


export const ProjectSchema = z.object({
id: z.string().uuid(),
name: z.string().min(1),
team: z.string().min(1),
projectCost: z.number().nonnegative(),
developer: z.string().min(1),
city: z.string().min(1),
startDate: z.string(), // ISO
endDate: z.string(), // ISO
projectSize: z.string(),
createdAt: z.number(),
});
export type Project = z.infer<typeof ProjectSchema>;


export const ExpenseSchema = z.object({
id: z.string().uuid(),
yyyyMM: z.string().regex(/^\d{6}$/),
projectId: z.string().uuid(),
invoiceDate: z.string(), // ISO
datePaid: z.string().optional(),
modeOfPayment: z.string().optional(),
payee: z.string().min(1),
category: z.string().min(1),
subCategory: z.string().optional(),
details: z.string().optional(),
amount: z.number().nonnegative(),
paid: z.boolean().default(false),
createdAt: z.number(),
updatedAt: z.number(),
});
export type Expense = z.infer<typeof ExpenseSchema>;
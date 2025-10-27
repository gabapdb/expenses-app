import { ProjectSchema, ExpenseSchema, type Project, type Expense } from "./models";
export const mapProject = (id: string, data: unknown): Project => ProjectSchema.parse({ id, ...(data as object) });
export const mapExpense = (id: string, data: unknown): Expense => ExpenseSchema.parse({ id, ...(data as object) });
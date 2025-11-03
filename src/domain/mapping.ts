import { ProjectSchema, ExpenseSchema, type Project, type Expense } from "./models";

export const mapProject = (id: string, data: unknown): Project =>
  ProjectSchema.parse({ id, ...(data as object) });

export const mapExpense = (id: string, data: unknown): Expense => {
  const raw = (data ?? {}) as Record<string, unknown>;

  const normalized = {
    id,
    ...raw,
    subCategory:
      typeof raw.subCategory === "string" && raw.subCategory.trim().length > 0
        ? raw.subCategory
        : "Uncategorized",
  };

  return ExpenseSchema.parse(normalized);
};

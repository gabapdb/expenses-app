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
    invoiceDate:
      typeof raw.invoiceDate === "string" && raw.invoiceDate.trim().length > 0
        ? raw.invoiceDate
        : typeof raw.datePaid === "string" && raw.datePaid.trim().length > 0
        ? raw.datePaid
        : typeof raw.yyyyMM === "string" && /^\d{6}$/.test(raw.yyyyMM)
        ? `${(raw.yyyyMM as string).slice(0, 4)}-${(raw.yyyyMM as string).slice(4)}-01`
        : new Date(
            typeof raw.createdAt === "number" ? raw.createdAt : Date.now()
          )
            .toISOString()
            .slice(0, 10),
  };

  return ExpenseSchema.parse(normalized);
};

import {
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/core/firebase";
import { ExpenseSchema, type Expense } from "@/domain/models";

function expenseDocRef(yyyyMM: string, expenseId: string) {
  return doc(db, "expenses", yyyyMM, "items", expenseId);
}

async function updateExpenseYearsMetadata(yyyyMM: string): Promise<void> {
  const year = Number(yyyyMM.slice(0, 4));
  if (Number.isNaN(year)) return;

  const ref = doc(db, "metadata", "expenseYears");
  const snap = await getDoc(ref);
  const data = snap.exists() ? (snap.data() as { years?: number[] }) : {};
  const years = Array.isArray(data.years) ? [...data.years] : [];

  if (!years.includes(year)) {
    years.push(year);
    years.sort((a, b) => a - b);
    await setDoc(ref, { years }, { merge: true });
  }
}

const TogglePayloadSchema = ExpenseSchema.pick({
  paid: true,
  updatedAt: true,
});

export function normalizeExpenseForWrite(draft: Partial<Expense>): Expense {
  const now = Date.now();
  const amountValue = draft.amount ?? 0;
  const amountNumber = Number(amountValue);
  const toTrim = (value: unknown) =>
    typeof value === "string" ? value.trim() : "";

  const normalized = ExpenseSchema.parse({
    ...draft,
    id: draft.id ?? "",
    projectId: toTrim(draft.projectId),
    yyyyMM: toTrim(draft.yyyyMM),
    payee: toTrim(draft.payee),
    category: toTrim(draft.category),
    subCategory: toTrim(draft.subCategory),
    details:
      typeof draft.details === "string" ? draft.details : draft.details ?? "",
    modeOfPayment:
      typeof draft.modeOfPayment === "string"
        ? draft.modeOfPayment.trim()
        : draft.modeOfPayment ?? "",
    invoiceDate: toTrim(draft.invoiceDate),
    datePaid: toTrim(draft.datePaid),
    amount: Number.isFinite(amountNumber) ? amountNumber : 0,
    paid: Boolean(draft.paid),
    createdAt: draft.createdAt ?? now,
    updatedAt: now,
  });

  return normalized;
}

export async function saveExpense(expense: Expense): Promise<Expense> {
  const parsed = ExpenseSchema.parse({
    ...expense,
    createdAt: expense.createdAt ?? Date.now(),
    updatedAt: Date.now(),
  });

  const ref = expenseDocRef(parsed.yyyyMM, parsed.id);
  await setDoc(ref, parsed, { merge: true });
  await updateExpenseYearsMetadata(parsed.yyyyMM);
  return parsed;
}

export async function deleteExpense(
  yyyyMM: string,
  expenseId: string
): Promise<void> {
  await deleteDoc(expenseDocRef(yyyyMM, expenseId));
}

export async function togglePaid(
  yyyyMM: string,
  expenseId: string,
  paid: boolean
): Promise<Expense> {
  const ref = expenseDocRef(yyyyMM, expenseId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    throw new Error(`Expense ${expenseId} not found in ${yyyyMM}`);
  }

  const existing = ExpenseSchema.parse({
    id: expenseId,
    yyyyMM,
    ...snap.data(),
  });

  const payload = TogglePayloadSchema.parse({
    paid,
    updatedAt: Date.now(),
  });

  const updated = ExpenseSchema.parse({
    ...existing,
    ...payload,
  });

  await setDoc(ref, updated, { merge: true });
  return updated;
}

export async function moveExpenseToMonth(
  expense: Expense,
  fromYYYYMM: string,
  toYYYYMM: string
): Promise<Expense> {
  const parsed = ExpenseSchema.parse({
    ...expense,
    yyyyMM: toYYYYMM,
    createdAt: expense.createdAt ?? Date.now(),
    updatedAt: Date.now(),
  });

  const batch = writeBatch(db);
  batch.set(expenseDocRef(toYYYYMM, parsed.id), parsed, { merge: true });
  batch.delete(expenseDocRef(fromYYYYMM, parsed.id));
  await batch.commit();

  await updateExpenseYearsMetadata(parsed.yyyyMM);
  return parsed;
}

export { expenseDocRef };

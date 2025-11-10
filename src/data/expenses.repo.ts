import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/core/firebase";
import { ExpenseSchema, type Expense } from "@/domain/models";

/* -------------------------------------------------------------------------- */
/* 🧩 Helper: keep /metadata/expenseYears in sync                             */
/* -------------------------------------------------------------------------- */
async function updateExpenseYearsMetadata(yyyyMM: string): Promise<void> {
  const year = Number(yyyyMM.slice(0, 4));
  if (isNaN(year)) return;

  const metaRef = doc(db, "metadata", "expenseYears");
  const snap = await getDoc(metaRef);
  const data = snap.exists() ? (snap.data() as { years?: number[] }) : {};
  const years = Array.isArray(data.years) ? [...data.years] : [];

  if (!years.includes(year)) {
    years.push(year);
    years.sort((a, b) => a - b);
    await setDoc(metaRef, { years }, { merge: true });
    console.log(`🧠 Added ${year} to /metadata/expenseYears`);
  }
}

/* -------------------------------------------------------------------------- */
/* 🧩 Add new expense (with year sync)                                        */
/* -------------------------------------------------------------------------- */
export async function addExpense(yyyyMM: string, data: unknown): Promise<void> {
  const parsed = ExpenseSchema.parse(data);
  const ref = doc(db, "expenses", yyyyMM, "items", parsed.id);

  await setDoc(ref, parsed, { merge: true });

  // 🧠 keep metadata up to date
  await updateExpenseYearsMetadata(yyyyMM);
}


/**
 * Update an expense's paid status and optionally patch other fields.
 * - Also updates `updatedAt` timestamp.
 * - Automatically coerces types and validates shape.
 */
export async function updateExpensePaid(
  yyyyMM: string,
  expenseId: string,
  paid: boolean,
  patch: Partial<Expense>
): Promise<void> {
  const ref = doc(db, "expenses", yyyyMM, "items", expenseId);

  // strip out undefined values so we don't accidentally write them
  const cleanedPatch = Object.fromEntries(
    Object.entries(patch).filter(([, value]) => value !== undefined)
  ) as Partial<Expense>;

  const normalized = {
    paid,
    ...cleanedPatch,
    updatedAt: Date.now(),
  } as Record<string, unknown>;

  const parsed = ExpenseSchema.partial().parse(normalized);

  // Zod applies defaults for missing fields; ensure we only send the keys we asked for
  const allowedKeys = new Set(Object.keys(normalized));
  const sanitized = Object.fromEntries(
    Object.entries(parsed).filter(([key]) => allowedKeys.has(key))
  );

  await updateDoc(ref, sanitized);
}

/**
 * Mirror a paid expense into its corresponding project summary.
 * - Optional helper for analytics / dashboard totals.
 * - Creates/updates a document in projects/{projectId}/paidExpenses/{expense.id}
 */
export async function mirrorPaidToProject(
  yyyyMM: string,
  expense: Expense
): Promise<void> {
  if (!expense.projectId || expense.projectId === "unassigned") return;

  const projectRef = doc(
    db,
    "projects",
    expense.projectId,
    "paidExpenses",
    expense.id
  );

  const payload = {
    id: expense.id,
    yyyyMM,
    payee: expense.payee,
    category: expense.category,
    subCategory: expense.subCategory ?? "",
    amount: Number(expense.amount) || 0,
    datePaid: expense.datePaid ?? "",
    updatedAt: Date.now(),
  };

  await setDoc(projectRef, payload, { merge: true });
}

/**
 * Utility: Get a reference to the collection for a given month.
 * (Useful for list or query hooks)
 */
export function expensesCollectionRef(yyyyMM: string) {
  return collection(db, "expenses", yyyyMM, "items");
}


/**
 * Delete an expense document.
 * - Removes Firestore document at: expenses/{yyyyMM}/items/{expenseId}
 */
export async function deleteExpense(yyyyMM: string, expenseId: string): Promise<void> {
  const ref = doc(db, "expenses", yyyyMM, "items", expenseId);
  await deleteDoc(ref);
}
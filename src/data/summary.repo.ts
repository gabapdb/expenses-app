import {
  getDocs,
  collection,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/core/firebase";
import { ExpenseSchema, type Expense } from "@/domain/models";
import { z } from "zod";

/**
 * Zod-safe wrapper for an array of Expense documents.
 */
const ExpensesArraySchema = z.array(ExpenseSchema);

/**
 * Retrieves all month IDs from Firestore (`expenses` root collection).
 * Returns sorted array of YYYYMM strings.
 */
export async function allMonths(): Promise<string[]> {
  const snap = await getDocs(collection(db, "expenses"));
  const ids: string[] = [];

  snap.forEach((doc) => {
    if (typeof doc.id === "string" && /^\d{6}$/.test(doc.id)) {
      ids.push(doc.id);
    }
  });

  return ids.sort();
}

/**
 * Fetches all Expense items for a given month, fully Zod-validated.
 * Rejects malformed documents immediately with a descriptive error.
 */
export async function expensesForMonth(yyyyMM: string): Promise<Expense[]> {
  const colRef = collection(db, "expenses", yyyyMM, "items");
  const snap = await getDocs(colRef);

  // Collect unknown Firestore payloads first
  const rawData: unknown[] = snap.docs.map(
    (d: QueryDocumentSnapshot<DocumentData>) => ({
      id: d.id,
      ...d.data(),
    })
  );

  // ✅ Zod-validate all entries before returning
  return ExpensesArraySchema.parse(rawData);
}

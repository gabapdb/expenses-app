import { collection, doc, getDocs, query, setDoc, updateDoc, where, type DocumentData } from "firebase/firestore";
import { db } from "@/core/firebase";
import { mapExpense } from "@/domain/mapping";
import type { Expense } from "@/domain/models";


const monthCol = (yyyyMM: string) => collection(db, "expenses", yyyyMM, "items");
export async function listMonthlyExpenses(yyyyMM: string): Promise<Expense[]> {
const snap = await getDocs(monthCol(yyyyMM));
return snap.docs.map(d => mapExpense(d.id, d.data() as DocumentData));
}
export async function addExpense(yyyyMM: string, e: Expense): Promise<void> {
const ref = doc(db, "expenses", yyyyMM, "items", e.id);
await setDoc(ref, e);
}
export async function updateExpensePaid(
yyyyMM: string,
expenseId: string,
paid: boolean,
patch: Partial<Expense>
): Promise<void> {
const ref = doc(db, "expenses", yyyyMM, "items", expenseId);
await updateDoc(ref, { paid, ...patch, updatedAt: Date.now() });
}
export async function mirrorPaidToProject(yyyyMM: string, expense: Expense): Promise<void> {
const ref = doc(db, "projects", expense.projectId, "paidExpenses", expense.id);
await setDoc(ref, { ...expense, yyyyMM });
}
export async function listMonthlyExpensesByProject(yyyyMM: string, projectId: string): Promise<Expense[]> {
const q = query(monthCol(yyyyMM), where("projectId", "==", projectId));
const snap = await getDocs(q);
return snap.docs.map(d => mapExpense(d.id, d.data() as DocumentData));
}
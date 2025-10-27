import { getDocs, collection, type DocumentData } from "firebase/firestore";
import { db } from "@/core/firebase";
import { mapExpense } from "@/domain/mapping";
import type { Expense } from "@/domain/models";


export async function allMonths(): Promise<string[]> {
const snap = await getDocs(collection(db, "expenses"));
return snap.docs.map(d => d.id).sort();
}
export async function expensesForMonth(yyyyMM: string): Promise<Expense[]> {
const items = await getDocs(collection(db, "expenses", yyyyMM, "items"));
return items.docs.map(d => mapExpense(d.id, d.data() as DocumentData));
}
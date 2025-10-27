"use client";
import { useState } from "react";
import Button from "./ui/Button";
import Input from "./ui/Input";
import Checkbox from "./ui/Checkbox";
import Card from "./ui/Card";
import { T, THead, TRow, TCell } from "./ui/Table";
import { uuid } from "@/utils/id";
import { addExpense, mirrorPaidToProject, updateExpensePaid } from "@/data/expenses.repo";
import type { Expense } from "@/domain/models";
import { peso } from "@/utils/format";

const COLS = "grid-cols-[140px_120px_120px_160px_160px_140px_160px_1fr_120px_80px]";


export default function ExpensesGrid({ yyyyMM, projectOptions }: { yyyyMM: string; projectOptions: { id: string; name: string }[] }) {
const [rows, setRows] = useState<Partial<Expense>[]>([]);


function addRow() {
setRows((r) => [
...r,
{ id: uuid(), yyyyMM, amount: 0, paid: false, createdAt: Date.now(), updatedAt: Date.now() },
]);
}

async function saveRow(i: number) {
const e = rows[i];
if (!e?.id || !e.projectId || !e.payee || !e.category) return;
const payload: Expense = {
id: e.id,
yyyyMM,
projectId: e.projectId,
invoiceDate: e.invoiceDate || new Date().toISOString(),
datePaid: e.datePaid,
modeOfPayment: e.modeOfPayment,
payee: e.payee,
category: e.category!,
subCategory: e.subCategory,
details: e.details,
amount: Number(e.amount || 0),
paid: !!e.paid,
createdAt: Number(e.createdAt || Date.now()),
updatedAt: Date.now(),
};
await addExpense(yyyyMM, payload);
if (payload.paid) await mirrorPaidToProject(yyyyMM, payload);
}

async function togglePaid(i: number) {
const e = rows[i];
if (!e?.id) return;
const paid = !e.paid;
setRows((r) => r.map((row, idx) => (idx === i ? { ...row, paid } : row)));
await updateExpensePaid(yyyyMM, e.id!, paid, { datePaid: paid ? new Date().toISOString() : undefined });
if (paid) await mirrorPaidToProject(yyyyMM, e as Expense);
}


function set(i: number, patch: Partial<Expense>) {
setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
}

return (
<Card>
<div className="mb-3 flex items-center justify-between">
<div className="text-sm text-gray-600">Month: <span className="font-medium">{yyyyMM}</span></div>
<Button onClick={addRow}>Add Row</Button>
</div>


<T>
<THead>
<TRow cols={COLS}>
{["Project","Invoice Date","Date Paid","Mode of Payment","Payee","Category","Sub Category","Details","Amount","Paid"].map(h => (
<TCell key={h} className="px-3 py-2">{h}</TCell>
))}
</TRow>
</THead>


{rows.map((r, i) => (
<TRow key={r.id} cols={COLS}>
<TCell>
<select
className="w-full rounded-lg border border-gray-300 px-2 py-2 text-sm"
value={r.projectId || ""}
onChange={(e) => set(i, { projectId: e.target.value })}
>
<option value="">Select project…</option>
{projectOptions.map((p) => (
<option key={p.id} value={p.id}>{p.name}</option>
))}
</select>
</TCell>
<TCell><Input type="date" value={(r.invoiceDate || "").slice(0, 10)} onChange={(e) => set(i, { invoiceDate: new Date(e.target.value).toISOString() })} /></TCell>
<TCell><Input type="date" value={(r.datePaid || "").slice(0, 10)} onChange={(e) => set(i, { datePaid: new Date(e.target.value).toISOString() })} /></TCell>
<TCell><Input value={r.modeOfPayment || ""} onChange={(e) => set(i, { modeOfPayment: e.target.value })} /></TCell>
<TCell><Input value={r.payee || ""} onChange={(e) => set(i, { payee: e.target.value })} /></TCell>
<TCell><Input value={r.category || ""} onChange={(e) => set(i, { category: e.target.value })} /></TCell>
<TCell><Input value={r.subCategory || ""} onChange={(e) => set(i, { subCategory: e.target.value })} /></TCell>
<TCell><Input value={r.details || ""} onChange={(e) => set(i, { details: e.target.value })} /></TCell>
<TCell>
<Input type="number" step="0.01" value={String(r.amount ?? 0)} onChange={(e) => set(i, { amount: Number(e.target.value) })} />
<div className="text-xs text-gray-500">{peso(Number(r.amount || 0))}</div>
</TCell>
<TCell>
<div className="flex items-center gap-2">
<Checkbox checked={!!r.paid} onChange={() => togglePaid(i)} />
<Button className="ml-2" onClick={() => saveRow(i)}>Save</Button>
</div>
</TCell>
</TRow>
))}
</T>
</Card>
);
}
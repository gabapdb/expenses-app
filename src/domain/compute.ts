import type { Expense, Project } from "./models";


export const expensesByCategory = (ex: Expense[]) => {
const m = new Map<string, number>();
for (const e of ex) m.set(e.category, (m.get(e.category) || 0) + e.amount);
return [...m.entries()].map(([category, total]) => ({ category, total }));
};


export const spentPct = (spent: number, cost: number) => (cost > 0 ? (spent / cost) * 100 : 0);
export const remainingPct = (spent: number, cost: number) => (cost > 0 ? ((cost - spent) / cost) * 100 : 0);


export function runningTotalsByProject(
expensesByMonth: Record<string, Expense[]>,
projects: Project[]
) {
const out: Record<string, Record<string, number>> = {};
const ids = new Set(projects.map(p => p.id));
const months = Object.keys(expensesByMonth).sort();
const acc: Record<string, number> = {};
for (const m of months) {
out[m] = {};
for (const id of ids) {
const month = expensesByMonth[m].filter(e => e.projectId === id);
const spent = month.reduce((s, e) => s + e.amount, 0);
acc[id] = (acc[id] || 0) + spent;
out[m][id] = acc[id];
}
}
return out;
}
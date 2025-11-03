"use client";

import { useState, useMemo } from "react";
import { useProjects } from "@/hooks/useProjects";
import { useCategories } from "@/hooks/useCategories";
import { CATEGORY_MAP } from "@/config/categories";
import { addExpense, updateExpensePaid } from "@/data/expenses.repo";
import { useRealtimeExpenses } from "@/hooks/useRealtimeExpenses";
import type { Expense } from "@/domain/models";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Checkbox from "@/components/ui/Checkbox";
import { peso } from "@/utils/format";
import { uuid } from "@/utils/id";
import { z } from "zod";
import ExpenseEditModal from "@/components/ExpenseEditModal";
import { isoDateToYYYYMM } from "@/utils/time";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */
const todayISO = () => new Date().toISOString().slice(0, 10);
const fmtDateInput = (iso?: string) =>
  iso ? new Date(iso).toISOString().slice(0, 10) : "";

/* responsive proportional grid */
const COLS =
  "grid-cols-[1.2fr_1fr_1fr_1fr_1fr_1.3fr_1.3fr_2fr_1fr_0.5fr]";

/* -------------------------------------------------------------------------- */
/* Zod schema (accepts empty strings)                                         */
/* -------------------------------------------------------------------------- */
const zOptStr = z.string().optional().or(z.literal(""));

const expenseSchema = z.object({
  id: z.string().min(1, "Missing ID"),
  yyyyMM: z.string(),
  projectId: z.string().min(1, "Project required"),
  invoiceDate: zOptStr,
  datePaid: zOptStr,
  modeOfPayment: zOptStr,
  payee: zOptStr,
  category: zOptStr,
  subCategory: zOptStr,
  details: zOptStr,
  amount: z.number(),
  paid: z.boolean(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */
export default function ExpensesGrid({ yyyyMM }: { yyyyMM: string }) {
  const { data: projects } = useProjects();
  const { categoryMap } = useCategories();
  const { data: expenses, loading } = useRealtimeExpenses(yyyyMM);

  const [draft, setDraft] = useState<Partial<Expense>>(() => ({
    id: uuid(),
    yyyyMM,
    projectId: "",
    invoiceDate: todayISO(),
    datePaid: todayISO(),
    modeOfPayment: "",
    payee: "",
    category: "",
    subCategory: "",
    details: "",
    amount: 0,
    paid: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }));

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  /* ---------------------------------------------------------------------- */
  /* Save handler                                                           */
  /* ---------------------------------------------------------------------- */
  async function handleSave() {
    try {
      const targetMonth =
        isoDateToYYYYMM(draft.datePaid) ??
        isoDateToYYYYMM(draft.invoiceDate) ??
        yyyyMM;

      const data = expenseSchema.parse({
        id: draft.id ?? crypto.randomUUID(),
        yyyyMM: targetMonth,
        projectId: draft.projectId,
        invoiceDate: draft.invoiceDate,
        datePaid: draft.datePaid,
        modeOfPayment: draft.modeOfPayment,
        payee: draft.payee,
        category: draft.category,
        subCategory: draft.subCategory,
        details: draft.details,
        amount: Number(draft.amount) || 0,
        paid: !!draft.paid,
        createdAt: draft.createdAt ?? Date.now(),
        updatedAt: Date.now(),
      });

      setSaving(true);
      await addExpense(targetMonth, data as Expense);

      // reset after save
      setDraft({
        id: uuid(),
        yyyyMM,
        projectId: "",
        invoiceDate: todayISO(),
        datePaid: todayISO(),
        modeOfPayment: "",
        payee: "",
        category: "",
        subCategory: "",
        details: "",
        amount: 0,
        paid: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      setError(null);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors = err.flatten().fieldErrors as Record<string, string[]>;
        const first = Object.values(errors)[0]?.[0];
        setError(first || "Please complete required fields.");
        console.warn("[ExpensesGrid] Validation error:", err.flatten());
      } else {
        setError("Failed to save expense.");
      }
    } finally {
      setSaving(false);
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Month Tabs                                                             */
  /* ---------------------------------------------------------------------- */
  const year = useMemo(() => yyyyMM.slice(0, 4), [yyyyMM]);
  const months = useMemo(
    () =>
      Array.from({ length: 12 }, (_, m) => ({
        name: new Date(0, m).toLocaleString("default", { month: "long" }),
        value: `${year}${String(m + 1).padStart(2, "0")}`,
      })),
    [year]
  );
  const currentMonth = yyyyMM.slice(4, 6);

  /* ---------------------------------------------------------------------- */
  /* Category fallback + typed helper                                       */
  /* ---------------------------------------------------------------------- */
  const categorySource =
    Object.keys(categoryMap).length > 0 ? categoryMap : CATEGORY_MAP;
  const categorySourceTyped = categorySource as Record<string, string[]>;

  /* ---------------------------------------------------------------------- */
  /* Toggle Paid                                                            */
  /* ---------------------------------------------------------------------- */
  async function togglePaid(id: string, current: boolean) {
    try {
      await updateExpensePaid(yyyyMM, id, !current, {
        updatedAt: Date.now(),
      });
    } catch (err) {
      console.error("Failed to toggle paid:", err);
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Render                                                                 */
  /* ---------------------------------------------------------------------- */
  return (
    <div className="space-y-8">
      {/* Input row */}
      <div className={`grid ${COLS} items-center gap-2 text-sm px-2 md:px-6`}>
        {/* Project */}
        <select
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
          value={draft.projectId ?? ""}
          onChange={(e) => setDraft({ ...draft, projectId: e.target.value })}
        >
          <option value="">Select project…</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        {/* Invoice Date */}
        <Input
          type="date"
          value={fmtDateInput(draft.invoiceDate)}
          onChange={(e) =>
            setDraft({
              ...draft,
              invoiceDate: e.target.value || todayISO(),
            })
          }
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        />

        {/* Date Paid */}
        <Input
          type="date"
          value={fmtDateInput(draft.datePaid)}
          onChange={(e) =>
            setDraft({
              ...draft,
              datePaid: e.target.value || todayISO(),
            })
          }
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        />

        {/* Mode of Payment */}
        <Input
          type="text"
          placeholder="Cash / Bank"
          value={draft.modeOfPayment ?? ""}
          onChange={(e) =>
            setDraft({ ...draft, modeOfPayment: e.target.value })
          }
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        />

        {/* Payee */}
        <Input
          type="text"
          placeholder="Payee name"
          value={draft.payee ?? ""}
          onChange={(e) => setDraft({ ...draft, payee: e.target.value })}
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        />

        {/* Category */}
        <select
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
          value={draft.category ?? ""}
          onChange={(e) =>
            setDraft({ ...draft, category: e.target.value, subCategory: "" })
          }
        >
          <option value="">Select category…</option>
          {Object.keys(categorySourceTyped).map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Sub Category */}
        <select
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
          value={draft.subCategory ?? ""}
          onChange={(e) => setDraft({ ...draft, subCategory: e.target.value })}
          disabled={!draft.category}
        >
          <option value="">
            {draft.category ? "Select subcategory…" : "(choose category first)"}
          </option>
          {(categorySourceTyped[draft.category ?? ""] ?? []).map((sub: string) => (
            <option key={sub} value={sub}>
              {sub}
            </option>
          ))}
        </select>

        {/* Details */}
        <Input
          type="text"
          placeholder="Details / description"
          value={draft.details ?? ""}
          onChange={(e) => setDraft({ ...draft, details: e.target.value })}
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        />

        {/* Amount */}
        <Input
          type="number"
          step="0.01"
          value={String(draft.amount ?? 0)}
          onChange={(e) =>
            setDraft({ ...draft, amount: Number(e.target.value || 0) })
          }
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm text-right"
        />

        {/* Paid */}
        <div className="flex justify-center items-center">
          <Checkbox
            checked={!!draft.paid}
            onChange={(e) => setDraft({ ...draft, paid: e.target.checked })}
          />
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-black"
        >
          {saving ? "Saving..." : "Save Expense"}
        </Button>
      </div>

      {/* Month tabs */}
      <div className="flex flex-wrap gap-2 border-t border-gray-200 pt-4">
        {months.map((m) => {
          const active = m.value.slice(4, 6) === currentMonth;
          return (
            <a
              key={m.value}
              href={`/expenses/${m.value}`}
              className={`px-3 py-1.5 text-sm rounded-md ${
                active
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              {m.name}
            </a>
          );
        })}
      </div>

      {/* Expense list */}
      <div className="border-t border-gray-300 pt-4">
        {loading ? (
          <div className="text-gray-500 text-sm">Loading expenses...</div>
        ) : expenses.length === 0 ? (
          <div className="text-gray-500 text-sm">No expenses yet for this month.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b text-left">
                  <th className="p-2">Project</th>
                  <th className="p-2">Invoice Date</th>
                  <th className="p-2">Date Paid</th>
                  <th className="p-2">Mode</th>
                  <th className="p-2">Payee</th>
                  <th className="p-2">Category</th>
                  <th className="p-2">Subcategory</th>
                  <th className="p-2">Details</th>
                  <th className="p-2 text-right">Amount</th>
                  <th className="p-2 text-center">Paid</th>
                  <th className="p-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((e) => (
                  <tr key={e.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{projects.find((p) => p.id === e.projectId)?.name || "—"}</td>
                    <td className="p-2">{fmtDateInput(e.invoiceDate)}</td>
                    <td className="p-2">{fmtDateInput(e.datePaid)}</td>
                    <td className="p-2">{e.modeOfPayment || "—"}</td>
                    <td className="p-2">{e.payee || "—"}</td>
                    <td className="p-2">{e.category || "—"}</td>
                    <td className="p-2">{e.subCategory || "—"}</td>
                    <td className="p-2">{e.details || "—"}</td>
                    <td className="p-2 text-right">{peso(e.amount)}</td>
                    <td className="p-2 text-center">
                      <Checkbox
                        checked={!!e.paid}
                        onChange={() => togglePaid(e.id, !!e.paid)}
                      />
                    </td>
                    <td className="p-2 text-center">
                      <Button
                        type="button"
                        className="bg-gray-100 text-gray-800 hover:bg-gray-200 px-2 py-1"
                        onClick={() => setEditingExpense(e)}
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {error && (
        <div className="text-sm text-red-600 font-medium">{error}</div>
      )}

      {editingExpense && (
        <ExpenseEditModal
          yyyyMM={editingExpense.yyyyMM ?? yyyyMM}
          expense={editingExpense}
          onClose={() => setEditingExpense(null)}
          onSaved={() => setEditingExpense(null)}
        />
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { z } from "zod";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { uuid } from "@/utils/id";
import { addExpense } from "@/data/expenses.repo";
import { isoDateToYYYYMM } from "@/utils/time";
import type { Expense } from "@/domain/models";
import { invalidateProjectExpenses } from "@/hooks/useProjectExpensesCollection";
import { getFirstZodError } from "@/utils/zodHelpers";
import { useAutoCategorize } from "@/utils/autoCategorize";
import DetailsAutocomplete from "@/components/DetailsAutocomplete";

const todayISO = () => new Date().toISOString().slice(0, 10);
const fmtDateInput = (iso?: string) =>
  iso ? new Date(iso).toISOString().slice(0, 10) : "";

const zOptStr = z.string().optional().or(z.literal(""));
const zRequiredStr = z.string().min(1);

const expenseSchema = z.object({
  id: z.string().min(1, "Missing ID"),
  yyyyMM: z.string(),
  projectId: z.string().min(1, "Project required"),
  invoiceDate: zRequiredStr,
  datePaid: zOptStr,
  modeOfPayment: zOptStr,
  payee: zOptStr,
  category: zRequiredStr,
  subCategory: zRequiredStr,
  details: zOptStr,
  amount: z.number().min(0, "Amount must be ≥ 0"),
  paid: z.boolean(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export default function ExpenseForm({
  yyyyMM,
  projects,
  categorySource,
  onError,
}: {
  yyyyMM: string;
  projects: { id: string; name: string }[];
  categorySource: Record<string, readonly string[]>;
  onError: (err: string | null) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [highlightCat, setHighlightCat] = useState(false);
  const [highlightSub, setHighlightSub] = useState(false);

  const [draft, setDraft] = useState<Partial<Expense>>({
    id: uuid(),
    yyyyMM,
    projectId: "",
    invoiceDate: "",
    datePaid: "",
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

  const autoCategorize = useAutoCategorize();
  const catSrc = categorySource as Record<string, string[]>;

  async function handleSave() {
  try {
    const targetMonth =
      isoDateToYYYYMM(draft.datePaid) ??
      isoDateToYYYYMM(draft.invoiceDate) ??
      yyyyMM;

    const data = expenseSchema.parse({
      id: draft.id ?? crypto.randomUUID(),
      yyyyMM: targetMonth,
      ...draft,
      amount: Number(draft.amount) || 0,
      paid: !!draft.paid,
      createdAt: draft.createdAt ?? Date.now(),
      updatedAt: Date.now(),
    });

    setSaving(true);
    await addExpense(targetMonth, data as Expense);

    // 🧠 Learn mapping for this item
    try {
      const { learn } = await autoCategorize({
        details: data.details ?? "",
        category: data.category ?? "",
        subCategory: data.subCategory ?? "",
      });
      await learn(data.category ?? "", data.subCategory ?? "");
      console.log("[AutoCategorize] Learned item:", data.details);
    } catch (e) {
      console.warn("[AutoCategorize] Learn failed:", e);
    }

    void invalidateProjectExpenses(data.projectId);
    onError(null);

    // Reset form
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
  } catch (err) {
    const first = getFirstZodError(err);
    if (first) onError(first);
    else onError("Failed to save expense.");
  } finally {
    setSaving(false);
  }
}


  /** 🔍 Auto-categorize and briefly highlight */
  async function handleDetailsBlur(nextDetails: string) {
    const details = nextDetails.trim();
    if (!details) return;

    const { suggestion } = await autoCategorize({
      details,
      category: draft.category ?? "",
      subCategory: draft.subCategory ?? "",
    });
    if (suggestion) {
      setDraft((current) => ({
        ...current,
        category: suggestion.category,
        subCategory: suggestion.subCategory,
      }));
      setHighlightCat(true);
      setHighlightSub(true);
      setTimeout(() => {
        setHighlightCat(false);
        setHighlightSub(false);
      }, 1000);
    }
  }

  return (
    <div className="rounded-xl border border-[#3a3a3a] bg-[#1f1f1f] p-6 shadow-sm space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Project */}
        <FormField label="Project">
          <select
            className="w-full min-w-[160px] rounded-md border border-[#3a3a3a] bg-[#242424] px-3 py-1.5 text-sm text-[#e5e5e5]"
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
        </FormField>

        {/* Dates */}
        <FormField label="Invoice Date">
          <Input
            type="date"
            value={fmtDateInput(draft.invoiceDate)}
            onChange={(e) =>
              setDraft({ ...draft, invoiceDate: e.target.value || todayISO() })
            }
            className="input-dark"
          />
        </FormField>

        <FormField label="Date Paid">
          <Input
            type="date"
            value={fmtDateInput(draft.datePaid)}
            onChange={(e) =>
              setDraft({ ...draft, datePaid: e.target.value || todayISO() })
            }
            className="input-dark"
          />
        </FormField>

        {/* Mode of Payment */}
        <FormField label="Mode of Payment">
          <Input
            type="text"
            placeholder="Cash / Bank"
            value={draft.modeOfPayment ?? ""}
            onChange={(e) =>
              setDraft({ ...draft, modeOfPayment: e.target.value })
            }
            className="input-dark"
          />
        </FormField>

        {/* Payee */}
        <FormField label="Payee">
          <Input
            type="text"
            placeholder="Payee name"
            value={draft.payee ?? ""}
            onChange={(e) => setDraft({ ...draft, payee: e.target.value })}
            className="input-dark"
          />
        </FormField>

        {/* 🧩 DETAILS BEFORE CATEGORY */}

        <FormField label="Details">
          <DetailsAutocomplete
            value={draft.details ?? ""}
            onChange={(val) => setDraft((prev) => ({ ...prev, details: val }))}
            onSelectSuggestion={(item) => {
              setDraft((prev) => ({
                ...prev,
                details: item.name,
                category: item.category,
                subCategory: item.subCategory,
              }));
              setHighlightCat(true);
              setHighlightSub(true);
              setTimeout(() => {
                setHighlightCat(false);
                setHighlightSub(false);
              }, 1000);
            }}
            onBlurAutoCategorize={handleDetailsBlur}
          />
        </FormField>


        {/* Category */}
        <FormField label="Category">
          <select
            className={`input-dark transition-colors duration-300 ${
              highlightCat ? "bg-[#374151]/60 border-[#6366f1]" : ""
            }`}
            value={draft.category ?? ""}
            onChange={(e) =>
              setDraft({ ...draft, category: e.target.value, subCategory: "" })
            }
          >
            <option value="">Select category…</option>
            {Object.keys(catSrc).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </FormField>

        {/* Subcategory */}
        <FormField label="Subcategory">
          <select
            className={`input-dark disabled:opacity-50 transition-colors duration-300 ${
              highlightSub ? "bg-[#374151]/60 border-[#6366f1]" : ""
            }`}
            value={draft.subCategory ?? ""}
            onChange={(e) =>
              setDraft({ ...draft, subCategory: e.target.value })
            }
            disabled={!draft.category}
          >
            <option value="">
              {draft.category
                ? "Select subcategory…"
                : "(choose category first)"}
            </option>
            {(catSrc[draft.category ?? ""] ?? []).map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </FormField>

        {/* Amount */}
        <FormField label="Amount">
          <Input
            type="number"
            step="0.01"
            value={String(draft.amount ?? 0)}
            onChange={(e) =>
              setDraft({ ...draft, amount: Number(e.target.value || 0) })
            }
            className="input-dark text-right"
          />
        </FormField>

        {/* Paid toggle */}
        <FormField label="Paid" center>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={!!draft.paid}
              onChange={(e) =>
                setDraft({ ...draft, paid: e.target.checked })
              }
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-[#3a3a3a] rounded-full peer-checked:bg-[#6366f1] transition-all" />
            <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-[#e5e5e5] rounded-full transition-transform peer-checked:translate-x-5" />
          </label>
        </FormField>
      </div>

      <div className="flex justify-center pt-2">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full sm:w-auto bg-[#2a2a2a] text-[#e5e5e5] px-6 py-2 rounded-md hover:bg-[#3a3a3a] transition font-medium"
        >
          {saving ? "Saving..." : "Save Expense"}
        </Button>
      </div>
    </div>
  );
}

/* ---------------------------------- */
/* Helper subcomponent */
/* ---------------------------------- */
function FormField({
  label,
  children,
  center,
}: {
  label: string;
  children: React.ReactNode;
  center?: boolean;
}) {
  return (
    <div
      className={`flex flex-col ${
        center ? "items-center justify-center" : ""
      }`}
    >
      <label className="mb-1 text-xs text-[#9ca3af]">{label}</label>
      {children}
    </div>
  );
}

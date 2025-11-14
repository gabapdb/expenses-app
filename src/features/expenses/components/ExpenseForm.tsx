"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import DetailsAutocomplete from "@/features/expenses/components/DetailsAutocomplete";
import { useExpenseFormLogicV2 } from "@/hooks/expenses/v2/useExpenseFormLogicV2";

interface ExpenseFormProps {
  yyyyMM: string;
  projects: { id: string; name: string }[];
  categorySource: Record<string, readonly string[]>;
  onError: (err: string | null) => void;
}

export default function ExpenseForm({
  yyyyMM,
  projects,
  categorySource,
  onError,
}: ExpenseFormProps) {
  const {
    values,
    saving,
    highlightCat,
    highlightSub,
    handleFieldChange,
    handleCategoryChange,
    handleSubCategoryChange,
    handleDetailsChange,
    handleDetailsSuggestionSelect,
    handleDetailsBlur,
    handleSubmit,
    fmtDateInput,
  } = useExpenseFormLogicV2({
    yyyyMM,
    categorySource,
    onError,
  });

  return (
    <div className="rounded-xl border border-[#3a3a3a] bg-[#1f1f1f] p-6 shadow-sm space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {/* Project */}
        <FormField label="Project">
          <select
            className="w-full min-w-[160px] rounded-md border border-[#3a3a3a] bg-[#242424] px-3 py-1.5 text-sm text-[#e5e5e5]"
            name="projectId"
            value={values.projectId ?? ""}
            onChange={handleFieldChange}
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
            name="invoiceDate"
            value={fmtDateInput(values.invoiceDate)}
            onChange={handleFieldChange}
            className="input-dark"
          />
        </FormField>

        <FormField label="Date Paid">
          <Input
            type="date"
            name="datePaid"
            value={fmtDateInput(values.datePaid)}
            onChange={handleFieldChange}
            className="input-dark"
          />
        </FormField>

        {/* Mode of Payment */}
        <FormField label="Mode of Payment">
          <Input
            type="text"
            name="modeOfPayment"
            placeholder="Cash / Bank"
            value={values.modeOfPayment ?? ""}
            onChange={handleFieldChange}
            className="input-dark"
          />
        </FormField>

        {/* Payee */}
        <FormField label="Payee">
          <Input
            type="text"
            name="payee"
            placeholder="Payee name"
            value={values.payee ?? ""}
            onChange={handleFieldChange}
            className="input-dark"
          />
        </FormField>

        {/* 🧩 DETAILS BEFORE CATEGORY */}

        <FormField label="Details">
          <DetailsAutocomplete
            value={values.details ?? ""}
            onChange={handleDetailsChange}
            onSelectSuggestion={handleDetailsSuggestionSelect}
            onBlurAutoCategorize={handleDetailsBlur}
          />
        </FormField>

        {/* Category */}
        <FormField label="Category">
          <select
            className={`input-dark transition-colors duration-300 ${
              highlightCat ? "bg-[#374151]/60 border-[#6366f1]" : ""
            }`}
            value={values.category ?? ""}
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            <option value="">Select category…</option>
            {Object.keys(categorySource).map((cat) => (
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
            value={values.subCategory ?? ""}
            onChange={(e) => handleSubCategoryChange(e.target.value)}
            disabled={!values.category}
          >
            <option value="">
              {values.category ? "Select subcategory…" : "(choose category first)"}
            </option>
            {(categorySource[values.category ?? ""] ?? []).map((sub) => (
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
            name="amount"
            value={String(values.amount ?? 0)}
            onChange={handleFieldChange}
            className="text-right input-dark"
          />
        </FormField>

        {/* Paid toggle */}
        <FormField label="Paid" center>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="paid"
              checked={!!values.paid}
              onChange={handleFieldChange}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-[#3a3a3a] rounded-full peer-checked:bg-[#6366f1] transition-all" />
            <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-[#e5e5e5] rounded-full transition-transform peer-checked:translate-x-5" />
          </label>
        </FormField>
      </div>

      <div className="flex justify-center pt-2">
        <Button
          onClick={() => {
            void handleSubmit();
          }}
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

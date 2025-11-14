"use client";

import { motion } from "framer-motion";

import Card from "@/components/ui/Card";
import ExpenseEditModal from "@/features/expenses/components/ExpenseEditModal";
import SectionHeader from "@/components/ui/SectionHeader";
import { useExpenseDetailPageLogicV2 } from "@/hooks/expenses/v2/useExpenseDetailPageLogicV2";
import "@/styles/pages.css";

export default function ExpenseDetailPage() {
  const {
    loading,
    error,
    expense,
    yyyyMM,
    expenseId,
    fields,
    subtitle,
    editing,
    openEdit,
    closeEdit,
    handleSaved,
  } = useExpenseDetailPageLogicV2();

  if (loading)
    return <div className="panel text-muted">Loading expense…</div>;
  if (error)
    return <div className="panel text-error text-sm">{error}</div>;
  if (!expense)
    return (
      <div className="panel text-muted text-sm">
        No expense found with ID {expenseId}.
      </div>
    );

  return (
    <motion.div
      className="page-container"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <SectionHeader title="Expense Details" subtitle={subtitle} />

      <div className="panel mt-4 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-base font-semibold text-gray-100">Expense Info</h1>
          <button
            onClick={openEdit}
            className="text-xs bg-gray-800 text-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-700"
          >
            ✏️ Edit
          </button>
        </div>

        <Card>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {fields.map((field) => (
              <Field key={field.label} label={field.label} value={field.value} />
            ))}
          </div>
        </Card>

        {editing && expense && (
          <ExpenseEditModal
            yyyyMM={yyyyMM}
            expense={expense}
            onClose={closeEdit}
            onSaved={handleSaved}
          />
        )}
      </div>
    </motion.div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-gray-400">{label}</div>
      <div className="font-medium text-gray-200 break-words">{value}</div>
    </div>
  );
}


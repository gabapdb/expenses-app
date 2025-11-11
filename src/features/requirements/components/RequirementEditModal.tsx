"use client";

import { useState } from "react";
import { z } from "zod";
import { updateRequirement, deleteRequirement } from "@/data/requirements.repo";
import type { Requirement } from "@/domain/validation/requirementSchema";
import { REQUIREMENT_TYPE_LIST, REQUIREMENT_STATUS_LIST, RequirementType,
  RequirementStatus, } from "@/config/requirements";

/* -------------------------------------------------------------------------- */
/* 🧩 Validation Schema (for local form)                                      */
/* -------------------------------------------------------------------------- */
const EditRequirementSchema = z.object({
  store: z.string().min(1, "Store is required"),
  item: z.string().min(1, "Item is required"),
  type: z.enum(REQUIREMENT_TYPE_LIST),
  dimensions: z.string().optional(),
  status: z.enum(REQUIREMENT_STATUS_LIST),
  notes: z.string().optional(),
  area: z.string().min(1, "Area is required"),
  approved: z.boolean().optional(),
  notApproved: z.boolean().optional(),
});

/* -------------------------------------------------------------------------- */
/* 🧱 Props                                                                   */
/* -------------------------------------------------------------------------- */
export interface RequirementEditModalProps {
  projectId: string;
  requirement: Requirement;
  onClose: () => void;
  onUpdated: () => Promise<void>;
}

/* -------------------------------------------------------------------------- */
/* 🧩 Component                                                               */
/* -------------------------------------------------------------------------- */
export default function RequirementEditModal({
  projectId,
  requirement,
  onClose,
  onUpdated,
}: RequirementEditModalProps) {
  const [formData, setFormData] = useState<z.infer<typeof EditRequirementSchema>>({
    store: requirement.store,
    item: requirement.item,
    type: requirement.type as RequirementType,
    dimensions: requirement.dimensions ?? "",
    status: requirement.status as RequirementStatus,
    notes: requirement.notes ?? "",
    area: requirement.area,
    approved: Boolean((requirement as Requirement).approved),
    notApproved: Boolean((requirement as Requirement).notApproved),
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ------------------------------------------------------------------------ */
  /* 🪄 Handlers                                                              */
  /* ------------------------------------------------------------------------ */
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ): void => {
    const { name, value, type } = e.target;
    const checked =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const validated = EditRequirementSchema.parse(formData);

      const updatedReq: Requirement = {
        ...requirement,
        ...validated,
        updatedAt: Date.now(),
      };

      await updateRequirement(projectId, updatedReq);
      await onUpdated();
      onClose();
    } catch (err) {
      if (err instanceof z.ZodError) {
        const flat = err.flatten();
        const fieldErrors: Record<string, string[]> = flat.fieldErrors;
        const first =
          Object.values(fieldErrors)[0]?.[0] ?? "Please check all fields.";
        setError(first);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unknown error while saving requirement.");
      }
    } finally {
      setSaving(false);
    }
  };

  async function handleDelete(): Promise<void> {
    if (!confirm("Are you sure you want to delete this requirement?")) return;
    await deleteRequirement(projectId, formData.area, requirement.id);
    await onUpdated();
    onClose();
  }

  /* ------------------------------------------------------------------------ */
  /* 🎨 UI                                                                   */
  /* ------------------------------------------------------------------------ */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-[480px] rounded-lg bg-[#1f1f1f] p-6 text-[#d1d1d1] border border-[#3a3a3a]">
        <h2 className="text-lg font-medium mb-4">Edit Requirement</h2>

        {error && <p className="text-sm text-red-400 mb-3">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Area</label>
              <input
                name="area"
                value={formData.area}
                onChange={handleChange}
                className="w-full rounded-md bg-[#2a2a2a] p-2 text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Store</label>
              <input
                name="store"
                value={formData.store}
                onChange={handleChange}
                className="w-full rounded-md bg-[#2a2a2a] p-2 text-sm outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Item</label>
            <input
              name="item"
              value={formData.item}
              onChange={handleChange}
              className="w-full rounded-md bg-[#2a2a2a] p-2 text-sm outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full rounded-md bg-[#2a2a2a] p-2 text-sm"
              >
                <option value="">Select Type</option>
                {REQUIREMENT_TYPE_LIST.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-md bg-[#2a2a2a] p-2 text-sm"
              >
                <option value="">Select Status</option>
                {REQUIREMENT_STATUS_LIST.map(status => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Dimensions</label>
            <input
              name="dimensions"
              value={formData.dimensions}
              onChange={handleChange}
              className="w-full rounded-md bg-[#2a2a2a] p-2 text-sm outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-md bg-[#2a2a2a] p-2 text-sm outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-500"
              disabled={saving}
            >
              Delete
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-[#333] px-4 py-2 text-sm hover:bg-[#444]"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500 disabled:opacity-50"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

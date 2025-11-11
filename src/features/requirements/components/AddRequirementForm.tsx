"use client";

import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import {
  REQUIREMENT_TYPE_LIST,
  REQUIREMENT_STATUS_LIST,
  RequirementType,
  RequirementStatus,
} from "@/config/requirements";
import { addRequirement } from "@/data/requirements.repo";
import { requirementSchema, type Requirement } from "@/domain/validation/requirementSchema";
import { Dialog } from "@headlessui/react";

/* -------------------------------------------------------------------------- */
/* 🧩 Validation Schema                                                       */
/* -------------------------------------------------------------------------- */
const RequirementFormSchema = z.object({
  area: z.string().min(1, "Area is required."),
  store: z.string().min(1, "Store is required."),
  item: z.string().min(1, "Item is required."),
  type: z
    .enum(REQUIREMENT_TYPE_LIST)
    .optional()
    .or(z.literal(""))
    .refine((val) => val !== "", "Type is required."),
  dimensions: z.string().optional(),
  status: z
    .enum(REQUIREMENT_STATUS_LIST)
    .optional()
    .or(z.literal(""))
    .refine((val) => val !== "", "Status is required."),
  notes: z.string().optional(),
});

/* -------------------------------------------------------------------------- */
/* 🧱 Component                                                               */
/* -------------------------------------------------------------------------- */
interface AddRequirementFormProps {
  projectId: string;
  initialArea: string;
  availableAreas: string[];
  onAdded?: () => void;
}

export default function AddRequirementForm({
  projectId,
  initialArea,
  availableAreas,
  onAdded,
}: AddRequirementFormProps) {
  const [formData, setFormData] = useState<
    z.infer<typeof RequirementFormSchema>
  >({
    area: initialArea,
    store: "",
    item: "",
    type: "" as unknown as RequirementType,
    dimensions: "",
    status: "" as unknown as RequirementStatus,
    notes: "",
  });

  const [customAreas, setCustomAreas] = useState<string[]>(
    initialArea ? [initialArea] : []
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newArea, setNewArea] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ------------------------------------------------------------------------ */
  /* ♻️ Sync area defaults + available options                                 */
  /* ------------------------------------------------------------------------ */
  useEffect(() => {
    if (!initialArea) return;
    setFormData((prev) => ({ ...prev, area: initialArea }));
  }, [initialArea]);

  useEffect(() => {
    if (!initialArea) return;
    setCustomAreas((prev) =>
      prev.includes(initialArea) ? prev : [...prev, initialArea]
    );
  }, [initialArea]);

  useEffect(() => {
    setCustomAreas((prev) =>
      prev.filter((area) => !availableAreas.includes(area))
    );
  }, [availableAreas]);

  const areaOptions = useMemo(() => {
    const merged = new Set<string>();
    availableAreas.forEach((area) => {
      if (area.trim()) merged.add(area);
    });
    customAreas.forEach((area) => {
      if (area.trim()) merged.add(area);
    });
    return Array.from(merged).sort((a, b) => a.localeCompare(b));
  }, [availableAreas, customAreas]);

  /* ------------------------------------------------------------------------ */
  /* 🪄 Handlers                                                              */
  /* ------------------------------------------------------------------------ */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "area" && value === "__add_new__") {
      setIsModalOpen(true);
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddArea = () => {
    const trimmed = newArea.trim();
    if (!trimmed) return;
    setCustomAreas((prev) =>
      prev.includes(trimmed) ? prev : [...prev, trimmed]
    );
    setFormData((prev) => ({ ...prev, area: trimmed }));
    setNewArea("");
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const validated = RequirementFormSchema.parse(formData);
      const data: Requirement = requirementSchema.parse({
        id: crypto.randomUUID(),
        projectId,
        area: validated.area,
        store: validated.store,
        item: validated.item,
        type: validated.type as RequirementType,
        status: validated.status as RequirementStatus,
        dimensions: validated.dimensions ?? "",
        notes: validated.notes ?? "",
        createdAt: Date.now(),
      });

      await addRequirement(projectId, data);
      onAdded?.();

      setFormData({
        area: validated.area,
        store: "",
        item: "",
        type: "" as unknown as RequirementType,
        dimensions: "",
        status: "" as unknown as RequirementStatus,
        notes: "",
      });
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        const flat = err.flatten();
        const firstError =
          Object.values(flat.fieldErrors as Record<string, string[]>)[0]?.[0] ??
          "Please fill all required fields.";
        setError(firstError);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unknown error saving requirement.");
      }
    } finally {
      setSaving(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* 🎨 UI                                                                   */
  /* ------------------------------------------------------------------------ */
  return (
    <>
      {/* 💬 Modal for Adding New Area */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-sm rounded-lg bg-[#1f1f1f] p-6 border border-[#3a3a3a] text-[#d1d1d1]">
            <Dialog.Title className="text-lg font-medium mb-3">Add New Area</Dialog.Title>
            <input
              value={newArea}
              onChange={(e) => setNewArea(e.target.value)}
              placeholder="Enter area name"
              className="w-full rounded-md bg-[#2a2a2a] p-2 text-sm outline-none focus:ring-1 focus:ring-[#555]"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-md bg-[#333] px-4 py-2 text-sm hover:bg-[#444]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddArea}
                className="rounded-md  bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500"
              >
                Save
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* 📋 Add Requirement Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-lg border border-[#3a3a3a] bg-[#1f1f1f] p-6 text-[#d1d1d1] space-y-6"
      >
        {error && <p className="text-red-400 text-sm">{error}</p>}

        {/* 🔹 Row 1 */}
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1">Area</label>
            <select
              name="area"
              value={formData.area}
              onChange={handleChange}
              className="w-full rounded-md bg-[#2a2a2a] p-2 text-sm"
            >
              <option value="">Select Area</option>
              {areaOptions.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
              <option value="__add_new__">➕ Add new area…</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Store</label>
            <input
              name="store"
              value={formData.store}
              onChange={handleChange}
              className="w-full rounded-md bg-[#2a2a2a] p-2 text-sm outline-none focus:ring-1 focus:ring-[#555]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Item</label>
            <input
              name="item"
              value={formData.item}
              onChange={handleChange}
              className="w-full rounded-md bg-[#2a2a2a] p-2 text-sm outline-none focus:ring-1 focus:ring-[#555]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full rounded-md bg-[#2a2a2a] p-2 text-sm"
            >
              <option value="">Select Type</option>
              {REQUIREMENT_TYPE_LIST.map((t: RequirementType) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 🔹 Row 2 */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1">Dimensions</label>
            <input
              name="dimensions"
              value={formData.dimensions}
              onChange={handleChange}
              className="w-full rounded-md bg-[#2a2a2a] p-2 text-sm outline-none focus:ring-1 focus:ring-[#555]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-md bg-[#2a2a2a] p-2 text-sm"
            >
              <option value="">Select Status</option>
              {REQUIREMENT_STATUS_LIST.map((s: RequirementStatus) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={1}
              className="w-full rounded-md bg-[#2a2a2a] p-2 text-sm outline-none focus:ring-1 focus:ring-[#555]"
            />
          </div>
        </div>

        {/* 🔘 Save Button (centered) */}
<div className="flex justify-center pt-4">
  <button
    type="submit"
    disabled={saving}
    className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
  >
    {saving ? "Saving..." : "Save Requirement"}
  </button>
</div>

      </form>
    </>
  );
}

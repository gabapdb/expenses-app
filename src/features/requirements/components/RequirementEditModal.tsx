"use client";

import { useEffect, useMemo, useState } from "react";
import { z } from "zod";

import { updateRequirement, deleteRequirement } from "@/data/requirements.repo";
import type { Requirement } from "@/domain/validation/requirementSchema";
import {
  REQUIREMENT_STATUS_LIST,
  REQUIREMENT_TYPE_LIST,
  type RequirementStatus,
  type RequirementType,
} from "@/config/requirements";
import type { Area } from "@/domain/validation/areaSchema";
import type { ScopeOfWork } from "@/domain/validation/scopeOfWorkSchema";

const EditRequirementSchema = z.object({
  areaId: z.string().min(1, "Area is required"),
  scopeId: z.string().min(1, "Scope is required"),
  store: z.string().min(1, "Store is required"),
  item: z.string().min(1, "Item is required"),
  type: z.enum(REQUIREMENT_TYPE_LIST),
  dimensions: z.string().optional(),
  status: z.enum(REQUIREMENT_STATUS_LIST),
  notes: z.string().optional(),
  approved: z.boolean().optional(),
  notApproved: z.boolean().optional(),
});

type EditRequirementForm = z.infer<typeof EditRequirementSchema>;

type EnsureScopesFn = (
  areaId: string,
  options?: { force?: boolean }
) => Promise<ScopeOfWork[]>;

export interface RequirementEditModalProps {
  clientId: string;
  projectId?: string;
  requirement: Requirement;
  areas: Area[];
  scopesByArea: Record<string, ScopeOfWork[]>;
  ensureScopes: EnsureScopesFn;
  onClose: () => void;
  onUpdated: () => Promise<void>;
}

export default function RequirementEditModal({
  clientId,
  projectId,
  requirement,
  areas,
  scopesByArea,
  ensureScopes,
  onClose,
  onUpdated,
}: RequirementEditModalProps) {
  const [formData, setFormData] = useState<EditRequirementForm>({
    areaId: requirement.areaId,
    scopeId: requirement.scopeId,
    store: requirement.store,
    item: requirement.item,
    type: requirement.type as RequirementType,
    dimensions: requirement.dimensions ?? "",
    status: requirement.status as RequirementStatus,
    notes: requirement.notes ?? "",
    approved: Boolean(requirement.approved),
    notApproved: Boolean(requirement.notApproved),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const areaOptions = useMemo(() => {
    const entries = new Map<string, string>();
    areas.forEach((area) => entries.set(area.id, area.name));
    if (requirement.areaId && !entries.has(requirement.areaId)) {
      entries.set(requirement.areaId, requirement.areaId);
    }
    return Array.from(entries.entries()).map(([id, name]) => ({ id, name }));
  }, [areas, requirement.areaId]);

  const [availableScopes, setAvailableScopes] = useState<ScopeOfWork[]>([]);

  useEffect(() => {
    const areaId = formData.areaId;
    if (!areaId) {
      setAvailableScopes([]);
      return;
    }

    const scopes = scopesByArea[areaId];
    if (scopes) {
      setAvailableScopes(scopes);
    } else {
      void ensureScopes(areaId).then(setAvailableScopes).catch(() => setAvailableScopes([]));
    }
  }, [formData.areaId, scopesByArea, ensureScopes]);

  const scopeOptions = useMemo(() => {
    const entries = new Map<string, string>();
    availableScopes.forEach((scope) => entries.set(scope.id, scope.name));
    if (formData.scopeId && !entries.has(formData.scopeId)) {
      entries.set(formData.scopeId, formData.scopeId);
    }
    return Array.from(entries.entries()).map(([id, name]) => ({ id, name }));
  }, [availableScopes, formData.scopeId]);

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type, checked } = event.target;

    if (name === "areaId") {
      setFormData((prev) => ({ ...prev, areaId: value, scopeId: "" }));
      return;
    }

    if (name === "scopeId") {
      setFormData((prev) => ({ ...prev, scopeId: value }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const validated = EditRequirementSchema.parse(formData);

      const updatedRequirement: Requirement = {
        ...requirement,
        ...validated,
        approved: Boolean(validated.approved),
        notApproved: Boolean(validated.notApproved),
        clientId,
        projectId: projectId ?? requirement.projectId,
        updatedAt: Date.now(),
      };

      await updateRequirement(clientId, updatedRequirement);
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

  const handleDelete = async (): Promise<void> => {
    if (!confirm("Are you sure you want to delete this requirement?")) return;
    await deleteRequirement(clientId, requirement.id);
    await onUpdated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-[520px] rounded-lg bg-[#1f1f1f] p-6 text-[#d1d1d1] border border-[#3a3a3a]">
        <h2 className="text-lg font-medium mb-4">Edit Requirement</h2>

        {error && <p className="text-sm text-red-400 mb-3">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Area</label>
              <select
                name="areaId"
                value={formData.areaId}
                onChange={handleChange}
                className="w-full rounded-md bg-[#2a2a2a] p-2 text-sm"
              >
                <option value="">Select Area</option>
                {areaOptions.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Scope</label>
              <select
                name="scopeId"
                value={formData.scopeId}
                onChange={handleChange}
                className="w-full rounded-md bg-[#2a2a2a] p-2 text-sm"
                disabled={!formData.areaId}
              >
                <option value="">Select Scope</option>
                {scopeOptions.map((scope) => (
                  <option key={scope.id} value={scope.id}>
                    {scope.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Store</label>
              <input
                name="store"
                value={formData.store}
                onChange={handleChange}
                className="w-full rounded-md bg-[#2a2a2a] p-2 text-sm outline-none"
              />
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
                {REQUIREMENT_TYPE_LIST.map((type) => (
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
                {REQUIREMENT_STATUS_LIST.map((status) => (
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

          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="approved"
                checked={!!formData.approved}
                onChange={handleChange}
                className="accent-green-500"
              />
              Approved
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="notApproved"
                checked={!!formData.notApproved}
                onChange={handleChange}
                className="accent-red-500"
              />
              Not Approved
            </label>
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

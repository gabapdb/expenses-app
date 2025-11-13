"use client";

import { useEffect, useMemo, useState } from "react";
import { Dialog } from "@headlessui/react";
import { z } from "zod";

import {
  REQUIREMENT_STATUS_LIST,
  REQUIREMENT_TYPE_LIST,
  type RequirementStatus,
  type RequirementType,
} from "@/config/requirements";
import { createRequirement } from "@/data/requirements.repo";
import { createClientArea, createClientScope } from "@/data/areas.repo";
import type { Area } from "@/domain/validation/areaSchema";
import type { ScopeOfWork } from "@/domain/validation/scopeOfWorkSchema";
import { requirementSchema, type Requirement } from "@/domain/validation/requirementSchema";

const RequirementFormSchema = z.object({
  areaId: z.string().min(1, "Area is required."),
  scopeId: z.string().min(1, "Scope is required."),
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

type RequirementFormState = z.infer<typeof RequirementFormSchema>;

type EnsureScopesFn = (
  areaId: string,
  options?: { force?: boolean }
) => Promise<ScopeOfWork[]>;

interface AddRequirementFormProps {
  clientId: string;
  projectId?: string;
  areas: Area[];
  scopesByArea: Record<string, ScopeOfWork[]>;
  initialAreaId?: string;
  ensureScopes: EnsureScopesFn;
  onAreasRefresh: () => Promise<void>;
  onRequirementCreated?: (areaId: string) => void;
}

export default function AddRequirementForm({
  clientId,
  projectId,
  areas,
  scopesByArea,
  initialAreaId = "",
  ensureScopes,
  onAreasRefresh,
  onRequirementCreated,
}: AddRequirementFormProps) {
  const [formData, setFormData] = useState<RequirementFormState>({
    areaId: initialAreaId,
    scopeId: "",
    store: "",
    item: "",
    type: "" as unknown as RequirementType,
    dimensions: "",
    status: "" as unknown as RequirementStatus,
    notes: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [areaModalOpen, setAreaModalOpen] = useState(false);
  const [scopeModalOpen, setScopeModalOpen] = useState(false);
  const [newAreaName, setNewAreaName] = useState("");
  const [newScopeName, setNewScopeName] = useState("");
  const [areaSaving, setAreaSaving] = useState(false);
  const [scopeSaving, setScopeSaving] = useState(false);

  const areaOptions = useMemo(() => areas.map((area) => ({
    id: area.id,
    name: area.name,
  })), [areas]);

  const [availableScopes, setAvailableScopes] = useState<ScopeOfWork[]>([]);

  useEffect(() => {
    if (!initialAreaId) return;
    setFormData((prev) => ({ ...prev, areaId: initialAreaId }));
  }, [initialAreaId]);

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

  useEffect(() => {
    if (!formData.scopeId) return;
    const hasScope = availableScopes.some((scope) => scope.id === formData.scopeId);
    if (!hasScope) {
      setFormData((prev) => ({ ...prev, scopeId: "" }));
    }
  }, [availableScopes, formData.scopeId]);

  const selectedAreaName = useMemo(() => {
    const selected = areaOptions.find((area) => area.id === formData.areaId);
    return selected?.name ?? "";
  }, [areaOptions, formData.areaId]);

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = event.target;

    if (name === "areaId") {
      if (value === "__add_area__") {
        setAreaModalOpen(true);
        return;
      }

      setFormData((prev) => ({ ...prev, areaId: value, scopeId: "" }));
      return;
    }

    if (name === "scopeId") {
      if (value === "__add_scope__") {
        setScopeModalOpen(true);
        return;
      }

      setFormData((prev) => ({ ...prev, scopeId: value }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateArea = async () => {
    const trimmed = newAreaName.trim();
    if (!trimmed || areaSaving) return;

    try {
      setAreaSaving(true);
      const id = crypto.randomUUID();
      await createClientArea(clientId, { id, name: trimmed });
      await onAreasRefresh();
      setFormData((prev) => ({ ...prev, areaId: id, scopeId: "" }));
      setNewAreaName("");
      setAreaModalOpen(false);
      await ensureScopes(id, { force: true });
    } catch (err) {
      console.error("[AddRequirementForm] Failed to create area", err);
      setError("Failed to create area. Please try again.");
    } finally {
      setAreaSaving(false);
    }
  };

  const handleCreateScope = async () => {
    if (!formData.areaId || scopeSaving) return;
    const trimmed = newScopeName.trim();
    if (!trimmed) return;

    try {
      setScopeSaving(true);
      const id = crypto.randomUUID();
      await createClientScope(clientId, formData.areaId, { id, name: trimmed });
      const scopes = await ensureScopes(formData.areaId, { force: true });
      setAvailableScopes(scopes);
      setFormData((prev) => ({ ...prev, scopeId: id }));
      setNewScopeName("");
      setScopeModalOpen(false);
    } catch (err) {
      console.error("[AddRequirementForm] Failed to create scope", err);
      setError("Failed to create scope. Please try again.");
    } finally {
      setScopeSaving(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const validated = RequirementFormSchema.parse(formData);
      if (!projectId) {
        throw new Error("Project context is required to create a requirement.");
      }

      const payload: Requirement = requirementSchema.parse({
        id: crypto.randomUUID(),
        clientId,
        projectId,
        areaId: validated.areaId,
        scopeId: validated.scopeId,
        store: validated.store,
        item: validated.item,
        type: validated.type as RequirementType,
        status: validated.status as RequirementStatus,
        dimensions: validated.dimensions ?? "",
        notes: validated.notes ?? "",
        createdAt: Date.now(),
      });

      await createRequirement(clientId, payload);
      onRequirementCreated?.(validated.areaId);

      setFormData((prev) => ({
        ...prev,
        scopeId: validated.scopeId,
        store: "",
        item: "",
        type: "" as unknown as RequirementType,
        dimensions: "",
        status: "" as unknown as RequirementStatus,
        notes: "",
      }));
    } catch (err) {
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

  return (
    <>
      <Dialog open={areaModalOpen} onClose={() => setAreaModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-sm rounded-lg bg-[#1f1f1f] p-6 border border-[#3a3a3a] text-[#d1d1d1]">
            <Dialog.Title className="text-lg font-medium mb-3">Add Area</Dialog.Title>
            <input
              value={newAreaName}
              onChange={(event) => setNewAreaName(event.target.value)}
              placeholder="Enter area name"
              className="w-full rounded-md bg-[#2a2a2a] p-2 text-sm outline-none focus:ring-1 focus:ring-[#555]"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setAreaModalOpen(false)}
                className="rounded-md bg-[#333] px-4 py-2 text-sm hover:bg-[#444]"
                disabled={areaSaving}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateArea}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500 disabled:opacity-50"
                disabled={areaSaving}
              >
                {areaSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      <Dialog open={scopeModalOpen} onClose={() => setScopeModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-sm rounded-lg bg-[#1f1f1f] p-6 border border-[#3a3a3a] text-[#d1d1d1]">
            <Dialog.Title className="text-lg font-medium mb-3">
              Add Scope{selectedAreaName ? ` for ${selectedAreaName}` : ""}
            </Dialog.Title>
            <input
              value={newScopeName}
              onChange={(event) => setNewScopeName(event.target.value)}
              placeholder="Enter scope name"
              className="w-full rounded-md bg-[#2a2a2a] p-2 text-sm outline-none focus:ring-1 focus:ring-[#555]"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setScopeModalOpen(false)}
                className="rounded-md bg-[#333] px-4 py-2 text-sm hover:bg-[#444]"
                disabled={scopeSaving}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateScope}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500 disabled:opacity-50"
                disabled={scopeSaving || !formData.areaId}
              >
                {scopeSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      <form
        onSubmit={handleSubmit}
        className="rounded-lg border border-[#3a3a3a] bg-[#1f1f1f] p-6 text-[#d1d1d1] space-y-6"
      >
        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1">Area</label>
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
              <option value="__add_area__">➕ Add new area…</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Scope</label>
            <select
              name="scopeId"
              value={formData.scopeId}
              onChange={handleChange}
              className="w-full rounded-md bg-[#2a2a2a] p-2 text-sm"
              disabled={!formData.areaId}
            >
              <option value="">Select Scope</option>
              {availableScopes.map((scope) => (
                <option key={scope.id} value={scope.id}>
                  {scope.name}
                </option>
              ))}
              {formData.areaId && <option value="__add_scope__">➕ Add new scope…</option>}
            </select>
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
              {REQUIREMENT_TYPE_LIST.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
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
              {REQUIREMENT_STATUS_LIST.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <label className="block text-xs font-medium mb-1">Dimensions</label>
            <input
              name="dimensions"
              value={formData.dimensions}
              onChange={handleChange}
              className="w-full rounded-md bg-[#2a2a2a] p-2 text-sm outline-none focus:ring-1 focus:ring-[#555]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-md bg-[#2a2a2a] p-2 text-sm outline-none focus:ring-1 focus:ring-[#555]"
          />
        </div>

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

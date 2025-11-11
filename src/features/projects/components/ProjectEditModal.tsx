"use client";

import { useState, useMemo, FormEvent, ChangeEvent } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { upsertProject } from "@/data/projects.repo";
import { ProjectSchema, type Project } from "@/domain/models";

interface ProjectEditModalProps {
  project: Project;
  onClose: () => void;
  onSaved?: (updated: Project) => void;
}

export default function ProjectEditModal({
  project,
  onClose,
  onSaved,
}: ProjectEditModalProps) {
  const [draft, setDraft] = useState<Project>({
  ...project,
  team: project.team ?? "",
  developer: project.developer ?? "",
  city: project.city ?? "",
  projectSize: project.projectSize ?? "",
  siteEngineer: project.siteEngineer ?? "", // 🆕
  designer: project.designer ?? "",         // 🆕
  startDate: project.startDate ?? "",
  endDate: project.endDate ?? "",
  createdAt: project.createdAt ?? Date.now(),
  projectCost: project.projectCost ?? 0,
});


  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmed = useMemo(
    () => ({
      ...draft,
      name: draft.name.trim(),
      team: draft.team.trim(),
      developer: draft.developer?.trim() ?? "",
      city: draft.city?.trim() ?? "",
      projectSize: draft.projectSize?.trim() ?? "",
      startDate: draft.startDate?.trim() ?? "",
      endDate: draft.endDate?.trim() ?? "",
      siteEngineer: draft.siteEngineer?.trim() ?? "",
      designer: draft.designer?.trim() ?? "",
      projectCost: draft.projectCost,

    }),
    [draft]
  );

  const canSave = useMemo(() => {
    return trimmed.name && trimmed.team && trimmed.projectCost >= 0;
  }, [trimmed]);

  const handleChange =
    (field: keyof Project) => (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setDraft((prev) => ({
        ...prev,
        [field]: field === "projectCost" ? Number(value) : value,
      }));
    };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSave || saving) return;

    setSaving(true);
    setError(null);

    try {
      const parsed = ProjectSchema.parse({
        ...trimmed,
        updatedAt: Date.now(),
        createdAt: draft.createdAt ?? Date.now(),
      });

      await upsertProject(parsed);
      onSaved?.(parsed);
      onClose();
    } catch (err) {
      console.error("[ProjectEditModal] Failed to save project", err);
      setError(err instanceof Error ? err.message : "Failed to save project");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="w-full max-w-3xl rounded-xl border border-[#3a3a3a] bg-[#1f1f1f] p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-[#e5e5e5]">Edit Project</h2>
          <button
            onClick={onClose}
            className="text-[#9ca3af] hover:text-[#e5e5e5] text-sm"
          >
            ✕
          </button>
        </div>

        {error && <div className="text-[#f87171] text-sm mb-3">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Project Name">
              <Input
                value={draft.name}
                onChange={handleChange("name")}
                placeholder="Project name"
                className="input-dark"
                required
              />
            </FormField>

            <FormField label="Team">
              <Input
                value={draft.team}
                onChange={handleChange("team")}
                placeholder="Team"
                className="input-dark"
                required
              />
            </FormField>

            <FormField label="Developer">
              <Input
                value={draft.developer ?? ""}
                onChange={handleChange("developer")}
                placeholder="Developer"
                className="input-dark"
              />
            </FormField>

            <FormField label="City">
              <Input
                value={draft.city ?? ""}
                onChange={handleChange("city")}
                placeholder="City"
                className="input-dark"
              />
            </FormField>

            <FormField label="Start Date">
              <Input
                type="date"
                value={draft.startDate ?? ""}
                onChange={handleChange("startDate")}
                className="input-dark"
              />
            </FormField>

            <FormField label="End Date">
              <Input
                type="date"
                value={draft.endDate ?? ""}
                onChange={handleChange("endDate")}
                className="input-dark"
              />
            </FormField>

            <FormField label="Project Size">
              <Input
                value={draft.projectSize ?? ""}
                onChange={handleChange("projectSize")}
                placeholder="e.g. 150 sqm"
                className="input-dark"
              />
            </FormField>

            <FormField label="Site Engineer">
  <Input
    value={draft.siteEngineer ?? ""}
    onChange={handleChange("siteEngineer")}
    placeholder="Site engineer"
    className="input-dark"
  />
</FormField>

<FormField label="Designer">
  <Input
    value={draft.designer ?? ""}
    onChange={handleChange("designer")}
    placeholder="Designer"
    className="input-dark"
  />
</FormField>


            <FormField label="Project Cost">
              <Input
                type="number"
                value={String(draft.projectCost)}
                onChange={handleChange("projectCost")}
                placeholder="₱"
                className="input-dark text-right"
                required
              />
            </FormField>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button
              type="button"
              onClick={onClose}
              className="bg-[#2a2a2a] text-[#e5e5e5] hover:bg-[#3a3a3a]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!canSave || saving}
              className="bg-[#6366f1] text-white hover:bg-[#4f46e5]"
            >
              {saving ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* Helper */
function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <label className="mb-1 text-xs text-[#9ca3af]">{label}</label>
      {children}
    </div>
  );
}

"use client";

import { type ChangeEvent, type FormEvent, useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { upsertProject } from "@/data/projects.repo";
import type { Project } from "@/domain/models";

interface ProjectCreateModalProps {
  onClose: () => void;
}

interface DraftProject {
  name: string;
  team: string;
  projectCost: string;
  developer: string;
  city: string;
  startDate: string;
  endDate: string;
  projectSize: string;
  siteEngineer: string;
  designer: string;
}

const initialDraft: DraftProject = {
  name: "",
  team: "",
  projectCost: "",
  developer: "",
  city: "",
  startDate: "",
  endDate: "",
  projectSize: "",
  siteEngineer: "",
  designer: "",
};

function generateProjectId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function ProjectCreateModal({ onClose }: ProjectCreateModalProps) {
  const [draft, setDraft] = useState<DraftProject>(initialDraft);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmed = useMemo(
    () => ({
      name: draft.name.trim(),
      team: draft.team.trim(),
      developer: draft.developer.trim(),
      city: draft.city.trim(),
      projectSize: draft.projectSize.trim(),
      startDate: draft.startDate.trim(),
      endDate: draft.endDate.trim(),
      projectCost: draft.projectCost.trim(),
      siteEngineer: draft.siteEngineer.trim(),
      designer: draft.designer.trim(),
    }),
    [draft]
  );

  const canSave = useMemo(() => {
    if (!trimmed.name || !trimmed.team) return false;
    const cost = Number(trimmed.projectCost);
    if (!Number.isFinite(cost) || cost < 0) return false;
    return true;
  }, [trimmed]);

  const handleChange =
    (field: keyof DraftProject) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setDraft((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSave || saving) return;

    setSaving(true);
    setError(null);

    try {
      const payload: Project = {
        id: generateProjectId(),
        name: trimmed.name,
        team: trimmed.team as "Team 1" | "Team 2",
        projectCost: Number(trimmed.projectCost) || 0,
        developer: trimmed.developer,
        city: trimmed.city,
        startDate: trimmed.startDate,
        endDate: trimmed.endDate,
        projectSize: trimmed.projectSize,
        siteEngineer: trimmed.siteEngineer,
        designer: trimmed.designer,
        createdAt: Date.now(),
      };

      await upsertProject(payload);
      setDraft(initialDraft);
      onClose();
    } catch (err) {
      console.error("[ProjectCreateModal] Failed to save project", err);
      setError(err instanceof Error ? err.message : "Failed to save project");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-3xl rounded-xl border border-[#3a3a3a] bg-[#1f1f1f] p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#e5e5e5]">Create Project</h2>
          <button
            onClick={onClose}
            className="text-[#9ca3af] hover:text-[#e5e5e5] text-sm"
          >
            ✕
          </button>
        </div>

        {error && <div className="text-[#f87171] text-sm mb-3">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Project Name">
              <Input
                value={draft.name}
                onChange={handleChange("name")}
                placeholder="Enter project name"
                className="input-dark"
                required
              />
            </FormField>

            <FormField label="Team">
              <select
                value={draft.team}
                onChange={handleChange("team")}
                className="bg-[#1f1f1f] border border-[#3a3a3a] rounded-md px-3 py-2 text-sm text-[#e5e5e5] focus:outline-none focus:ring-1 focus:ring-[#4f4f4f]"
              >
                <option value="">Select team</option>
                <option value="Team 1">Team 1</option>
                <option value="Team 2">Team 2</option>
              </select>
            </FormField>

            <FormField label="Developer">
              <Input
                value={draft.developer}
                onChange={handleChange("developer")}
                placeholder="Developer name"
                className="input-dark"
              />
            </FormField>

            <FormField label="City">
              <Input
                value={draft.city}
                onChange={handleChange("city")}
                placeholder="City"
                className="input-dark"
              />
            </FormField>

            <FormField label="Start Date">
              <Input
                type="date"
                value={draft.startDate}
                onChange={handleChange("startDate")}
                className="input-dark"
              />
            </FormField>

            <FormField label="End Date">
              <Input
                type="date"
                value={draft.endDate}
                onChange={handleChange("endDate")}
                className="input-dark"
              />
            </FormField>

            <FormField label="Project Size">
              <Input
                value={draft.projectSize}
                onChange={handleChange("projectSize")}
                placeholder="e.g. 150 sqm"
                className="input-dark"
              />
            </FormField>

            <FormField label="Site Engineer">
              <Input
                value={draft.siteEngineer}
                onChange={handleChange("siteEngineer")}
                placeholder="Site engineer"
                className="input-dark"
              />
            </FormField>

            <FormField label="Designer">
              <Input
                value={draft.designer}
                onChange={handleChange("designer")}
                placeholder="Designer"
                className="input-dark"
              />
            </FormField>

            <FormField label="Project Cost">
              <Input
                type="number"
                value={draft.projectCost}
                onChange={handleChange("projectCost")}
                placeholder="₱"
                className="text-right input-dark"
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
              {saving ? "Saving…" : "Create Project"}
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
      <label className="text-xs text-[#9ca3af] mb-1">{label}</label>
      {children}
    </div>
  );
}

"use client";

import { type ChangeEvent, type FormEvent, useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
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
};

function generateProjectId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  // Fallback UUID v4 generator
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
    }),
    [draft]
  );

  const canSave = useMemo(() => {
    if (!trimmed.name || !trimmed.team || !trimmed.developer || !trimmed.city || !trimmed.projectSize) {
      return false;
    }

    if (!trimmed.startDate || !trimmed.endDate) {
      return false;
    }

    const cost = Number(trimmed.projectCost);
    return Number.isFinite(cost) && cost >= 0;
  }, [trimmed]);

  const handleChange = (field: keyof DraftProject) => (event: ChangeEvent<HTMLInputElement>) => {
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
        team: trimmed.team,
        projectCost: Number(trimmed.projectCost) || 0,
        developer: trimmed.developer,
        city: trimmed.city,
        startDate: trimmed.startDate,
        endDate: trimmed.endDate,
        projectSize: trimmed.projectSize,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <Card className="w-full max-w-lg space-y-6">
        <div className="space-y-1 text-center">
          <h2 className="text-lg font-semibold text-slate-900">Create project</h2>
          <p className="text-sm text-slate-500">Fill in the details below to add a new project to your workspace.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="font-medium text-slate-700">Project name</span>
              <Input value={draft.name} onChange={handleChange("name")} placeholder="Project Alpha" required />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium text-slate-700">Team</span>
              <Input value={draft.team} onChange={handleChange("team")} placeholder="Operations" required />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium text-slate-700">Developer</span>
              <Input value={draft.developer} onChange={handleChange("developer")} placeholder="Jane Doe" required />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium text-slate-700">City</span>
              <Input value={draft.city} onChange={handleChange("city")} placeholder="New York" required />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium text-slate-700">Start date</span>
              <Input type="date" value={draft.startDate} onChange={handleChange("startDate")} required />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium text-slate-700">End date</span>
              <Input type="date" value={draft.endDate} onChange={handleChange("endDate")} required />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium text-slate-700">Project size</span>
              <Input value={draft.projectSize} onChange={handleChange("projectSize")} placeholder="1200 sq ft" required />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium text-slate-700">Project cost</span>
              <Input type="number" min="0" step="0.01" value={draft.projectCost} onChange={handleChange("projectCost")} placeholder="100000" required />
            </label>
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            >
              Cancel
            </button>
            <Button
              type="submit"
              disabled={!canSave || saving}
              className="bg-slate-900 text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving…" : "Create project"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

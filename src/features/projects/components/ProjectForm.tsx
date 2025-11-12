"use client";
import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { uuid } from "@/utils/id";
import { ProjectSchema, type Project } from "@/domain/models";
import { upsertProject } from "@/data/projects.repo";
import { getFirstZodError } from "@/utils/zodHelpers";

export default function ProjectForm({ onSaved }: { onSaved?: () => void }) {
  const [values, setValues] = useState<Partial<Project>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const parsed = ProjectSchema.parse({
        id: uuid(),
        name: values.name || "",
        team: values.team || "Team 1",
        projectCost: Number(values.projectCost) || 0,
        developer: values.developer || "",
        city: values.city || "",
        startDate: values.startDate || "",
        endDate: values.endDate || "",
        projectSize: values.projectSize || "",
        siteEngineer: values.siteEngineer || "",
        designer: values.designer || "",
        createdAt: Date.now(),
      });
      await upsertProject(parsed);
      setValues({});
      onSaved?.();
    } catch (err) {
      const first = getFirstZodError(err);
      setError(first ?? "Please fill all required fields.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 bg-[#1f1f1f] p-4 rounded-xl border border-[#3a3a3a]">
      {error && <div className="text-sm text-red-500">{error}</div>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormField label="Project Name">
          <Input name="name" placeholder="Enter project name" value={values.name ?? ""} onChange={handleChange} />
        </FormField>

        <FormField label="Team">
          <select
            name="team"
            value={values.team ?? ""}
            onChange={handleChange}
            className="bg-[#1f1f1f] border border-[#3a3a3a] rounded-md px-3 py-2 text-sm text-[#e5e5e5] focus:outline-none focus:ring-1 focus:ring-[#4f4f4f]"
          >
            <option value="">Select team</option>
            <option value="Team 1">Team 1</option>
            <option value="Team 2">Team 2</option>
          </select>
        </FormField>

        <FormField label="Project Cost">
          <Input name="projectCost" placeholder="₱" value={values.projectCost ?? ""} onChange={handleChange} />
        </FormField>

        <FormField label="Developer">
          <Input name="developer" placeholder="Developer name" value={values.developer ?? ""} onChange={handleChange} />
        </FormField>

        <FormField label="City">
          <Input name="city" placeholder="City" value={values.city ?? ""} onChange={handleChange} />
        </FormField>

        <FormField label="Start Date">
          <Input type="date" name="startDate" value={values.startDate ?? ""} onChange={handleChange} />
        </FormField>

        <FormField label="End Date">
          <Input type="date" name="endDate" value={values.endDate ?? ""} onChange={handleChange} />
        </FormField>

        <FormField label="Project Size">
          <Input name="projectSize" placeholder="e.g. 150 sqm" value={values.projectSize ?? ""} onChange={handleChange} />
        </FormField>

        <FormField label="Site Engineer">
          <Input name="siteEngineer" placeholder="Site engineer" value={values.siteEngineer ?? ""} onChange={handleChange} />
        </FormField>

        <FormField label="Designer">
          <Input name="designer" placeholder="Designer" value={values.designer ?? ""} onChange={handleChange} />
        </FormField>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving} className="mt-2">
          {saving ? "Saving..." : "Add Project"}
        </Button>
      </div>
    </form>
  );
}

/* Helper */
function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <label className="text-xs text-[#9ca3af] mb-1">{label}</label>
      {children}
    </div>
  );
}

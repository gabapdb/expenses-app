"use client";
import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { uuid } from "@/utils/id";
import { ProjectSchema, type Project } from "@/domain/models";
import { upsertProject } from "@/data/projects.repo";
import { z } from "zod";
import { getFirstZodError } from "@/utils/zodHelpers";

export default function ProjectForm({ onSaved }: { onSaved?: () => void }) {
  const [values, setValues] = useState<Partial<Project>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const parsed = ProjectSchema.parse({
        id: uuid(),
        name: values.name || "",
        team: values.team || "",
        projectCost: Number(values.projectCost) || 0,
        developer: values.developer || "",
        city: values.city || "",
        startDate: values.startDate || "",
        endDate: values.endDate || "",
        projectSize: values.projectSize || "",
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
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <Input name="name" placeholder="Project Name" value={values.name ?? ""} onChange={handleChange} />
      <Input name="team" placeholder="Team" value={values.team ?? ""} onChange={handleChange} />
      <Input name="projectCost" placeholder="Project Cost" value={values.projectCost ?? ""} onChange={handleChange} />
      <Input name="developer" placeholder="Developer" value={values.developer ?? ""} onChange={handleChange} />
      <Input name="city" placeholder="City" value={values.city ?? ""} onChange={handleChange} />
      <Input name="startDate" placeholder="Start Date (YYYY-MM-DD)" value={values.startDate ?? ""} onChange={handleChange} />
      <Input name="endDate" placeholder="End Date (YYYY-MM-DD)" value={values.endDate ?? ""} onChange={handleChange} />
      <Input name="projectSize" placeholder="Project Size" value={values.projectSize ?? ""} onChange={handleChange} />
      <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Add Project"}</Button>
    </form>
  );
}

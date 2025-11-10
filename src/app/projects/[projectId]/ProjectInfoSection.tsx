"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import type { Project } from "@/hooks/useProjects";
import ProjectEditModal from "@/components/ProjectEditModal";
import { useProjectExpenseBreakdown } from "@/hooks/useProjectExpenseBreakdown";
import { peso } from "@/utils/expenses";

interface ProjectInfoSectionProps {
  project: Project;
}

export default function ProjectInfoSection({ project }: ProjectInfoSectionProps) {
  const [editing, setEditing] = useState(false);
  const { totalAmount, loading, error } = useProjectExpenseBreakdown(project.id);

  const runningBalance = totalAmount ?? 0;
  const projectCost = project.projectCost ?? 0;
  const profit = projectCost - runningBalance;
  const profitRatio = projectCost > 0 ? (profit / projectCost) * 100 : 0;

  const profitColor =
    projectCost === 0
      ? "text-gray-300"
      : profitRatio >= 40
      ? "text-green-400"
      : "text-red-400";

  const formattedSize =
    project.projectSize && project.projectSize.trim() !== ""
      ? `${project.projectSize} m²`
      : "—";

  return (
    <>
      <div
        className="cursor-pointer transition-all duration-200 hover:scale-[1.01] hover:shadow-md"
        onClick={() => setEditing(true)}
      >
        <Card className="rounded-xl border border-[#3a3a3a] bg-[#1f1f1f] p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#2a2a2a] text-sm text-[#d1d5db]">
            {/* Column 1 */}
            <div className="flex flex-col gap-4 px-4">
              <Field label="Project Name" value={project.name} />
              <Field label="Developer" value={project.developer ?? "—"} />
              <Field label="City" value={project.city ?? "—"} />
            </div>

            {/* Column 2 */}
            <div className="flex flex-col gap-4 px-4">
              <Field label="Project Cost" value={peso(projectCost)} />
              <Field
                label="Running Balance"
                value={
                  loading
                    ? "Loading…"
                    : error
                    ? "Error"
                    : peso(runningBalance)
                }
              />
              <Field
                label="Profit"
                value={loading ? "—" : peso(profit)}
                valueClass={profitColor}
                tooltip={
                  projectCost > 0
                    ? `Profit margin: ${profitRatio.toFixed(1)}%`
                    : undefined
                }
              />
            </div>

            {/* Column 3 */}
            <div className="flex flex-col gap-4 px-4">
              <Field label="Team" value={project.team ?? "—"} />
              <Field label="Site Engineer" value={project.siteEngineer ?? "—"} />
              <Field label="Designer" value={project.designer ?? "—"} />
            </div>

            {/* Column 4 */}
            <div className="flex flex-col gap-4 px-4">
              <Field label="Size" value={formattedSize} />
              <Field label="Start Date" value={formatDate(project.startDate)} />
              <Field label="End Date" value={formatDate(project.endDate)} />
            </div>
          </div>
        </Card>
      </div>

      {editing && (
        <ProjectEditModal
          project={{
            ...project,
            team: project.team ?? "",
            developer: project.developer ?? "",
            city: project.city ?? "",
            projectSize: project.projectSize ?? "",
            siteEngineer: project.siteEngineer ?? "",
            designer: project.designer ?? "",
            startDate: project.startDate ?? "",
            endDate: project.endDate ?? "",
            createdAt: project.createdAt ?? 0,
          }}
          onClose={() => setEditing(false)}
          onSaved={() => setEditing(false)}
        />
      )}
    </>
  );
}

/* --------------------------------- Helpers -------------------------------- */
function Field({
  label,
  value,
  valueClass = "text-[#e5e5e5]",
  tooltip,
}: {
  label: string;
  value: string;
  valueClass?: string;
  tooltip?: string;
}) {
  return (
    <div className="relative group">
      <div className="text-xs text-[#9ca3af] mb-1">{label}</div>
      <div
        className={`font-semibold tracking-tight ${valueClass}`}
      >
        {value}
      </div>

      {tooltip && (
        <div
          className="
            absolute
            bottom-full left-0 mb-1
            hidden
            group-hover:block
            text-[11px]
            text-gray-200
            bg-[#2a2a2a]
            border border-[#3a3a3a]
            rounded-md
            px-2 py-1
            whitespace-nowrap
            z-10
            shadow-lg
          "
        >
          {tooltip}
        </div>
      )}
    </div>
  );
}

function formatDate(date?: string): string {
  if (!date) return "—";
  const parsed = new Date(date);
  return !isNaN(parsed.getTime())
    ? parsed.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short", // ✅ allowed — the error was due to 'year: "short"' earlier
        day: "numeric",
      } as Intl.DateTimeFormatOptions)
    : "—";
}


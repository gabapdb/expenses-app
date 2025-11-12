"use client";

import Link from "next/link";
import { CalendarDays } from "lucide-react";
import Card from "@/components/ui/Card";
import { peso } from "@/utils/format";
import type { Project } from "@/domain/models";

/* -------------------------------------------------------------------------- */
/* 📦 Props                                                                   */
/* -------------------------------------------------------------------------- */
interface ProjectCardProps {
  project: Project;
  onEdit: () => void;
}

/* -------------------------------------------------------------------------- */
/* 🧩 Component                                                               */
/* -------------------------------------------------------------------------- */
export default function ProjectCard({ project, onEdit }: ProjectCardProps) {
  const timeline = buildTimeline(project.startDate, project.endDate);
  const projectCost =
    typeof project.projectCost === "number" ? peso(project.projectCost) : "—";

  return (
    <Link href={`/projects/${project.id}`} className="block h-full group">
      <Card className="relative flex flex-col justify-between h-full rounded-2xl border border-[#3a3a3a] bg-[#1f1f1f] p-5 shadow-sm transition-all duration-200 hover:-translate-y-[3px] hover:border-[#4b4b4b] hover:bg-[#252525] hover:shadow-md">
        {/* ✏️ Edit Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onEdit();
          }}
          className="absolute top-4 right-4 text-[#d1d5db] hover:text-white bg-[#2b2b2b] hover:bg-[#3a3a3a] rounded-md px-3 py-[2px] text-xs border border-[#3a3a3a] transition-colors"
        >
          Edit
        </button>

        {/* 🏗️ Project Name */}
        <h2 className="text-lg font-semibold text-[#e5e5e5] group-hover:text-white leading-tight mb-3">
          {project.name || "Untitled Project"}
        </h2>

        {/* 📅 Timeline */}
        {timeline && (
          <p className="flex items-center gap-2 text-xs tracking-wide uppercase text-[#a8a8a8] mb-4">
            <CalendarDays size={12} />
            {timeline}
          </p>
        )}

        {/* 💰 Footer (Cost) */}
        <div className="mt-auto flex flex-col items-center justify-center rounded-xl border border-[#3a3a3a] bg-[#262626]/40 px-4 py-3 text-sm text-center">
          <p className="text-xs uppercase tracking-wide text-[#9ca3af]">
            Project Cost
          </p>
          <p className="text-base font-semibold text-[#f3f4f6] mt-1">
            {projectCost}
          </p>
        </div>
      </Card>
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/* 🧮 Helpers                                                                 */
/* -------------------------------------------------------------------------- */
function buildTimeline(start?: string, end?: string) {
  const formattedStart = formatDate(start);
  const formattedEnd = formatDate(end);
  if (!formattedStart && !formattedEnd) return null;
  if (formattedStart && formattedEnd) return `${formattedStart} – ${formattedEnd}`;
  return formattedStart ?? formattedEnd;
}

function formatDate(input?: string) {
  if (!input) return null;
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

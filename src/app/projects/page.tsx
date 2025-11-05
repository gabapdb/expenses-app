"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CalendarDays, MapPin, Users } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import Card from "@/components/ui/Card";
import { useProjects, type Project } from "@/hooks/useProjects";
import { peso } from "@/utils/format";
import "@/styles/dashboard.css";

export default function ProjectsPage() {
  const { data: projects, loading, error } = useProjects();
  const hasProjects = projects.length > 0;

  return (
    <main className="dashboard-container">
      <SectionHeader title="Projects" subtitle="Manage and view all active projects" />

      {loading ? (
        <ProjectsSkeleton />
      ) : error ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-red-300">
          {error}
        </div>
      ) : !hasProjects ? (
        <EmptyProjectsState />
      ) : (
        <motion.div
          className="projects-grid"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </motion.div>
      )}
    </main>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const timeline = buildTimeline(project.startDate, project.endDate);
  const projectCost =
    typeof project.projectCost === "number" ? peso(project.projectCost) : "—";

  return (
    <Link
      href={`/projects/${project.id}`}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#16161a]"
    >
      <Card className="flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-[#1a1b23]/80 p-6 transition-all duration-200 group-hover:-translate-y-1 group-hover:border-indigo-300/40">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-200/80">
              <Users size={12} />
              {project.team || "Unassigned"}
            </span>
            {project.city && (
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-gray-300">
                <MapPin size={12} />
                {project.city}
              </span>
            )}
          </div>
          <h2 className="text-lg font-semibold text-white transition-colors group-hover:text-indigo-50">
            {project.name}
          </h2>
          {project.developer && (
            <p className="text-sm text-gray-400">Developer: {project.developer}</p>
          )}
          {timeline && (
            <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-gray-500">
              <CalendarDays size={12} />
              {timeline}
            </p>
          )}
          {project.projectSize && (
            <p className="text-xs text-gray-500">Project Size: {project.projectSize}</p>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between rounded-xl border border-white/5 bg-black/10 px-4 py-3 text-sm">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">Project Cost</p>
            <p className="text-base font-semibold text-white">{projectCost}</p>
          </div>
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-200 transition-transform group-hover:translate-x-1">
            View details
            <ArrowRight size={14} />
          </span>
        </div>
      </Card>
    </Link>
  );
}

function ProjectsSkeleton() {
  return (
    <div className="projects-grid">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card
          key={`project-skeleton-${index}`}
          className="h-full animate-pulse rounded-2xl border border-white/10 bg-[#1a1b23]/60"
        >
          <div className="h-6 w-2/3 rounded bg-white/10" />
          <div className="mt-4 space-y-3">
            <div className="h-5 w-full rounded bg-white/10" />
            <div className="h-5 w-5/6 rounded bg-white/10" />
            <div className="h-5 w-4/5 rounded bg-white/10" />
          </div>
          <div className="mt-8 h-12 rounded-xl bg-white/5" />
        </Card>
      ))}
    </div>
  );
}

function EmptyProjectsState() {
  return (
    <Card className="flex flex-col items-start gap-4 rounded-2xl border border-dashed border-white/20 bg-[#1a1b23]/70 p-8 text-sm text-gray-300">
      <p>No projects have been created yet.</p>
      <p className="text-xs text-gray-400">
        Use the “New project” action to add your first record and start tracking
        expenses in real time.
      </p>
    </Card>
  );
}

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

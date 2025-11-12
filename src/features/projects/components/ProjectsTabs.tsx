"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { TEAM_OPTIONS } from "@/config/teams";
import type { NormalizedProject } from "@/domain/types/NormalizedProject";
import ProjectCard from "./ProjectCard";

/* -------------------------------------------------------------------------- */
/* 🧩 Props                                                                    */
/* -------------------------------------------------------------------------- */
interface ProjectsTabsProps {
  projects: NormalizedProject[];
  onEdit: (p: NormalizedProject) => void;
}

/* -------------------------------------------------------------------------- */
/* 🧱 Main Component                                                           */
/* -------------------------------------------------------------------------- */
export default function ProjectsTabs({ projects, onEdit }: ProjectsTabsProps) {
  const [activeTab, setActiveTab] = useState<"pending" | "ongoing" | "completed">("ongoing");

  const pending = projects.filter((p) => !p.startDate);
  const ongoing = projects
    .filter((p) => p.startDate && !p.endDate)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  const completed = projects
    .filter((p) => p.endDate)
    .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());

  return (
    <div className="w-full">
      {/* Tabs Header */}
      <div className="flex gap-4 border-b border-[#3a3a3a] bg-[#1f1f1f] mb-8">
        {[
          { key: "pending", label: "Pending" },
          { key: "ongoing", label: "Ongoing" },
          { key: "completed", label: "Completed" },
        ].map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key as "pending" | "ongoing" | "completed")}
            className={`px-4 py-2 text-sm font-medium rounded-t-md transition-all ${
              activeTab === key
                ? "bg-[#242424] text-[#e5e5e5] border border-[#3a3a3a] border-b-0 shadow-inner"
                : "text-[#9ca3af] hover:text-[#e5e5e5] hover:bg-[#2a2a2a] border border-transparent"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "pending" && (
        <TeamSections title="Pending" projects={pending} onEdit={onEdit} />
      )}

      {activeTab === "ongoing" && (
        <TeamSections title="Ongoing" projects={ongoing} onEdit={onEdit} />
      )}

      {activeTab === "completed" && (
        <TeamSections title="Completed" projects={completed} onEdit={onEdit} />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 🧱 Team Sections (Team 1 / Team 2)                                          */
/* -------------------------------------------------------------------------- */
function TeamSections({
  title,
  projects,
  onEdit,
}: {
  title: string;
  projects: NormalizedProject[];
  onEdit: (p: NormalizedProject) => void;
}) {
  return (
    <div className="space-y-10">
      {TEAM_OPTIONS.map((team) => {
        const teamProjects = projects.filter((p) => p.team === team);
        if (teamProjects.length === 0) return null;

        return (
          <section key={team}>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-[#a1a1a1] mb-4">
              {team}
            </h3>
            <motion.div
              className="projects-grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {teamProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onEdit={() => onEdit(project)}
                />
              ))}
            </motion.div>
          </section>
        );
      })}
    </div>
  );
}

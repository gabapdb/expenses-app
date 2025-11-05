"use client";

import { clsx } from "clsx";
import { motion } from "framer-motion";
import SectionHeader from "@/components/ui/SectionHeader";
import Card from "@/components/ui/Card";
import "@/styles/dashboard.css";

const demoProjects = [
  {
    id: "p-001",
    name: "School grounds renovation",
    owner: "Facilities Team",
    budget: "₱180,000",
    status: "On track",
    statusVariant: "emerald",
  },
  {
    id: "p-002",
    name: "IT hardware refresh",
    owner: "Information Services",
    budget: "₱240,000",
    status: "Pending receipts",
    statusVariant: "amber",
  },
  {
    id: "p-003",
    name: "Community outreach program",
    owner: "Partnerships",
    budget: "₱95,000",
    status: "Awaiting liquidation",
    statusVariant: "sky",
  },
];

const statusVariantClasses: Record<string, string> = {
  emerald: "bg-emerald-500/10 text-emerald-300",
  amber: "bg-amber-500/10 text-amber-200",
  sky: "bg-sky-500/10 text-sky-200",
};

export default function ProjectsPage() {
  return (
    <main className="dashboard-container">
      <SectionHeader title="Projects" subtitle="Manage and view all active projects" />

      <motion.div
        className="projects-grid"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {demoProjects.map((project) => (
          <Card
            key={project.id}
            className="flex h-full flex-col justify-between rounded-2xl border border-[#2d2d2d] bg-[#262626] p-5 shadow-lg"
          >
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{project.id}</p>
              <h2 className="text-lg font-semibold text-white">{project.name}</h2>
              <p className="text-sm text-gray-400">Lead: {project.owner}</p>
            </div>

            <div className="mt-6 flex items-center justify-between rounded-xl border border-white/5 bg-black/10 px-4 py-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">Budget</p>
                <p className="text-base font-semibold text-white">{project.budget}</p>
              </div>
              <span
                className={clsx(
                  "rounded-full px-3 py-1 text-xs font-semibold",
                  statusVariantClasses[project.statusVariant] ?? statusVariantClasses.emerald,
                )}
              >
                {project.status}
              </span>
            </div>
          </Card>
        ))}
      </motion.div>
    </main>
  );
}

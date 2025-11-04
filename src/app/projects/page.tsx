"use client";

import { motion } from "framer-motion";
import SectionHeader from "@/components/ui/SectionHeader";
import "@/styles/dashboard.css";

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
        {/* Empty grid — ready for dynamic project cards */}
      </motion.div>
    </main>
  );
}

"use client";

import { motion } from "framer-motion";
import SectionHeader from "@/components/ui/SectionHeader";
import "@/styles/dashboard.css";

export default function SummaryPage() {
  return (
    <main className="dashboard-container">
      <SectionHeader title="Summary" subtitle="View aggregated financial performance" />

      <motion.div
        className="summary-layout"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="summary-top">
          <div className="summary-card"></div>
          <div className="summary-card"></div>
        </div>

        <div className="summary-bottom">
          <div className="summary-panel"></div>
          <div className="summary-panel"></div>
        </div>
      </motion.div>
    </main>
  );
}

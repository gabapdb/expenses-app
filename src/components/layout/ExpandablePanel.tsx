"use client";

import { motion } from "framer-motion";
import "@/styles/expandable.css";

export default function ExpandablePanel({ expanded }: { expanded: boolean }) {
  return (
    <motion.aside
      className="drawer"
      initial={false}
      animate={{ width: expanded ? 280 : 0, opacity: expanded ? 1 : 0 }}
      transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
      style={{ pointerEvents: expanded ? "auto" : "none" }}
      data-expanded={expanded ? "true" : "false"}
    >
      <div className="drawer-glass" aria-hidden />
      <div className="drawer-inner">
        {/* Future filters or shortcuts can go here */}
      </div>
    </motion.aside>
  );
}

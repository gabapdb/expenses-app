"use client";

import { motion } from "framer-motion";
import "@/styles/expandable.css";

export default function ExpandablePanel({ expanded }: { expanded: boolean }) {
  return (
    <motion.aside
      className="drawer"
      initial={false}
      animate={{ width: expanded ? 260 : 0, opacity: expanded ? 1 : 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      style={{ pointerEvents: expanded ? "auto" : "none" }}
    >
      <div className="drawer-inner">
        {/* Future filters or shortcuts can go here */}
      </div>
    </motion.aside>
  );
}

"use client";

import { motion } from "framer-motion";
import "@/styles/expandable.css";

export default function ExpandablePanel({ expanded }: { expanded: boolean }) {
  return (
    <motion.aside
      className="drawer"
      animate={{ width: expanded ? 260 : 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="drawer-inner">
        {/* Future filters or shortcuts can go here */}
      </div>
    </motion.aside>
  );
}

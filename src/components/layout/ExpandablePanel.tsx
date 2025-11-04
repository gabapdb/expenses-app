"use client";

import { AnimatePresence, motion } from "framer-motion";
import "@/styles/expandable.css";

interface ExpandablePanelProps {
  expanded: boolean;
  onEnter: () => void;
  onLeave: () => void;
}

export default function ExpandablePanel({ expanded, onEnter, onLeave }: ExpandablePanelProps) {
  return (
    <AnimatePresence initial={false}>
      {expanded && (
        <motion.aside
          className="drawer"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 288, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.26, ease: [0.25, 0.1, 0.25, 1] }}
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
        >
          <div className="drawer-surface" aria-hidden />
          <div className="drawer-inner">
            {/* Future filters or shortcuts can go here */}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

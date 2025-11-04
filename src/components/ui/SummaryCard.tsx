"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface SummaryCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  color?: "blue" | "violet" | "amber" | "emerald";
}

export default function SummaryCard({
  title,
  value,
  icon,
  color = "blue",
}: SummaryCardProps) {
  const colorMap: Record<string, string> = {
    blue: "text-blue-400",
    violet: "text-violet-400",
    amber: "text-amber-400",
    emerald: "text-emerald-400",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.04, boxShadow: "0 0 15px rgba(59,130,246,0.35)" }}
      transition={{ type: "spring", stiffness: 250, damping: 20 }}
      className="summary-card"
    >
      <div className={`summary-icon ${colorMap[color]}`}>{icon}</div>
      <div className="summary-text">
        <h3 className="summary-title">{title}</h3>
        <p className="summary-value">{value}</p>
      </div>
    </motion.div>
  );
}

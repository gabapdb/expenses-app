"use client";

import type { RequirementStatus } from "@/config/requirements";

interface StatusBadgeProps {
  status: RequirementStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const base = "px-2 py-0.5 rounded-full text-xs font-semibold uppercase";

  const colorMap: Record<RequirementStatus, string> = {
    COMPLETED: "bg-[#333] text-white",
    "DELIVERED/IN PROGRESS": "bg-blue-200 text-blue-700",
    "SUBMITTED/DONE OCULAR": "bg-red-200 text-red-700",
    PAID: "bg-green-200 text-green-800",
  };

  return <span className={`${base} ${colorMap[status]}`}>{status}</span>;
}

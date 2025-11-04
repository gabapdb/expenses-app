"use client";

import { useState, useCallback } from "react";
import Sidebar from "@/components/layout/Sidebar";
import ExpandablePanel from "@/components/layout/ExpandablePanel";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(false);

  const handleEnter = useCallback(() => setExpanded(true), []);
  const handleLeave = useCallback(() => setExpanded(false), []);

  return (
    <div
      className="flex h-screen w-full overflow-hidden bg-[#121212] text-gray-100 transition-colors"
      onMouseLeave={handleLeave}
    >
      {/* Sidebar */}
      <Sidebar expanded={expanded} onEnter={handleEnter} onLeave={handleLeave} />

      {/* Expandable Panel */}
      <div
        className={`flex-shrink-0 transition-all duration-300 ease-in-out ${
          expanded ? "w-72 opacity-100" : "w-0 opacity-0"
        }`}
      >
        <ExpandablePanel expanded={expanded} />
      </div>

      {/* Main Content */}
      <main
        className={`flex-1 overflow-y-auto bg-[#1E1E1E] rounded-l-3xl transition-all duration-300`}
      >
        <div className="min-h-screen p-8">{children}</div>
      </main>
    </div>
  );
}

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
      className="relative flex h-screen w-full overflow-hidden bg-[#0f0f12] text-gray-100 transition-colors"
      onMouseLeave={handleLeave}
    >
      {/* Sidebar */}
      <div className="relative z-30 flex-shrink-0" style={{ width: 72 }}>
        <Sidebar expanded={expanded} onEnter={handleEnter} onLeave={handleLeave} />
      </div>

      {/* Expandable Panel */}
      <ExpandablePanel expanded={expanded} onEnter={handleEnter} onLeave={handleLeave} />

      {/* Main Content */}
      <main className="relative flex-1 overflow-y-auto">
        <div className="min-h-screen rounded-l-[36px] border border-white/5 bg-[#16161a]/95 p-8 shadow-[0_24px_60px_rgba(10,10,20,0.65)] backdrop-blur-lg transition-all duration-300">
          {children}
        </div>
      </main>
    </div>
  );
}

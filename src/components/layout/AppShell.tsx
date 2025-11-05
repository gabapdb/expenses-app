"use client";

import { useCallback, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";

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

      {/* Main Content */}
      <main
        className={`flex-1 overflow-y-auto bg-[#1E1E1E] rounded-l-3xl transition-all duration-300 ${
          expanded ? "ml-[300px]" : "ml-[72px]"
        }`}
      >
        <div className="min-h-screen p-8">{children}</div>
      </main>
    </div>
  );
}

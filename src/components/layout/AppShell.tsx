"use client";

import { useCallback, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(false);

  const handleEnter = useCallback(() => setExpanded(true), []);
  const handleLeave = useCallback(() => setExpanded(false), []);

  return (
    <div
      className="relative h-screen w-full overflow-hidden bg-[#0f0f12] text-gray-100 transition-colors"
      onMouseLeave={handleLeave}
    >
      <Sidebar expanded={expanded} onEnter={handleEnter} onLeave={handleLeave} />

      <main className="relative h-full overflow-y-auto pl-[72px]">
        <div className="min-h-screen rounded-l-[36px] border border-white/5 bg-[#16161a]/95 p-8 shadow-[0_24px_60px_rgba(10,10,20,0.65)] backdrop-blur-lg transition-all duration-300">
          {children}
        </div>
      </main>
    </div>
  );
}

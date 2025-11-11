"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";


export default function AppShell({ children }: { children: React.ReactNode }) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  return (
    <div className="relative h-screen overflow-hidden">
      <Sidebar
        expanded={isSidebarExpanded}
        onEnter={() => setIsSidebarExpanded(true)}
        onLeave={() => setIsSidebarExpanded(false)}
      />

      {/* ✅ Remove any ml-* margin — sidebar now overlays */}
      <main className="relative h-full pl-16 overflow-y-auto transition-all duration-300">
        {children}
      </main>
    </div>
  );
}

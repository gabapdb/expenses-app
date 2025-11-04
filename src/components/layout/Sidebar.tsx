"use client";
import { useState } from "react";
import { Home, Folder, CreditCard, BarChart3, Settings } from "lucide-react";
import Link from "next/link";

const links = [
  { name: "Dashboard", icon: Home, href: "/dashboard" },
  { name: "Projects", icon: Folder, href: "/projects" },
  { name: "Expenses", icon: CreditCard, href: "/expenses" },
  { name: "Reports", icon: BarChart3, href: "/reports" },
  { name: "Settings", icon: Settings, href: "/settings" },
];

export default function Sidebar() {
  const [expanded, setExpanded] = useState(false);

  return (
    <aside
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className={`fixed top-0 left-0 h-screen bg-surface border-r border-border transition-all duration-200 
        ${expanded ? "w-56" : "w-16"} flex flex-col justify-between`}
    >
      <nav className="flex flex-col gap-2 mt-4">
        {links.map(({ name, icon: Icon, href }) => (
          <Link
            key={name}
            href={href}
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-neutral-800 transition"
          >
            <Icon size={20} className="text-text-secondary" />
            <span
              className={`text-sm font-medium text-text-secondary transition-opacity duration-200 ${
                expanded ? "opacity-100" : "opacity-0"
              }`}
            >
              {name}
            </span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-neutral-700" />
          {expanded && <span className="text-sm text-text-secondary">you@example.com</span>}
        </div>
      </div>
    </aside>
  );
}

"use client";

import clsx from "clsx";
import Image from "next/image";
import {
  Home,
  Folder,
  DollarSign,
  BarChart2,
  Settings,
} from "lucide-react";
import "@/styles/sidebar.css";
import Link from "next/link";

interface SidebarProps {
  expanded: boolean;
  onEnter: () => void;
  onLeave: () => void;
}

export default function Sidebar({ expanded, onEnter, onLeave }: SidebarProps) {
  const navItems = [
    { icon: <Home size={20} />, label: "Dashboard", href: "/dashboard" },
    { icon: <Folder size={20} />, label: "Projects", href: "/projects" },
    { icon: <DollarSign size={20} />, label: "Expenses", href: "/expenses" },
    { icon: <BarChart2 size={20} />, label: "Summary", href: "/summary" },
    { icon: <Settings size={20} />, label: "Settings", href: "/settings" },
  ];

  return (
    <>
      {/* ✅ FIXED UNDERLAY to prevent gray bleed-through */}
      <div
        className="fixed top-0 left-0 h-screen w-16 bg-gray-900"
        style={{ zIndex: 30 }}
      ></div>

      {/* Sidebar (same as before) */}
      <aside
        className={clsx(
          "sidebar",
          expanded ? "sidebar-expanded" : "sidebar-collapsed"
        )}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
      >
        <div className="flex flex-col items-start p-3">
          {/* Logo */}
          <div className="flex items-center gap-3 p-3 mb-4">
            <Link
              href="/"
              className="flex items-center gap-3 transition-transform duration-200 hover:scale-105"
            >
              <Image
                src="/logo.png"
                alt="Logo"
                width={24}
                height={24}
                className="rounded"
              />
              <span className="sidebar-label text-sm font-medium">
                APDB Project & Expenses
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-1 w-full">
            {navItems.map((item) => (
              <Link key={item.label} href={item.href} className="sidebar-item">
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-label">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="sidebar-footer">you@example.com</div>
      </aside>
    </>
  );
}

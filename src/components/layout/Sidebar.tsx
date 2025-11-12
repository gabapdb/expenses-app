"use client";

import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { Home, Folder, DollarSign, BarChart2, Settings, LogOut } from "lucide-react";
import { toYYYYMM } from "@/utils/time";
import "@/styles/sidebar.css";
import { useAuthUser } from "@/hooks/auth/useAuthUser";
import { logout } from "@/core/auth";
import { useEffect, useState } from "react";
import { db } from "@/core/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import type { Role } from "@/core/auth";

interface SidebarProps {
  expanded: boolean;
  onEnter: () => void;
  onLeave: () => void;
}

/* -------------------------------------------------------------------------- */
/* 🧭 Sidebar Navigation by Role                                              */
/* -------------------------------------------------------------------------- */
const NAV_ITEMS = [
  { icon: <Home size={20} />, label: "Dashboard", href: "/dashboard", roles: ["admin", "engineer", "junior"] },
  { icon: <Folder size={20} />, label: "Projects", href: "/projects", roles: ["admin", "engineer", "junior"] },
  { icon: <DollarSign size={20} />, label: "Expenses", href: `/expenses/${toYYYYMM()}`, roles: ["admin", "engineer"] },
  { icon: <BarChart2 size={20} />, label: "Summary", href: "/summary", roles: ["admin"] },
  { icon: <Settings size={20} />, label: "Settings", href: "/settings", roles: ["admin", "engineer"] },
  { icon: <BarChart2 size={20} />, label: "Admin Panel", href: "/admin", roles: ["admin"] },
];

export default function Sidebar({ expanded, onEnter, onLeave }: SidebarProps) {
  const { user } = useAuthUser();
  const [role, setRole] = useState<Role | null>(user?.role ?? null);

  /* ------------------------------------------------------------------------ */
  /* 🔄 Live Firestore Role Updates                                           */
  /* ------------------------------------------------------------------------ */
  useEffect(() => {
    if (!user) return;
    const ref = doc(db, "users", user.uid);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setRole(data.role as Role);
      }
    });
    return () => unsub();
  }, [user]);

  const visibleLinks = NAV_ITEMS.filter(
    (item) => !role || item.roles.includes(role)
  );

  return (
    <>
      {/* Fixed underlay (prevents gray bleed-through) */}
      <div className="fixed top-0 left-0 w-16 h-screen bg-gray-900" style={{ zIndex: 30 }}></div>

      <aside
        className={clsx(
          "sidebar",
          expanded ? "sidebar-expanded" : "sidebar-collapsed"
        )}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
      >
        {/* Header / Logo */}
        <div className="flex flex-col items-start p-3">
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
              <span className="text-sm font-medium sidebar-label">
                APDB Project & Expenses
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col w-full gap-1">
            {visibleLinks.map((item) => (
              <Link key={item.label} href={item.href} className="sidebar-item">
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-label">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Footer (User Info + Logout) */}
        <div className="sidebar-footer flex flex-col items-start gap-2 p-3 text-xs text-[#b3b3b3] border-t border-[#2e2e2e]">
          {user ? (
            <>
              <div className="truncate w-full text-[#d1d5db]">
                {user.displayName || user.email}
              </div>
              <div className="capitalize text-[#9ca3af]">Role: {role}</div>
              <button
                onClick={logout}
                className="flex items-center gap-2 mt-2 px-2 py-1 border border-[#3a3a3a] rounded-md text-[#d1d5db] hover:bg-[#2a2a2a] transition-colors"
              >
                <LogOut size={14} />
                Logout
              </button>
            </>
          ) : (
            <div className="text-[#9ca3af]">Not signed in</div>
          )}
        </div>
      </aside>
    </>
  );
}

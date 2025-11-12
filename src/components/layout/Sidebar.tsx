"use client";

import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import {
  Home,
  Folder,
  DollarSign,
  BarChart2,
  Settings,
  LogOut,
  ShieldUser,
  WalletCards,
  LogIn,
} from "lucide-react";
import { toYYYYMM } from "@/utils/time";
import "@/styles/sidebar.css";
import { logout, loginWithGoogle } from "@/core/auth";
import { useEffect, useMemo, useState } from "react";
import { db } from "@/core/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import type { Role } from "@/core/auth";
import { useAuth } from "@/context/AuthContext";

/* -------------------------------------------------------------------------- */
/* 📦 Props + Role Abbreviations                                              */
/* -------------------------------------------------------------------------- */
interface SidebarProps {
  expanded: boolean;
  onEnter: () => void;
  onLeave: () => void;
}

const ROLE_ABBR: Record<Role, string> = {
  admin: "ADM",
  engineer: "ENG",
  junior: "JR",
  viewer: "VW",
};

/* -------------------------------------------------------------------------- */
/* 🧭 Navigation                                                              */
/* -------------------------------------------------------------------------- */
const NAV_ITEMS = [
  { icon: <Home size={20} />, label: "Dashboard", href: "/dashboard", roles: ["admin", "engineer", "junior"] },
  { icon: <Folder size={20} />, label: "Projects", href: "/projects", roles: ["admin", "engineer", "junior"] },
  { icon: <WalletCards size={20} />, label: "Expenses", href: `/expenses/${toYYYYMM()}`, roles: ["admin", "engineer"] },
  { icon: <BarChart2 size={20} />, label: "Summary", href: "/summary", roles: ["admin"] },
  { icon: <Settings size={20} />, label: "Settings", href: "/settings", roles: ["admin", "engineer"] },
  { icon: <ShieldUser size={20} />, label: "Admin", href: "/admin", roles: ["admin"] },
];

/* -------------------------------------------------------------------------- */
/* 🧩 Component                                                               */
/* -------------------------------------------------------------------------- */
export default function Sidebar({ expanded, onEnter, onLeave }: SidebarProps) {
  const { user } = useAuth();
  const [role, setRole] = useState<Role | null>(user?.role ?? null);

  // 🔄 Realtime role updates
  useEffect(() => {
    if (!user) return;
    const ref = doc(db, "users", user.uid);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) setRole(snap.data().role as Role);
    });
    return () => unsub();
  }, [user]);

  const effectiveRole = useMemo(() => role ?? user?.role ?? null, [role, user]);
  const visibleLinks = useMemo(
    () =>
      user
        ? NAV_ITEMS.filter(
            (item) => effectiveRole && item.roles.includes(effectiveRole)
          )
        : [],
    [effectiveRole, user]
  );

  const getInitials = (nameOrEmail?: string | null) => {
    if (!nameOrEmail) return "U";
    const parts = nameOrEmail.split(" ");
    if (parts.length > 1) return parts[0][0] + parts[1][0];
    return nameOrEmail[0]?.toUpperCase() ?? "U";
  };

  /* ------------------------------------------------------------------------ */
  /* 🧱 Layout                                                                */
  /* ------------------------------------------------------------------------ */
  return (
    <>
      {/* Static Background (fixed color) */}
      <div className="fixed top-0 left-0 h-screen w-16 bg-[#1f1f1f] z-30" />

      <aside
        className={clsx(
          "fixed top-0 left-0 h-screen flex flex-col justify-between border-r border-[#3a3a3a] bg-[#1f1f1f] z-40 shadow-sm",
          "transition-[width] duration-300 ease-in-out overflow-hidden",
          expanded ? "w-64" : "w-[64px]"
        )}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
      >
        {/* Header */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex items-center gap-3 p-4 pb-6">
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
              <span
                className={clsx(
                  "text-sm font-medium whitespace-nowrap transition-opacity duration-200",
                  expanded ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
              >
                APDB Project & Expenses
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-1 px-2 overflow-y-auto">
            {visibleLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={clsx(
                  "flex items-center rounded-lg px-3 py-2 hover:bg-[#2a2a2a] transition-colors duration-150",
                  "w-full justify-start overflow-hidden"
                )}
              >
                <span className="flex-shrink-0 sidebar-icon">{item.icon}</span>
                <span
                  className={clsx(
                    "ml-3 truncate text-sm text-[#e5e5e5] transition-opacity duration-150",
                    expanded ? "opacity-100" : "opacity-0 pointer-events-none"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Footer */}
<div className="border-t border-[#3a3a3a] p-3 text-xs text-[#b3b3b3]">
  {user ? (
    <>
      <div className="flex items-center">
        {/* Avatar */}
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#2a2a2a] text-[#e5e5e5] font-semibold text-[11px] flex-shrink-0">
          {getInitials(user.displayName || user.email)}
        </div>

        {/* Name + Role (keeps space reserved even when hidden) */}
        <div
          className={clsx(
            "flex flex-col ml-2 w-[140px] transition-opacity duration-200",
            expanded ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <span className="text-[#d1d5db] truncate text-xs">
            {user.displayName || user.email}
          </span>
          <span className="text-[#9ca3af] uppercase text-[10px] font-medium">
            {effectiveRole ? ROLE_ABBR[effectiveRole] : "—"}
          </span>
        </div>
      </div>

      {/* Logout button */}
      <button
        onClick={logout}
        className={clsx(
          "mt-2 flex items-center gap-2 px-2 py-1 text-xs border border-[#3a3a3a] rounded-md text-[#d1d5db]",
          "hover:bg-[#2a2a2a] transition-colors w-full justify-center"
        )}
      >
        <LogOut size={12} />
        {expanded && <span>Logout</span>}
      </button>
    </>
  ) : (
    <button
      onClick={loginWithGoogle}
      className={clsx(
        "flex items-center gap-2 px-2 py-1 text-xs border border-[#3a3a3a] rounded-md text-[#d1d5db]",
        "hover:bg-[#2a2a2a] transition-colors w-full justify-center"
      )}
    >
      <LogIn size={12} />
      {expanded && <span>Login</span>}
    </button>
  )}
</div>

      </aside>
    </>
  );
}

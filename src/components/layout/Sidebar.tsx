"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Folder, CreditCard, BarChart3, Settings } from "lucide-react";
import { useAuthUser } from "@/hooks/useAuthUser";
import { toYYYYMM } from "@/utils/time";
import "@/styles/sidebar.css";

interface Props {
  expanded: boolean;
  onEnter: () => void;
  onLeave: () => void;
}

const NAV_ITEMS = [
  {
    key: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    match: "/dashboard",
    icon: Home,
  },
  {
    key: "projects",
    label: "Projects",
    href: "/projects",
    match: "/projects",
    icon: Folder,
  },
  {
    key: "expenses",
    label: "Expenses",
    href: "/expenses",
    match: "/expenses",
    icon: CreditCard,
  },
  {
    key: "summary",
    label: "Summary",
    href: "/summary",
    match: "/summary",
    icon: BarChart3,
  },
  {
    key: "settings",
    label: "Settings",
    href: "/settings",
    match: "/settings",
    icon: Settings,
  },
];

export default function Sidebar({ expanded, onEnter, onLeave }: Props) {
  const pathname = usePathname();
  const { user } = useAuthUser();

  const currentMonthId = useMemo(() => toYYYYMM(), []);
  const userEmail = user?.email ?? "Sign in to sync";

  const items = useMemo(
    () =>
      NAV_ITEMS.map((item) =>
        item.key === "expenses"
          ? { ...item, href: `/expenses/${currentMonthId}` }
          : item
      ),
    [currentMonthId]
  );

  return (
    <aside
      className="sidebar"
      data-expanded={expanded ? "true" : "false"}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <div className="sidebar-inner">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Image src="/logo.png" alt="APDB" width={28} height={28} priority />
          </div>
          <span className="sidebar-brand">APDB Project & Expenses</span>
        </div>

        <nav className="sidebar-nav">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.match || pathname.startsWith(`${item.match}/`);

            return (
              <Link
                key={item.key}
                href={item.href}
                className="sidebar-link"
                data-active={isActive ? "true" : "false"}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon size={18} />
                <span className="sidebar-label">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <span className="user-email">{userEmail}</span>
        </div>
      </div>
    </aside>
  );
}

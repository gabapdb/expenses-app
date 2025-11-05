"use client";

import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { Home, Folder, CreditCard, BarChart3, Settings } from "lucide-react";
import "@/styles/sidebar.css";

interface Props {
  expanded: boolean;
  onEnter: () => void;
  onLeave: () => void;
}

export default function Sidebar({ expanded, onEnter, onLeave }: Props) {
  const currentMonthId = format(new Date(), "yyyyMM");

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
          <Link href="/dashboard" className="sidebar-link">
            <Home size={18} />
            <span className="sidebar-label">Dashboard</span>
          </Link>
          <Link href="/projects" className="sidebar-link">
            <Folder size={18} />
            <span className="sidebar-label">Projects</span>
          </Link>
          <Link href={`/expenses/${currentMonthId}`} className="sidebar-link">
            <CreditCard size={18} />
            <span className="sidebar-label">Expenses</span>
          </Link>
          <Link href="/summary" className="sidebar-link">
            <BarChart3 size={18} />
            <span className="sidebar-label">Summary</span>
          </Link>
          <Link href="/settings" className="sidebar-link">
            <Settings size={18} />
            <span className="sidebar-label">Settings</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <span className="user-email">you@example.com</span>
        </div>
      </div>
    </aside>
  );
}

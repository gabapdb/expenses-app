"use client";

import Image from "next/image";
import Link from "next/link";
import { Home, Folder, CreditCard, BarChart3, Settings } from "lucide-react";
import "@/styles/sidebar.css";

interface Props {
  expanded: boolean;
  onEnter: () => void;
  onLeave: () => void;
}

export default function Sidebar({ expanded, onEnter, onLeave }: Props) {
  return (
    <aside
      className={`sidebar ${expanded ? "expanded" : "collapsed"}`}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={handleBlur}
      data-expanded={expanded}
      className={clsx(
        "fixed left-0 top-0 z-40 flex h-full flex-col gap-6 border-r border-white/12 bg-[rgba(22,24,33,0.74)] text-slate-100 shadow-[0_32px_90px_rgba(8,8,18,0.6)] backdrop-blur-2xl transition-[width,padding] duration-250 ease-out",
        expanded ? "w-[300px] px-5 py-6" : "w-[72px] items-center px-3 py-6"
      )}
    >
      <div className="sidebar-inner">
        <div className="sidebar-logo">
          <Image src="/logo.png" alt="APDB" width={28} height={28} priority />
          <span className="sidebar-brand">APDB Project & Expenses</span>
        </div>

        <nav className="sidebar-nav">
          <Link href="/dashboard" className="sidebar-link">
            <Home size={18} />
            <span>Dashboard</span>
          </Link>
          <Link href="/projects" className="sidebar-link">
            <Folder size={18} />
            <span>Projects</span>
          </Link>
          <Link href="/expenses" className="sidebar-link">
            <CreditCard size={18} />
            <span>Expenses</span>
          </Link>
          <Link href="/summary" className="sidebar-link">
            <BarChart3 size={18} />
            <span>Summary</span>
          </Link>
          <Link href="/settings" className="sidebar-link">
            <Settings size={18} />
            <span>Settings</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <div className="user-email">you@example.com</div>
        </div>
      </div>
    </aside>
  );
}

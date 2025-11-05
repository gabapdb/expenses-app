"use client";

import { clsx } from "clsx";
import { BarChart3, CreditCard, Folder, Home, Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FocusEvent } from "react";

interface Props {
  expanded: boolean;
  onEnter: () => void;
  onLeave: () => void;
}

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/projects", label: "Projects", icon: Folder },
  { href: "/expenses", label: "Expenses", icon: CreditCard },
  { href: "/summary", label: "Summary", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ expanded, onEnter, onLeave }: Props) {
  const handleBlur = (event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      onLeave();
    }
  };

  return (
    <aside
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
      <div
        className={clsx(
          "flex items-center rounded-2xl border border-white/12 bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] transition-all duration-300",
          expanded ? "w-full gap-3 px-3 py-2" : "h-12 w-12 justify-center"
        )}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/15 bg-white/12">
          <Image src="/logo.png" alt="APDB" width={24} height={24} priority />
        </div>
        <span
          className={clsx(
            "overflow-hidden text-sm font-semibold tracking-wide text-slate-50 transition-all duration-200 transform-gpu",
            expanded
              ? "max-w-[180px] opacity-100 translate-x-0"
              : "max-w-0 -translate-x-2 opacity-0"
          )}
        >
          APDB Project & Expenses
        </span>
      </div>

      <nav
        className={clsx(
          "flex flex-1 flex-col gap-2 transition-all duration-300",
          expanded ? "w-full" : "w-full items-center"
        )}
      >
        {NAV_LINKS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-label={label}
            className={clsx(
              "group/nav flex items-center rounded-2xl border border-transparent text-slate-200 transition-all duration-200 ease-out hover:border-white/15 hover:bg-white/12 hover:text-white",
              expanded ? "w-full gap-3 px-3 py-3" : "h-12 w-12 justify-center"
            )}
          >
            <span
              className={clsx(
                "flex items-center justify-center rounded-2xl border border-white/12 bg-white/10 text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-all duration-200 group-hover/nav:border-white/20 group-hover/nav:bg-white/16",
                expanded ? "h-10 w-10" : "h-12 w-12"
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={1.8} />
            </span>
            <span
              className={clsx(
                "overflow-hidden text-[0.95rem] font-medium text-slate-100 transition-all duration-200 transform-gpu",
                expanded
                  ? "max-w-[180px] opacity-100 translate-x-0"
                  : "max-w-0 -translate-x-2 opacity-0"
              )}
            >
              {label}
            </span>
          </Link>
        ))}
      </nav>

      <div
        className={clsx(
          "mt-auto flex items-center rounded-2xl border border-white/12 bg-white/10 text-xs text-slate-100/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-all duration-300",
          expanded ? "w-full px-4 py-3" : "h-12 w-12 justify-center"
        )}
      >
        <span
          className={clsx(
            "overflow-hidden text-[0.88rem] font-medium tracking-wide text-slate-100 transition-all duration-200 transform-gpu",
            expanded
              ? "max-w-[200px] opacity-100 translate-x-0"
              : "max-w-0 -translate-x-2 opacity-0"
          )}
        >
          you@example.com
        </span>
        <span
          className={clsx(
            "text-sm font-medium text-slate-100 transition-opacity duration-200",
            expanded ? "hidden" : "block"
          )}
        >
          you
        </span>
      </div>
    </aside>
  );
}

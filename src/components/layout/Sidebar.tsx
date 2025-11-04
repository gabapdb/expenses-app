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
  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      onLeave();
    }
  };

  return (
    <div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={handleBlur}
      className="fixed left-0 top-0 z-40 flex h-full"
    >
      <aside className="flex h-full w-[72px] flex-col items-center gap-6 border-r border-white/10 bg-[rgba(24,26,34,0.74)] px-3 py-6 text-slate-200 shadow-[0_32px_80px_rgba(8,8,16,0.55)] backdrop-blur-2xl">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]">
          <Image src="/logo.png" alt="APDB" width={28} height={28} priority />
        </div>

        <nav className="flex flex-1 flex-col items-center gap-3">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group/nav flex h-12 w-12 items-center justify-center rounded-2xl border border-transparent bg-white/5 text-slate-200 transition-all duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white"
            >
              <Icon className="h-5 w-5 transition-colors group-hover/nav:text-white" strokeWidth={1.8} />
              <span className="sr-only">{label}</span>
            </Link>
          ))}
        </nav>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/8 text-xs text-slate-100/80">
          you
        </div>
      </aside>

      <div
        className={clsx(
          "relative ml-[-1px] flex h-full w-0 items-stretch overflow-visible transition-[width] duration-200 ease-out",
          expanded && "w-[264px]"
        )}
        aria-hidden={!expanded}
      >
        <div
          className={clsx(
            "pointer-events-none absolute left-[12px] top-6 flex h-[calc(100%-3rem)] w-[248px] flex-col rounded-[30px] border border-white/12 bg-white/6 p-5 text-[0.92rem] text-slate-100 shadow-[0_28px_90px_rgba(8,8,18,0.55)] backdrop-blur-2xl transition-all duration-200 ease-out",
            expanded ? "pointer-events-auto translate-x-0 opacity-100" : "-translate-x-4 opacity-0",
            "transform-gpu"
          )}
        >
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-3 py-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]">
              <Image src="/logo.png" alt="APDB" width={28} height={28} priority />
            </div>
            <span className="text-[0.95rem] font-semibold tracking-wide text-slate-50">APDB Project & Expenses</span>
          </div>

          <nav className="mt-4 flex flex-col gap-1">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                tabIndex={expanded ? 0 : -1}
                className="group/nav flex items-center gap-3 rounded-2xl border border-transparent px-3 py-3 font-medium text-slate-200 transition-all duration-150 hover:border-white/15 hover:bg-white/12 hover:text-white"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/8 text-slate-100 group-hover/nav:bg-white/15">
                  <Icon className="h-5 w-5" strokeWidth={1.8} />
                </span>
                <span>{label}</span>
              </Link>
            ))}
          </nav>

          <div className="mt-auto rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-xs text-slate-100/80">
            you@example.com
          </div>
        </div>
      </div>
    </div>
  );
}

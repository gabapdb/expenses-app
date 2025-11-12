"use client";

import { useAuth } from "@/context/AuthContext";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

/** Wraps protected routes, waits for auth before rendering */
export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#111] text-[#9ca3af] text-sm">
        Loading…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#111] text-[#f87171] text-sm">
        You must be logged in to access this page.
      </div>
    );
  }

  return <>{children}</>;
}

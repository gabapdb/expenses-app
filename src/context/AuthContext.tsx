"use client";

import { createContext, useContext, useMemo } from "react";
import { useAuthUser } from "@/hooks/auth/useAuthUser";
import type { AppUser } from "@/core/auth";

/* -------------------------------------------------------------------------- */
/* 🧱 Types & Context Setup                                                    */
/* -------------------------------------------------------------------------- */
interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  isAdmin: boolean;
  isEngineer: boolean;
  isJunior: boolean;
  isViewer: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/* -------------------------------------------------------------------------- */
/* 🧩 Provider                                                                 */
/* -------------------------------------------------------------------------- */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthUser();

  // Memoize derived role flags
  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAdmin: user?.role === "admin",
      isEngineer: user?.role === "engineer",
      isJunior: user?.role === "junior",
      isViewer: user?.role === "viewer",
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/* -------------------------------------------------------------------------- */
/* 🪄 Hook: useAuth                                                            */
/* -------------------------------------------------------------------------- */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx)
    throw new Error("useAuth must be used within an <AuthProvider> component");
  return ctx;
}

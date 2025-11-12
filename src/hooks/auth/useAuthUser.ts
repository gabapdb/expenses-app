"use client";

import { useEffect, useState } from "react";
import { listenToUser, type AppUser } from "@/core/auth";

/**
 * Cached + reactive Firebase Auth listener
 * - Reads user from sessionStorage to avoid flicker
 * - Subscribes to real-time Firebase user changes
 * - Fully ESLint-compliant (no sync setState in effect)
 */
export function useAuthUser() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🟢 Step 1: Initialize from session cache asynchronously
    const cached = sessionStorage.getItem("appUser");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        // Schedule on next tick to avoid sync state update warning
        queueMicrotask(() => {
          setUser(parsed);
          setLoading(false);
        });
      } catch {
        sessionStorage.removeItem("appUser");
      }
    }

    // 🟢 Step 2: Subscribe to Firebase auth state
    const unsub = listenToUser((u) => {
      setUser(u);
      setLoading(false);
      if (u) sessionStorage.setItem("appUser", JSON.stringify(u));
      else sessionStorage.removeItem("appUser");
    });

    return () => unsub();
  }, []);

  return { user, loading };
}

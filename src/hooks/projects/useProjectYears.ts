"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/core/firebase";

/* -------------------------------------------------------------------------- */
/* 🧠 Types                                                                   */
/* -------------------------------------------------------------------------- */
interface UseProjectYearsResult {
  years: number[];
  loading: boolean;
  error: string | null;
}

interface UseProjectYearsOptions {
  enabled?: boolean;
}

interface ProjectYearsCache {
  years: number[];
}

let cachedProjectYears: ProjectYearsCache | null = null;
let cachedProjectYearsError: string | null = null;
let pendingProjectYears: Promise<ProjectYearsCache> | null = null;

async function loadProjectYears(): Promise<ProjectYearsCache> {
  const snapshot = await getDocs(collection(db, "projects"));
  const found = new Set<number>();

  snapshot.forEach((docSnap) => {
    const data = docSnap.data() as Record<string, unknown>;
    const start = data.startDate ? new Date(String(data.startDate)) : null;
    const end = data.endDate ? new Date(String(data.endDate)) : null;
    if (start && !isNaN(start.getTime())) found.add(start.getFullYear());
    if (end && !isNaN(end.getTime())) found.add(end.getFullYear());
  });

  return {
    years: Array.from(found).sort((a, b) => b - a),
  };
}

export function invalidateProjectYearsCache(): void {
  cachedProjectYears = null;
  cachedProjectYearsError = null;
  pendingProjectYears = null;
}

function scheduleMicrotask(fn: () => void): void {
  if (typeof queueMicrotask === "function") {
    queueMicrotask(fn);
  } else {
    Promise.resolve().then(fn);
  }
}

/* -------------------------------------------------------------------------- */
/* 🧮 Hook                                                                    */
/* -------------------------------------------------------------------------- */
export function useProjectYears(
  options: UseProjectYearsOptions = {}
): UseProjectYearsResult {
  const { enabled = true } = options;

  const [years, setYears] = useState<number[]>(
    () => cachedProjectYears?.years ?? []
  );
  const [internalLoading, setInternalLoading] = useState<boolean>(
    enabled && !cachedProjectYears && !cachedProjectYearsError
  );
  const [internalError, setInternalError] = useState<string | null>(
    enabled ? cachedProjectYearsError : null
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let active = true;
    if (cachedProjectYears) {
      scheduleMicrotask(() => {
        if (!active) return;
        setYears(cachedProjectYears!.years);
        setInternalError(null);
        setInternalLoading(false);
      });

      return () => {
        active = false;
      };
    }

    if (cachedProjectYearsError) {
      scheduleMicrotask(() => {
        if (!active) return;
        setInternalError(cachedProjectYearsError);
        setInternalLoading(false);
      });

      return () => {
        active = false;
      };
    }

    scheduleMicrotask(() => {
      if (!active) return;
      setInternalLoading(true);
      setInternalError(null);
    });

    const pending = pendingProjectYears ?? loadProjectYears();
    pendingProjectYears = pending;

    pending
      .then((result) => {
        cachedProjectYears = result;
        cachedProjectYearsError = null;

        if (!active) return;

        setYears(result.years);
        setInternalError(null);
      })
      .catch((err) => {
        console.error("[useProjectYears] Error:", err);
        const message = err instanceof Error ? err.message : "Unknown error";
        cachedProjectYearsError = message;

        if (!active) return;

        setInternalError(message);
      })
      .finally(() => {
        if (pendingProjectYears === pending) {
          pendingProjectYears = null;
        }

        if (active) {
          setInternalLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [enabled]);

  return {
    years,
    loading: enabled ? internalLoading : false,
    error: enabled ? internalError : null,
  };
}

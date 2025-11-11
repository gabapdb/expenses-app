"use client";

import { useState, useEffect, useCallback } from "react";
import type { Requirement } from "@/domain/validation/requirementSchema";
import { getRequirements } from "@/data/requirements.repo";

export interface UseRequirementsResult {
  data: Requirement[];
  loading: boolean;
  refresh: () => Promise<void>;
}

export function useRequirements(projectId: string): UseRequirementsResult {
  const [data, setData] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const refresh = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const reqs = await getRequirements(projectId);
      setData(reqs);
    } catch (err) {
      console.error("[useRequirements] Failed to load requirements:", err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, loading, refresh };
}

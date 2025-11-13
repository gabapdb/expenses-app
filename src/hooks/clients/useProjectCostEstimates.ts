"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getProjectCostEstimates,
  updateProjectCostEstimates,
} from "@/data/clientCE.repo";
import type { CostEstimates } from "@/domain/validation/costEstimateSchema";

export function useProjectCostEstimates(clientId?: string, projectId?: string) {
  const [ce, setCe] = useState<CostEstimates>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!clientId || !projectId) {
      setCe({});
      setLoading(false);
      return;
    }
    setLoading(true);

    const data = await getProjectCostEstimates(clientId, projectId);
    setCe(data);
    setLoading(false);
  }, [clientId, projectId]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => void load(), [load]);

  const save = useCallback(
    async (next: CostEstimates) => {
      if (!clientId || !projectId) return;
      await updateProjectCostEstimates(clientId, projectId, next);
      setCe(next);
    },
    [clientId, projectId]
  );

  return { ce, loading, save };
}

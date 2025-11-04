"use client";

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import { collectionGroup, getDocs, query, where } from "firebase/firestore";

import { db } from "@/core/firebase";
import type { Expense } from "@/domain/models";
import { mapExpense } from "@/domain/mapping";

interface ProjectExpenseSnapshot {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
}

interface CacheEntry extends ProjectExpenseSnapshot {
  promise?: Promise<void>;
  listeners: Set<() => void>;
}

const cache = new Map<string, CacheEntry>();

const emptySnapshot: ProjectExpenseSnapshot = Object.freeze({
  expenses: [],
  loading: false,
  error: null,
});

function getOrCreateEntry(projectId: string): CacheEntry {
  let entry = cache.get(projectId);
  if (!entry) {
    entry = {
      expenses: [],
      loading: false,
      error: null,
      listeners: new Set(),
    };
    cache.set(projectId, entry);
  }
  return entry;
}

function notify(projectId: string) {
  const entry = cache.get(projectId);
  if (!entry) return;
  entry.listeners.forEach((listener) => listener());
}

async function fetchProjectExpenses(projectId: string, force = false) {
  const entry = getOrCreateEntry(projectId);

  if (!force && (entry.promise || entry.loading)) {
    return entry.promise;
  }

  entry.loading = true;
  entry.error = null;
  notify(projectId);

  const loadPromise = (async () => {
    try {
      const expensesQuery = query(
        collectionGroup(db, "items"),
        where("projectId", "==", projectId)
      );
      const snapshot = await getDocs(expensesQuery);

      const expenses = snapshot.docs.map((docSnap) =>
        mapExpense(docSnap.id, docSnap.data())
      );

      entry.expenses = expenses;
      entry.error = null;
    } catch (err) {
      if (err instanceof Error) {
        entry.error = err.message;
      } else {
        entry.error = "Failed to load project expenses.";
      }
      entry.expenses = [];
    } finally {
      entry.loading = false;
      entry.promise = undefined;
      notify(projectId);
    }
  })();

  entry.promise = loadPromise;
  return loadPromise;
}

export function clearProjectExpenseCache(projectId?: string) {
  if (projectId) {
    cache.delete(projectId);
  } else {
    cache.clear();
  }
}

export function useProjectExpensesCollection(projectId: string | null | undefined) {
  const normalizedId = projectId?.trim() ?? "";

  const subscribe = useCallback(
    (listener: () => void) => {
      if (!normalizedId) {
        return () => undefined;
      }

      const entry = getOrCreateEntry(normalizedId);
      entry.listeners.add(listener);
      return () => {
        entry.listeners.delete(listener);
      };
    },
    [normalizedId]
  );

  const getSnapshot = useCallback((): ProjectExpenseSnapshot => {
    if (!normalizedId) {
      return emptySnapshot;
    }

    const { expenses, loading, error } = getOrCreateEntry(normalizedId);
    return { expenses, loading, error };
  }, [normalizedId]);

  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    if (!normalizedId) return;

    const entry = getOrCreateEntry(normalizedId);
    if (!entry.expenses.length && !entry.loading) {
      void fetchProjectExpenses(normalizedId);
    }
  }, [normalizedId]);

  const refetch = useCallback(() => {
    if (!normalizedId) return Promise.resolve();
    return fetchProjectExpenses(normalizedId, true);
  }, [normalizedId]);

  return useMemo(
    () => ({
      data: snapshot.expenses,
      loading: snapshot.loading,
      error: snapshot.error,
      refetch,
    }),
    [snapshot, refetch]
  );
}

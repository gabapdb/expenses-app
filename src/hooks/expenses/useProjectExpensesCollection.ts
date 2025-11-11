"use client";

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import {
  collectionGroup,
  FirestoreError,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import { db } from "@/core/firebase";
import type { Expense } from "@/domain/models";
import { mapExpense } from "@/domain/mapping";
import { compareExpensesByPaymentDate } from "@/utils/expenses";

interface ProjectExpenseSnapshot {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
}

interface CacheEntry extends ProjectExpenseSnapshot {
  promise?: Promise<void>;
  listeners: Set<() => void>;
  unsubscribe?: () => void;
  snapshot: ProjectExpenseSnapshot;
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
      snapshot: emptySnapshot,
    };
    cache.set(projectId, entry);
  }
  return entry;
}

function updateSnapshot(entry: CacheEntry) {
  entry.snapshot = {
    expenses: entry.expenses,
    loading: entry.loading,
    error: entry.error,
  };
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
  updateSnapshot(entry);
  notify(projectId);

  const loadPromise = (async () => {
    try {
      const expensesQuery = query(
        collectionGroup(db, "items"),
        where("projectId", "==", projectId)
      );
      const snapshot = await getDocs(expensesQuery);

      const expenses = snapshot.docs
        .map((docSnap) => {
          try {
            return mapExpense(docSnap.id, docSnap.data());
          } catch (err) {
            console.error(
              `[useProjectExpensesCollection] Invalid expense (${docSnap.id}):`,
              err
            );
            return null;
          }
        })
        .filter((expense): expense is Expense => expense !== null)
        .sort(compareExpensesByPaymentDate);

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
      updateSnapshot(entry);
      notify(projectId);
    }
  })();

  entry.promise = loadPromise;
  return loadPromise;
}

function ensureRealtimeSubscription(projectId: string) {
  const entry = getOrCreateEntry(projectId);
  if (entry.unsubscribe) {
    return;
  }

  entry.loading = true;
  updateSnapshot(entry);
  notify(projectId);

  const expensesQuery = query(
    collectionGroup(db, "items"),
    where("projectId", "==", projectId)
  );

  entry.unsubscribe = onSnapshot(
    expensesQuery,
    (snapshot) => {
      try {
        const expenses = snapshot.docs
          .map((docSnap) => {
            try {
              return mapExpense(docSnap.id, docSnap.data());
            } catch (err) {
              console.error(
                `[useProjectExpensesCollection] Invalid expense (${docSnap.id}):`,
                err
              );
              return null;
            }
          })
          .filter((expense): expense is Expense => expense !== null)
          .sort(compareExpensesByPaymentDate);

        entry.expenses = expenses;
        entry.error = null;
      } catch (err) {
        console.error(
          "[useProjectExpensesCollection] Unexpected snapshot error:",
          err
        );
        entry.error = "Failed to parse project expenses.";
        entry.expenses = [];
      } finally {
        entry.loading = false;
        updateSnapshot(entry);
        notify(projectId);
      }
    },
    (err: FirestoreError) => {
      console.error("[useProjectExpensesCollection] Snapshot listener error:", err);
      entry.error = err.message;
      entry.expenses = [];
      entry.loading = false;
      updateSnapshot(entry);
      notify(projectId);
    }
  );
}

export function clearProjectExpenseCache(projectId?: string) {
  if (projectId) {
    const entry = cache.get(projectId);
    entry?.unsubscribe?.();
    cache.delete(projectId);
  } else {
    cache.forEach((entry) => entry.unsubscribe?.());
    cache.clear();
  }
}

export function invalidateProjectExpenses(
  projectId: string | null | undefined
): Promise<void> {
  const normalizedId = projectId?.trim() ?? "";
  if (!normalizedId) {
    return Promise.resolve();
  }

  ensureRealtimeSubscription(normalizedId);
  const promise = fetchProjectExpenses(normalizedId, true);
  return promise ?? Promise.resolve();
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
      ensureRealtimeSubscription(normalizedId);
      return () => {
        entry.listeners.delete(listener);
        if (entry.listeners.size === 0 && entry.unsubscribe) {
          entry.unsubscribe();
          entry.unsubscribe = undefined;
        }
      };
    },
    [normalizedId]
  );

  const getSnapshot = useCallback((): ProjectExpenseSnapshot => {
    if (!normalizedId) {
      return emptySnapshot;
    }

    const entry = getOrCreateEntry(normalizedId);
    return entry.snapshot;
  }, [normalizedId]);

  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    if (!normalizedId) return;

    ensureRealtimeSubscription(normalizedId);
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

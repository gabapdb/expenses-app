"use client";

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import {
  collectionGroup,
  FirestoreError,
  getDocs,
  onSnapshot,
  query,
  where,
  type QueryDocumentSnapshot,
} from "firebase/firestore";

import { db } from "@/core/firebase";
import type { Expense } from "@/domain/models";
import { mapExpense } from "@/domain/mapping";
import { compareExpensesByPaymentDate } from "@/utils/expenses";

interface ProjectExpensesScopeInput {
  clientId?: string;
  projectId?: string;
  year?: string;
  month?: string;
  yyyyMM?: string;
}

interface ResolvedProjectExpensesScope {
  clientId: string;
  projectId: string;
  year: string;
  month: string;
  yyyyMM: string;
}

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
  subscriptionClientId?: string;
}

const cache = new Map<string, CacheEntry>();

const emptySnapshot: ProjectExpenseSnapshot = Object.freeze({
  expenses: [],
  loading: false,
  error: null,
});

function normalize(value: string | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

function resolveProjectCollectionScope(
  scopeOrProjectId: string | ProjectExpensesScopeInput | null | undefined
): ResolvedProjectExpensesScope {
  if (typeof scopeOrProjectId === "string") {
    const projectId = normalize(scopeOrProjectId);
    return { clientId: "", projectId, year: "", month: "", yyyyMM: "" };
  }

  if (!scopeOrProjectId) {
    return { clientId: "", projectId: "", year: "", month: "", yyyyMM: "" };
  }

  const clientId = normalize(scopeOrProjectId.clientId);
  const projectId = normalize(scopeOrProjectId.projectId);
  const providedYear = normalize(scopeOrProjectId.year);
  const providedMonth = normalize(scopeOrProjectId.month);
  const providedYYYYMM = normalize(scopeOrProjectId.yyyyMM);
  const year = providedYear || (providedYYYYMM ? providedYYYYMM.slice(0, 4) : "");
  const month = providedMonth || (providedYYYYMM ? providedYYYYMM.slice(4, 6) : "");
  const yyyyMM =
    providedYYYYMM || (year && month ? `${year}${month}` : "");

  return { clientId, projectId, year, month, yyyyMM };
}

function selectScopedDocs(
  docs: readonly QueryDocumentSnapshot[],
  projectId: string,
  clientId?: string
): QueryDocumentSnapshot[] {
  const scopedSegment = `/projects/${projectId}/expenses/`;
  const clientSegment = clientId ? `/clients/${clientId}/` : null;

  const hasScopedDocs = docs.some((docSnap) => {
    const path = docSnap.ref.path;
    if (!path.includes(scopedSegment)) {
      return false;
    }
    if (clientSegment && !path.includes(clientSegment)) {
      return false;
    }
    return true;
  });

  if (hasScopedDocs) {
    return docs.filter((docSnap) => {
      const path = docSnap.ref.path;
      if (!path.includes(scopedSegment)) {
        return false;
      }
      if (clientSegment && !path.includes(clientSegment)) {
        return false;
      }
      return true;
    });
  }

  return docs.filter((docSnap) => docSnap.ref.path.startsWith("expenses/"));
}

function mapSnapshotToExpenses(
  docs: readonly QueryDocumentSnapshot[],
  projectId: string,
  clientId?: string
): Expense[] {
  return selectScopedDocs(docs, projectId, clientId)
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
}

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

async function fetchProjectExpenses(
  projectId: string,
  clientId: string,
  force = false
) {
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

      entry.expenses = mapSnapshotToExpenses(
        snapshot.docs,
        projectId,
        clientId || undefined
      );
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

function ensureRealtimeSubscription(scope: ResolvedProjectExpensesScope) {
  const { projectId, clientId } = scope;
  const entry = getOrCreateEntry(projectId);

  if (entry.unsubscribe && entry.subscriptionClientId === clientId) {
    return;
  }

  entry.unsubscribe?.();
  entry.subscriptionClientId = clientId;

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
        entry.expenses = mapSnapshotToExpenses(
          snapshot.docs,
          projectId,
          clientId || undefined
        );
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
  scopeOrProjectId: string | ProjectExpensesScopeInput | null | undefined
): Promise<void> {
  const resolved = resolveProjectCollectionScope(scopeOrProjectId);
  const { projectId } = resolved;

  if (!projectId) {
    return Promise.resolve();
  }

  const entry = getOrCreateEntry(projectId);
  const clientIdForFetch = entry.subscriptionClientId ?? resolved.clientId;

  ensureRealtimeSubscription({ ...resolved, clientId: clientIdForFetch ?? "" });
  const promise = fetchProjectExpenses(projectId, clientIdForFetch ?? "", true);
  return promise ?? Promise.resolve();
}

export function useProjectExpensesCollection(
  scopeOrProjectId: string | ProjectExpensesScopeInput | null | undefined
) {
  const resolvedScope = useMemo(
    () => resolveProjectCollectionScope(scopeOrProjectId),
    [scopeOrProjectId]
  );

  const { projectId, clientId, year, month, yyyyMM } = resolvedScope;

  const subscribe = useCallback(
    (listener: () => void) => {
      if (!projectId) {
        return () => undefined;
      }

      const entry = getOrCreateEntry(projectId);
      entry.listeners.add(listener);
      ensureRealtimeSubscription({
        clientId,
        projectId,
        year,
        month,
        yyyyMM,
      });
      return () => {
        entry.listeners.delete(listener);
        if (entry.listeners.size === 0 && entry.unsubscribe) {
          entry.unsubscribe();
          entry.unsubscribe = undefined;
          entry.subscriptionClientId = undefined;
        }
      };
    },
    [projectId, clientId, year, month, yyyyMM]
  );

  const getSnapshot = useCallback((): ProjectExpenseSnapshot => {
    if (!projectId) {
      return emptySnapshot;
    }

    const entry = getOrCreateEntry(projectId);
    return entry.snapshot;
  }, [projectId]);

  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    if (!projectId) return;

    ensureRealtimeSubscription({ clientId, projectId, year, month, yyyyMM });
  }, [projectId, clientId, year, month, yyyyMM]);

  const refetch = useCallback(() => {
    if (!projectId) return Promise.resolve();
    return fetchProjectExpenses(projectId, clientId, true);
  }, [projectId, clientId]);

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

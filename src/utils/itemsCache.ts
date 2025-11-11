import { set, get, del } from "idb-keyval";
import { db } from "@/core/firebase";
import { doc, writeBatch, updateDoc } from "firebase/firestore";
import type { ItemRecord } from "@/domain/items";

const IDB_KEY = "itemsDB-cache-v1";
const CLEANUP_KEY = "itemsDB-lastCleanup";
const SYNC_KEY = "itemsDB-lastSync";

/* -------------------------------------------------------------------------- */
/* Core Cache Operations                                                      */
/* -------------------------------------------------------------------------- */

export async function saveItemsCache(items: ItemRecord[]): Promise<void> {
  try {
    await set(IDB_KEY, items);
  } catch {
    localStorage.setItem(IDB_KEY, JSON.stringify(items));
  }
}

export async function loadItemsCache(): Promise<ItemRecord[] | null> {
  try {
    const fromIdb = await get<ItemRecord[] | undefined>(IDB_KEY);
    if (fromIdb && Array.isArray(fromIdb)) return fromIdb;
  } catch {
    /* ignore */
  }

  const raw = localStorage.getItem(IDB_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ItemRecord[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export async function clearItemsCache(): Promise<void> {
  try {
    await del(IDB_KEY);
    localStorage.removeItem(IDB_KEY);
  } catch {
    /* ignore */
  }
}

/* -------------------------------------------------------------------------- */
/* 🔄 Real-Time Update for Item Usage                                         */
/* -------------------------------------------------------------------------- */

/** Update lastUsedAt locally + in Firestore immediately */
export async function markItemUsed(itemId: string): Promise<void> {
  if (!itemId) return;

  const now = Date.now();
  const cached = (await loadItemsCache()) ?? [];
  const updated = cached.map((i) =>
    i.id === itemId ? { ...i, lastUsedAt: now } : i
  );

  await saveItemsCache(updated);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("itemsCacheUpdated"));
  }

  // Try to update Firestore, fail silently if offline
  try {
    const ref = doc(db, "itemsDB", itemId);
    await updateDoc(ref, { lastUsedAt: now });
  } catch (err) {
    console.warn("[itemsCache] Firestore lastUsedAt update skipped:", err);
  }
}

/* -------------------------------------------------------------------------- */
/* 🧹 Background Cleaner (90-Day Retention)                                   */
/* -------------------------------------------------------------------------- */

export async function runItemsCacheCleanup(): Promise<void> {
  const now = Date.now();
  const lastRun = Number(localStorage.getItem(CLEANUP_KEY) ?? 0);
  const oneWeek = 1000 * 60 * 60 * 24 * 7;

  if (now - lastRun < oneWeek) return;

  const cached = (await loadItemsCache()) ?? [];
  if (!cached.length) {
    localStorage.setItem(CLEANUP_KEY, String(now));
    return;
  }

  const ninetyDays = 1000 * 60 * 60 * 24 * 90;
  const cutoff = now - ninetyDays;
  const cleaned = cached.filter(
    (i) => (i.lastUsedAt ?? i.createdAt) > cutoff
  );

  if (cleaned.length !== cached.length) {
    await saveItemsCache(cleaned);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("itemsCacheUpdated"));
    }
    console.info(
      `[itemsCache] 🧹 Pruned ${cached.length - cleaned.length} old items (>90 days)`
    );
  }

  localStorage.setItem(CLEANUP_KEY, String(now));
}

/* -------------------------------------------------------------------------- */
/* ☁️ Weekly Sync (Safety Net)                                                */
/* -------------------------------------------------------------------------- */

export async function runItemsSyncToFirestore(): Promise<void> {
  const now = Date.now();
  const lastSync = Number(localStorage.getItem(SYNC_KEY) ?? 0);
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  if (now - lastSync < oneWeek) return;

  const cached = await loadItemsCache();
  if (!cached?.length) {
    localStorage.setItem(SYNC_KEY, String(now));
    return;
  }

  const batch = writeBatch(db);
  let count = 0;

  cached.forEach((i) => {
    if (!i.id || !i.lastUsedAt) return;
    batch.update(doc(db, "itemsDB", i.id), { lastUsedAt: i.lastUsedAt });
    count++;
  });

  if (count > 0) {
    try {
      await batch.commit();
      console.info(`[itemsCache] ☁️ Synced ${count} lastUsedAt updates to Firestore`);
    } catch (err) {
      console.warn("[itemsCache] Firestore sync failed:", err);
    }
  }

  localStorage.setItem(SYNC_KEY, String(now));
}

/* -------------------------------------------------------------------------- */
/* 🪄 Automatic Background Maintenance                                        */
/* -------------------------------------------------------------------------- */

if (typeof window !== "undefined") {
  Promise.allSettled([
    runItemsCacheCleanup(),
    runItemsSyncToFirestore(),
  ]).then(() => console.log("[itemsCache] ✅ maintenance complete"));
}

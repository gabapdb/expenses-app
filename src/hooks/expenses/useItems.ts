// src/hooks/useItems.ts
"use client";

import { useEffect, useRef, useState } from "react";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "@/core/firebase";
import { ItemArraySchema, type ItemRecord } from "@/domain/items";
import { saveItemsCache, loadItemsCache } from "@/utils/itemsCache";

/**
 * useItems — manages a cached item database for instant lookups.
 *  - loads once from cache (IndexedDB/localStorage)
 *  - syncs with Firestore in background if stale
 *  - provides fuzzy, prefix, and substring search
 */
export function useItems() {
  const [items, setItems] = useState<ItemRecord[]>([]);
  const loadedOnce = useRef(false);

  /* -------------------------------------------------------------------------- */
  /* Load items from cache + background Firestore refresh                       */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (loadedOnce.current) return;
    loadedOnce.current = true;

    (async () => {
      const cached = await loadItemsCache();
      if (cached?.length) {
        setItems(cached);
      }

      // background refresh from Firestore (non-blocking)
      try {
        const q = query(collection(db, "itemsDB"));
        const snap = await getDocs(q);
        const raw = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const fresh = ItemArraySchema.parse(raw);

        if (fresh.length) {
          setItems(fresh);
          await saveItemsCache(fresh);
        }
      } catch (err) {
        console.warn("[useItems] Firestore refresh failed:", err);
      }
    })();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleCacheUpdated = () => {
      void (async () => {
        const cached = await loadItemsCache();
        if (cached) {
          setItems(cached);
        }
      })();
    };

    window.addEventListener("itemsCacheUpdated", handleCacheUpdated);

    return () =>
      window.removeEventListener("itemsCacheUpdated", handleCacheUpdated);
  }, []);

  /* -------------------------------------------------------------------------- */
  /* 🔍 findBestItemMatch: instant fuzzy search                                 */
  /* -------------------------------------------------------------------------- */
  async function findBestItemMatch(queryText: string): Promise<ItemRecord | null> {
    const q = queryText.trim().toLowerCase();
    if (!q) return null;
    if (!items.length) {
      const cached = await loadItemsCache();
      if (cached?.length) setItems(cached);
    }

    // Normalize and split words for richer matching
    const qWords = q.split(/\s+/);

    let best: ItemRecord | null = null;
    let bestScore = 0;

    for (const item of items) {
      const name = item.nameLower ?? item.name.toLowerCase();

      // Base matches
      const exact = name === q;
      const prefix = name.startsWith(q);
      const contains = name.includes(q);

      // Word-level overlap
      const wordOverlap = qWords.reduce(
        (sum, w) => (name.includes(w) ? sum + 1 : sum),
        0
      );

      // scoring heuristic
      let score = 0;
      if (exact) score = 100;
      else if (prefix) score = 80;
      else if (contains) score = 60;
      else if (wordOverlap > 0) score = 30 + wordOverlap * 10;

      if (score > bestScore) {
        bestScore = score;
        best = item;
      }
    }

    return best;
  }

  /* -------------------------------------------------------------------------- */
  /* 🧠 learnItem: add/update an item manually                                  */
  /* -------------------------------------------------------------------------- */
  async function learnItem(newItem: ItemRecord): Promise<void> {
    const updated = [...items.filter((i) => i.id !== newItem.id), newItem];
    setItems(updated);
    await saveItemsCache(updated);
  }

  return { items, findBestItemMatch, learnItem };
}

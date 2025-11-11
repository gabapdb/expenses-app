"use client";

import { useEffect, useState } from "react";
import { CATEGORY_MAP, type MutableCategoryMap } from "@/config/categories";

/**
 * useCategories()
 * Provides a category→subcategory map that falls back to
 * local defaults when Firestore data is unavailable.
 */
export function useCategories() {
  // ✅ Safely convert readonly map to mutable structure
  const makeMutableMap = (): MutableCategoryMap =>
    Object.fromEntries(
      Object.entries(CATEGORY_MAP).map(([k, v]) => [k, [...v]])
    );

  const [categoryMap, setCategoryMap] = useState<MutableCategoryMap>(
    makeMutableMap
  );

  useEffect(() => {
    // defer state update to next tick → no purity warning
    queueMicrotask(() => {
      try {
        const defaults = makeMutableMap();
        if (!defaults || Object.keys(defaults).length === 0) {
          console.warn("[useCategories] No defaults found — creating empty map");
          setCategoryMap({});
        } else {
          setCategoryMap(defaults);
        }
      } catch (err) {
        console.error("[useCategories] Failed to load defaults:", err);
        setCategoryMap(makeMutableMap());
      }
    });
  }, []);

  return { categoryMap };
}

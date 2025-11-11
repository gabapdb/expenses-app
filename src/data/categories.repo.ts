import { doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/core/firebase";
import { z } from "zod";
import type { MutableCategoryMap } from "@/config/categories";

/* ---------------- Schema ---------------- */
export const CategoryMapSchema = z.record(z.string(), z.array(z.string()));

/**
 * Firestore document path for global categories.
 * (Can later be scoped per company, user, or workspace.)
 */
const CATEGORY_DOC_PATH = "config/categories";

/**
 * Load the current category map once.
 */
export async function getCategoryMap(): Promise<MutableCategoryMap> {
  const ref = doc(db, CATEGORY_DOC_PATH);
  const snap = await getDoc(ref);
  if (!snap.exists()) return {};
  return CategoryMapSchema.parse(snap.data());
}

/**
 * Subscribe to real-time category updates.
 * Returns unsubscribe() cleanup function.
 */
export function onCategoryMapChange(
  callback: (data: MutableCategoryMap) => void
): () => void {
  const ref = doc(db, CATEGORY_DOC_PATH);
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      try {
        callback(CategoryMapSchema.parse(snap.data()));
      } catch (err) {
        console.error("[onCategoryMapChange] Invalid data:", err);
      }
    }
  });
}

/**
 * Save (merge) updated category map to Firestore.
 */
export async function saveCategoryMap(data: MutableCategoryMap): Promise<void> {
  const ref = doc(db, CATEGORY_DOC_PATH);
  await setDoc(ref, data, { merge: true });
}

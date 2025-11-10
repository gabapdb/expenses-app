import type { ItemRecord } from "@/domain/items";
import type { Expense } from "@/domain/models";
import { useItems } from "@/hooks/useItems";
import { saveItemsCache, loadItemsCache, markItemUsed } from "@/utils/itemsCache";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/core/firebase";

/**
 * Suggests and learns category/subCategory for an expense.
 * - Fast local suggestion
 * - Learns new items
 * - Updates usage (lastUsedAt) in real time
 */
export function useAutoCategorize() {
  const { findBestItemMatch } = useItems();

  async function suggest(
    exp: Pick<Expense, "details" | "category" | "subCategory">
  ): Promise<{
    suggestion: Pick<ItemRecord, "category" | "subCategory"> | null;
    learn: (finalCategory: string, finalSub: string) => Promise<void>;
  }> {
    const details = exp.details?.trim() ?? "";
    if (!details) {
      return { suggestion: null, learn: async () => void 0 };
    }

    // Try cached/local match first
    const match = await findBestItemMatch(details);
    if (match) {
      // ✅ Mark usage immediately
      await markItemUsed(match.id);
      return {
        suggestion: { category: match.category, subCategory: match.subCategory },
        learn: async () => void 0,
      };
    }

    // Not found → learn a new mapping
    return {
      suggestion: null,
      learn: async (finalCategory: string, finalSub: string) => {
        const now = Date.now();
        const id = details.toLowerCase().replace(/\s+/g, "_");

        const item: ItemRecord = {
          id,
          name: details,
          nameLower: details.toLowerCase(),
          category: finalCategory,
          subCategory: finalSub,
          keywords: details.split(/\s+/).map((w) => w.toLowerCase()),
          createdAt: now,
          lastUsedAt: now,
        };

        // 🔹 Save to Firestore
        const ref = doc(db, "itemsDB", id);
        await setDoc(ref, item, { merge: true });

        // 🔹 Update local cache
        const cached = (await loadItemsCache()) ?? [];
        const updated = [
          ...cached.filter((i) => i.nameLower !== item.nameLower),
          item,
        ];
        await saveItemsCache(updated);

        // 🔹 Notify listeners
        window.dispatchEvent(new CustomEvent("itemsCacheUpdated"));
        console.log("[AutoCategorize] Learned + cached:", item.name);
      },
    };
  }

  return suggest;
}

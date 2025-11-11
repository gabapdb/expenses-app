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
        const normalized = details.trim().toLowerCase();
        const safeIdBase = normalized
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 120);
        const id = safeIdBase && !safeIdBase.startsWith("__")
          ? safeIdBase
          : `item-${crypto.randomUUID()}`;

        const item: ItemRecord = {
          id,
          name: details,
          nameLower: normalized || details.toLowerCase(),
          category: finalCategory,
          subCategory: finalSub,
          keywords: Array.from(
            new Set(normalized.split(/\s+/).filter(Boolean))
          ),
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
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("itemsCacheUpdated"));
        }
        console.log("[AutoCategorize] Learned + cached:", item.name);
      },
    };
  }

  return suggest;
}

import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  where,
  type QuerySnapshot,
  type DocumentData,
} from "firebase/firestore";
import { db } from "@/core/firebase";
import {
  ItemArraySchema,
  ItemRecord,
  NewItem,
  NewItemSchema,
} from "@/domain/items";
import { z } from "zod";

const col = () => collection(db, "itemsDB");

/** Get ALL items once (for cold start / prefill cache) */
export async function listItemsOnce(): Promise<ItemRecord[]> {
  const snap = await getDocs(col());
  const raw: unknown[] = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return ItemArraySchema.parse(raw);
}

/** Try exact match (normalized) from Firestore if cache misses */
export async function findItemByExactNameLower(
  nameLower: string
): Promise<ItemRecord | null> {
  const q = query(col(), where("nameLower", "==", nameLower));
  const snap: QuerySnapshot<DocumentData> = await getDocs(q);
  if (snap.empty) return null;
  const docSnap = snap.docs[0];
  const parsed = ItemArraySchema.element.parse({
    id: docSnap.id,
    ...docSnap.data(),
  });
  return parsed;
}

/** “Learn” a new mapping */
export async function addItem(newItem: NewItem): Promise<ItemRecord> {
  const parsed = NewItemSchema.parse(newItem);
  const now = Date.now();
  const id = crypto.randomUUID();
  const payload: ItemRecord = {
    id,
    name: parsed.name.trim(),
    nameLower: parsed.name.trim().toLowerCase(),
    category: parsed.category,
    subCategory: parsed.subCategory,
    keywords: parsed.keywords?.map((k) => k.toLowerCase()) ?? [],
    createdAt: now,
    lastUsedAt: now, // ✅ ensure populated for new records
  };
  await setDoc(doc(db, "itemsDB", id), payload, { merge: true });
  return payload;
}

/** Live subscription (for cache warming / UI lists) */
export function subscribeItems(
  cb: (items: ItemRecord[]) => void,
  onError: (e: Error) => void
) {
  return onSnapshot(
    col(),
    (snap) => {
      try {
        const raw = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        cb(ItemArraySchema.parse(raw));
      } catch (err) {
        onError(err instanceof Error ? err : new Error("Invalid item format"));
      }
    },
    (err) => onError(err)
  );
}

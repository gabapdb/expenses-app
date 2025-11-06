import type { ItemRecord } from "@/domain/items";

export type SearchIndex = {
  byFirstChar: Map<string, ItemRecord[]>;
  all: ItemRecord[];
};

/** Build a grouped index (reduces fuzzy search space by ~90%) */
export function buildSearchIndex(items: ItemRecord[]): SearchIndex {
  const byFirstChar = new Map<string, ItemRecord[]>();
  for (const it of items) {
    const key = (it.nameLower[0] ?? "#");
    const bucket = byFirstChar.get(key) ?? [];
    bucket.push(it);
    byFirstChar.set(key, bucket);
  }
  return { byFirstChar, all: items };
}

export function normalizeKey(input: string | undefined | null): string {
  return (input ?? "").trim().toLowerCase();
}

/** Pick a small candidate set from index */
function pickCandidates(idx: SearchIndex, key: string): ItemRecord[] {
  if (!key) return [];
  const first = key[0] ?? "#";
  const primary = idx.byFirstChar.get(first) ?? [];
  // widen the net if too small
  if (primary.length >= 30) return primary;
  // fallback: include all if bucket is tiny
  return idx.all;
}

/** Lazy-load Fuse.js only when needed */
export async function fuzzyFind(
  idx: SearchIndex,
  key: string,
  limit = 5
): Promise<ItemRecord | null> {
  const candidates = pickCandidates(idx, key);
  if (candidates.length === 0) return null;

  const [{ default: Fuse }] = await Promise.all([import("fuse.js")]);

  const fuse = new Fuse(candidates, {
    keys: [
      { name: "nameLower", weight: 0.7 },
      { name: "keywords", weight: 0.3 },
    ],
    includeScore: true,
    ignoreLocation: true,
    threshold: 0.35, // tighter = more precise
    minMatchCharLength: 2,
  });

  const res = fuse.search(key, { limit });
  return res[0]?.score !== undefined && res[0].score <= 0.35 ? res[0].item : null;
}

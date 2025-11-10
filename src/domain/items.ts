import { z } from "zod";

/** Firestore: itemsDB/{id} */
export const ItemRecordSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  nameLower: z.string().min(1),
  category: z.string().min(1),
  subCategory: z.string().min(1),
  keywords: z.array(z.string()).default([]),
  createdAt: z.number().int().nonnegative(),
  lastUsedAt: z.number().int().nonnegative().optional(), // ✅ added
});

export type ItemRecord = z.infer<typeof ItemRecordSchema>;
export const ItemArraySchema = z.array(ItemRecordSchema);

/** Input for creating a new item */
export const NewItemSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  subCategory: z.string().min(1),
  keywords: z.array(z.string()).optional(),
});
export type NewItem = z.infer<typeof NewItemSchema>;

import { z } from "zod";

/**
 * Core category → subcategory map.
 */
export const CATEGORY_MAP = {
  Salary: [
    "Labor",
    "Engineer",
    "Mandatory Benefits",
    "Cabinets",
    "Miscellaneous",
    "Relaminate",
    "Electrical",
    "Plumbing",
    "Tiles",
    "Paint",
    "Ceiling",
    "Flooring",
  ],
  Materials: [
    "Hardware Materials",
    "Paint",
    "Plumbing",
    "Electrical",
    "Tiles",
    "Ceiling",
    "Miscellaneous",
    "Flooring",
  ],
  Transport: ["Hauling", "Delivery"],
  Cabinets: ["Laminate", "Accessories", "Boards", "Rugby"],
  Others: ["Insurance", "Others"],
} as const;

export type Category = keyof typeof CATEGORY_MAP;
export type Subcategory<C extends Category = Category> =
  (typeof CATEGORY_MAP)[C][number];
export type MutableCategoryMap = Record<string, string[]>;
export const CATEGORY_LIST = Object.keys(CATEGORY_MAP) as Category[];

export function getSubcategories(category: string): string[] {
  const map = CATEGORY_MAP as unknown as MutableCategoryMap;
  return map[category] ?? [];
}

export function addCategoryOrSubcategory(
  map: MutableCategoryMap,
  category: string,
  subCategory?: string
): MutableCategoryMap {
  const updated: MutableCategoryMap = { ...map };
  if (!updated[category]) {
    updated[category] = subCategory ? [subCategory] : [];
  } else if (subCategory && !updated[category].includes(subCategory)) {
    updated[category] = [...updated[category], subCategory];
  }
  return updated;
}

export const CategorySchema = z.object({
  category: z.string().min(1, "Category is required"),
  subCategory: z.string().optional(),
});

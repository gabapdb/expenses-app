// src/utils/normalizeDate.ts
import { format, parse, isValid } from "date-fns";

/**
 * normalizeDateInput()
 * ---------------------
 * Cleans and normalizes date strings entered by users.
 * - Accepts "MM/dd" or "MM/dd/yyyy"
 * - Auto-fills current year if missing
 * - Returns valid "MM/dd/yyyy" or empty string
 */
export function normalizeDateInput(value: string): string {
  if (!value.trim()) return "";

  const currentYear = new Date().getFullYear();

  try {
    // Try full date first (MM/dd/yyyy)
    let parsed = parse(value, "MM/dd/yyyy", new Date());
    if (isValid(parsed)) return format(parsed, "MM/dd/yyyy");

    // Try short format (MM/dd) → append current year
    parsed = parse(`${value}/${currentYear}`, "MM/dd/yyyy", new Date());
    if (isValid(parsed)) return format(parsed, "MM/dd/yyyy");

    // Invalid format
    return "";
  } catch {
    return "";
  }
}

import { z } from "zod";

/**
 * Extracts the first user-friendly validation error message
 * from a ZodError.
 *
 * @example
 * try {
 *   schema.parse(data);
 * } catch (err) {
 *   const msg = getFirstZodError(err);
 *   console.error(msg); // "Email is required."
 * }
 */
export function getFirstZodError(err: unknown): string | null {
  if (err instanceof z.ZodError) {
    const fieldErrors = err.flatten().fieldErrors as Record<string, string[]>;
    const formErrors = err.flatten().formErrors as string[];
    const firstFieldError = Object.values(fieldErrors)[0]?.[0];
    const firstFormError = formErrors?.[0];
    return firstFieldError ?? firstFormError ?? "Invalid input.";
  }
  return null;
}

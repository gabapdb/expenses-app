export const toYYYYMM = (d = new Date()) =>
  `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;

export const isoDateToYYYYMM = (
  iso?: string | null,
  fallback?: string
): string | null => {
  if (!iso) {
    return fallback ?? null;
  }

  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) {
    return fallback ?? null;
  }

  return toYYYYMM(parsed);
};

// src/utils/time.ts
export const fmtDateInput = (d?: Date | string | null): string => {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0]; // yyyy-mm-dd for <input type="date" />
};

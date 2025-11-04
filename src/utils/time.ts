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

export const peso = (n: number) => new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(n);
export const pct = (n: number) => `${n.toFixed(1)}%`;
export const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("en-CA"); // YYYY-MM-DD
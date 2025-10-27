import { clsx } from "clsx";


export type BadgeVariant = "neutral" | "success" | "warning" | "danger" | "info";


export default function Badge({
children,
className,
variant = "neutral",
}: React.PropsWithChildren<{ className?: string; variant?: BadgeVariant }>) {
const base = "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium";
const theme: Record<BadgeVariant, string> = {
neutral: "bg-gray-100 text-gray-700 border border-gray-200",
success: "bg-green-100 text-green-800 border border-green-200",
warning: "bg-amber-100 text-amber-800 border border-amber-200",
danger: "bg-red-100 text-red-800 border border-red-200",
info: "bg-blue-100 text-blue-800 border border-blue-200",
};
return <span className={clsx(base, theme[variant], className)}>{children}</span>;
}
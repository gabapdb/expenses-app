import { clsx } from "clsx";

/**
 * Dark theme button aligned with dashboard palette
 * - Primary: solid dark gray
 * - Secondary: transparent with border
 * - Danger: red tone
 */
export default function Button({
  className,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" }) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1f1f1f]";

  const variants = {
    primary:
      "bg-[#2a2a2a] text-[#e5e5e5] hover:bg-[#2f2f2f] border border-[#3a3a3a] focus:ring-[#3a3a3a]",
    secondary:
      "bg-transparent text-[#e5e5e5] border border-[#3a3a3a] hover:bg-[#262626] focus:ring-[#3a3a3a]",
    danger:
      "bg-[#b91c1c] text-[#f3f4f6] hover:bg-[#991b1b] focus:ring-[#b91c1c]",
  };

  return (
    <button
      {...props}
      className={clsx(base, variants[variant], className)}
    />
  );
}

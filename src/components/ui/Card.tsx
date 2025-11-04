import { clsx } from "clsx";

type CardProps = React.PropsWithChildren<{ className?: string }>;

export default function Card({ className, children }: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_18px_45px_rgba(8,8,20,0.45)] backdrop-blur-md transition-colors duration-200",
        className,
      )}
    >
      {children}
    </div>
  );
}

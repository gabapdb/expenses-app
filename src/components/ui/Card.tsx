import { clsx } from "clsx";


export default function Card({ className, children }: React.PropsWithChildren<{ className?: string }>) {
return <div className={clsx("bg-white rounded-2xl shadow-sm border border-gray-200 p-6", className)}>{children}</div>;
}
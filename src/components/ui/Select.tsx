import { clsx } from "clsx";


export default function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
return (
<select
className={clsx(
"w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm",
"focus:border-gray-900 focus:outline-none",
className
)}
{...props}
/>
);
}
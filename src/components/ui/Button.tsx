import { clsx } from "clsx";


export default function Button({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
return (
<button
className={clsx(
"inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-medium",
"bg-gray-900 text-white hover:bg-black focus:outline-none focus:ring",
className
)}
{...props}
/>
);
}
import { clsx } from "clsx";


export default function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
return (
<textarea
className={clsx(
"w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm",
"focus:border-gray-900 focus:outline-none resize-y min-h-[84px]",
className
)}
{...props}
/>
);
}
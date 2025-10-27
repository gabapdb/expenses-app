import { clsx } from "clsx";


export default function Label({ className, children, htmlFor }: React.PropsWithChildren<{ className?: string; htmlFor?: string }>) {
return (
<label htmlFor={htmlFor} className={clsx("text-xs font-medium text-gray-600", className)}>
{children}
</label>
);
}
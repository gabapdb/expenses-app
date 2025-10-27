export function T({ children }: React.PropsWithChildren) {
return <div className="overflow-auto rounded-xl border border-gray-200">{children}</div>;
}
export function THead({ children }: React.PropsWithChildren) {
return <div className="grid bg-gray-50 text-xs font-semibold text-gray-600">{children}</div>;
}
export function TRow({ children, cols }: React.PropsWithChildren<{ cols: string }>) {
return <div className={`grid items-center border-b last:border-0 ${cols}`}>{children}</div>;
}
export function TCell({ children, className = "px-3 py-2" }: React.PropsWithChildren<{ className?: string }>) {
return <div className={className}>{children}</div>;
}
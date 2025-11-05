/**
 * Table layout aligned with dark dashboard palette
 * Uses same surface/border colors as dashboard.css
 */
export function T({ children }: React.PropsWithChildren) {
  return (
    <div className="overflow-auto rounded-xl border border-[#3a3a3a] bg-[#2a2a2a]">
      {children}
    </div>
  );
}

export function THead({ children }: React.PropsWithChildren) {
  return (
    <div className="grid bg-[#242424] text-xs font-semibold text-[#e5e5e5] border-b border-[#3a3a3a]">
      {children}
    </div>
  );
}

export function TRow({
  children,
  cols,
}: React.PropsWithChildren<{ cols: string }>) {
  return (
    <div
      className={`grid items-center border-b border-[#3a3a3a] last:border-0 hover:bg-[#262626] transition-colors ${cols}`}
    >
      {children}
    </div>
  );
}

export function TCell({
  children,
  className = "px-3 py-2 text-[#e5e5e5]",
}: React.PropsWithChildren<{ className?: string }>) {
  return <div className={className}>{children}</div>;
}

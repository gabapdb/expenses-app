interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode; // optional right-side button or link
}

export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-lg font-semibold text-neutral-100 tracking-tight">{title}</h2>
        {subtitle && (
          <p className="text-sm text-neutral-500 mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

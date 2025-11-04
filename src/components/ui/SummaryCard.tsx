export function SummaryCard({ title, value }: { title: string; value: string }) {
return (
<div className="bg-[#1a1a1a] border border-[#27272a] rounded-xl p-4">
<p className="text-neutral-400 text-sm">{title}</p>
<h3 className="text-xl font-semibold mt-2">{value}</h3>
</div>
);
}
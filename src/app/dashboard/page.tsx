import { SectionHeader } from "@/components/ui/SectionHeader";
import { SummaryCard } from "@/components/ui/SummaryCard";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <SummaryCard title="Total Projects" value="12" />
        <SummaryCard title="Total Expenses" value="₱245,300" />
        <SummaryCard title="Balance Remaining" value="₱82,150" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1a1a1a] border border-[#27272a] rounded-xl p-4">
          <SectionHeader
            title="Recent Expenses"
            subtitle="Latest transactions recorded"
          />
          <div className="text-sm text-neutral-500">No recent expenses.</div>
        </div>

        <div className="bg-[#1a1a1a] border border-[#27272a] rounded-xl p-4">
          <SectionHeader
            title="Active Projects"
            subtitle="Ongoing work in progress"
          />
          <div className="text-sm text-neutral-500">No active projects.</div>
        </div>
      </div>
    </div>
  );
}

"use client";
import { useParams } from "next/navigation";
import { useProjects } from "@/hooks/useProjects";
import ExpensesGrid from "@/components/ExpensesGrid";

export default function ExpensesMonthPage() {
  const { yyyyMM } = useParams<{ yyyyMM: string }>();
  const projects = useProjects();

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Expenses – {yyyyMM}</h2>
      <ExpensesGrid
        yyyyMM={yyyyMM}
        projectOptions={projects.map((p) => ({ id: p.id, name: p.name }))}
      />
    </div>
  );
}

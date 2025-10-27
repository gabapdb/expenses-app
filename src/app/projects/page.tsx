"use client";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useProjects } from "@/hooks/useProjects";
import { peso } from "@/utils/format";

export default function ProjectsPage() {
  const items = useProjects();

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Projects</h2>
          <Button onClick={() => (window.location.href = "/summary")}>View Summary</Button>
        </div>

        <div className="divide-y">
          {items.map((p) => (
            <div key={p.id} className="py-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-xs text-gray-600">{p.city} · {p.team}</div>
              </div>
              <div className="text-sm text-gray-700">{peso(p.projectCost)}</div>
              <a
                href={`/projects/${p.id}`}
                className="text-blue-600 text-sm hover:underline"
              >
                Open →
              </a>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

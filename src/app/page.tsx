"use client";

import Link from "next/link";
import { Folder, CircleDollarSign, BarChart3 } from "lucide-react";
import { format } from "date-fns";
import Card from "@/components/ui/Card";

export default function HomePage() {
  const now = new Date();

  const sections = [
    {
      title: "Projects",
      description: "Manage client projects and details",
      href: "/projects",
      icon: Folder,
      color: "text-blue-600",
    },
    {
      title: "Expenses",
      description: "Track expenses by month and category",
      href: `/expenses/${format(now, "yyyyMM")}`,
      icon: CircleDollarSign,
      color: "text-green-600",
    },
    {
      title: "Summary",
      description: "View analytics and reports",
      href: "/summary",
      icon: BarChart3,
      color: "text-purple-600",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Expenses App</h1>
        <span className="text-sm text-gray-500">
          {format(now, "MMMM yyyy")}
        </span>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {sections.map((s) => (
          <Link key={s.title} href={s.href} className="group">
            <Card className="transition-transform transform hover:-translate-y-1 hover:shadow-md border border-gray-200 rounded-xl bg-white p-6 space-y-4 cursor-pointer text-center">
              <div className="flex justify-center">
                <s.icon
                  className={`w-10 h-10 ${s.color} group-hover:scale-110 transition-transform`}
                />
              </div>
              <h2 className="text-lg font-semibold text-gray-800 group-hover:text-black transition-colors">
                {s.title}
              </h2>
              <p className="text-sm text-gray-500">{s.description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}

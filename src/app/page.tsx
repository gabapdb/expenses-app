// src/app/page.tsx
"use client";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function HomePage() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card>
        <h2 className="font-medium mb-2">Projects</h2>
        <Button onClick={() => (window.location.href = "/projects")}>Open</Button>
      </Card>
      <Card>
        <h2 className="font-medium mb-2">Expenses</h2>
        <Button
          onClick={() =>
            (window.location.href = `/expenses/${new Date()
              .toISOString()
              .slice(0, 7)
              .replace("-", "")}`)
          }
        >
          Open
        </Button>
      </Card>
      <Card>
        <h2 className="font-medium mb-2">Summary</h2>
        <Button onClick={() => (window.location.href = "/summary")}>Open</Button>
      </Card>
    </div>
  );
}

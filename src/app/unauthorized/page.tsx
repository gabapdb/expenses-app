"use client";

import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import Button from "@/components/ui/Button";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#111] text-center text-[#e5e5e5] px-6">
      <div className="max-w-md">
        <h1 className="mb-3 text-2xl font-semibold">Access Denied</h1>
        <p className="text-[#9ca3af] mb-6">
          You don’t have permission to access this page.  
          Please log in with an authorized account.
        </p>
        <Button
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-2 bg-[#1f1f1f] border border-[#3a3a3a] hover:bg-[#2a2a2a] transition-all"
        >
          <LogIn size={16} />
          Go to Login
        </Button>
      </div>
    </main>
  );
}

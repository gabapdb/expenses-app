"use client";

import { useAuth } from "@/context/AuthContext";
import UserManagementTable from "@/features/admin/components/UserManagementTable";

export default function AdminPage() {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading…</p>;
  if (!user) return <p>Please log in.</p>;
  if (user.role !== "admin")
    return <p className="text-[#f87171]">Access denied.</p>;

  return (
    <main className="p-6 space-y-8 text-[#e5e5e5]">
      <h1 className="text-xl font-semibold">Admin Panel</h1>
      <UserManagementTable />
    </main>
  );
}

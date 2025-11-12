"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/core/firebase";
import { Role } from "@/core/auth";
import Card from "@/components/ui/Card";
import { Loader2 } from "lucide-react";

/* -------------------------------------------------------------------------- */
/* 🧩 Types & Constants                                                       */
/* -------------------------------------------------------------------------- */
interface UserRecord {
  id: string;
  email: string;
  displayName?: string;
  role: Role;
}

const ROLE_OPTIONS: Role[] = ["admin", "engineer", "junior", "viewer"];

/* -------------------------------------------------------------------------- */
/* 🧩 Component                                                               */
/* -------------------------------------------------------------------------- */
export default function UserManagementTable() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  /* --------------------------- Fetch users on mount -------------------------- */
  useEffect(() => {
    async function fetchUsers() {
      const snap = await getDocs(collection(db, "users"));
      const list: UserRecord[] = snap.docs.map((d) => ({
        id: d.id,
        email: d.data().email,
        displayName: d.data().displayName ?? "",
        role: d.data().role ?? "viewer",
      }));
      setUsers(list);
      setLoading(false);
    }
    fetchUsers();
  }, []);

  /* ------------------------------ Update Role ------------------------------- */
  async function handleRoleChange(uid: string, newRole: Role) {
    setSaving(uid);
    await updateDoc(doc(db, "users", uid), { role: newRole });
    setUsers((prev) =>
      prev.map((u) => (u.id === uid ? { ...u, role: newRole } : u))
    );
    setSaving(null);
  }

  /* ----------------------------- Loading State ------------------------------ */
  if (loading)
    return (
      <Card className="p-6 border border-[#3a3a3a] bg-[#1f1f1f] rounded-xl text-[#9ca3af] text-sm flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-[#9ca3af]" />
        Loading users…
      </Card>
    );

  /* ------------------------------- Main Table ------------------------------- */
  return (
    <Card className="p-6 border border-[#3a3a3a] bg-[#1f1f1f] rounded-2xl text-[#e5e5e5] shadow-sm">
      <h2 className="mb-6 text-lg font-semibold tracking-wide text-[#f3f4f6]">
        Manage User Roles
      </h2>

      <div className="overflow-hidden rounded-lg border border-[#2d2d2d]">
        <table className="min-w-full text-sm">
          <thead className="bg-[#242424] text-[#a3a3a3] uppercase text-xs tracking-wider">
            <tr>
              <th className="px-4 py-3 font-medium text-left">Name</th>
              <th className="px-4 py-3 font-medium text-left">Email</th>
              <th className="px-4 py-3 font-medium text-left">Role</th>
              <th className="w-20 px-4 py-3 font-medium text-left"></th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#2a2a2a]">
            {users.map((u) => (
              <tr
                key={u.id}
                className="hover:bg-[#2a2a2a]/60 transition-colors duration-150"
              >
                <td className="px-4 py-3 text-[#e5e5e5] font-medium">
                  {u.displayName || "—"}
                </td>
                <td className="px-4 py-3 text-[#9ca3af]">{u.email}</td>
                <td className="px-4 py-3">
                  <select
                    value={u.role}
                    onChange={(e) =>
                      handleRoleChange(u.id, e.target.value as Role)
                    }
                    className="block w-full rounded-md border border-[#3a3a3a] bg-[#1f1f1f] text-[#e5e5e5] px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-[#555] focus:border-[#555] hover:bg-[#2a2a2a] transition-all"
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option
                        key={r}
                        value={r}
                        className="bg-[#1f1f1f] text-[#e5e5e5]"
                      >
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-right">
                  {saving === u.id && (
                    <span className="text-xs text-[#9ca3af] italic">
                      Saving…
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

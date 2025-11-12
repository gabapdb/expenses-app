"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  const [error, setError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const snap = await getDocs(collection(db, "users"));
      if (!isMountedRef.current) return;
      const list: UserRecord[] = snap.docs.map((d) => ({
        id: d.id,
        email: d.data().email,
        displayName: d.data().displayName ?? "",
        role: d.data().role ?? "viewer",
      }));
      setUsers(list);
    } catch (err) {
      console.error("Failed to load users", err);
      if (!isMountedRef.current) return;
      setError("We couldn't load the user list. Please try again.");
    } finally {
      if (!isMountedRef.current) return;
      setLoading(false);
    }
  }, []);

  /* --------------------------- Fetch users on mount -------------------------- */
  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  /* ------------------------------ Update Role ------------------------------- */
  async function handleRoleChange(uid: string, newRole: Role) {
    setUpdateError(null);
    setSaving(uid);
    try {
      await updateDoc(doc(db, "users", uid), { role: newRole });
      if (!isMountedRef.current) return;
      setUsers((prev) =>
        prev.map((u) => (u.id === uid ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      console.error("Failed to update user role", err);
      if (!isMountedRef.current) return;
      setUpdateError("Failed to update the user role. Please try again.");
    } finally {
      if (!isMountedRef.current) return;
      setSaving(null);
    }
  }

  /* ----------------------------- Loading State ------------------------------ */
  if (loading)
    return (
      <Card className="p-6 border border-[#3a3a3a] bg-[#1f1f1f] rounded-xl text-[#9ca3af] text-sm flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-[#9ca3af]" />
        Loading users…
      </Card>
    );

  if (error)
    return (
      <Card className="p-6 border border-[#3a3a3a] bg-[#1f1f1f] rounded-xl text-[#fca5a5] text-sm flex flex-col gap-4">
        <div>{error}</div>
        <button
          onClick={loadUsers}
          className="self-start rounded-md border border-[#fca5a5]/40 px-3 py-1.5 text-xs font-medium text-[#fca5a5] hover:bg-[#fca5a5]/10 transition-colors"
        >
          Try again
        </button>
      </Card>
    );

  /* ------------------------------- Main Table ------------------------------- */
  return (
    <Card className="p-6 border border-[#3a3a3a] bg-[#1f1f1f] rounded-2xl text-[#e5e5e5] shadow-sm">
      <h2 className="mb-6 text-lg font-semibold tracking-wide text-[#f3f4f6]">
        Manage User Roles
      </h2>

      {updateError && (
        <div className="mb-4 rounded-md border border-[#5c2a2a] bg-[#2a1f1f] px-3 py-2 text-sm text-[#fca5a5]">
          {updateError}
        </div>
      )}

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

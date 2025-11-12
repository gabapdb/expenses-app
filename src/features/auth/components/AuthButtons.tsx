"use client";

import { useAuthUser } from "@/hooks/auth/useAuthUser";
import { loginWithGoogle, logout } from "@/core/auth";
import Button from "@/components/ui/Button";

export default function AuthButtons() {
  const { user, loading } = useAuthUser();

  if (loading)
    return <div className="text-sm text-[#9ca3af]">Checking session…</div>;

  if (user)
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-[#e5e5e5]">
          {user.displayName || user.email} ({user.role})
        </span>
        <Button
          onClick={logout}
          className="bg-[#262626] text-white border border-[#3a3a3a] hover:bg-[#333]"
        >
          Logout
        </Button>
      </div>
    );

  return (
    <Button
      onClick={loginWithGoogle}
      className="bg-[#1f1f1f] border border-[#3a3a3a] hover:bg-[#2a2a2a] text-[#e5e5e5]"
    >
      Login with Google
    </Button>
  );
}

"use client";

import { signInWithGoogle, signOutUser } from "@/core/auth";
import { useAuthUser } from "@/hooks/useAuthUser";
import Button from "@/components/ui/Button";

export default function AuthButtons() {
  const { user, loading } = useAuthUser();

  if (loading) return null;

  if (!user) {
    return (
      <Button
        onClick={async () => {
          try {
            await signInWithGoogle();
          } catch (err) {
            console.error("Google sign-in failed:", err);
          }
        }}
        className="bg-gray-900 text-white hover:bg-black"
      >
        Sign in with Google
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-700">{user.displayName}</span>
      <Button
        onClick={async () => {
          try {
            await signOutUser();
          } catch (err) {
            console.error("Sign-out failed:", err);
          }
        }}
        className="bg-gray-200 text-gray-800 hover:bg-gray-300"
      >
        Sign out
      </Button>
    </div>
  );
}

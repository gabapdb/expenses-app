"use client";

import { useEffect, useState } from "react";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { auth } from "@/core/firebase"; // adjust path if needed

export default function DevLoginButton() {
  const [user, setUser] = useState<null | { email: string }>(null);

  useEffect(() => {
    const unsub = getAuth().onAuthStateChanged((u) => {
      if (u) setUser({ email: u.email ?? "Anonymous" });
      else setUser(null);
    });
    return () => unsub();
  }, []);

  // Don’t show this in production
  if (process.env.NODE_ENV === "production") return null;

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("[DevLoginButton] Login failed:", err);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="fixed z-50 bottom-4 right-4">
      {user ? (
        <button
          onClick={handleLogout}
          className="px-3 py-2 text-xs text-white bg-red-600 rounded-md shadow hover:bg-red-500"
        >
          Logout ({user.email})
        </button>
      ) : (
        <button
          onClick={handleLogin}
          className="px-3 py-2 text-xs text-white bg-blue-600 rounded-md shadow hover:bg-blue-500"
        >
          Sign in with Google
        </button>
      )}
    </div>
  );
}

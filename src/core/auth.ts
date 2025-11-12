// src/core/auth.ts
import { onAuthStateChanged, signOut, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "@/core/firebase";
import { setFirebaseAuthCookie, clearFirebaseAuthCookie } from "@/core/authCookie";

export type Role = "admin" | "viewer" | "junior" | "engineer";

export interface AppUser {
  uid: string;
  email: string | null;
  role: Role;
  displayName?: string | null;
}

/* -------------------------------------------------------------------------- */
/* 🧠 Listen to User Auth Changes                                              */
/* -------------------------------------------------------------------------- */
export function listenToUser(callback: (user: AppUser | null) => void) {
  return onAuthStateChanged(auth, async (fbUser) => {
    if (!fbUser) {
      callback(null);
      clearFirebaseAuthCookie();
      return;
    }

    const ref = doc(db, "users", fbUser.uid);
    const snap = await getDoc(ref);

    let role: Role = "viewer";

    if (snap.exists()) {
      const data = snap.data();
      if (["admin", "viewer", "junior", "engineer"].includes(data.role)) {
        role = data.role as Role;
      }
    } else {
      // Create default Firestore user entry if first login
      await setDoc(ref, {
        email: fbUser.email,
        displayName: fbUser.displayName ?? "",
        role: "viewer",
      });
    }

    await setFirebaseAuthCookie();

    callback({
      uid: fbUser.uid,
      email: fbUser.email,
      displayName: fbUser.displayName,
      role,
    });
  });
}

/* -------------------------------------------------------------------------- */
/* 🚀 Login / Logout                                                          */
/* -------------------------------------------------------------------------- */
export async function loginWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  await setFirebaseAuthCookie(); // 🔥 Keep cookie synced for middleware
  return result.user;
}

export async function logout() {
  await signOut(auth);
  clearFirebaseAuthCookie();
}

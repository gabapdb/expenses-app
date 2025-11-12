// src/core/auth.ts
import {
  onIdTokenChanged,
  signOut,
  signInWithPopup,
  type User as FirebaseUser,
} from "firebase/auth";
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
  return onIdTokenChanged(auth, async (fbUser) => {
    if (!fbUser) {
      callback(null);
      clearFirebaseAuthCookie();
      return;
    }

    await setFirebaseAuthCookie(fbUser);

    const user = await resolveUserWithRole(fbUser);
    callback(user);
  });
}

async function resolveUserWithRole(fbUser: FirebaseUser): Promise<AppUser> {
  const ref = doc(db, "users", fbUser.uid);

  try {
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

    return {
      uid: fbUser.uid,
      email: fbUser.email,
      displayName: fbUser.displayName,
      role,
    };
  } catch (error) {
    console.error("Failed to resolve user role", error);
    return {
      uid: fbUser.uid,
      email: fbUser.email,
      displayName: fbUser.displayName,
      role: "viewer",
    };
  }
}

/* -------------------------------------------------------------------------- */
/* 🚀 Login / Logout                                                          */
/* -------------------------------------------------------------------------- */
export async function loginWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  await setFirebaseAuthCookie(result.user); // 🔥 Keep cookie synced for middleware
  return result.user;
}

export async function logout() {
  await signOut(auth);
  clearFirebaseAuthCookie();
}

import type { User } from "firebase/auth";
import { getAuth } from "firebase/auth";

export async function setFirebaseAuthCookie(userOverride?: User) {
  const auth = getAuth();
  const user = userOverride ?? auth.currentUser;
  if (!user) return;

  const token = await user.getIdToken();
  const secureFlag =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";
  document.cookie = `firebase-auth-token=${token}; Path=/; Max-Age=3600; SameSite=Lax${secureFlag}`;
}

export function clearFirebaseAuthCookie() {
  document.cookie = "firebase-auth-token=; Path=/; Max-Age=0";
}

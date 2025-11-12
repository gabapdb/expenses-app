import { getAuth } from "firebase/auth";

export async function setFirebaseAuthCookie() {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return;

  const token = await user.getIdToken();
  document.cookie = `firebase-auth-token=${token}; Path=/; Max-Age=3600; SameSite=Lax`;
}

export function clearFirebaseAuthCookie() {
  document.cookie = "firebase-auth-token=; Path=/; Max-Age=0";
}

import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "./firebase";
export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user; // <- required for Firestore permission
};
export const signOutUser = () => signOut(auth);
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "./firebase";
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const signOutUser = () => signOut(auth);
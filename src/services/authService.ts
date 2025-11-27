import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  type User
} from "firebase/auth";
import { auth } from "../lib/auth";

export const login = async (email: string, password: string): Promise<User> => {
  try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
  } catch (error) {
      console.error("Erro no login:", error);
      throw error;
  }
};

export const register = async (
  email: string,
  password: string,
  displayName?: string
): Promise<User> => {
  try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
          await updateProfile(userCredential.user, { displayName });
      }
      return userCredential.user;
  } catch (error) {
      console.error("Erro no registro:", error);
      throw error;
  }
};

export const loginWithGoogle = async (): Promise<User> => {
  try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      return userCredential.user;
  } catch (error) {
      console.error("Erro no login com Google:", error);
      throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
      await signOut(auth);
  } catch (error) {
      console.error("Erro no logout:", error);
      throw error;
  }
};

export const resetPassword = async (email: string): Promise<void> => {
  try {
      await sendPasswordResetEmail(auth, email);
  } catch (error) {
      console.error("Erro ao enviar email de recuperação:", error);
      throw error;
  }
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
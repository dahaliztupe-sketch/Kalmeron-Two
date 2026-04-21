"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";
import { auth, googleProvider, db } from "@/src/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";

interface DBUser {
  uid: string;
  email: string;
  name?: string;
  startup_stage?: string;
  industry?: string;
  governorate?: string;
  created_at: any;
  profile_completed: boolean;
}

interface AuthContextType {
  user: User | null;
  dbUser: DBUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshDBUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<DBUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDBUser = async (uid: string) => {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      setDbUser(userSnap.data() as DBUser);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Ensure user document exists in Firestore
        const userRef = doc(db, "users", currentUser.uid);
        try {
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            const newUser: DBUser = {
              uid: currentUser.uid,
              email: currentUser.email || "",
              created_at: serverTimestamp(),
              profile_completed: false,
            };
            await setDoc(userRef, newUser);
            setDbUser(newUser);
          } else {
            setDbUser(userSnap.data() as DBUser);
          }
        } catch (error) {
          console.error("Error setting up user doc:", error);
        }
      } else {
        setUser(null);
        setDbUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Error signing in with Google:", error);
      const code = error?.code || "";
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
        return;
      }
      const message =
        code === "auth/popup-blocked"
          ? "المتصفح حظر النافذة المنبثقة. يرجى السماح بالنوافذ المنبثقة وإعادة المحاولة."
          : code === "auth/unauthorized-domain"
          ? "هذا النطاق غير مصرح به في إعدادات Firebase."
          : "تعذّر تسجيل الدخول باستخدام Google. حاول مرة أخرى.";
      try { toast.error(message); } catch {}
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
      try { toast.error("تعذّر تسجيل الخروج. حاول مرة أخرى."); } catch {}
    }
  };

  const refreshDBUser = async () => {
    if (user) {
      await fetchDBUser(user.uid);
    }
  };

  return (
    <AuthContext.Provider value={{ user, dbUser, loading, signInWithGoogle, signOut, refreshDBUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

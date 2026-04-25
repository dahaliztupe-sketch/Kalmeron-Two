"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
} from "firebase/auth";
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

// ─── Mobile / in-app-browser detection ───────────────────────────────────
// signInWithPopup is unreliable on mobile (popups blocked, cancelled by user
// gesture loss, blank in in-app browsers like Telegram/WhatsApp). On those
// surfaces we fall back to signInWithRedirect which is the Firebase-recommended
// flow for mobile.
function shouldUseRedirect(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent || "";
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
  // In-app browsers commonly seen in Egypt/MENA where popups silently fail.
  const isInApp =
    /FBAN|FBAV|Instagram|Twitter|Line|MicroMessenger|TikTok|WhatsApp|Telegram|Snapchat/i.test(
      ua
    );
  return isMobile || isInApp;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<DBUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrCreateDBUser = async (currentUser: User) => {
    const userRef = doc(db, "users", currentUser.uid);
    try {
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        const newUser: DBUser = {
          uid: currentUser.uid,
          email: currentUser.email || "",
          name: currentUser.displayName || undefined,
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
  };

  useEffect(() => {
    // Resolve any pending redirect-based sign-in BEFORE we wire up the listener
    // so the popup → redirect transition completes cleanly. Errors here are
    // surfaced as toasts but never block the rest of auth.
    getRedirectResult(auth).catch((error: any) => {
      const code = error?.code || "";
      if (
        code === "auth/credential-already-in-use" ||
        code === "auth/no-auth-event"
      ) {
        return;
      }
      if (code) {
        console.error("Redirect sign-in error:", error);
      }
    });

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // Set user + finish loading immediately so the UI can react. Firestore
      // doc setup is fired-and-forgotten — it must not gate the loading flag,
      // because slow Firestore writes were making the post-login redirect
      // appear to "hang" for 3-8 seconds on mobile.
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        void fetchOrCreateDBUser(currentUser);
      } else {
        setDbUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      if (shouldUseRedirect()) {
        // Redirect flow — page will reload and getRedirectResult above will
        // pick up the result on return.
        await signInWithRedirect(auth, googleProvider);
        return;
      }
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Error signing in with Google:", error);
      const code = error?.code || "";
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
        return;
      }
      // If popup was blocked, transparently retry with redirect — better UX
      // than asking the user to enable popups.
      if (code === "auth/popup-blocked") {
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch {
          /* fall through to toast */
        }
      }
      const message =
        code === "auth/popup-blocked"
          ? "المتصفح حظر النافذة المنبثقة. يرجى السماح بالنوافذ المنبثقة وإعادة المحاولة."
          : code === "auth/unauthorized-domain"
          ? "هذا النطاق غير مصرح به في إعدادات Firebase."
          : code === "auth/network-request-failed"
          ? "تعذّر الاتصال بالشبكة. تأكد من اتصالك بالإنترنت وحاول مرة أخرى."
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
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) setDbUser(snap.data() as DBUser);
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

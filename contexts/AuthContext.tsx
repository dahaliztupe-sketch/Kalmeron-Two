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
  /**
   * `true` while we are still fetching the Firestore user document for the
   * currently signed-in user. Components that route based on
   * `dbUser.profile_completed` MUST wait for this to be `false` — otherwise
   * they will see `dbUser === null` and incorrectly treat the user as
   * not-onboarded, sending an existing user back through onboarding.
   */
  dbUserLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshDBUser: () => Promise<void>;
  mergeDBUser: (patch: Partial<DBUser>) => void;
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
  const [dbUserLoading, setDbUserLoading] = useState(false);
  // Tracks if mergeDBUser was called for the current uid. When true, we will
  // NOT overwrite local optimistic state with a stale Firestore re-fetch —
  // this prevents the post-onboarding bounce where a background fetch races
  // an in-flight write and momentarily reports profile_completed=false.
  const optimisticUidRef = React.useRef<string | null>(null);

  const fetchOrCreateDBUser = async (currentUser: User) => {
    setDbUserLoading(true);
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
        if (optimisticUidRef.current !== currentUser.uid) setDbUser(newUser);
      } else {
        // If we have an optimistic state for this uid AND the server still
        // says profile_completed=false, prefer the optimistic value so the
        // user is not bounced back to /onboarding while their write is
        // in-flight. Once the server catches up, future fetches will agree.
        const serverData = userSnap.data() as DBUser;
        if (
          optimisticUidRef.current === currentUser.uid &&
          serverData.profile_completed === false
        ) {
          // keep current optimistic dbUser
        } else {
          setDbUser(serverData);
          // server caught up — drop the optimistic guard
          if (serverData.profile_completed) optimisticUidRef.current = null;
        }
      }
    } catch (error) {
      console.error("Error setting up user doc:", error);
    } finally {
      setDbUserLoading(false);
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
      // Set user + finish auth-loading immediately so the UI can react.
      // Firestore doc setup runs in parallel and is tracked separately by
      // `dbUserLoading` — routing components should wait on BOTH before
      // making profile-based decisions.
      setUser(currentUser);
      setLoading(false);
      // Mirror the auth state into a non-HTTP-only marker cookie so the
      // server-side middleware can decide whether to render or redirect
      // protected routes. The real authorization still happens via Firebase
      // ID-token verification in API routes — this cookie is only a UX hint
      // to avoid flashing protected pages to logged-out visitors.
      try {
        if (typeof document !== 'undefined') {
          if (currentUser) {
            const isHttps =
              typeof window !== 'undefined' && window.location.protocol === 'https:';
            const secure = isHttps ? '; Secure' : '';
            document.cookie = `kal_session=1; Path=/; Max-Age=2592000; SameSite=Lax${secure}`;
          } else {
            document.cookie = 'kal_session=; Path=/; Max-Age=0; SameSite=Lax';
          }
        }
      } catch {
        /* cookie set is best-effort; never block auth */
      }
      if (currentUser) {
        // Drop optimistic guard if the uid changed (different account).
        if (optimisticUidRef.current && optimisticUidRef.current !== currentUser.uid) {
          optimisticUidRef.current = null;
        }
        void fetchOrCreateDBUser(currentUser);
      } else {
        setDbUser(null);
        setDbUserLoading(false);
        optimisticUidRef.current = null;
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

  // Optimistic local merge — used by flows like onboarding submit so the UI can
  // proceed without waiting for an extra Firestore round-trip. We also flag
  // the uid so a concurrent fetchOrCreateDBUser() doesn't overwrite the
  // merged value with stale server data while the background write is
  // still in-flight.
  const mergeDBUser = (patch: Partial<DBUser>) => {
    setDbUser((prev) => {
      if (!prev) return prev;
      const merged = { ...prev, ...patch } as DBUser;
      if (user) optimisticUidRef.current = user.uid;
      return merged;
    });
  };

  return (
    <AuthContext.Provider value={{ user, dbUser, loading, dbUserLoading, signInWithGoogle, signOut, refreshDBUser, mergeDBUser }}>
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

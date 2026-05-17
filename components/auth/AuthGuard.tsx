"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  requireProfile?: boolean;
}

/**
 * Reads the sessionStorage flag set by finalizeOnboarding() so we never
 * redirect a freshly-onboarded user back to /onboarding while the optimistic
 * Firestore write is still in flight or the React context hasn't propagated
 * the merged dbUser yet.
 */
function isJustOnboarded(): boolean {
  try {
    return typeof window !== "undefined" &&
      sessionStorage.getItem("kalmeron_just_onboarded") === "1";
  } catch {
    return false;
  }
}

function clearJustOnboarded() {
  try { sessionStorage.removeItem("kalmeron_just_onboarded"); } catch {}
}

export function AuthGuard({ children, requireProfile = true }: AuthGuardProps) {
  const { user, dbUser, loading, dbUserLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/auth/login");
      return;
    }

    if (requireProfile) {
      // Wait for the Firestore profile fetch before deciding on onboarding —
      // checking against `null` would race with the in-flight fetch.
      if (dbUserLoading) return;

      // dbUser is null here either because:
      // 1. The Firestore fetch failed (network/permissions error), OR
      // 2. This is a brand-new user whose doc doesn't exist yet.
      // In both cases, redirect to onboarding — never return a blank screen.
      if (!dbUser || !dbUser.profile_completed) {
        // Don't redirect if the user JUST completed onboarding and the
        // Firestore write / React context update is still propagating.
        // The flag is set in finalizeOnboarding() and survives the onboarding
        // page unmount so it's visible here on the destination page.
        if (isJustOnboarded()) return;
        router.replace("/onboarding");
        return;
      }

      // Profile is confirmed complete — safe to clear the just-onboarded flag.
      if (dbUser.profile_completed) {
        clearJustOnboarded();
      }
    }
  }, [user, dbUser, loading, dbUserLoading, router, requireProfile]);

  // Hold the loader while either auth OR (when required) the profile is still
  // resolving so we never flash protected content to a not-yet-onboarded user.
  if (loading || (requireProfile && user && dbUserLoading)) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-[rgb(var(--brand-cyan))] animate-spin" />
          <p className="text-neutral-400 text-sm">جاري التحقق من هويتك...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Profile required but missing/incomplete → redirect already queued above.
  // Exception: if the user JUST onboarded, trust the optimistic state and
  // render children immediately instead of returning null (which would flash
  // a blank screen while the context catches up).
  if (requireProfile && (!dbUser || !dbUser.profile_completed)) {
    if (isJustOnboarded()) {
      // Optimistic: render children; effect will clear the flag once confirmed.
      return <>{children}</>;
    }
    // Redirect is already queued by the effect — show spinner instead of a
    // completely blank screen while Next.js navigation completes.
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-[rgb(var(--brand-cyan))] animate-spin" />
          <p className="text-neutral-400 text-sm">جاري التحميل…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

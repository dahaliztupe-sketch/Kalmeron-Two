"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  requireProfile?: boolean;
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
      // Wait for the Firestore profile fetch before deciding onboarding —
      // checking against `null` would race with the in-flight fetch.
      if (dbUserLoading) return;
      if (dbUser && !dbUser.profile_completed) {
        router.replace("/onboarding");
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
  // Profile required but missing/incomplete → redirect already queued above;
  // render nothing to avoid flashing protected children.
  if (requireProfile && (!dbUser || !dbUser.profile_completed)) return null;

  return <>{children}</>;
}

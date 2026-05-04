"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { Loader2 } from "lucide-react";

export default function OnboardingPage() {
  const { user, dbUser, loading, dbUserLoading } = useAuth();
  const router = useRouter();

  // Clear completing guard when this page unmounts (i.e. user navigated away).
  useEffect(() => {
    return () => {
      try { sessionStorage.removeItem("kalmeron_onboarding_completing"); } catch {}
    };
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/auth/signup");
      return;
    }
    // Wait for the Firestore profile fetch to finish before deciding whether
    // to bounce to /dashboard. Without this guard, an already-onboarded user
    // would briefly see the onboarding form while dbUser is still loading.
    if (dbUserLoading) return;
    if (dbUser?.profile_completed) {
      // Skip redirect if we're in the middle of finalizing onboarding so
      // the First Mission screen can navigate to its own destination without
      // being overridden by this guard.
      try {
        if (sessionStorage.getItem("kalmeron_onboarding_completing") === "1") return;
      } catch {}
      router.replace("/dashboard");
    }
  }, [user, dbUser, loading, dbUserLoading, router]);

  // Hold the spinner while either auth OR the profile fetch is in flight.
  // Do NOT show spinner when profile_completed is true but completing flag
  // is active — that means we're in the First Mission screen.
  const isCompleting = (() => {
    try { return sessionStorage.getItem("kalmeron_onboarding_completing") === "1"; } catch { return false; }
  })();

  if (loading || !user || dbUserLoading || (dbUser?.profile_completed && !isCompleting)) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[rgb(var(--brand-cyan))] animate-spin" />
      </div>
    );
  }

  return <OnboardingForm />;
}

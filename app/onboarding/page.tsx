"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { Loader2 } from "lucide-react";

export default function OnboardingPage() {
  const { user, dbUser, loading, dbUserLoading } = useAuth();
  const router = useRouter();

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
      router.replace("/dashboard");
    }
  }, [user, dbUser, loading, dbUserLoading, router]);

  // Hold the spinner while either auth OR the profile fetch is in flight, and
  // also when the profile is already completed (we're about to redirect).
  if (loading || !user || dbUserLoading || dbUser?.profile_completed) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[rgb(var(--brand-cyan))] animate-spin" />
      </div>
    );
  }

  return <OnboardingForm />;
}

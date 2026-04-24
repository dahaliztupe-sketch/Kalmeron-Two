"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { Loader2 } from "lucide-react";

export default function OnboardingPage() {
  const { user, dbUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/auth/signup");
      } else if (dbUser?.profile_completed) {
        router.replace("/dashboard");
      }
    }
  }, [user, dbUser, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[rgb(var(--brand-cyan))] animate-spin" />
      </div>
    );
  }

  return <OnboardingFormWithRedirect />;
}

function OnboardingFormWithRedirect() {
  const { dbUser, refreshDBUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (dbUser?.profile_completed) {
      router.replace("/dashboard");
    }
  }, [dbUser, router]);

  return <OnboardingForm />;
}

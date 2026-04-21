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
  const { user, dbUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/auth/login");
      } else if (requireProfile && dbUser && !dbUser.profile_completed) {
        router.replace("/onboarding");
      }
    }
  }, [user, dbUser, loading, router, requireProfile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-[rgb(var(--gold))] animate-spin" />
          <p className="text-neutral-400 text-sm">جاري التحقق من هويتك...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}

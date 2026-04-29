"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { motion, useReducedMotion } from "motion/react";
import { Loader2, Globe, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const { user, dbUser, loading, dbUserLoading, signInWithGoogle } = useAuth();
  const router = useRouter();
  const reduce = useReducedMotion();
  const [signingIn, setSigningIn] = useState(false);

  // Prefetch the dashboard bundle on mount so the post-login navigation feels
  // instant once the Firebase user resolves.
  useEffect(() => {
    try { router.prefetch("/dashboard"); } catch {}
    try { router.prefetch("/onboarding"); } catch {}
  }, [router]);

  useEffect(() => {
    // Route the moment Firebase confirms the user — do NOT wait for the
    // Firestore profile fetch. Waiting for `dbUserLoading` to settle keeps the
    // user staring at the login form for several seconds on slow networks.
    // The dashboard's own AuthGuard handles the profile check (and bounces to
    // /onboarding if profile_completed=false), so this is safe.
    if (loading) return;
    if (!user) return;
    // If we already know the profile is incomplete, skip the dashboard hop and
    // go straight to onboarding. Otherwise (profile complete OR not yet known)
    // send to /dashboard — AuthGuard will re-route to /onboarding if needed
    // once the Firestore doc resolves.
    if (!dbUserLoading && dbUser && !dbUser.profile_completed) {
      router.replace("/onboarding");
    } else {
      router.replace("/dashboard");
    }
  }, [user, dbUser, loading, dbUserLoading, router]);

  const handleGoogleLogin = async () => {
    if (signingIn) return;
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } catch {
      /* toast already shown in context */
    } finally {
      // For redirect flow the page navigates away; for popup flow we re-enable.
      setSigningIn(false);
    }
  };

  // Show the redirecting state as soon as we have a user — the navigation is
  // already queued in the effect above, so we shouldn't keep offering the
  // sign-in button.
  const isRedirecting = !loading && !!user;

  return (
    <div className="min-h-screen mesh-gradient aurora-bg starfield flex items-center justify-center relative overflow-hidden px-4 sm:px-6" dir="rtl">
      <Link href="/" className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4 icon-flip" /> العودة للرئيسية
      </Link>

      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20 }}
        animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
        transition={{ duration: reduce ? 0.2 : 0.5 }}
        className="w-full max-w-md z-10 py-6"
      >
        <div className="glass-panel rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 md:p-10 shadow-2xl text-center space-y-6 sm:space-y-7">
          <div className="flex flex-col items-center gap-4 sm:gap-5">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/40 via-indigo-500/40 to-fuchsia-500/40 blur-2xl logo-halo" />
              <div className="relative w-full h-full rounded-2xl border border-white/10 bg-[#070A18]/70 flex items-center justify-center">
                <Image src="/brand/kalmeron-mark.svg" alt="Kalmeron AI" width={120} height={120} className="w-[78%] h-[78%] object-contain" priority />
              </div>
            </div>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white mb-2">أهلاً بعودتك</h1>
              <p className="text-neutral-400 text-sm leading-relaxed">
                سجّل دخولك للمتابعة إلى لوحة تحكم كلميرون.
              </p>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={signingIn || loading || isRedirecting}
            className="w-full flex items-center justify-center gap-3 h-14 rounded-2xl bg-white text-black font-bold text-base hover:bg-neutral-100 transition-all hover:scale-[1.02] active:scale-[0.99] shadow-lg disabled:opacity-70 disabled:cursor-wait disabled:hover:scale-100"
          >
            {signingIn || isRedirecting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {isRedirecting ? "جارِ التحويل..." : "جارِ تسجيل الدخول..."}
              </>
            ) : (
              <>
                <Globe className="w-5 h-5" />
                تسجيل الدخول باستخدام Google
              </>
            )}
          </button>

          <div className="relative flex items-center gap-3 text-xs text-neutral-600">
            <span className="flex-1 h-px bg-white/[0.08]" />
            <span>أو</span>
            <span className="flex-1 h-px bg-white/[0.08]" />
          </div>

          <p className="text-neutral-400 text-sm">
            ليس لديك حساب؟{" "}
            <Link href="/auth/signup" className="text-cyan-300 hover:text-cyan-200 hover:underline font-bold">
              سجل الآن مجاناً
            </Link>
          </p>

          <p className="text-neutral-600 text-[11px] leading-relaxed">
            بتسجيل الدخول، أنت توافق على{" "}
            <Link href="/terms" className="underline hover:text-neutral-300">شروط الاستخدام</Link>
            {" "}و{" "}
            <Link href="/privacy" className="underline hover:text-neutral-300">سياسة الخصوصية</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

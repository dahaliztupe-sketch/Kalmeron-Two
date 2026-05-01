"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { motion, useReducedMotion } from "motion/react";
import { Loader2, Globe, Check, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ReferralCapture, attributeReferralIfAny } from "@/components/auth/ReferralCapture";

const PERKS = [
  "وصول مجاني للأبد للأفكار الأولى",
  "٥٧ مساعداً ذكياً متخصصاً عبر ٧ أقسام",
  "تحليل أسواق وخطط مالية جاهزة",
  "بدون بطاقة ائتمان",
];

export default function SignUpPage() {
  const { user, dbUser, loading, dbUserLoading, signInWithGoogle } = useAuth();
  const router = useRouter();
  const reduce = useReducedMotion();
  const [signingIn, setSigningIn] = useState(false);

  // Referral attribution can fire as soon as we have a Firebase user — it does
  // not depend on the Firestore profile.
  useEffect(() => {
    if (!loading && user) {
      user.getIdToken().then((t) => attributeReferralIfAny(t)).catch(() => {});
    }
  }, [user, loading]);

  // Prefetch likely destinations so the post-signup hop feels instant.
  useEffect(() => {
    try { router.prefetch("/onboarding"); } catch {}
    try { router.prefetch("/dashboard"); } catch {}
  }, [router]);

  useEffect(() => {
    // Route the moment Firebase confirms the user — do NOT block on the
    // Firestore profile fetch. New signups will (correctly) land on
    // /onboarding because their fresh user doc has profile_completed=false.
    // Existing users who happen to sign in via the signup page get sent to
    // /dashboard once we know their profile is complete; until then we send
    // them to /dashboard and let AuthGuard re-route to /onboarding only if
    // truly needed. This avoids leaving the user staring at the signup form
    // for several seconds on slow networks.
    if (loading) return;
    if (!user) return;
    if (!dbUserLoading && dbUser && !dbUser.profile_completed) {
      router.replace("/onboarding");
    } else if (!dbUserLoading && dbUser && dbUser.profile_completed) {
      router.replace("/dashboard");
    } else {
      // Profile not yet known — default to onboarding because the vast
      // majority of users hitting /auth/signup are new. AuthGuard / the
      // onboarding page itself will bounce already-onboarded users to
      // /dashboard once Firestore resolves.
      router.replace("/onboarding");
    }
  }, [user, dbUser, loading, dbUserLoading, router]);

  const handleGoogleSignUp = async () => {
    if (signingIn) return;
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } catch {
      /* toast already shown in context */
    } finally {
      setSigningIn(false);
    }
  };

  // Show the redirecting state as soon as we have a user — navigation is
  // already queued, no need to keep offering the sign-up button.
  const isRedirecting = !loading && !!user;

  return (
    <div className="min-h-screen mesh-gradient aurora-bg starfield flex items-center justify-center relative px-4 sm:px-6 py-16 sm:py-12" dir="rtl">
      <Suspense fallback={null}>
        <ReferralCapture />
      </Suspense>
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
              {/* Brand name kept exactly as the e2e onboarding spec asserts:
                  "انضم إلى كلميرون تو" — must remain a contiguous text node so
                  Playwright's getByText(string, { exact:false }) matches it. */}
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white mb-2">انضم إلى كلميرون تو</h1>
              <p className="text-neutral-400 text-sm leading-relaxed">
                ابدأ رحلتك مع فريق مساعدين ذكي يعمل لصالحك.
              </p>
            </div>
          </div>

          <ul className="text-right space-y-2.5">
            {PERKS.map((p) => (
              <li key={p} className="flex items-center gap-2.5 text-sm text-neutral-300">
                <span className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-emerald-300" />
                </span>
                {p}
              </li>
            ))}
          </ul>

          <button
            onClick={handleGoogleSignUp}
            disabled={signingIn || loading || isRedirecting}
            className="w-full flex items-center justify-center gap-3 h-14 rounded-2xl bg-white text-black font-bold text-base hover:bg-neutral-100 transition-all hover:scale-[1.02] active:scale-[0.99] shadow-lg disabled:opacity-70 disabled:cursor-wait disabled:hover:scale-100"
          >
            {signingIn || isRedirecting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {isRedirecting ? "جارِ التحويل..." : "جارِ إنشاء الحساب..."}
              </>
            ) : (
              <>
                <Globe className="w-5 h-5" />
                التسجيل باستخدام Google
              </>
            )}
          </button>

          <p className="text-neutral-400 text-sm">
            لديك حساب بالفعل؟{" "}
            <Link href="/auth/login" className="text-cyan-300 hover:text-cyan-200 hover:underline font-bold">
              سجّل دخولك
            </Link>
          </p>

          <p className="text-neutral-600 text-[11px] leading-relaxed">
            بالتسجيل، أنت توافق على{" "}
            <Link href="/terms" className="underline hover:text-neutral-300">شروط الاستخدام</Link>
            {" "}و{" "}
            <Link href="/privacy" className="underline hover:text-neutral-300">سياسة الخصوصية</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

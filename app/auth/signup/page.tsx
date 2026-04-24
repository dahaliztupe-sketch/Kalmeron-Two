"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { motion, useReducedMotion } from "motion/react";
import { Loader2, Chrome, Check, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ReferralCapture, attributeReferralIfAny } from "@/components/auth/ReferralCapture";

const PERKS = [
  "وصول مجاني للأبد للأفكار الأولى",
  "16 مساعداً ذكياً متخصصاً عبر 7 أقسام",
  "تحليل أسواق وخطط مالية جاهزة",
  "بدون بطاقة ائتمان",
];

export default function SignUpPage() {
  const { user, dbUser, loading, signInWithGoogle } = useAuth();
  const router = useRouter();
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!loading && user) {
      // attempt to attribute any captured referral code
      user.getIdToken().then((t) => attributeReferralIfAny(t)).catch(() => {});
      if (!dbUser?.profile_completed) router.replace("/onboarding");
      else router.replace("/dashboard");
    }
  }, [user, dbUser, loading, router]);

  const handleGoogleSignUp = async () => {
    try { await signInWithGoogle(); } catch { /* toast */ }
  };

  if (loading) {
    return (
      <div className="min-h-screen mesh-gradient flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen mesh-gradient aurora-bg starfield flex items-center justify-center relative overflow-hidden" dir="rtl">
      <Suspense fallback={null}>
        <ReferralCapture />
      </Suspense>
      <Link href="/" className="absolute top-6 right-6 z-20 inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4 icon-flip" /> العودة للرئيسية
      </Link>

      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20 }}
        animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
        transition={{ duration: reduce ? 0.2 : 0.5 }}
        className="w-full max-w-md z-10 p-6"
      >
        <div className="glass-panel rounded-[2.5rem] p-8 md:p-10 shadow-2xl text-center space-y-7">
          <div className="flex flex-col items-center gap-5">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/40 via-indigo-500/40 to-fuchsia-500/40 blur-2xl logo-halo" />
              <div className="relative w-full h-full rounded-2xl border border-white/10 bg-[#070A18]/70 flex items-center justify-center">
                <img src="/brand/kalmeron-mark.svg" alt="Kalmeron AI" className="w-[78%] h-[78%] object-contain" />
              </div>
            </div>
            <div>
              <h1 className="font-display text-3xl font-extrabold text-white mb-2">انضم إلى كلميرون</h1>
              <p className="text-neutral-400 text-sm leading-relaxed">
                ابدأ رحلتك مع فريق وكلاء ذكي يعمل لصالحك.
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
            className="w-full flex items-center justify-center gap-3 h-14 rounded-2xl bg-white text-black font-bold text-base hover:bg-neutral-100 transition-all hover:scale-[1.02] active:scale-[0.99] shadow-lg"
          >
            <Chrome className="w-5 h-5" />
            التسجيل باستخدام Google
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

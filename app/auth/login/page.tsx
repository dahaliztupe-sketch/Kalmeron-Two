"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { motion, useReducedMotion } from "motion/react";
import { Loader2, Chrome, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const { user, dbUser, loading, signInWithGoogle } = useAuth();
  const router = useRouter();
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!loading && user) {
      if (!dbUser?.profile_completed) router.replace("/onboarding");
      else router.replace("/dashboard");
    }
  }, [user, dbUser, loading, router]);

  const handleGoogleLogin = async () => {
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
                <Image src="/brand/kalmeron-mark.svg" alt="Kalmeron AI" width={120} height={120} className="w-[78%] h-[78%] object-contain" priority />
              </div>
            </div>
            <div>
              <h1 className="font-display text-3xl font-extrabold text-white mb-2">أهلاً بعودتك</h1>
              <p className="text-neutral-400 text-sm leading-relaxed">
                سجّل دخولك للمتابعة إلى لوحة تحكم كلميرون.
              </p>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 h-14 rounded-2xl bg-white text-black font-bold text-base hover:bg-neutral-100 transition-all hover:scale-[1.02] active:scale-[0.99] shadow-lg"
          >
            <Chrome className="w-5 h-5" />
            تسجيل الدخول باستخدام Google
          </button>

          <div className="relative flex items-center gap-3 text-xs text-neutral-600">
            <span className="flex-1 h-px bg-white/[0.08]" />
            <span>OR</span>
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

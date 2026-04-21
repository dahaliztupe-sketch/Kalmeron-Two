"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Loader2, Chrome } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  const { user, dbUser, loading, signInWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (!dbUser?.profile_completed) {
        router.replace("/onboarding");
      } else {
        router.replace("/dashboard");
      }
    }
  }, [user, dbUser, loading, router]);

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch {
      // toast already shown in context
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[rgb(var(--gold))] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center relative overflow-hidden" dir="rtl">
      <div className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-[rgb(var(--gold))] opacity-10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[rgb(var(--tech-blue,10,102,194))] opacity-10 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10 p-6"
      >
        <div className="glass border border-white/10 rounded-[2.5rem] p-10 shadow-2xl text-center space-y-8">
          <div className="flex flex-col items-center gap-4">
            <Image src="/brand/logo.svg" alt="Kalmeron Two" width={160} height={48} style={{ height: '3rem', width: 'auto' }} />
            <h1 className="text-3xl font-black text-white">أهلاً بعودتك</h1>
            <p className="text-neutral-400 text-base leading-relaxed">
              سجّل دخولك للمتابعة إلى لوحة تحكم كلميرون تو.
            </p>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 h-14 rounded-2xl bg-white text-black font-bold text-lg hover:bg-neutral-100 transition-all hover:scale-[1.02] shadow-lg"
          >
            <Chrome className="w-6 h-6" />
            تسجيل الدخول باستخدام Google
          </button>

          <p className="text-neutral-500 text-sm">
            ليس لديك حساب؟{" "}
            <Link href="/auth/signup" className="text-[rgb(var(--gold))] hover:underline font-bold">
              سجل الآن
            </Link>
          </p>

          <p className="text-neutral-600 text-xs leading-relaxed">
            بتسجيل الدخول، أنت توافق على{" "}
            <Link href="/terms" className="underline hover:text-neutral-400">شروط الاستخدام</Link>
            {" "}و{" "}
            <Link href="/privacy" className="underline hover:text-neutral-400">سياسة الخصوصية</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

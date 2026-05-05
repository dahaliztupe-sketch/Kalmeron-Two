"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, X, ArrowLeft, Zap } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface UsageData {
  plan: string;
  dailyBalance: number;
  dailyLimit: number;
}

export function UpgradeBanner() {
  const { user } = useAuth();
  const [data, setData] = useState<UsageData | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!user) return;
    const key = `upgrade_banner_dismissed_${new Date().toDateString()}`;

    const load = async () => {
      if (sessionStorage.getItem(key)) { setDismissed(true); return; }
      try {
        const token = await user.getIdToken().catch(() => null);
        if (!token) return;
        const res = await fetch("/api/user/credits", { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) return;
        const j = await res.json();
        setData({
          plan: j.plan || "free",
          dailyBalance: j.dailyBalance ?? j.dailyLimit ?? 200,
          dailyLimit: j.dailyLimit || 200,
        });
      } catch { /* silent */ }
    };
    load();
  }, [user]);

  function dismiss() {
    setDismissed(true);
    const key = `upgrade_banner_dismissed_${new Date().toDateString()}`;
    sessionStorage.setItem(key, "1");
  }

  const usedPct = data && data.dailyLimit > 0
    ? Math.round(((data.dailyLimit - data.dailyBalance) / data.dailyLimit) * 100)
    : 0;

  const show = !dismissed && data && data.plan === "free" && data.dailyLimit > 0 && usedPct > 80;
  const safeUsedPct = Number.isFinite(usedPct) ? Math.max(0, Math.min(100, usedPct)) : 0;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mx-4 md:mx-0 mt-2 mb-0 flex items-center gap-3 px-4 py-3 rounded-xl border border-violet-500/30 bg-gradient-to-l from-violet-500/[0.07] to-fuchsia-500/[0.07]"
        >
          <div className="w-7 h-7 rounded-lg bg-violet-500/15 flex items-center justify-center shrink-0">
            <Zap className="w-3.5 h-3.5 text-violet-300" />
          </div>
          <p className="flex-1 text-sm text-neutral-300 leading-snug">
            استخدمت{" "}
            <span className="font-bold text-white">{safeUsedPct}%</span>{" "}
            من رصيدك اليومي —{" "}
            <Link href="/pricing" className="text-violet-300 font-semibold hover:underline">
              رقّي خطتك الآن
            </Link>{" "}
            للحصول على رصيد أكبر
          </p>
          <Link
            href="/pricing"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-colors whitespace-nowrap"
          >
            <Sparkles className="w-3 h-3" />
            ترقية <ArrowLeft className="w-3 h-3" />
          </Link>
          <button
            onClick={dismiss}
            className="w-6 h-6 rounded-lg flex items-center justify-center text-neutral-500 hover:text-white hover:bg-white/[0.06] transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

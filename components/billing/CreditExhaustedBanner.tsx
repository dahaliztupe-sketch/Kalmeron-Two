"use client";

import { motion } from "motion/react";
import { AlertCircle, Sparkles, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

interface CreditExhaustedBannerProps {
  remainingBalance?: number;
  onRetry?: () => void;
}

export function CreditExhaustedBanner({ remainingBalance, onRetry }: CreditExhaustedBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-rose-500/30 bg-rose-500/[0.06] p-5 space-y-4"
      dir="rtl"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center shrink-0">
          <AlertCircle className="w-5 h-5 text-rose-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-sm mb-1">نفد رصيدك اليومي</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            استنفذت حد استخدامك اليومي من نقاط الذكاء الاصطناعي. قم بترقية خطتك للحصول على رصيد أكبر والاستمرار في الاستفادة من المساعدين الذكيين.
          </p>
          {typeof remainingBalance === "number" && remainingBalance > 0 && (
            <p className="text-xs text-rose-300/70 mt-1">
              الرصيد المتبقي:{" "}
              <span className="font-bold text-rose-300">{remainingBalance}</span> نقطة
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 bg-gradient-to-l from-violet-600 to-fuchsia-600 hover:brightness-110 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all"
        >
          <Sparkles className="w-4 h-4" />
          ترقية الخطة
          <ArrowLeft className="w-4 h-4" />
        </Link>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white border border-white/10 hover:border-white/20 px-4 py-2 rounded-xl transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            المحاولة مجدداً
          </button>
        )}
      </div>
    </motion.div>
  );
}

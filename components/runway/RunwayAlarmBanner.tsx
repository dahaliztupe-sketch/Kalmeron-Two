"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, X, Sparkles, TrendingDown } from "lucide-react";
import { useRunwaySnapshot } from "@/hooks/useRunwaySnapshot";
import { fmtMonths } from "@/src/lib/runway/calc";

/**
 * Cash Runway Alarm — renders only when the latest snapshot drops below the
 * user's threshold (default 6 months) and the user has not dismissed it.
 *
 * Safe to mount on any authenticated page. Renders nothing while loading,
 * when the user has no snapshot, or when runway is healthy.
 */
export function RunwayAlarmBanner() {
  const { loading, hasSnapshot, shouldAlarm, result, inputs, dismiss, recommendations } =
    useRunwaySnapshot();
  const [showDetails, setShowDetails] = useState(false);
  const [hidden, setHidden] = useState(false);

  if (loading || !hasSnapshot || !shouldAlarm || hidden) return null;

  const months = fmtMonths(result.months);
  const isCritical = result.months < 3 || result.kind === "noCash";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        dir="rtl"
        className={`relative rounded-2xl border p-4 md:p-5 mb-5 ${
          isCritical
            ? "border-rose-500/40 bg-rose-500/[0.08]"
            : "border-amber-500/40 bg-amber-500/[0.08]"
        }`}
        role="alert"
        aria-live="polite"
      >
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${
              isCritical ? "bg-rose-500/20" : "bg-amber-500/20"
            }`}
          >
            {isCritical ? (
              <AlertTriangle className="w-5 h-5 text-rose-300" />
            ) : (
              <TrendingDown className="w-5 h-5 text-amber-300" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display text-base md:text-lg font-bold text-white">
                {isCritical ? "تنبيه نقد حرج" : "الـ runway تحت الحدّ الآمن"}
              </h3>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  isCritical
                    ? "bg-rose-500/30 text-rose-100"
                    : "bg-amber-500/30 text-amber-100"
                }`}
              >
                {result.kind === "noCash" ? "لا يوجد رصيد" : `${months} متبقّي`}
              </span>
            </div>
            <p className="text-sm text-text-secondary mt-1 leading-7">
              {result.kind === "noCash"
                ? "رصيدك الحالي صفر — تحرّك اليوم قبل توقّف العمليات."
                : `بناءً على آخر تحديث، يكفي رصيدك ${months} عند معدّل الحرق الحالي. الحدّ الذي ضبطته: ${inputs.thresholdMonths} شهر.`}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowDetails((v) => !v)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white transition-colors"
              >
                {showDetails ? "إخفاء التوصيات" : `عرض ${recommendations.length} توصية`}
              </button>
              <Link
                href="/cash-runway"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white transition-colors inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                حدّث الأرقام
              </Link>
              <Link
                href="/chat?q=ساعدني%20في%20تحسين%20الـ%20runway"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-100 transition-colors"
              >
                استشر CFO
              </Link>
            </div>

            {showDetails && recommendations.length > 0 && (
              <ul className="mt-4 space-y-2.5">
                {recommendations.map((rec) => (
                  <li
                    key={rec.id}
                    className="rounded-xl bg-black/30 border border-white/5 p-3"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-sm font-bold text-white leading-6">
                        {rec.title}
                      </p>
                      {typeof rec.monthsGained === "number" && rec.monthsGained > 0 && (
                        <span className="text-[11px] font-semibold text-emerald-300 whitespace-nowrap">
                          +{rec.monthsGained} شهر
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary mt-1 leading-6">
                      {rec.rationale}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            type="button"
            aria-label="إخفاء التنبيه أسبوعاً"
            title="إخفاء أسبوعاً"
            onClick={async () => {
              setHidden(true);
              await dismiss(7);
            }}
            className="shrink-0 p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

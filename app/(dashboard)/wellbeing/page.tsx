"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import { Heart, ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";

const QUESTION_KEYS = ["sleep", "energy", "focus", "support", "purpose"] as const;
type QKey = typeof QUESTION_KEYS[number];

export default function WellbeingPage() {
  const t = useTranslations("Wellbeing");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<QKey, number>>({
    sleep: 0, energy: 0, focus: 0, support: 0, purpose: 0,
  });
  const [submitted, setSubmitted] = useState(false);

  const total = QUESTION_KEYS.length;
  const currentKey = QUESTION_KEYS[step];

  const score = useMemo(() => {
    return QUESTION_KEYS.reduce((sum, k) => sum + (answers[k] || 0), 0);
  }, [answers]);

  const verdict = useMemo(() => {
    if (score >= 12) return { kind: "thrive" as const, label: t("results.thrive"), color: "from-emerald-500 to-cyan-500" };
    if (score >= 7) return { kind: "stable" as const, label: t("results.stable"), color: "from-amber-500 to-orange-500" };
    return { kind: "atRisk" as const, label: t("results.atRisk"), color: "from-rose-500 to-red-500" };
  }, [score, t]);

  const choose = (val: number) => {
    setAnswers((a) => ({ ...a, [currentKey]: val }));
    if (step < total - 1) {
      setTimeout(() => setStep((s) => s + 1), 150);
    } else {
      setTimeout(() => setSubmitted(true), 200);
    }
  };

  const goPrev = () => setStep((s) => Math.max(0, s - 1));

  return (
    <AppShell>
      <div dir="rtl" className="max-w-2xl mx-auto">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 text-xs text-pink-300 font-semibold uppercase tracking-wider mb-2">
            <Heart className="w-3.5 h-3.5" />
            MEQ
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-2">{t("title")}</h1>
          <p className="text-text-secondary text-sm leading-7">{t("subtitle")}</p>
        </div>

        {!submitted ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="glass-panel rounded-3xl p-8"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-text-secondary">
                {t("questionLabel", { current: step + 1, total })}
              </span>
              <div className="flex gap-1">
                {QUESTION_KEYS.map((k, i) => (
                  <span key={k} className={`h-1.5 w-6 rounded-full transition-colors ${
                    i < step ? "bg-emerald-400/70" : i === step ? "bg-cyan-400" : "bg-white/10"
                  }`} />
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={currentKey}
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="font-display text-xl md:text-2xl font-bold text-white mb-6 leading-relaxed">
                  {t(`questions.${currentKey}` as never)}
                </h2>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { val: 1, label: t("scale.low"), color: "border-rose-500/30 hover:bg-rose-500/15 text-rose-200" },
                    { val: 2, label: t("scale.mid"), color: "border-amber-500/30 hover:bg-amber-500/15 text-amber-200" },
                    { val: 3, label: t("scale.high"), color: "border-emerald-500/30 hover:bg-emerald-500/15 text-emerald-200" },
                  ].map(({ val, label, color }) => (
                    <button key={val} onClick={() => choose(val)}
                      className={`rounded-2xl border bg-white/[0.03] py-4 text-sm font-medium transition-all hover:scale-[1.02] ${color}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {step > 0 && (
                  <button onClick={goPrev} className="text-xs text-text-secondary hover:text-white inline-flex items-center gap-1">
                    <ArrowRight className="w-3.5 h-3.5" /> {t("previous")}
                  </button>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="glass-panel rounded-3xl p-8 text-center"
          >
            <div className={`mx-auto w-20 h-20 rounded-full bg-gradient-to-br ${verdict.color} flex items-center justify-center mb-5 shadow-2xl`}>
              <Heart className="w-9 h-9 text-white" />
            </div>
            <div className="font-display text-2xl md:text-3xl font-extrabold text-white mb-3">
              {verdict.label}
            </div>
            <div className="text-sm text-text-secondary mb-6">
              مجموع نقاطك: <span className="font-bold text-white">{score} / {total * 3}</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => { setStep(0); setSubmitted(false); setAnswers({ sleep: 0, energy: 0, focus: 0, support: 0, purpose: 0 }); }}
                className="btn-ghost px-5 py-2.5 rounded-xl text-sm"
              >
                إعادة الاختبار
              </button>
              <Link href="/chat?q=أنا متعب — كيف أحافظ على طاقتي كمؤسّس؟"
                className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold"
              >
                <Sparkles className="w-4 h-4" />
                تحدّث مع كلميرون
              </Link>
            </div>
          </motion.div>
        )}

        <div className="mt-6">
          <Link href="/dashboard" className="text-sm text-text-secondary hover:text-white inline-flex items-center gap-1.5">
            <ArrowLeft className="w-4 h-4 icon-flip" />
            العودة للوحة
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

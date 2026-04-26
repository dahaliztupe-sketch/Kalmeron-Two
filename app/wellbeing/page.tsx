"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { Heart, Sparkles, Wind, BookOpen, ArrowLeft, RotateCw, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { BURNOUT_QUESTIONS, scoreWellbeing, type WellbeingAnswer } from "@/src/lib/founder-tools/wellbeing";

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; ring: string }> = {
  red: { bg: "from-red-500/20 to-red-900/10", border: "border-red-500/40", text: "text-red-300", ring: "ring-red-500/30" },
  amber: { bg: "from-amber-500/20 to-amber-900/10", border: "border-amber-500/40", text: "text-amber-300", ring: "ring-amber-500/30" },
  cyan: { bg: "from-cyan-500/20 to-cyan-900/10", border: "border-cyan-500/40", text: "text-cyan-300", ring: "ring-cyan-500/30" },
  emerald: { bg: "from-emerald-500/20 to-emerald-900/10", border: "border-emerald-500/40", text: "text-emerald-300", ring: "ring-emerald-500/30" },
};

export default function WellbeingPage() {
  const [answers, setAnswers] = useState<Record<string, WellbeingAnswer>>({});
  const [showBreath, setShowBreath] = useState(false);

  const allAnswered = Object.keys(answers).length === BURNOUT_QUESTIONS.length;
  const result = useMemo(() => (allAnswered ? scoreWellbeing(answers) : null), [answers, allAnswered]);
  const palette = result ? COLOR_MAP[result.color] : COLOR_MAP.cyan;

  const reset = () => setAnswers({});

  return (
    <AppShell>
      <div dir="rtl" className="max-w-4xl mx-auto space-y-8 pb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-4 h-4 text-rose-400" />
            <span className="text-xs text-rose-400 font-medium uppercase tracking-wide">Founder Wellbeing Coach · الوكيل ١٧</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-2">مدرّب الصحّة النفسيّة لرائد الأعمال</h1>
          <p className="text-text-secondary max-w-2xl">
            ٨٨٪ من رواد الأعمال يعانون نفسيّاً، لكن قلّة فقط تتحدّث عن ذلك. هذا التقييم يأخذ ٣ دقايق ويعطيك صورة واضحة + خطّة عمليّة فوراً.
          </p>
        </div>

        {!result ? (
          <>
            <div className="grid gap-4">
              {BURNOUT_QUESTIONS.map((q, idx) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-5"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-rose-500/15 text-rose-300 text-sm font-bold flex-shrink-0">{idx + 1}</span>
                    <p className="text-white font-medium">{q.q}</p>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {q.labels.map((lbl, i) => {
                      const val = (i + 1) as WellbeingAnswer;
                      const selected = answers[q.id] === val;
                      return (
                        <button
                          key={i}
                          onClick={() => setAnswers((p) => ({ ...p, [q.id]: val }))}
                          className={`p-2.5 rounded-lg text-xs text-center border transition-all ${
                            selected
                              ? "bg-rose-500/20 border-rose-500/50 text-rose-100 ring-2 ring-rose-500/30"
                              : "bg-white/[0.02] border-white/10 text-neutral-400 hover:border-white/20 hover:text-neutral-200"
                          }`}
                        >
                          {lbl}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/10 sticky bottom-4 backdrop-blur-xl">
              <div className="text-sm text-neutral-400">
                أجبت على <strong className="text-white">{Object.keys(answers).length}</strong> من {BURNOUT_QUESTIONS.length}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowBreath(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-sm transition-colors"
                >
                  <Wind className="w-4 h-4" /> تنفّس فوري
                </button>
              </div>
            </div>
          </>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Result Card */}
            <div className={`relative overflow-hidden rounded-2xl border ${palette.border} bg-gradient-to-br ${palette.bg} p-8`}>
              <div className="grid md:grid-cols-3 gap-6 items-center">
                <div>
                  <div className={`inline-flex items-center gap-2 text-sm font-semibold mb-3 ${palette.text}`}>
                    تقييمك الحالي
                  </div>
                  <div className="text-4xl md:text-5xl font-black text-white mb-1">{result.label}</div>
                  <div className="text-sm text-neutral-400 mt-2">المؤشّر العامّ: {result.pct.toFixed(0)}٪</div>
                </div>
                <div className="md:col-span-2 space-y-2">
                  {result.insights.map((ins, i) => (
                    <div key={i} className="text-sm text-neutral-200 leading-relaxed bg-black/20 rounded-lg p-3 border border-white/5">{ins}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* Exercises */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-violet-400" />
                <h2 className="text-lg font-bold text-white">تمارين موصى بها لك الآن</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {result.exercises.map((ex, i) => (
                  <div key={i} className="p-4 rounded-xl bg-black/30 border border-white/10">
                    <div className="font-semibold text-white mb-2">{ex.title}</div>
                    <p className="text-xs text-neutral-300 leading-relaxed">{ex.body}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl p-4 bg-amber-500/10 border border-amber-500/30 text-sm text-amber-200 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block mb-1 text-amber-100">تنويه مهم</strong>
                هذا التقييم استرشادي وليس تشخيصاً طبّيّاً. لو شعرت بأعراض اكتئاب مستمرّة أو أفكار سلبيّة متكرّرة، تواصل مع مختصّ نفسي. في مصر: الخطّ الساخن للصحّة النفسيّة <strong>08008880700</strong>.
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button onClick={reset} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 text-sm transition-colors">
                <RotateCw className="w-4 h-4" /> إعادة التقييم
              </button>
              <button onClick={() => setShowBreath(true)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-sm transition-colors">
                <Wind className="w-4 h-4" /> ابدأ تمرين تنفّس
              </button>
              <Link href="/decision-journal" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-violet-500/15 hover:bg-violet-500/25 text-violet-300 border border-violet-500/30 text-sm transition-colors">
                <BookOpen className="w-4 h-4" /> دفتر القرارات
              </Link>
            </div>
          </motion.div>
        )}
      </div>

      {/* Breathing modal */}
      <AnimatePresence>
        {showBreath && <BreathingModal onClose={() => setShowBreath(false)} />}
      </AnimatePresence>
    </AppShell>
  );
}

function BreathingModal({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in");
  const [count, setCount] = useState(4);
  const [cycle, setCycle] = useState(0);

  // Simple 4-7-8 breathing
  useMemo(() => {
    const t = setInterval(() => {
      setCount((c) => {
        if (c > 1) return c - 1;
        setPhase((p) => {
          if (p === "in") { setCount(7); return "hold"; }
          if (p === "hold") { setCount(8); return "out"; }
          setCount(4);
          setCycle((cy) => cy + 1);
          return "in";
        });
        return c;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const phaseLabel = phase === "in" ? "اشهق" : phase === "hold" ? "احتفظ" : "ازفر";
  const scale = phase === "in" ? 1.5 : phase === "hold" ? 1.5 : 0.8;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()} className="bg-[#0a0d14] border border-white/10 rounded-2xl p-10 max-w-sm w-full text-center" dir="rtl">
        <h3 className="text-xl font-bold text-white mb-1">تنفّس ٤-٧-٨</h3>
        <p className="text-xs text-neutral-400 mb-8">يهدّئ الجهاز العصبي في ٤ دورات.</p>
        <div className="relative h-48 flex items-center justify-center mb-6">
          <motion.div
            animate={{ scale }}
            transition={{ duration: phase === "in" ? 4 : phase === "hold" ? 7 : 8, ease: "easeInOut" }}
            className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-400/40 to-violet-500/40 border-2 border-cyan-300/50 flex items-center justify-center"
          >
            <div className="text-3xl font-black text-white">{count}</div>
          </motion.div>
        </div>
        <div className="text-2xl font-bold text-cyan-300 mb-2">{phaseLabel}</div>
        <div className="text-xs text-neutral-500 mb-6">دورة {cycle + 1} من ٤</div>
        <button onClick={onClose} className="text-sm text-neutral-400 hover:text-white">إغلاق</button>
      </div>
    </motion.div>
  );
}

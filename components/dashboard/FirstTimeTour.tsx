"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Sparkles, MessageSquare, Zap, Activity, DollarSign } from "lucide-react";

const STEPS = [
  {
    icon: Sparkles,
    color: "from-cyan-500 to-indigo-500",
    title: "أهلاً بك في كلميرون! 🎉",
    desc: "مقر عمليات شركتك الذكي — ١٦ مساعداً متخصصاً يعملون معاً لمساعدتك.",
    anchor: null,
  },
  {
    icon: MessageSquare,
    color: "from-indigo-500 to-violet-500",
    title: "الإجراءات السريعة",
    desc: "انقر أي إجراء سريع لفتح محادثة مباشرة مع المساعد المناسب — CFO، قانوني، تسويق.",
    anchor: "quick-actions",
  },
  {
    icon: Activity,
    color: "from-violet-500 to-fuchsia-500",
    title: "نشاط الفريق",
    desc: "هنا تظهر كل المهام التي ينجزها فريقك الذكي في الوقت الفعلي.",
    anchor: "team-activity",
  },
  {
    icon: DollarSign,
    color: "from-emerald-500 to-teal-500",
    title: "تكلفة الاستهلاك",
    desc: "تتبّع تكلفة الذكاء الاصطناعي يومياً — شفافية كاملة، لا مفاجآت.",
    anchor: null,
  },
  {
    icon: Zap,
    color: "from-amber-500 to-orange-500",
    title: "جاهز للانطلاق!",
    desc: "ابدأ بأول محادثة مع فريقك الذكي — فقط اكتب سؤالك بأي لغة.",
    anchor: null,
  },
] as const;

const TOUR_KEY = "kalmeron_tour_done_v1";

export function FirstTimeTour() {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(TOUR_KEY)) {
        setTimeout(() => setVisible(true), 1200);
      }
    } catch {}
  }, []);

  const dismiss = () => {
    setVisible(false);
    try { localStorage.setItem(TOUR_KEY, "1"); } catch {}
  };

  const next = () => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      dismiss();
    }
  };

  const current = STEPS[step];
  const Icon = current.icon;

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={dismiss}
          />

          {/* Tour card */}
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm mx-4"
            dir="rtl"
          >
            <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl">
              {/* Close */}
              <button
                onClick={dismiss}
                className="absolute top-4 left-4 w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                aria-label="تخطّي الجولة"
              >
                <X className="w-3.5 h-3.5 text-white/60" />
              </button>

              {/* Step indicator */}
              <div className="flex items-center gap-1.5 mb-4">
                {STEPS.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      i === step ? "w-6 bg-brand-cyan" : i < step ? "w-3 bg-brand-cyan/40" : "w-3 bg-white/10"
                    }`}
                  />
                ))}
              </div>

              {/* Icon */}
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${current.color} flex items-center justify-center mb-4 shadow-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>

              {/* Content */}
              <h3 className="font-display text-lg font-bold text-white mb-2">{current.title}</h3>
              <p className="text-sm text-text-secondary leading-7 mb-5">{current.desc}</p>

              {/* Actions */}
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={dismiss}
                  className="text-xs text-text-secondary hover:text-white transition-colors"
                >
                  تخطّي الجولة
                </button>
                <button
                  onClick={next}
                  className="btn-primary text-sm font-bold px-5 py-2 rounded-xl"
                >
                  {step < STEPS.length - 1 ? "التالي" : "ابدأ الآن!"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

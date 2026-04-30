"use client";

/**
 * StartClient — تجربة دخول المحادثة على نمط Claude / ChatGPT.
 *
 * تجربة من خطوتين:
 * 1. شاشة ترحيب أنيقة مع تحية شخصية (إن سُجِّل المستخدم) و suggested prompts
 * 2. عند الكتابة أو اختيار اقتراح → ينتقل بسلاسة إلى /dashboard/chat?initial=...
 *
 * استخدام animate presence من motion/react لانتقال smooth fade + slide.
 */

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Send, ArrowLeft, Loader2, Brain, FileText, ShieldAlert, Radar, Briefcase, Scale } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const STARTER_PROMPTS = [
  {
    icon: Brain,
    title: "حلل فكرة مشروع",
    prompt: "عندي فكرة مشروع صيدلية أونلاين في مصر، حللها لي من ناحية الجدوى والمنافسة.",
    color: "from-cyan-500 to-blue-500",
  },
  {
    icon: FileText,
    title: "اكتب خطة عمل",
    prompt: "ساعدني في كتابة خطة عمل تفصيلية لمطعم أكلات شعبية في القاهرة.",
    color: "from-indigo-500 to-purple-500",
  },
  {
    icon: ShieldAlert,
    title: "اكشف الأخطاء القاتلة",
    prompt: "ما الأخطاء الشائعة التي تقتل المشاريع الناشئة في السوق المصري؟",
    color: "from-rose-500 to-pink-500",
  },
  {
    icon: Radar,
    title: "ابحث عن فرص تمويل",
    prompt: "اعرض علي أحدث فرص التمويل والمسرعات المتاحة لرواد الأعمال في مصر.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: Briefcase,
    title: "حلل مالي تفصيلي",
    prompt: "احسب لي نقطة التعادل والـ ROI لمشروع رأس ماله 500 ألف جنيه.",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: Scale,
    title: "استشارة قانونية",
    prompt: "ما الإجراءات القانونية اللازمة لتأسيس شركة ذات مسؤولية محدودة في مصر؟",
    color: "from-violet-500 to-fuchsia-500",
  },
];

export default function StartClient() {
  const router = useRouter();
  const { user, dbUser } = useAuth();
  const [input, setInput] = useState("");
  const [isLeaving, setIsLeaving] = useState(false);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 5) return "ساعات الإلهام الهادئة";
    if (h < 12) return "صباح الخير";
    if (h < 18) return "مساء النور";
    return "مساء الخير";
  })();

  const name = dbUser?.display_name || user?.displayName?.split(" ")[0] || "";

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleSubmit(prompt: string) {
    const text = prompt.trim();
    if (!text) return;
    setIsLeaving(true);
    startTransition(() => {
      const url = `/dashboard/chat?q=${encodeURIComponent(text)}`;
      // delay a frame so exit animation can play
      setTimeout(() => router.push(url), 350);
    });
  }

  return (
    <main
      dir="rtl"
      className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-background to-primary/5"
    >
      {/* Animated background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <motion.div
          className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      <AnimatePresence mode="wait">
        {!isLeaving ? (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30, scale: 0.98 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col px-4 py-12"
          >
            {/* Header */}
            <header className="mb-10 mt-12 text-center">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-indigo-600 shadow-lg"
              >
                <Sparkles className="h-8 w-8 text-white" aria-hidden="true" />
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-2 text-4xl font-bold tracking-tight md:text-5xl"
              >
                {name ? `${greeting}، ${name}` : greeting}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg text-muted-foreground md:text-xl"
              >
                كيف أقدر أساعدك اليوم؟
              </motion.p>
            </header>

            {/* Starter prompts */}
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              aria-label="اقتراحات سريعة"
              className="mb-8 grid gap-3 sm:grid-cols-2"
            >
              {STARTER_PROMPTS.map((p, i) => {
                const Icon = p.icon;
                return (
                  <motion.button
                    key={p.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.05 }}
                    whileHover={{ y: -2, transition: { duration: 0.15 } }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSubmit(p.prompt)}
                    className="group relative overflow-hidden rounded-xl border bg-card p-4 text-right shadow-sm transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label={`بدء محادثة: ${p.title}`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${p.color} opacity-0 transition-opacity group-hover:opacity-5`} aria-hidden="true" />
                    <div className="flex items-start gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${p.color} text-white shadow-sm`}>
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div className="flex-1">
                        <h3 className="mb-1 font-semibold">{p.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{p.prompt}</p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </motion.section>

            {/* Input box */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(input);
              }}
              className="sticky bottom-6 mt-auto"
            >
              <div className="relative rounded-2xl border bg-background shadow-xl ring-1 ring-black/5 dark:ring-white/10">
                <label htmlFor="start-input" className="sr-only">اكتب سؤالك أو فكرة مشروعك</label>
                <textarea
                  id="start-input"
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(input);
                    }
                  }}
                  placeholder="اكتب فكرتك أو سؤالك هنا… (Enter للإرسال، Shift+Enter لسطر جديد)"
                  rows={2}
                  className="w-full resize-none rounded-2xl bg-transparent px-5 py-4 pl-14 text-base focus:outline-none"
                  aria-label="نص الرسالة"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isPending}
                  className="absolute bottom-3 left-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
                  aria-label="إرسال الرسالة"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Send className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                المحادثة مشفّرة وآمنة. إجاباتنا قد تحتاج للتحقق قبل اعتمادها كقرار نهائي.
              </p>
            </motion.form>
          </motion.div>
        ) : (
          <motion.div
            key="leaving"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 flex min-h-screen items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center gap-4 text-center"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-indigo-600 shadow-2xl">
                <ArrowLeft className="h-10 w-10 animate-pulse text-white" aria-hidden="true" />
              </div>
              <p className="text-lg font-medium text-muted-foreground">جاري تجهيز المحادثة…</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Heart, Brain, Sparkles, ArrowLeft, RefreshCw,
  MessageSquare, Loader2, Zap, Moon, Target, Users, Sun,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";

const SCORE_QUESTIONS = [
  { key: "energy",  label: "مستوى طاقتك",      sub: "كيف تشعر بطاقتك الجسدية والذهنية؟",      icon: Zap,     color: "from-amber-500 to-orange-500" },
  { key: "sleep",   label: "جودة نومك",          sub: "هل تنام جيداً وتستيقظ منتعشاً؟",          icon: Moon,    color: "from-indigo-500 to-violet-500" },
  { key: "focus",   label: "مستوى تركيزك",       sub: "هل تستطيع التركيز على ما يهم؟",           icon: Target,  color: "from-cyan-500 to-blue-500" },
  { key: "stress",  label: "الضغط النفسي",       sub: "١ = ضغط شديد جداً، ٥ = هادئ ومتوازن",    icon: Brain,   color: "from-rose-500 to-pink-500" },
  { key: "purpose", label: "الهدف والمعنى",       sub: "هل تشعر أن عملك ذو معنى حقيقي؟",         icon: Sun,     color: "from-emerald-500 to-teal-500" },
  { key: "social",  label: "الدعم الاجتماعي",    sub: "هل لديك من يدعمك ويسمعك؟",               icon: Users,   color: "from-fuchsia-500 to-purple-500" },
] as const;

type ScoreKey = typeof SCORE_QUESTIONS[number]["key"];
const RATING_LABELS = ["ضعيف جداً", "ضعيف", "متوسط", "جيد", "ممتاز"];

type Mode = "home" | "assessment" | "checkin" | "results";

export default function WellbeingPage() {
  const { user } = useAuth();
  const [mode, setMode] = useState<Mode>("home");
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Partial<Record<ScoreKey, number>>>({});
  const [context, setContext] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkinMood, setCheckinMood] = useState("");
  const [checkinResult, setCheckinResult] = useState("");
  const [checkinLoading, setCheckinLoading] = useState(false);

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const pct = Object.keys(scores).length === SCORE_QUESTIONS.length
    ? Math.round((totalScore / (SCORE_QUESTIONS.length * 5)) * 100)
    : 0;

  const verdict =
    pct >= 75 ? { label: "مزدهر 🌱", color: "from-emerald-500 to-teal-500", border: "border-emerald-500/30 bg-emerald-500/5" }
    : pct >= 50 ? { label: "مستقر ⚖️",  color: "from-amber-500 to-orange-500", border: "border-amber-500/30 bg-amber-500/5" }
    : pct >= 30 ? { label: "تحت ضغط ⚡", color: "from-orange-500 to-red-500",  border: "border-orange-500/30 bg-orange-500/5" }
    : { label: "يحتاج دعم 🤝", color: "from-rose-500 to-pink-500", border: "border-rose-500/30 bg-rose-500/5" };

  const chooseScore = useCallback((val: number) => {
    const key = SCORE_QUESTIONS[step].key;
    setScores(prev => ({ ...prev, [key]: val }));
    if (step < SCORE_QUESTIONS.length - 1) {
      setTimeout(() => setStep(s => s + 1), 200);
    } else {
      setTimeout(() => setMode("results"), 300);
    }
  }, [step]);

  const getAIAnalysis = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    setAiResult("");
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (user) headers["Authorization"] = `Bearer ${await user.getIdToken()}`;
      const res = await fetch("/api/wellbeing", {
        method: "POST",
        headers,
        body: JSON.stringify({ scores, context }),
      });
      const data = await res.json();
      setAiResult(data.result ?? "حدث خطأ في التحليل");
    } catch {
      setAiResult("تعذّر الاتصال بالمساعد. تحقق من الاتصال بالإنترنت.");
    } finally {
      setLoading(false);
    }
  }, [scores, context, user, loading]);

  const sendCheckin = useCallback(async () => {
    if (!checkinMood.trim() || checkinLoading) return;
    setCheckinLoading(true);
    setCheckinResult("");
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (user) headers["Authorization"] = `Bearer ${await user.getIdToken()}`;
      const res = await fetch("/api/wellbeing", {
        method: "POST",
        headers,
        body: JSON.stringify({ mode: "checkin", mood: checkinMood }),
      });
      const data = await res.json();
      setCheckinResult(data.result ?? "");
    } catch {
      setCheckinResult("تعذّر الاتصال. حاول مرة أخرى.");
    } finally {
      setCheckinLoading(false);
    }
  }, [checkinMood, checkinLoading, user]);

  const reset = () => {
    setMode("home"); setStep(0); setScores({}); setContext(""); setAiResult("");
    setCheckinMood(""); setCheckinResult("");
  };

  return (
    <AppShell>
      <div dir="rtl" className="max-w-3xl mx-auto space-y-6 pb-16">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4 text-rose-400" />
              <span className="text-xs text-rose-400 font-medium uppercase tracking-wide">Wellbeing Coach</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-2">صحتك النفسية</h1>
            <p className="text-white/50 max-w-xl text-sm">ريادة الأعمال مسيرة طويلة — صحتك هي الأصل الحقيقي.</p>
          </div>
          <Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors">
            <ArrowLeft className="w-4 h-4" /> لوحة القيادة
          </Link>
        </div>

        <AnimatePresence mode="wait">
          {/* HOME */}
          {mode === "home" && (
            <motion.div key="home" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button onClick={() => { setMode("assessment"); setStep(0); }}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-right hover:border-rose-500/30 hover:bg-rose-500/5 transition-all">
                  <Heart className="w-8 h-8 text-rose-400 mb-3" />
                  <h3 className="font-bold text-white text-lg mb-1">تقييم الرفاه الكامل</h3>
                  <p className="text-white/50 text-sm">٦ أسئلة + تحليل AI مخصّص لوضعك الآن</p>
                  <div className="mt-4 text-xs text-rose-400 font-medium">~ ٥ دقائق ←</div>
                </button>
                <button onClick={() => setMode("checkin")}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-right hover:border-violet-500/30 hover:bg-violet-500/5 transition-all">
                  <MessageSquare className="w-8 h-8 text-violet-400 mb-3" />
                  <h3 className="font-bold text-white text-lg mb-1">تسجيل يومي سريع</h3>
                  <p className="text-white/50 text-sm">اكتب كيف حالك والمدرب يردّ بما تحتاج سماعه</p>
                  <div className="mt-4 text-xs text-violet-400 font-medium">~ دقيقة ←</div>
                </button>
              </div>
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-semibold text-white">لماذا يهم هذا؟</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm text-white/60">
                  {[
                    { n: "٨٨٪", t: "من رواد الأعمال يعانون ضغطاً حاداً" },
                    { n: "٦٥٪", t: "من الفشل سببه إرهاق المؤسس لا المنتج" },
                    { n: "٣×",  t: "أداء أعلى عند الاعتناء بالصحة النفسية" },
                  ].map(({ n, t: text }) => (
                    <div key={n} className="rounded-xl bg-white/[0.03] p-3">
                      <div className="text-2xl font-bold text-white mb-1">{n}</div>
                      {text}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ASSESSMENT */}
          {mode === "assessment" && (
            <motion.div key={`q-${step}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="flex items-center gap-2">
                {SCORE_QUESTIONS.map((_, i) => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i < step ? "bg-rose-500" : i === step ? "bg-white/60" : "bg-white/10"}`} />
                ))}
              </div>
              {(() => {
                const q = SCORE_QUESTIONS[step];
                const Icon = q.icon;
                return (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 space-y-6">
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${q.color} opacity-90`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="font-display text-2xl font-bold text-white mb-1">{q.label}</h2>
                      <p className="text-white/60 text-sm">{q.sub}</p>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {[1, 2, 3, 4, 5].map(v => (
                        <button key={v} onClick={() => chooseScore(v)}
                          className={`rounded-xl border-2 p-4 flex flex-col items-center gap-1.5 transition-all hover:scale-105 ${scores[q.key] === v ? "border-rose-500 bg-rose-500/20 text-white" : "border-white/10 bg-white/[0.03] text-white/40 hover:border-rose-500/40 hover:text-white/80"}`}>
                          <span className="text-xl font-bold">{v}</span>
                          <span className="text-[9px] text-center leading-tight">{RATING_LABELS[v - 1]}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}
              <button onClick={reset} className="text-sm text-white/30 hover:text-white/60 transition-colors">إلغاء</button>
            </motion.div>
          )}

          {/* CHECKIN */}
          {mode === "checkin" && (
            <motion.div key="checkin" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-6">
                <h2 className="font-bold text-white text-xl mb-2">كيف حالك اليوم؟</h2>
                <p className="text-white/50 text-sm mb-4">اكتب ما تشعر به بصدق — الفرح، القلق، الإرهاق، التشوّق. المدرب هنا.</p>
                <textarea
                  value={checkinMood}
                  onChange={e => setCheckinMood(e.target.value)}
                  placeholder="مثال: اليوم كان ثقيلاً — اجتماع صعب مع الفريق وضغط من الديدلاين..."
                  rows={4}
                  className="w-full rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder:text-white/25 p-4 text-sm resize-none focus:outline-none focus:border-violet-500/50 transition-colors mb-3"
                />
                <div className="flex items-center gap-3">
                  <button onClick={sendCheckin} disabled={!checkinMood.trim() || checkinLoading}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-500 hover:bg-violet-600 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    {checkinLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {checkinLoading ? "يحلل..." : "أرسل"}
                  </button>
                  <button onClick={reset} className="text-sm text-white/30 hover:text-white/60 transition-colors">رجوع</button>
                </div>
              </div>
              {checkinResult && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Heart className="w-4 h-4 text-rose-400" />
                    <span className="text-sm font-semibold text-white">مدرب الرفاه</span>
                  </div>
                  <div className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{checkinResult}</div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* RESULTS */}
          {mode === "results" && (
            <motion.div key="results" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <div className={`rounded-2xl border p-6 ${verdict.border}`}>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="text-xs text-white/50 mb-1">نتيجتك</div>
                    <div className={`text-3xl font-black bg-gradient-to-r ${verdict.color} bg-clip-text text-transparent`}>{verdict.label}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-5xl font-black text-white">{pct}٪</div>
                    <div className="text-xs text-white/40 mt-1">درجة الرفاه</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {SCORE_QUESTIONS.map(q => (
                    <div key={q.key} className="rounded-xl bg-white/[0.05] p-3 text-center">
                      <div className="text-xl font-bold text-white">{scores[q.key] ?? 0}/5</div>
                      <div className="text-[10px] text-white/50 mt-0.5">{q.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <label className="block text-sm text-white/60 mb-2">أضف سياقاً للمدرب (اختياري)</label>
                <textarea
                  value={context}
                  onChange={e => setContext(e.target.value)}
                  placeholder="مثلاً: هذا الأسبوع مررت بخلاف مع الشريك، أو الشهر الماضي كان قاسياً..."
                  rows={3}
                  className="w-full rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder:text-white/25 p-3 text-sm resize-none focus:outline-none focus:border-rose-500/50 transition-colors mb-3"
                />
                <button onClick={getAIAnalysis} disabled={loading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {loading ? "يحلل ويوصي..." : "احصل على تحليل AI مخصص"}
                </button>
              </div>

              {aiResult && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Brain className="w-4 h-4 text-rose-400" />
                    <span className="text-sm font-semibold text-white">تحليل مدرب الرفاه</span>
                  </div>
                  <div className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{aiResult}</div>
                </motion.div>
              )}

              <button onClick={reset} className="flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors">
                <RefreshCw className="w-3.5 h-3.5" /> تقييم جديد
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}

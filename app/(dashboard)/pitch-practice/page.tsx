"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Mic, Sparkles, ArrowLeft, Loader2, CheckCircle2,
  MessageSquare, HelpCircle, Copy, Check, RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";

const AUDIENCES = [
  "مستثمر Angel مصري (Flat6Labs / Algebra)", "مستثمر VC منطقة MENA",
  "مستثمر أجنبي (US/Europe)", "شريك استراتيجي", "عميل مؤسسي كبير",
];

const STAGES = [
  { value: "pre-seed", label: "Pre-Seed (فكرة / MVP)" },
  { value: "seed", label: "Seed (منتج + Traction مبكر)" },
  { value: "series-a", label: "Series A (نمو مثبت)" },
  { value: "growth", label: "Growth (توسع)" },
];

type Mode = "menu" | "feedback" | "questions" | "result";

export default function PitchPracticePage() {
  const { user } = useAuth();
  const [mode, setMode] = useState<Mode>("menu");
  const [pitch, setPitch] = useState("");
  const [idea, setIdea] = useState("");
  const [audience, setAudience] = useState(AUDIENCES[0]);
  const [stage, setStage] = useState(STAGES[0].value);
  const [result, setResult] = useState("");
  const [resultMode, setResultMode] = useState<"feedback" | "questions">("feedback");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const callApi = useCallback(async (apiMode: "feedback" | "questions") => {
    setLoading(true);
    setError("");
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (user) headers["Authorization"] = `Bearer ${await user.getIdToken()}`;

      const body = apiMode === "feedback"
        ? { mode: "feedback", pitch, audience }
        : { mode: "questions", idea, stage };

      const res = await fetch("/api/pitch-practice", { method: "POST", headers, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطأ");
      setResult(data.result ?? "");
      setResultMode(apiMode);
      setMode("result");
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ");
    } finally {
      setLoading(false);
    }
  }, [pitch, idea, audience, stage, user]);

  const copyResult = async () => {
    await navigator.clipboard.writeText(result).catch(() => null);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <AppShell>
      <div dir="rtl" className="max-w-3xl mx-auto space-y-6 pb-16">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Mic className="w-4 h-4 text-violet-400" />
              <span className="text-xs text-violet-400 font-medium uppercase tracking-wide">Pitch Coach</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-2">تدريب الـ Pitch</h1>
            <p className="text-white/50 max-w-xl text-sm">احصل على تغذية راجعة فورية على عرضك الاستثماري أو اختبر نفسك بأسئلة المستثمرين.</p>
          </div>
          <Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors">
            <ArrowLeft className="w-4 h-4" /> لوحة القيادة
          </Link>
        </div>

        <AnimatePresence mode="wait">
          {mode === "menu" && (
            <motion.div key="menu" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button onClick={() => setMode("feedback")}
                className="group rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-purple-500/5 p-6 text-right hover:border-violet-500/40 hover:scale-[1.02] transition-all">
                <div className="text-3xl mb-3">🎤</div>
                <div className="text-lg font-bold text-white mb-1">تقييم عرضي</div>
                <div className="text-sm text-white/50">الصق نص الـ Pitch الخاص بك واحصل على تغذية راجعة مفصّلة من مدرب AI</div>
              </button>
              <button onClick={() => setMode("questions")}
                className="group rounded-2xl border border-rose-500/20 bg-gradient-to-br from-rose-500/10 to-pink-500/5 p-6 text-right hover:border-rose-500/40 hover:scale-[1.02] transition-all">
                <div className="text-3xl mb-3">❓</div>
                <div className="text-lg font-bold text-white mb-1">أسئلة المستثمرين</div>
                <div className="text-sm text-white/50">ولّد الأسئلة الصعبة التي ستواجهها في اجتماع المستثمر وتدرّب على إجاباتها</div>
              </button>
            </motion.div>
          )}

          {mode === "feedback" && (
            <motion.div key="feedback" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <button onClick={() => setMode("menu")} className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors">
                <ArrowLeft className="w-4 h-4" /> رجوع
              </button>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
                <div>
                  <label className="block text-xs text-white/50 mb-2 font-medium">المستثمر المستهدف</label>
                  <select value={audience} onChange={e => setAudience(e.target.value)}
                    className="w-full rounded-xl bg-white/[0.04] border border-white/[0.07] text-white px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500/40 appearance-none">
                    {AUDIENCES.map(a => <option key={a} value={a} className="bg-[#0a0a1a]">{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-2 font-medium">نص الـ Pitch *</label>
                  <textarea value={pitch} onChange={e => setPitch(e.target.value)} rows={10}
                    placeholder="اكتب أو الصق نص الـ Pitch هنا — يمكن أن يكون نص Elevator Pitch أو ملاحظاتك للشرائح أو سكريبت اجتماعك القادم..."
                    className="w-full rounded-xl bg-white/[0.04] border border-white/[0.07] text-white placeholder:text-white/20 px-4 py-3 text-sm focus:outline-none focus:border-violet-500/40 transition-colors resize-none leading-relaxed" />
                  <div className="text-xs text-white/20 mt-1">{pitch.length} / 5000 حرف</div>
                </div>
              </div>
              <button onClick={() => callApi("feedback")} disabled={pitch.length < 50 || loading}
                className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-bold text-sm hover:opacity-90 disabled:opacity-40 transition-all shadow-lg shadow-violet-500/20">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                {loading ? "يحلل الـ Pitch..." : "احصل على التغذية الراجعة"}
              </button>
              {error && <p className="text-rose-400 text-sm rounded-xl border border-rose-500/20 bg-rose-500/5 p-3">{error}</p>}
            </motion.div>
          )}

          {mode === "questions" && (
            <motion.div key="questions" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <button onClick={() => setMode("menu")} className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors">
                <ArrowLeft className="w-4 h-4" /> رجوع
              </button>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
                <div>
                  <label className="block text-xs text-white/50 mb-2 font-medium">مرحلة شركتك</label>
                  <div className="grid grid-cols-2 gap-2">
                    {STAGES.map(s => (
                      <button key={s.value} onClick={() => setStage(s.value)}
                        className={`rounded-xl border p-3 text-right text-sm transition-all ${stage === s.value ? "border-rose-500/40 bg-rose-500/10 text-white" : "border-white/10 bg-white/[0.03] text-white/50 hover:border-rose-500/20"}`}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-2 font-medium">وصف الفكرة / الشركة *</label>
                  <textarea value={idea} onChange={e => setIdea(e.target.value)} rows={5}
                    placeholder="اشرح باختصار ما تبنيه، من هو عميلك، وما حجم السوق..."
                    className="w-full rounded-xl bg-white/[0.04] border border-white/[0.07] text-white placeholder:text-white/20 px-4 py-3 text-sm focus:outline-none focus:border-rose-500/40 transition-colors resize-none leading-relaxed" />
                </div>
              </div>
              <button onClick={() => callApi("questions")} disabled={idea.length < 30 || loading}
                className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-sm hover:opacity-90 disabled:opacity-40 transition-all shadow-lg shadow-rose-500/20">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <HelpCircle className="w-5 h-5" />}
                {loading ? "يولّد الأسئلة..." : "ولّد أسئلة المستثمرين"}
              </button>
              {error && <p className="text-rose-400 text-sm rounded-xl border border-rose-500/20 bg-rose-500/5 p-3">{error}</p>}
            </motion.div>
          )}

          {mode === "result" && (
            <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-semibold text-white">
                    {resultMode === "feedback" ? "تغذية راجعة على الـ Pitch" : "أسئلة المستثمرين"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={copyResult} className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 border border-white/10 rounded-lg px-3 py-1.5 transition-colors">
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? "تم" : "نسخ"}
                  </button>
                  <button onClick={() => setMode("menu")} className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 border border-violet-500/20 rounded-lg px-3 py-1.5 transition-colors">
                    <RefreshCw className="w-3 h-3" /> تدريب جديد
                  </button>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <div className="prose prose-invert prose-sm max-w-none text-white/80 leading-relaxed whitespace-pre-wrap">{result}</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link href="/ideas/analyze" className="flex items-center gap-3 rounded-xl border border-cyan-500/20 bg-white/[0.03] p-3.5 hover:border-cyan-500/40 transition-all">
                  <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="text-sm font-medium text-white">حلّل فكرتك أعمق</span>
                </Link>
                <Link href="/competitor-watch" className="flex items-center gap-3 rounded-xl border border-rose-500/20 bg-white/[0.03] p-3.5 hover:border-rose-500/40 transition-all">
                  <MessageSquare className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="text-sm font-medium text-white">رصد المنافسين</span>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}

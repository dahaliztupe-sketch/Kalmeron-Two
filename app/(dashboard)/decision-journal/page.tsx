"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BookOpen, Sparkles, ArrowLeft, Loader2, Plus, Trash2,
  Brain, CheckCircle2, Copy, Check, Calendar, Tag,
  TrendingUp, AlertCircle, RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";

type Mode = "log" | "analyze" | "postmortem";
type Impact = "high" | "medium" | "low";

interface Decision {
  id: string;
  title: string;
  context: string;
  options: string[];
  chosen: string;
  reasoning: string;
  date: string;
  impact: Impact;
  tags: string[];
  outcome?: string;
  aiAnalysis?: string;
}

const IMPACT_COLORS: Record<Impact, string> = {
  high: "text-red-400 bg-red-900/20 border-red-500/30",
  medium: "text-amber-400 bg-amber-900/20 border-amber-500/30",
  low: "text-emerald-400 bg-emerald-900/20 border-emerald-500/30",
};

const IMPACT_LABELS: Record<Impact, string> = {
  high: "عالي التأثير",
  medium: "متوسط التأثير",
  low: "منخفض التأثير",
};

const SAMPLE_DECISIONS: Decision[] = [
  {
    id: "1",
    title: "تأجيل الحصول على التمويل 6 أشهر",
    context: "عرض مستثمر ملاك بتقييم منخفض جداً في مرحلة مبكرة",
    options: ["قبول العرض بالشروط الحالية", "الرفض والاستمرار بالتمويل الذاتي", "طلب إعادة التفاوض"],
    chosen: "الرفض والاستمرار بالتمويل الذاتي",
    reasoning: "التقييم كان سيخفف حصصنا بشكل كبير. قررنا بناء منتج أقوى أولاً.",
    date: "2025-11-15",
    impact: "high",
    tags: ["تمويل", "استراتيجية"],
    outcome: "بعد 4 أشهر، حصلنا على عرض بتقييم أعلى بـ 3x.",
  },
];

export default function DecisionJournalPage() {
  const { user } = useAuth();
  const [mode, setMode] = useState<Mode>("log");
  const [decisions, setDecisions] = useState<Decision[]>(SAMPLE_DECISIONS);
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);

  // Log form
  const [title, setTitle] = useState("");
  const [context, setContext] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [chosen, setChosen] = useState("");
  const [reasoning, setReasoning] = useState("");
  const [impact, setImpact] = useState<Impact>("medium");
  const [tags, setTags] = useState("");

  // Analyze form
  const [decisionToAnalyze, setDecisionToAnalyze] = useState("");
  const [outcomeToReview, setOutcomeToReview] = useState("");

  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSaveDecision = useCallback(() => {
    if (!title.trim() || !chosen.trim()) return;
    const newDecision: Decision = {
      id: Date.now().toString(),
      title,
      context,
      options: options.filter(Boolean),
      chosen,
      reasoning,
      date: new Date().toISOString().split("T")[0],
      impact,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
    };
    setDecisions(prev => [newDecision, ...prev]);
    setTitle(""); setContext(""); setOptions(["", ""]); setChosen(""); setReasoning(""); setTags("");
  }, [title, context, options, chosen, reasoning, impact, tags]);

  const handleAnalyze = useCallback(async () => {
    if (!decisionToAnalyze.trim() || loading) return;
    setLoading(true);
    setError("");
    setResult("");
    try {
      const token = await user?.getIdToken();
      const res = await fetch("/api/decision-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ mode: "premortem", decision: decisionToAnalyze }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "حدث خطأ");
      setResult(data.result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  }, [decisionToAnalyze, loading, user]);

  const handlePostmortem = useCallback(async () => {
    if (!decisionToAnalyze.trim() || !outcomeToReview.trim() || loading) return;
    setLoading(true);
    setError("");
    setResult("");
    try {
      const token = await user?.getIdToken();
      const res = await fetch("/api/decision-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ mode: "postmortem", decision: decisionToAnalyze, outcome: outcomeToReview }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "حدث خطأ");
      setResult(data.result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  }, [decisionToAnalyze, outcomeToReview, loading, user]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [result]);

  return (
    <AppShell>
      <div className="min-h-screen bg-[#0a0a0f] text-white" dir="rtl">
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
            <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <BookOpen className="text-violet-400" size={24} />
                دفتر القرارات
              </h1>
              <p className="text-slate-400 text-sm mt-1">سجّل قراراتك الكبرى وتعلّم منها بمساعدة الذكاء الاصطناعي</p>
            </div>
          </motion.div>

          {/* Mode Tabs */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex gap-2">
            {[
              { id: "log" as Mode, label: "سجّل قراراً", icon: Plus },
              { id: "analyze" as Mode, label: "تحليل قبل القرار", icon: Brain },
              { id: "postmortem" as Mode, label: "مراجعة بعد القرار", icon: RefreshCw },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setMode(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  mode === id
                    ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg"
                    : "bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-700/60"
                }`}
              >
                <Icon size={15} /> {label}
              </button>
            ))}
          </motion.div>

          <AnimatePresence mode="wait">
            {/* Log Mode */}
            {mode === "log" && (
              <motion.div
                key="log"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 space-y-4">
                  <h2 className="font-semibold text-slate-200">تفاصيل القرار</h2>

                  <div className="space-y-3">
                    <div>
                      <label className="text-slate-400 text-sm block mb-1.5">عنوان القرار *</label>
                      <input
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="مثال: تأجيل إطلاق المنتج شهرين"
                        className="w-full bg-slate-900/70 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-sm block mb-1.5">السياق والخلفية</label>
                      <textarea
                        value={context}
                        onChange={e => setContext(e.target.value)}
                        placeholder="ما الموقف الذي دفعك لاتخاذ هذا القرار؟"
                        rows={2}
                        className="w-full bg-slate-900/70 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 resize-none focus:outline-none focus:border-violet-500/50 text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 text-sm block mb-1.5">الخيارات التي كانت متاحة</label>
                      <div className="space-y-2">
                        {options.map((opt, i) => (
                          <div key={i} className="flex gap-2">
                            <input
                              value={opt}
                              onChange={e => {
                                const newOpts = [...options];
                                newOpts[i] = e.target.value;
                                setOptions(newOpts);
                              }}
                              placeholder={`الخيار ${i + 1}`}
                              className="flex-1 bg-slate-900/70 border border-slate-700/50 rounded-xl px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 text-sm"
                            />
                            {options.length > 2 && (
                              <button
                                onClick={() => setOptions(opts => opts.filter((_, j) => j !== i))}
                                className="text-slate-500 hover:text-red-400 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={() => setOptions(opts => [...opts, ""])}
                          className="text-violet-400 hover:text-violet-300 text-sm flex items-center gap-1 transition-colors"
                        >
                          <Plus size={13} /> إضافة خيار آخر
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-400 text-sm block mb-1.5">القرار المُتخذ *</label>
                      <input
                        value={chosen}
                        onChange={e => setChosen(e.target.value)}
                        placeholder="ما الذي اخترته في النهاية؟"
                        className="w-full bg-slate-900/70 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 text-sm block mb-1.5">المنطق والأسباب</label>
                      <textarea
                        value={reasoning}
                        onChange={e => setReasoning(e.target.value)}
                        placeholder="لماذا اخترت هذا الخيار تحديداً؟"
                        rows={2}
                        className="w-full bg-slate-900/70 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 resize-none focus:outline-none focus:border-violet-500/50 text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-400 text-sm block mb-1.5">مستوى التأثير</label>
                        <select
                          value={impact}
                          onChange={e => setImpact(e.target.value as Impact)}
                          className="w-full bg-slate-900/70 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-violet-500/50 text-sm"
                        >
                          <option value="high">عالي التأثير</option>
                          <option value="medium">متوسط التأثير</option>
                          <option value="low">منخفض التأثير</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-slate-400 text-sm block mb-1.5">التصنيفات (مفصولة بفاصلة)</label>
                        <input
                          value={tags}
                          onChange={e => setTags(e.target.value)}
                          placeholder="تمويل، منتج، فريق"
                          className="w-full bg-slate-900/70 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveDecision}
                    disabled={!title.trim() || !chosen.trim()}
                    className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <BookOpen size={16} /> حفظ القرار
                  </button>
                </div>

                {/* Past decisions */}
                <div className="space-y-3">
                  <h2 className="font-semibold text-slate-300 flex items-center gap-2">
                    <TrendingUp size={16} className="text-violet-400" /> القرارات المسجّلة ({decisions.length})
                  </h2>
                  {decisions.map((d, i) => (
                    <motion.div
                      key={d.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => setSelectedDecision(selectedDecision?.id === d.id ? null : d)}
                      className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 cursor-pointer hover:border-slate-600/60 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded text-xs border ${IMPACT_COLORS[d.impact]}`}>
                              {IMPACT_LABELS[d.impact]}
                            </span>
                            <span className="text-slate-500 text-xs flex items-center gap-1">
                              <Calendar size={10} /> {d.date}
                            </span>
                          </div>
                          <h3 className="font-semibold text-white">{d.title}</h3>
                          <p className="text-slate-400 text-sm mt-0.5">✓ {d.chosen}</p>
                        </div>
                        <div className="flex flex-wrap gap-1 mr-2">
                          {d.tags.map(tag => (
                            <span key={tag} className="px-2 py-0.5 bg-violet-900/30 text-violet-300 rounded text-xs flex items-center gap-1">
                              <Tag size={9} /> {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <AnimatePresence>
                        {selectedDecision?.id === d.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-slate-700/50 mt-3 pt-3 space-y-2"
                          >
                            {d.context && <p className="text-slate-300 text-sm"><span className="text-slate-500">السياق: </span>{d.context}</p>}
                            {d.reasoning && <p className="text-slate-300 text-sm"><span className="text-slate-500">المنطق: </span>{d.reasoning}</p>}
                            {d.outcome && (
                              <p className="text-emerald-300 text-sm flex items-start gap-1">
                                <CheckCircle2 size={13} className="mt-0.5 shrink-0" />
                                <span><span className="text-slate-500">النتيجة: </span>{d.outcome}</span>
                              </p>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Analyze / Postmortem Mode */}
            {(mode === "analyze" || mode === "postmortem") && (
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 space-y-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  {mode === "analyze" ? <Brain className="text-violet-400" size={18} /> : <RefreshCw className="text-cyan-400" size={18} />}
                  <span className="font-semibold text-slate-200">
                    {mode === "analyze" ? "تحليل القرار قبل اتخاذه (Pre-mortem)" : "مراجعة القرار بعد النتيجة (Post-mortem)"}
                  </span>
                </div>
                <p className="text-slate-400 text-sm">
                  {mode === "analyze"
                    ? "اكتب قرارك المُخطَّط وسيحلل الـ AI أسباب الفشل المحتملة مسبقاً"
                    : "اكتب القرار ونتيجته وسيستخرج الـ AI الدروس المستفادة"
                  }
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="text-slate-400 text-sm block mb-1.5">
                      {mode === "analyze" ? "القرار المُخطَّط" : "القرار الذي اتخذته"}
                    </label>
                    <textarea
                      value={decisionToAnalyze}
                      onChange={e => setDecisionToAnalyze(e.target.value)}
                      placeholder={mode === "analyze"
                        ? "مثال: سأنهي خدمة دعم العملاء المجانية وأحوّلها لباقة مدفوعة..."
                        : "مثال: قررت تعيين مطوّر أول بدلاً من استخدام فريلانسرز..."}
                      rows={3}
                      className="w-full bg-slate-900/70 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 resize-none focus:outline-none focus:border-violet-500/50 text-sm"
                    />
                  </div>

                  {mode === "postmortem" && (
                    <div>
                      <label className="text-slate-400 text-sm block mb-1.5">النتيجة الفعلية</label>
                      <textarea
                        value={outcomeToReview}
                        onChange={e => setOutcomeToReview(e.target.value)}
                        placeholder="ماذا حدث بعد اتخاذ القرار؟ ما النتائج التي شهدتها؟"
                        rows={2}
                        className="w-full bg-slate-900/70 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 resize-none focus:outline-none focus:border-violet-500/50 text-sm"
                      />
                    </div>
                  )}
                </div>

                <button
                  onClick={mode === "analyze" ? handleAnalyze : handlePostmortem}
                  disabled={loading || !decisionToAnalyze.trim() || (mode === "postmortem" && !outcomeToReview.trim())}
                  className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  {loading ? "جاري التحليل..." : mode === "analyze" ? "حلّل قبل القرار" : "استخرج الدروس"}
                </button>

                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="bg-red-900/30 border border-red-500/30 rounded-xl p-4 text-red-300 text-sm flex items-start gap-2">
                      <AlertCircle size={14} className="mt-0.5 shrink-0" /> {error}
                    </motion.div>
                  )}
                  {result && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="bg-slate-900/50 border border-violet-500/20 rounded-xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-violet-400 text-sm font-medium flex items-center gap-1">
                          <CheckCircle2 size={14} />
                          {mode === "analyze" ? "تحليل Pre-mortem" : "تحليل Post-mortem"}
                        </span>
                        <button onClick={handleCopy} className="text-slate-400 hover:text-white transition-colors">
                          {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                        </button>
                      </div>
                      <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{result}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </AppShell>
  );
}

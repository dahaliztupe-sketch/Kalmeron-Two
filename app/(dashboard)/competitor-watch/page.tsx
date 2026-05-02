"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Radar, Sparkles, ArrowLeft, Loader2, CheckCircle2,
  TrendingUp, Target, Zap, Copy, Check, Plus, Trash2,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";

const INDUSTRIES = [
  "تقنية المعلومات والبرمجيات", "التجارة الإلكترونية", "الصحة والرعاية الطبية",
  "التعليم والتدريب", "التمويل والتقنية المالية", "العقارات", "الخدمات اللوجستية",
  "المطاعم والأغذية", "الترفيه والإعلام", "الزراعة والتكنولوجيا الزراعية", "أخرى",
];

const ANALYSIS_TYPES = [
  { key: "full", label: "تحليل شامل", desc: "SWOT + فجوات + فرص التميّز", icon: "🔍" },
  { key: "gaps", label: "الفجوات السوقية", desc: "أين الفراغ الذي يمكنك ملؤه؟", icon: "🎯" },
  { key: "positioning", label: "نقطة التميّز", desc: "كيف تتمايز عن المنافسين؟", icon: "⚡" },
];

export default function CompetitorWatchPage() {
  const { user } = useAuth();
  const [industry, setIndustry] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [knownCompetitors, setKnownCompetitors] = useState<string[]>(["", ""]);
  const [analysisType, setAnalysisType] = useState("full");
  const [targetCustomer, setTargetCustomer] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const canAnalyze = industry.trim().length > 0 && !loading;

  const addCompetitor = () => setKnownCompetitors(c => [...c, ""]);
  const removeCompetitor = (i: number) => setKnownCompetitors(c => c.filter((_, idx) => idx !== i));
  const updateCompetitor = (i: number, val: string) => setKnownCompetitors(c => c.map((cc, idx) => idx === i ? val : cc));

  const handleAnalyze = useCallback(async () => {
    if (!canAnalyze) return;
    setLoading(true);
    setResult("");
    setError("");
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (user) headers["Authorization"] = `Bearer ${await user.getIdToken()}`;

      const validCompetitors = knownCompetitors.filter(c => c.trim());
      const typeLabels: Record<string, string> = {
        full: "تحليل شامل للمنافسين",
        gaps: "تحليل الفجوات السوقية",
        positioning: "تحليل نقاط التميّز والموضع التنافسي",
      };

      const prompt = `قطاع: ${industry}
${companyName ? `شركتي: ${companyName}` : ""}
${targetCustomer ? `عميلي المستهدف: ${targetCustomer}` : ""}
${validCompetitors.length > 0 ? `منافسون معروفون: ${validCompetitors.join("، ")}` : ""}

نوع التحليل المطلوب: ${typeLabels[analysisType] || "تحليل شامل"}

قدّم ${typeLabels[analysisType]} للسوق المصري والعربي في قطاع "${industry}".

اشمل:
## خريطة المنافسين
(المباشرون وغير المباشرون — مع تقييم قوة كل منهم)

## تحليل نقاط القوة والضعف
(لأبرز ٣-٥ منافسين مع المصادر إن أمكن)

## الفجوات السوقية غير المستغلة
(ما الذي يفتقده العملاء حالياً من الحلول الموجودة؟)

## فرص التمايز
(كيف يمكن لشركة جديدة أن تنافس وتتميّز؟)

## توصية Positioning
(جملة تموضع تنافسي واضحة وقابلة للاختبار)

## خطوات التتبع التالية
(كيف تراقب المنافسين باستمرار؟)`;

      const res = await fetch("/api/ideas/analyze", {
        method: "POST",
        headers,
        body: JSON.stringify({ ideaDesc: prompt, industry, startup_stage: `competitor_${analysisType}` }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطأ");
      setResult(data.result ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ");
    } finally {
      setLoading(false);
    }
  }, [industry, companyName, knownCompetitors, analysisType, targetCustomer, user, canAnalyze]);

  const copyResult = async () => {
    await navigator.clipboard.writeText(result).catch(() => null);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <AppShell>
      <div dir="rtl" className="max-w-4xl mx-auto space-y-6 pb-16">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Radar className="w-4 h-4 text-rose-400" />
              <span className="text-xs text-rose-400 font-medium uppercase tracking-wide">Competitor Intelligence</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-2">رصد المنافسين</h1>
            <p className="text-white/50 max-w-xl text-sm">حلّل منافسيك واكشف الفجوات السوقية وجِد نقطة تميّزك في السوق المصري والعربي.</p>
          </div>
          <Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors">
            <ArrowLeft className="w-4 h-4" /> لوحة القيادة
          </Link>
        </div>

        {!result ? (
          <div className="space-y-5">
            {/* Analysis Type */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {ANALYSIS_TYPES.map(({ key, label, desc, icon }) => (
                <button key={key} onClick={() => setAnalysisType(key)}
                  className={`rounded-2xl border p-4 text-right transition-all hover:scale-[1.02] ${analysisType === key ? "border-rose-500/40 bg-rose-500/10 text-white" : "border-white/10 bg-white/[0.03] text-white/60 hover:border-rose-500/20"}`}>
                  <div className="text-2xl mb-2">{icon}</div>
                  <div className="text-sm font-bold mb-0.5">{label}</div>
                  <div className="text-xs text-white/40">{desc}</div>
                </button>
              ))}
            </div>

            {/* Inputs */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-white/50 mb-2 font-medium">القطاع *</label>
                  <select value={industry} onChange={e => setIndustry(e.target.value)}
                    className="w-full rounded-xl bg-white/[0.04] border border-white/[0.07] text-white px-4 py-2.5 text-sm focus:outline-none focus:border-rose-500/40 appearance-none">
                    <option value="" className="bg-[#0a0a1a]">اختر القطاع...</option>
                    {INDUSTRIES.map(i => <option key={i} value={i} className="bg-[#0a0a1a]">{i}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-2 font-medium">اسم شركتك (اختياري)</label>
                  <input value={companyName} onChange={e => setCompanyName(e.target.value)}
                    placeholder="مثال: تك فيجن للبرمجيات"
                    className="w-full rounded-xl bg-white/[0.04] border border-white/[0.07] text-white placeholder:text-white/20 px-4 py-2.5 text-sm focus:outline-none focus:border-rose-500/40 transition-colors" />
                </div>
              </div>

              <div>
                <label className="block text-xs text-white/50 mb-2 font-medium">عميلك المستهدف (اختياري)</label>
                <input value={targetCustomer} onChange={e => setTargetCustomer(e.target.value)}
                  placeholder="مثال: أصحاب المطاعم الصغيرة (٥-١٥ طاولة) في القاهرة الكبرى"
                  className="w-full rounded-xl bg-white/[0.04] border border-white/[0.07] text-white placeholder:text-white/20 px-4 py-2.5 text-sm focus:outline-none focus:border-rose-500/40 transition-colors" />
              </div>

              {/* Known Competitors */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-white/50 font-medium">منافسون تعرفهم بالفعل (اختياري)</label>
                  <button onClick={addCompetitor} className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 border border-rose-500/20 rounded-lg px-2 py-1 transition-colors">
                    <Plus className="w-3 h-3" /> أضف
                  </button>
                </div>
                <div className="space-y-2">
                  {knownCompetitors.map((c, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input value={c} onChange={e => updateCompetitor(i, e.target.value)}
                        placeholder={`مثال: منافس ${i + 1}`}
                        className="flex-1 rounded-xl bg-white/[0.04] border border-white/[0.07] text-white placeholder:text-white/20 px-4 py-2 text-sm focus:outline-none focus:border-rose-500/40 transition-colors" />
                      {knownCompetitors.length > 1 && (
                        <button onClick={() => removeCompetitor(i)} className="text-white/20 hover:text-rose-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={handleAnalyze} disabled={!canAnalyze}
              className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-sm hover:opacity-90 disabled:opacity-40 transition-all shadow-lg shadow-rose-500/20">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Radar className="w-5 h-5" />}
              {loading ? "يحلل السوق..." : "حلّل المنافسين"}
            </button>

            {error && <p className="text-rose-400 text-sm rounded-xl border border-rose-500/20 bg-rose-500/5 p-3">{error}</p>}
          </div>
        ) : (
          <AnimatePresence>
            <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-semibold text-white">تحليل منافسي — {industry}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={copyResult}
                    className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 border border-white/10 rounded-lg px-3 py-1.5 transition-colors">
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? "تم" : "نسخ"}
                  </button>
                  <button onClick={() => setResult("")}
                    className="text-xs text-rose-400 hover:text-rose-300 border border-rose-500/20 rounded-lg px-3 py-1.5 transition-colors">
                    تحليل جديد
                  </button>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <div className="prose prose-invert prose-sm max-w-none text-white/80 leading-relaxed whitespace-pre-wrap">{result}</div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { href: "/ideas/analyze", label: "حلّل فكرتك", icon: Target, color: "border-cyan-500/20 hover:border-cyan-500/40 text-cyan-400" },
                  { href: "/customer-discovery", label: "اكتشف عملاءك", icon: Zap, color: "border-violet-500/20 hover:border-violet-500/40 text-violet-400" },
                  { href: "/ideas/canvas", label: "كانفاس الأعمال", icon: TrendingUp, color: "border-fuchsia-500/20 hover:border-fuchsia-500/40 text-fuchsia-400" },
                ].map(({ href, label, icon: Icon, color }) => (
                  <Link key={href} href={href}
                    className={`flex items-center gap-3 rounded-xl border bg-white/[0.03] p-3.5 transition-all ${color}`}>
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="text-sm font-medium text-white">{label}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </AppShell>
  );
}

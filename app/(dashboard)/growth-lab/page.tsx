"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Rocket, ArrowLeft, Loader2, CheckCircle2,
  Copy, Check, RefreshCw, AlertCircle, TrendingUp,
  Zap, Target, BarChart3, Download, FlaskConical,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import ReactMarkdown from "react-markdown";

type GrowthMode = "experiment" | "strategy" | "channels" | "retention" | "viral";

const GROWTH_MODES: { id: GrowthMode; label: string; icon: LucideIcon; desc: string }[] = [
  { id: "experiment", label: "تجربة نمو", icon: FlaskConical, desc: "صمّم فرضية + KPI + خطة أسبوعية" },
  { id: "strategy",   label: "استراتيجية النمو", icon: Rocket,    desc: "خطة نمو شاملة لمرحلتك الحالية" },
  { id: "channels",   label: "قنوات الاكتساب",   icon: Target,    desc: "أفضل قنوات لاكتساب عملاء جدد" },
  { id: "retention",  label: "الاحتفاظ بالعملاء", icon: BarChart3, desc: "زيادة Retention وخفض Churn" },
  { id: "viral",      label: "الانتشار الفيروسي", icon: Zap,       desc: "بناء Growth loops وViral loops" },
];

const STAGES = [
  { value: "pre-product", label: "قبل المنتج / Idea" },
  { value: "MVP", label: "MVP — أول 100 عميل" },
  { value: "early", label: "Early Traction — 100-1000 عميل" },
  { value: "growth", label: "Growth — قاعدة نمو ثابتة" },
  { value: "scale", label: "Scale — توسع جغرافي" },
];

export default function GrowthLabPage() {
  const { user } = useAuth();
  const [mode, setMode] = useState<GrowthMode>("experiment");

  const [experimentIdea, setExperimentIdea] = useState("");
  const [product, setProduct] = useState("");
  const [stage, setStage] = useState("MVP");
  const [currentMetrics, setCurrentMetrics] = useState("");
  const [budget, setBudget] = useState("");
  const [challenge, setChallenge] = useState("");

  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const isExperiment = mode === "experiment";

  const isSubmitDisabled = loading || (isExperiment ? !experimentIdea.trim() : !product.trim());

  const handleSubmit = useCallback(async () => {
    if (isSubmitDisabled) return;
    setLoading(true);
    setError("");
    setResult("");
    try {
      const token = await user?.getIdToken();
      const body = isExperiment
        ? { mode, experimentIdea, product, stage, currentMetrics }
        : { mode, product, stage, currentMetrics, budget, challenge };
      const res = await fetch("/api/growth-lab", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "حدث خطأ");
      setResult(data.result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  }, [mode, experimentIdea, product, stage, currentMetrics, budget, challenge, loading, user, isExperiment, isSubmitDisabled]);

  const inputClass = "w-full bg-slate-900/70 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 text-sm";
  const currentMode = GROWTH_MODES.find(m => m.id === mode)!;

  const handleModeChange = (id: GrowthMode) => {
    setMode(id);
    setResult("");
    setError("");
  };

  return (
    <AppShell>
      <div className="min-h-screen bg-[#0a0a0f] text-white" dir="rtl">
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
            <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Rocket className="text-violet-400" size={24} />
                مختبر النمو
              </h1>
              <p className="text-slate-400 text-sm mt-1">استراتيجيات نمو مُخصَّصة للسوق المصري والعربي</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {GROWTH_MODES.map(({ id, label, icon: Icon, desc }) => (
              <button key={id} onClick={() => handleModeChange(id)}
                className={`text-right p-3 rounded-xl border transition-all ${
                  mode === id
                    ? "bg-violet-900/30 border-violet-500/50 shadow-lg"
                    : "bg-slate-800/40 border-slate-700/40 hover:border-slate-600/60"
                }`}>
                <Icon size={16} className={mode === id ? "text-violet-400 mb-1" : "text-slate-400 mb-1"} />
                <div className={`text-xs font-semibold leading-tight ${mode === id ? "text-violet-300" : "text-slate-300"}`}>{label}</div>
                <div className="text-[10px] text-slate-500 mt-0.5 leading-tight hidden sm:block">{desc}</div>
              </button>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 space-y-4">

            <div className="flex items-center gap-2 mb-1">
              <currentMode.icon className="text-violet-400" size={18} />
              <span className="font-semibold text-violet-400">{currentMode.label}</span>
            </div>

            <AnimatePresence mode="wait">
              {isExperiment ? (
                <motion.div key="experiment" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  className="space-y-3">
                  <div>
                    <label className="text-slate-400 text-xs block mb-1.5">فكرة التجربة *</label>
                    <textarea value={experimentIdea} onChange={e => setExperimentIdea(e.target.value)}
                      placeholder="مثال: إضافة زر 'شارك مع صديق' في صفحة إتمام الطلب لزيادة الإحالات"
                      rows={3}
                      className="w-full bg-slate-900/70 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 resize-none focus:outline-none focus:border-violet-500/50 text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-400 text-xs block mb-1.5">المنتج/الخدمة (اختياري)</label>
                      <input value={product} onChange={e => setProduct(e.target.value)}
                        placeholder="مثال: منصة طلبات أونلاين" className={inputClass} />
                    </div>
                    <div>
                      <label className="text-slate-400 text-xs block mb-1.5">مرحلة الشركة</label>
                      <select value={stage} onChange={e => setStage(e.target.value)} className={inputClass}>
                        {STAGES.map(({ value, label }) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="text-slate-400 text-xs block mb-1.5">المقاييس الحالية (اختياري)</label>
                      <input value={currentMetrics} onChange={e => setCurrentMetrics(e.target.value)}
                        placeholder="مثال: معدل الإحالة الحالي 2%، 500 مستخدم نشط" className={inputClass} />
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="other" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  className="space-y-3">
                  <div>
                    <label className="text-slate-400 text-xs block mb-1.5">وصف المنتج/الخدمة *</label>
                    <textarea value={product} onChange={e => setProduct(e.target.value)}
                      placeholder="مثال: منصة SaaS لإدارة المخزون للمطاعم الصغيرة..."
                      rows={2}
                      className="w-full bg-slate-900/70 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 resize-none focus:outline-none focus:border-violet-500/50 text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-400 text-xs block mb-1.5">مرحلة النمو الحالية</label>
                      <select value={stage} onChange={e => setStage(e.target.value)} className={inputClass}>
                        {STAGES.map(({ value, label }) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-400 text-xs block mb-1.5">ميزانية النمو الشهرية</label>
                      <input value={budget} onChange={e => setBudget(e.target.value)}
                        placeholder="مثال: 10,000 جنيه أو صفر" className={inputClass} />
                    </div>
                    <div className="col-span-2">
                      <label className="text-slate-400 text-xs block mb-1.5">المقاييس الحالية (إن وُجدت)</label>
                      <input value={currentMetrics} onChange={e => setCurrentMetrics(e.target.value)}
                        placeholder="مثال: 50 عميل، MRR = 25,000 جنيه، Churn = 8% شهرياً" className={inputClass} />
                    </div>
                    <div className="col-span-2">
                      <label className="text-slate-400 text-xs block mb-1.5">أكبر تحدي نمو تواجهه الآن</label>
                      <input value={challenge} onChange={e => setChallenge(e.target.value)}
                        placeholder="مثال: لا أعرف كيف أصل للعملاء بدون ميزانية إعلانية" className={inputClass} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button onClick={handleSubmit} disabled={isSubmitDisabled}
              className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <TrendingUp size={16} />}
              {loading
                ? (isExperiment ? "جاري تصميم التجربة..." : "جاري بناء الاستراتيجية...")
                : (isExperiment ? "صمّم التجربة" : "ابنِ استراتيجية النمو")}
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
                      <CheckCircle2 size={14} /> {currentMode.label}
                    </span>
                    <div className="flex gap-2">
                      <button onClick={() => { setResult(""); }}
                        className="text-slate-400 hover:text-white transition-colors"><RefreshCw size={14} /></button>
                      <button onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                        className="text-slate-400 hover:text-white transition-colors">
                        {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      </button>
                      <button onClick={() => { const b = new Blob([result], { type: "text/markdown" }); const u = URL.createObjectURL(b); const a = document.createElement("a"); a.href = u; a.download = `growth-lab-${mode}-${Date.now()}.md`; a.click(); URL.revokeObjectURL(u); }}
                        className="text-slate-400 hover:text-white transition-colors" title="تحميل">
                        <Download size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="text-sm leading-relaxed prose prose-invert prose-neutral max-w-none
                    prose-headings:text-violet-400 prose-headings:font-bold prose-strong:text-white
                    prose-li:text-slate-300 prose-p:text-slate-300" dir="auto">
                    <ReactMarkdown>{result}</ReactMarkdown>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="grid grid-cols-3 gap-3">
            {[
              { href: "/ideas/analyze", label: "مختبر الأفكار", icon: "🧠" },
              { href: "/smart-pricing", label: "التسعير الذكي", icon: "💰" },
              { href: "/customer-discovery", label: "اكتشاف العملاء", icon: "🎯" },
            ].map(({ href, label, icon }) => (
              <Link key={href} href={href}
                className="bg-slate-800/40 border border-slate-700/30 hover:border-slate-600/50 rounded-xl p-4 text-center transition-all group">
                <div className="text-2xl mb-1">{icon}</div>
                <div className="text-slate-300 text-sm font-medium group-hover:text-white transition-colors">{label}</div>
              </Link>
            ))}
          </motion.div>

        </div>
      </div>
    </AppShell>
  );
}

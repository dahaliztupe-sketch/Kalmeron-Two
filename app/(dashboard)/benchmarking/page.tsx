"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BarChart3, ArrowLeft, Loader2, CheckCircle2, Copy, Check,
  AlertCircle, RefreshCw, TrendingUp, Activity,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import ReactMarkdown from "react-markdown";

const SECTORS = [
  "SaaS / برمجيات", "تجارة إلكترونية", "Fintech / مالية", "EdTech / تعليم",
  "HealthTech / صحة", "Marketplace", "لوجستيات وتوصيل", "تقنية زراعية",
  "عقارات", "خدمات احترافية", "تجزئة / تسوق", "أخرى",
];

const STAGES = ["Pre-Seed", "Seed", "Series A", "Series B", "Series C+"];

interface MetricField {
  key: string;
  label: string;
  placeholder: string;
  hint: string;
}

const METRICS: MetricField[] = [
  { key: "mrr", label: "MRR (الإيراد الشهري المتكرر)", placeholder: "مثال: 50,000 جنيه", hint: "اختياري" },
  { key: "burnRate", label: "Burn Rate (الحرق الشهري)", placeholder: "مثال: 80,000 جنيه/شهر", hint: "اختياري" },
  { key: "cac", label: "CAC (تكلفة اكتساب العميل)", placeholder: "مثال: 500 جنيه/عميل", hint: "اختياري" },
  { key: "churn", label: "Churn Rate (معدل الإلغاء)", placeholder: "مثال: 5% شهرياً", hint: "اختياري" },
  { key: "ltv", label: "LTV (قيمة العميل مدى الحياة)", placeholder: "مثال: 3,000 جنيه", hint: "اختياري" },
  { key: "teamSize", label: "حجم الفريق", placeholder: "مثال: 8 أشخاص", hint: "اختياري" },
  { key: "runway", label: "المدرج المالي (Runway)", placeholder: "مثال: 14 شهر", hint: "اختياري" },
  { key: "growthRate", label: "معدل النمو الشهري", placeholder: "مثال: 12% شهرياً", hint: "اختياري" },
];

export default function BenchmarkingPage() {
  const { user } = useAuth();
  const [sector, setSector] = useState("SaaS / برمجيات");
  const [stage, setStage] = useState("Seed");
  const [metrics, setMetrics] = useState<Record<string, string>>({});
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const filledCount = Object.values(metrics).filter(v => v.trim()).length;

  const handleAnalyze = useCallback(async () => {
    if (loading) return;
    setLoading(true); setError(""); setResult("");
    try {
      const token = await user?.getIdToken();
      const res = await fetch("/api/benchmarking", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ sector, stage, ...metrics }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "حدث خطأ");
      setResult(data.result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  }, [sector, stage, metrics, loading, user]);

  const inputClass = "w-full bg-slate-900/70 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 text-sm";

  return (
    <AppShell>
      <div className="min-h-screen bg-[#0a0a0f] text-white" dir="rtl">
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
            <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <BarChart3 className="text-cyan-400" size={24} />
                قارن شركتك (Benchmarking)
              </h1>
              <p className="text-slate-400 text-sm mt-1">قارن مؤشراتك بأفضل الشركات المماثلة في مصر والمنطقة</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="grid grid-cols-3 gap-3">
            {[
              { icon: Activity, label: "بيانات MENA", color: "text-cyan-400", desc: "معايير الشركات الناشئة المصرية والعربية" },
              { icon: TrendingUp, label: "تحليل مقارن", color: "text-emerald-400", desc: "نقاط القوة والضعف الحقيقية" },
              { icon: BarChart3, label: "توصيات عملية", color: "text-violet-400", desc: "خطوات تحسين قابلة للتطبيق" },
            ].map(({ icon: Icon, label, color, desc }) => (
              <div key={label} className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3">
                <Icon size={16} className={`${color} mb-1`} />
                <div className="text-sm font-medium text-slate-300">{label}</div>
                <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
              </div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 space-y-5">

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 text-xs block mb-1.5">القطاع *</label>
                <select value={sector} onChange={e => setSector(e.target.value)} className={inputClass}>
                  {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-xs block mb-1.5">مرحلة الشركة *</label>
                <select value={stage} onChange={e => setStage(e.target.value)} className={inputClass}>
                  {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-slate-300">المؤشرات (أدخل ما تعرفه)</span>
                <span className="text-xs text-slate-500">{filledCount} / {METRICS.length} مُعبَّأ</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {METRICS.map(({ key, label, placeholder, hint }) => (
                  <div key={key}>
                    <label className="text-slate-400 text-xs block mb-1">
                      {label} <span className="text-slate-600">({hint})</span>
                    </label>
                    <input
                      value={metrics[key] ?? ""}
                      onChange={e => setMetrics(m => ({ ...m, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className={inputClass}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={handleAnalyze} disabled={loading}
                className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <BarChart3 size={16} />}
                {loading ? "جاري المقارنة..." : "قارن مؤشراتي بالسوق"}
              </button>
              {result && (
                <button onClick={() => { setResult(""); setMetrics({}); }}
                  className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors">
                  <RefreshCw size={14} /> تحليل جديد
                </button>
              )}
            </div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="bg-red-900/30 border border-red-500/30 rounded-xl p-3 text-red-300 text-sm flex gap-2">
                  <AlertCircle size={14} className="mt-0.5 shrink-0" /> {error}
                </motion.div>
              )}
              {result && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-400 text-sm font-medium flex items-center gap-1">
                      <CheckCircle2 size={14} /> تقرير المقارنة
                    </span>
                    <button onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                      className="text-slate-400 hover:text-white transition-colors">
                      {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                  </div>
                  <div className="text-sm leading-relaxed prose prose-invert prose-neutral max-w-none
                    prose-headings:text-cyan-400 prose-headings:font-bold prose-strong:text-white
                    prose-li:text-slate-300 prose-p:text-slate-300 prose-table:text-slate-300" dir="auto">
                    <ReactMarkdown>{result}</ReactMarkdown>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="grid grid-cols-3 gap-3">
            {[
              { href: "/financial-model", label: "النموذج المالي", icon: "📈" },
              { href: "/cash-runway", label: "المدرج المالي", icon: "🛫" },
              { href: "/growth-lab", label: "مختبر النمو", icon: "🚀" },
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

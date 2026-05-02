"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  TrendingUp, Sparkles, ArrowLeft, Loader2, CheckCircle2,
  Copy, Check, RefreshCw, AlertCircle,
  Phone, Target, DollarSign, BarChart3,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import ReactMarkdown from "react-markdown";

type SalesMode = "script" | "objections" | "pipeline" | "closing";

const SALES_MODES = [
  { id: "script" as SalesMode, label: "سكريبت المبيعات", icon: Phone, desc: "محادثة مبيعات منظمة ومقنعة" },
  { id: "objections" as SalesMode, label: "التغلب على الاعتراضات", icon: Target, desc: "ردود ذكية على كل رفض" },
  { id: "pipeline" as SalesMode, label: "إدارة Pipeline", icon: BarChart3, desc: "منهجية لإدارة العملاء المحتملين" },
  { id: "closing" as SalesMode, label: "إغلاق الصفقات", icon: DollarSign, desc: "تقنيات إغلاق تناسب السوق المصري" },
];

const PRODUCTS = [
  "SaaS / برمجيات", "خدمات احترافية", "منتج مادي",
  "تجارة إلكترونية", "عقارات", "تعليم / تدريب", "أخرى",
];

export default function SalesCoachPage() {
  const { user } = useAuth();
  const [mode, setMode] = useState<SalesMode>("script");
  const [product, setProduct] = useState("");
  const [productType, setProductType] = useState("SaaS / برمجيات");
  const [priceRange, setPriceRange] = useState("");
  const [targetCustomer, setTargetCustomer] = useState("");
  const [challenge, setChallenge] = useState("");

  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!product.trim() || loading) return;
    setLoading(true);
    setError("");
    setResult("");
    try {
      const token = await user?.getIdToken();
      const res = await fetch("/api/sales-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ mode, product, productType, priceRange, targetCustomer, challenge }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "حدث خطأ");
      setResult(data.result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  }, [mode, product, productType, priceRange, targetCustomer, challenge, loading, user]);

  const inputClass = "w-full bg-slate-900/70 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-green-500/50 text-sm";
  const currentMode = SALES_MODES.find(m => m.id === mode)!;

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
                <TrendingUp className="text-green-400" size={24} />
                مدرّب المبيعات الذكي
              </h1>
              <p className="text-slate-400 text-sm mt-1">سكريبتات مبيعات، التغلب على الاعتراضات، وإغلاق الصفقات في السوق المصري</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="grid grid-cols-2 gap-3">
            {SALES_MODES.map(({ id, label, icon: Icon, desc }) => (
              <button key={id} onClick={() => { setMode(id); setResult(""); setError(""); }}
                className={`text-right p-4 rounded-xl border transition-all ${
                  mode === id
                    ? "bg-green-900/20 border-green-500/50 shadow-lg"
                    : "bg-slate-800/40 border-slate-700/40 hover:border-slate-600/60"
                }`}>
                <Icon size={18} className={mode === id ? "text-green-400 mb-1" : "text-slate-400 mb-1"} />
                <div className={`text-sm font-semibold ${mode === id ? "text-green-300" : "text-slate-300"}`}>{label}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{desc}</div>
              </button>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 space-y-4">

            <div className="flex items-center gap-2 mb-1">
              <currentMode.icon className="text-green-400" size={18} />
              <span className="font-semibold text-green-400">{currentMode.label}</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-slate-400 text-xs block mb-1.5">المنتج/الخدمة *</label>
                <textarea value={product} onChange={e => setProduct(e.target.value)}
                  placeholder="مثال: نظام حضور وانصراف للشركات الصغيرة، 500 جنيه/شهر..."
                  rows={2}
                  className="w-full bg-slate-900/70 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 resize-none focus:outline-none focus:border-green-500/50 text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-xs block mb-1.5">نوع المنتج</label>
                  <select value={productType} onChange={e => setProductType(e.target.value)} className={inputClass}>
                    {PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-xs block mb-1.5">نطاق السعر</label>
                  <input value={priceRange} onChange={e => setPriceRange(e.target.value)}
                    placeholder="مثال: 500-2000 جنيه/شهر" className={inputClass} />
                </div>
                <div>
                  <label className="text-slate-400 text-xs block mb-1.5">العميل المستهدف</label>
                  <input value={targetCustomer} onChange={e => setTargetCustomer(e.target.value)}
                    placeholder="مثال: أصحاب مطاعم صغيرة 5-20 فرع" className={inputClass} />
                </div>
                <div>
                  <label className="text-slate-400 text-xs block mb-1.5">أكبر تحدي في المبيعات</label>
                  <input value={challenge} onChange={e => setChallenge(e.target.value)}
                    placeholder="مثال: يقولون السعر مرتفع دايماً" className={inputClass} />
                </div>
              </div>
            </div>

            <button onClick={handleSubmit} disabled={loading || !product.trim()}
              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {loading ? "جاري بناء الاستراتيجية..." : `ابنِ ${currentMode.label}`}
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
                  className="bg-slate-900/50 border border-green-500/20 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-green-400 text-sm font-medium flex items-center gap-1">
                      <CheckCircle2 size={14} /> {currentMode.label}
                    </span>
                    <div className="flex gap-2">
                      <button onClick={() => setResult("")}
                        className="text-slate-400 hover:text-white transition-colors"><RefreshCw size={14} /></button>
                      <button onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                        className="text-slate-400 hover:text-white transition-colors">
                        {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                  <div className="text-sm leading-relaxed prose prose-invert prose-neutral max-w-none
                    prose-headings:text-green-400 prose-headings:font-bold prose-strong:text-white
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
              { href: "/pitch-practice", label: "تدريب الـ Pitch", icon: "🎤" },
              { href: "/email-ai", label: "كاتب البريد الذكي", icon: "📧" },
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

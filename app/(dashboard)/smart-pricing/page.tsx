"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  DollarSign, Sparkles, ArrowLeft, Loader2, CheckCircle2,
  Copy, Check, RefreshCw, AlertCircle, TrendingUp, Target,
  Users, Zap,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import ReactMarkdown from "react-markdown";

const PRICING_MODELS = [
  { value: "subscription", label: "اشتراك شهري / سنوي (SaaS)" },
  { value: "usage", label: "دفع حسب الاستخدام" },
  { value: "freemium", label: "Freemium (مجاني + مدفوع)" },
  { value: "one-time", label: "رسوم لمرة واحدة" },
  { value: "marketplace", label: "عمولة (Marketplace)" },
  { value: "tiered", label: "خطط متدرجة (Tiered)" },
  { value: "enterprise", label: "Enterprise / Custom Pricing" },
  { value: "other", label: "أخرى" },
];

const CURRENCY_OPTIONS = [
  { value: "EGP", label: "جنيه مصري (EGP)" },
  { value: "USD", label: "دولار أمريكي (USD)" },
  { value: "SAR", label: "ريال سعودي (SAR)" },
];

export default function SmartPricingPage() {
  const { user } = useAuth();
  const [product, setProduct] = useState("");
  const [model, setModel] = useState("subscription");
  const [segment, setSegment] = useState("");
  const [currency, setCurrency] = useState("EGP");
  const [competitors, setCompetitors] = useState("");
  const [cogs, setCogs] = useState("");
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
      const res = await fetch("/api/smart-pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ product, model, segment, currency, competitors, cogs }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "حدث خطأ");
      setResult(data.result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  }, [product, model, segment, currency, competitors, cogs, loading, user]);

  const inputClass = "w-full bg-slate-900/70 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 text-sm";

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
                <DollarSign className="text-emerald-400" size={24} />
                استراتيجية التسعير الذكي
              </h1>
              <p className="text-slate-400 text-sm mt-1">احصل على استراتيجية تسعير مثالية للسوق المصري والعربي</p>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="grid grid-cols-3 gap-3">
            {[
              { icon: Target, label: "تسعير مبني على القيمة", color: "text-emerald-400" },
              { icon: Users, label: "مُكيَّف للسوق المصري", color: "text-cyan-400" },
              { icon: TrendingUp, label: "زيادة هامش الربح", color: "text-violet-400" },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3 flex items-center gap-2">
                <Icon size={16} className={color} />
                <span className="text-slate-300 text-xs">{label}</span>
              </div>
            ))}
          </motion.div>

          {/* Form */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 space-y-4">

            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="text-emerald-400" size={18} />
              <span className="font-semibold text-emerald-400">بيانات المنتج/الخدمة</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-slate-400 text-xs block mb-1.5">وصف المنتج/الخدمة *</label>
                <textarea value={product} onChange={e => setProduct(e.target.value)}
                  placeholder="مثال: منصة SaaS لإدارة المخزون للمطاعم، تُوفّر على العمل يومياً 2-3 ساعات..."
                  rows={3}
                  className="w-full bg-slate-900/70 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 resize-none focus:outline-none focus:border-emerald-500/50 text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-xs block mb-1.5">نموذج التسعير</label>
                  <select value={model} onChange={e => setModel(e.target.value)} className={inputClass}>
                    {PRICING_MODELS.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-xs block mb-1.5">العملة</label>
                  <select value={currency} onChange={e => setCurrency(e.target.value)} className={inputClass}>
                    {CURRENCY_OPTIONS.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-xs block mb-1.5">الشريحة المستهدفة</label>
                  <input value={segment} onChange={e => setSegment(e.target.value)}
                    placeholder="مثال: PMEs مصرية 10-50 موظف" className={inputClass} />
                </div>
                <div>
                  <label className="text-slate-400 text-xs block mb-1.5">تكلفة تقديم الخدمة (COGS)</label>
                  <input value={cogs} onChange={e => setCogs(e.target.value)}
                    placeholder="مثال: 200 جنيه/شهر/عميل" className={inputClass} />
                </div>
                <div className="col-span-2">
                  <label className="text-slate-400 text-xs block mb-1.5">أسعار المنافسين</label>
                  <input value={competitors} onChange={e => setCompetitors(e.target.value)}
                    placeholder="مثال: المنافس أ = 500 جنيه/شهر، المنافس ب = 300 جنيه/شهر" className={inputClass} />
                </div>
              </div>
            </div>

            <button onClick={handleSubmit} disabled={loading || !product.trim()}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
              {loading ? "جاري بناء الاستراتيجية..." : "ابنِ استراتيجية التسعير"}
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
                  className="bg-slate-900/50 border border-emerald-500/20 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400 text-sm font-medium flex items-center gap-1">
                      <CheckCircle2 size={14} /> استراتيجية التسعير الذكي
                    </span>
                    <div className="flex gap-2">
                      <button onClick={() => { setResult(""); setProduct(""); }}
                        className="text-slate-400 hover:text-white transition-colors"><RefreshCw size={14} /></button>
                      <button onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                        className="text-slate-400 hover:text-white transition-colors">
                        {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                  <div className="text-sm leading-relaxed prose prose-invert prose-neutral max-w-none
                    prose-headings:text-emerald-400 prose-headings:font-bold prose-strong:text-white
                    prose-li:text-slate-300 prose-p:text-slate-300" dir="auto">
                    <ReactMarkdown>{result}</ReactMarkdown>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Quick Links */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="grid grid-cols-3 gap-3">
            {[
              { href: "/ideas/analyze", label: "مختبر الأفكار", icon: "🧠" },
              { href: "/customer-discovery", label: "اكتشاف العملاء", icon: "🎯" },
              { href: "/competitor-watch", label: "رصد المنافسين", icon: "👁️" },
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

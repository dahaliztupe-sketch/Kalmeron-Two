"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Globe, Sparkles, ArrowLeft, Loader2, CheckCircle2,
  Copy, Check, RefreshCw, AlertCircle, Search,
  TrendingUp, BarChart3, Target,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import ReactMarkdown from "react-markdown";

type IntelMode = "market" | "trends" | "customer" | "entry";

const INTEL_MODES = [
  { id: "market" as IntelMode, label: "تحليل السوق", icon: BarChart3, desc: "حجم السوق، النمو، والفرص" },
  { id: "trends" as IntelMode, label: "اتجاهات السوق", icon: TrendingUp, desc: "الترندات الحالية في قطاعك" },
  { id: "customer" as IntelMode, label: "ملف العميل المثالي", icon: Target, desc: "ICP وسلوك المشتري المصري" },
  { id: "entry" as IntelMode, label: "استراتيجية الدخول", icon: Globe, desc: "كيف تدخل السوق بأقل خسائر" },
];

const SECTORS = [
  "تكنولوجيا / SaaS", "التجارة الإلكترونية", "الخدمات المالية / Fintech",
  "التعليم والتدريب", "الرعاية الصحية", "العقارات والبناء",
  "الأغذية والمطاعم", "اللوجستيات والتوصيل", "التسويق والإعلان",
  "الترفيه والمحتوى", "الطاقة والاستدامة", "الزراعة والتكنولوجيا الزراعية",
  "السياحة والسفر", "أخرى",
];

export default function MarketIntelligencePage() {
  const { user } = useAuth();
  const [mode, setMode] = useState<IntelMode>("market");
  const [sector, setSector] = useState("تكنولوجيا / SaaS");
  const [product, setProduct] = useState("");
  const [geography, setGeography] = useState("القاهرة الكبرى");
  const [targetSegment, setTargetSegment] = useState("");

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
      const res = await fetch("/api/market-intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ mode, sector, product, geography, targetSegment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "حدث خطأ");
      setResult(data.result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  }, [mode, sector, product, geography, targetSegment, loading, user]);

  const inputClass = "w-full bg-slate-900/70 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 text-sm";
  const currentMode = INTEL_MODES.find(m => m.id === mode)!;

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
                <Globe className="text-cyan-400" size={24} />
                استخبارات السوق
              </h1>
              <p className="text-slate-400 text-sm mt-1">تحليلات سوقية عميقة مُخصَّصة للسوق المصري والعربي</p>
            </div>
          </motion.div>

          {/* Mode Cards */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="grid grid-cols-2 gap-3">
            {INTEL_MODES.map(({ id, label, icon: Icon, desc }) => (
              <button key={id} onClick={() => { setMode(id); setResult(""); setError(""); }}
                className={`text-right p-4 rounded-xl border transition-all ${
                  mode === id
                    ? "bg-cyan-900/20 border-cyan-500/50 shadow-lg"
                    : "bg-slate-800/40 border-slate-700/40 hover:border-slate-600/60"
                }`}>
                <Icon size={18} className={mode === id ? "text-cyan-400 mb-1" : "text-slate-400 mb-1"} />
                <div className={`text-sm font-semibold ${mode === id ? "text-cyan-300" : "text-slate-300"}`}>{label}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{desc}</div>
              </button>
            ))}
          </motion.div>

          {/* Form */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 space-y-4">

            <div className="flex items-center gap-2 mb-1">
              <currentMode.icon className="text-cyan-400" size={18} />
              <span className="font-semibold text-cyan-400">{currentMode.label}</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-slate-400 text-xs block mb-1.5">المنتج/الخدمة *</label>
                <textarea value={product} onChange={e => setProduct(e.target.value)}
                  placeholder="مثال: منصة لإدارة المصروفات للشركات الصغيرة في مصر..."
                  rows={2}
                  className="w-full bg-slate-900/70 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 resize-none focus:outline-none focus:border-cyan-500/50 text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-xs block mb-1.5">القطاع الصناعي</label>
                  <select value={sector} onChange={e => setSector(e.target.value)} className={inputClass}>
                    {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-xs block mb-1.5">الجغرافيا المستهدفة</label>
                  <input value={geography} onChange={e => setGeography(e.target.value)}
                    placeholder="مثال: القاهرة، مصر، MENA" className={inputClass} />
                </div>
                <div className="col-span-2">
                  <label className="text-slate-400 text-xs block mb-1.5">الشريحة المستهدفة</label>
                  <input value={targetSegment} onChange={e => setTargetSegment(e.target.value)}
                    placeholder="مثال: الشركات الصغيرة 10-50 موظف، قطاع التجزئة" className={inputClass} />
                </div>
              </div>
            </div>

            <button onClick={handleSubmit} disabled={loading || !product.trim()}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              {loading ? "جاري التحليل..." : `حلّل ${currentMode.label}`}
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
                  className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-400 text-sm font-medium flex items-center gap-1">
                      <CheckCircle2 size={14} /> {currentMode.label}
                    </span>
                    <div className="flex gap-2">
                      <button onClick={() => { setResult(""); }}
                        className="text-slate-400 hover:text-white transition-colors"><RefreshCw size={14} /></button>
                      <button onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                        className="text-slate-400 hover:text-white transition-colors">
                        {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                  <div className="text-sm leading-relaxed prose prose-invert prose-neutral max-w-none
                    prose-headings:text-cyan-400 prose-headings:font-bold prose-strong:text-white
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
              { href: "/competitor-watch", label: "رصد المنافسين", icon: "👁️" },
              { href: "/customer-discovery", label: "اكتشاف العملاء", icon: "🎯" },
              { href: "/ideas/analyze", label: "مختبر الأفكار", icon: "🧠" },
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

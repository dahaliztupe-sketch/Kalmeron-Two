"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Presentation, Loader2, CheckCircle2, Copy, Check,
  RefreshCw, AlertCircle, Download, ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import ReactMarkdown from "react-markdown";

const STAGES = [
  "Pre-Seed", "Seed", "Series A", "Series B",
];

const SECTORS = [
  "SaaS / برمجيات", "تجارة إلكترونية", "Fintech / مالية",
  "EdTech / تعليم", "HealthTech / صحة", "Marketplace",
  "لوجستيات وتوصيل", "تقنية زراعية", "عقارات", "أخرى",
];

export default function InvestorDeckPage() {
  const { user } = useAuth();

  const [startupName, setStartupName] = useState("");
  const [problem, setProblem] = useState("");
  const [solution, setSolution] = useState("");
  const [sector, setSector] = useState("SaaS / برمجيات");
  const [stage, setStage] = useState("Seed");
  const [traction, setTraction] = useState("");
  const [teamBio, setTeamBio] = useState("");
  const [askAmount, setAskAmount] = useState("");

  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const isReady = startupName.trim() && problem.trim() && solution.trim();

  const handleGenerate = useCallback(async () => {
    if (!isReady || loading) return;
    setLoading(true);
    setError("");
    setResult("");
    try {
      const token = await user?.getIdToken();
      const res = await fetch("/api/investor-deck", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ startupName, problem, solution, sector, stage, traction, teamBio, askAmount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "حدث خطأ");
      setResult(data.result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  }, [startupName, problem, solution, sector, stage, traction, teamBio, askAmount, loading, user, isReady]);

  const inputClass = "w-full bg-slate-900/70 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 text-sm";

  return (
    <AppShell>
      <div className="min-h-screen bg-[#0a0a0f] text-white" dir="rtl">
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">

          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
            <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Presentation className="text-cyan-400" size={22} />
                مُنشئ عرض المستثمرين
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                أدخل بيانات شركتك وسنولّد لك هيكل عرض كامل من 12 شريحة بالعربية
              </p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 space-y-4">

            <div className="grid grid-cols-1 gap-4">

              <div>
                <label className="text-slate-400 text-xs block mb-1.5">اسم الشركة الناشئة *</label>
                <input value={startupName} onChange={e => setStartupName(e.target.value)}
                  placeholder="مثال: لوجيتك — منصة شحن ذكية" className={inputClass} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-xs block mb-1.5">القطاع</label>
                  <select value={sector} onChange={e => setSector(e.target.value)} className={inputClass}>
                    {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-xs block mb-1.5">المرحلة</label>
                  <select value={stage} onChange={e => setStage(e.target.value)} className={inputClass}>
                    {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-xs block mb-1.5">المشكلة التي تحلها *</label>
                <textarea value={problem} onChange={e => setProblem(e.target.value)}
                  placeholder="مثال: أصحاب المتاجر الصغيرة يدفعون ضعف سعر الشحن مقارنة بالشركات الكبيرة بسبب غياب حلول الشحن المجمّع"
                  rows={3}
                  className="w-full bg-slate-900/70 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 resize-none focus:outline-none focus:border-cyan-500/50 text-sm" />
              </div>

              <div>
                <label className="text-slate-400 text-xs block mb-1.5">الحل الذي تقدمه *</label>
                <textarea value={solution} onChange={e => setSolution(e.target.value)}
                  placeholder="مثال: منصة تجمّع طلبات الشحن من المتاجر الصغيرة وتفاوض بأسعار الجملة مع شركات الشحن"
                  rows={3}
                  className="w-full bg-slate-900/70 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 resize-none focus:outline-none focus:border-cyan-500/50 text-sm" />
              </div>

              <div>
                <label className="text-slate-400 text-xs block mb-1.5">الزخم والإنجازات (Traction) — اختياري</label>
                <input value={traction} onChange={e => setTraction(e.target.value)}
                  placeholder="مثال: 120 متجر، MRR = 85,000 جنيه، نمو 18% شهرياً" className={inputClass} />
              </div>

              <div>
                <label className="text-slate-400 text-xs block mb-1.5">الفريق المؤسس — اختياري</label>
                <input value={teamBio} onChange={e => setTeamBio(e.target.value)}
                  placeholder="مثال: محمد — 10 سنوات لوجستيات، سارة — مطوّرة فودافون سابقاً" className={inputClass} />
              </div>

              <div>
                <label className="text-slate-400 text-xs block mb-1.5">حجم الجولة المطلوب — اختياري</label>
                <input value={askAmount} onChange={e => setAskAmount(e.target.value)}
                  placeholder="مثال: 500,000 دولار مقابل 15% equity" className={inputClass} />
              </div>
            </div>

            <button onClick={handleGenerate} disabled={!isReady || loading}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Presentation size={16} />}
              {loading ? "جاري إنشاء العرض..." : "أنشئ عرض المستثمرين"}
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
                      <CheckCircle2 size={14} /> عرض المستثمرين جاهز
                    </span>
                    <div className="flex gap-2">
                      <button onClick={() => setResult("")}
                        className="text-slate-400 hover:text-white transition-colors">
                        <RefreshCw size={14} />
                      </button>
                      <button onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                        className="text-slate-400 hover:text-white transition-colors">
                        {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      </button>
                      <button
                        onClick={() => { const b = new Blob([result], { type: "text/markdown" }); const u = URL.createObjectURL(b); const a = document.createElement("a"); a.href = u; a.download = `investor-deck-${startupName.replace(/\s+/g, "-")}-${Date.now()}.md`; a.click(); URL.revokeObjectURL(u); }}
                        className="text-slate-400 hover:text-white transition-colors" title="تحميل">
                        <Download size={14} />
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

        </div>
      </div>
    </AppShell>
  );
}

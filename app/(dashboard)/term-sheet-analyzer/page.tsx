"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileText, ArrowLeft, Loader2, CheckCircle2, Copy, Check,
  AlertCircle, RefreshCw, ShieldAlert, Scale, Upload, X,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import ReactMarkdown from "react-markdown";

const ROUND_TYPES = ["Pre-Seed", "Seed", "Series A", "Series B", "Series C+", "Convertible Note", "SAFE"];

const EXAMPLE_TERM_SHEET = `مثال على نص Term Sheet:
- مبلغ الاستثمار: 500,000 دولار
- التقييم Pre-Money: 2,000,000 دولار  
- نوع الأسهم: Preferred Shares
- نسبة الحصة: 20%
- حق الفيتو: على قرارات استراتيجية
- Pro-Rata Rights: نعم
- Liquidation Preference: 1x Non-Participating
- Anti-Dilution: Broad-Based Weighted Average
- Board Seat: نعم (مقعد واحد)
- Information Rights: تقارير ربع سنوية`;

type InputMode = "text" | "pdf";

export default function TermSheetAnalyzerPage() {
  const { user } = useAuth();
  const [inputMode, setInputMode] = useState<InputMode>("text");
  const [termSheetText, setTermSheetText] = useState("");
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [roundType, setRoundType] = useState("Seed");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfFileName, setPdfFileName] = useState("");
  const [error, setError] = useState("");
  const [pdfError, setPdfError] = useState("");
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePdfUpload = useCallback(async (file: File) => {
    if (!user) {
      setPdfError("يجب تسجيل الدخول لرفع ملفات PDF");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setPdfError("حجم الملف يتجاوز 10 MB");
      return;
    }
    setPdfLoading(true);
    setPdfError("");
    setPdfFileName(file.name);
    try {
      const token = await user.getIdToken();
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/extract-pdf", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل استخراج النص من PDF");
      const extractedText = data.text ?? "";
      if (!extractedText.trim()) throw new Error("لم يتم العثور على نص في الملف");
      setTermSheetText(extractedText.slice(0, 15000));
    } catch (e) {
      setPdfError(e instanceof Error ? e.message : "فشل استخراج النص");
      setPdfFileName("");
    } finally {
      setPdfLoading(false);
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handlePdfUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === "application/pdf") handlePdfUpload(file);
    else setPdfError("يرجى رفع ملف PDF فقط");
  };

  const handleAnalyze = useCallback(async () => {
    if (!termSheetText.trim() || loading) return;
    setLoading(true); setError(""); setResult("");
    try {
      const token = await user?.getIdToken();
      const res = await fetch("/api/term-sheet-analyzer", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ termSheetText, investmentAmount, roundType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "حدث خطأ");
      setResult(data.result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  }, [termSheetText, investmentAmount, roundType, loading, user]);

  const clearPdf = () => {
    setPdfFileName("");
    setTermSheetText("");
    setPdfError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const inputClass = "w-full bg-slate-900/70 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 text-sm";

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
                <FileText className="text-blue-400" size={24} />
                محلل عروض الاستثمار (Term Sheet)
              </h1>
              <p className="text-slate-400 text-sm mt-1">افهم كل بند في عرض الاستثمار قبل التوقيع — الصق النص أو ارفع PDF</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}
            className="bg-blue-900/10 border border-blue-500/20 rounded-xl p-3 text-blue-300 text-xs flex items-start gap-2">
            <ShieldAlert size={14} className="mt-0.5 shrink-0" />
            <span>هذا التحليل للإرشاد العام. استشر محامياً متخصصاً في صفقات الاستثمار قبل التوقيع على أي وثيقة قانونية.</span>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 space-y-4">

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 text-xs block mb-1.5">نوع الجولة</label>
                <select value={roundType} onChange={e => setRoundType(e.target.value)} className={inputClass}>
                  {ROUND_TYPES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-xs block mb-1.5">مبلغ الاستثمار</label>
                <input value={investmentAmount} onChange={e => setInvestmentAmount(e.target.value)}
                  placeholder="مثال: 500,000 دولار" className={inputClass} />
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setInputMode("text")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm transition-all ${inputMode === "text" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white border border-slate-700/50"}`}>
                <FileText size={13} /> لصق النص
              </button>
              <button onClick={() => setInputMode("pdf")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm transition-all ${inputMode === "pdf" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white border border-slate-700/50"}`}>
                <Upload size={13} /> رفع PDF
              </button>
            </div>

            {inputMode === "text" ? (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-slate-400 text-xs">نص الـ Term Sheet *</label>
                  <button onClick={() => setTermSheetText(EXAMPLE_TERM_SHEET)}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                    أدرج مثالاً
                  </button>
                </div>
                <textarea
                  value={termSheetText}
                  onChange={e => setTermSheetText(e.target.value)}
                  placeholder="الصق نص الـ Term Sheet هنا... (يمكن أن يكون نصاً عربياً أو إنجليزياً أو مزيجاً منهما)"
                  rows={12}
                  className="w-full bg-slate-900/70 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 resize-none focus:outline-none focus:border-blue-500/50 text-sm font-mono leading-relaxed"
                />
                <p className="text-xs text-slate-600 mt-1">{termSheetText.length} حرف</p>
              </div>
            ) : (
              <div className="space-y-3">
                <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" onChange={handleFileChange} className="hidden" />

                {!pdfFileName ? (
                  <div
                    onDrop={handleDrop}
                    onDragOver={e => e.preventDefault()}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-700/60 hover:border-blue-500/50 rounded-xl p-8 text-center cursor-pointer transition-all group">
                    {pdfLoading ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 size={24} className="animate-spin text-blue-400" />
                        <p className="text-sm text-slate-400">جاري استخراج النص من PDF...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload size={24} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
                        <p className="text-sm text-slate-400 group-hover:text-slate-300">اسحب ملف PDF هنا أو اضغط للاختيار</p>
                        <p className="text-xs text-slate-600">PDF حتى 10 MB</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-900/60 border border-blue-500/20 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText size={18} className="text-blue-400" />
                      <div>
                        <p className="text-sm text-white">{pdfFileName}</p>
                        <p className="text-xs text-slate-400">{termSheetText.length} حرف مُستخرَج</p>
                      </div>
                    </div>
                    <button onClick={clearPdf} className="text-slate-500 hover:text-rose-400 transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                )}

                {pdfError && (
                  <p className="text-xs text-rose-400 flex items-center gap-1">
                    <AlertCircle size={12} /> {pdfError}
                  </p>
                )}

                {termSheetText && (
                  <div className="bg-slate-900/40 border border-slate-700/30 rounded-xl p-3 max-h-48 overflow-y-auto">
                    <p className="text-xs text-slate-500 mb-1">معاينة النص المُستخرَج:</p>
                    <p className="text-xs text-slate-400 whitespace-pre-wrap font-mono">{termSheetText.slice(0, 800)}...</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button onClick={handleAnalyze}
                disabled={loading || termSheetText.trim().length < 50}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Scale size={16} />}
                {loading ? "جاري التحليل..." : "حلّل الـ Term Sheet"}
              </button>
              {result && (
                <button onClick={() => { setResult(""); setTermSheetText(""); setPdfFileName(""); }}
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
                  className="bg-slate-900/50 border border-blue-500/20 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-400 text-sm font-medium flex items-center gap-1">
                      <CheckCircle2 size={14} /> تحليل الـ Term Sheet
                    </span>
                    <button onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                      className="text-slate-400 hover:text-white transition-colors">
                      {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                  </div>
                  <div className="text-sm leading-relaxed prose prose-invert prose-neutral max-w-none
                    prose-headings:text-blue-400 prose-headings:font-bold prose-strong:text-white
                    prose-li:text-slate-300 prose-p:text-slate-300" dir="auto">
                    <ReactMarkdown>{result}</ReactMarkdown>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="grid grid-cols-3 gap-3">
            {[
              { href: "/cap-table", label: "إدارة الحصص", icon: "📊" },
              { href: "/legal-ai", label: "المستشار القانوني", icon: "⚖️" },
              { href: "/investor", label: "لوحة المستثمر", icon: "💼" },
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

"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users, Sparkles, ArrowLeft, Loader2, CheckCircle2,
  Copy, Check, RefreshCw, AlertCircle, FileText,
  UserPlus, Star, MessageSquare, Download, Upload, X,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import ReactMarkdown from "react-markdown";

type HRMode = "jobdesc" | "interview" | "performance" | "offer" | "cv-screen";

const HR_MODES = [
  { id: "jobdesc" as HRMode, label: "وصف وظيفي", icon: FileText, desc: "وصف وظيفي احترافي لأي دور" },
  { id: "interview" as HRMode, label: "أسئلة المقابلة", icon: MessageSquare, desc: "أسئلة مقابلة مُخصَّصة للدور" },
  { id: "performance" as HRMode, label: "تقييم الأداء", icon: Star, desc: "نموذج تقييم أداء شامل" },
  { id: "offer" as HRMode, label: "عرض العمل", icon: UserPlus, desc: "مسوّدة عرض عمل احترافية" },
  { id: "cv-screen" as HRMode, label: "فحص السيرة الذاتية", icon: Upload, desc: "حلّل CV وقيّم التوافق مع الوظيفة" },
];

const DEPARTMENTS = [
  "هندسة برمجيات", "تسويق ونمو", "مبيعات", "خدمة عملاء", "عمليات",
  "مالية ومحاسبة", "موارد بشرية", "منتج وتصميم", "إدارة تنفيذية", "أخرى",
];

export default function HRAIPage() {
  const { user } = useAuth();
  const [mode, setMode] = useState<HRMode>("jobdesc");
  const [role, setRole] = useState("");
  const [department, setDepartment] = useState("هندسة برمجيات");
  const [experience, setExperience] = useState("");
  const [skills, setSkills] = useState("");
  const [context, setContext] = useState("");
  const [salary, setSalary] = useState("");

  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvText, setCvText] = useState("");
  const [cvLoading, setCvLoading] = useState(false);
  const [cvError, setCvError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCvUpload = useCallback(async (file: File) => {
    if (!user) { setCvError("يجب تسجيل الدخول لرفع ملف"); return; }
    if (file.size > 10 * 1024 * 1024) { setCvError("حجم الملف يتجاوز 10 MB"); return; }
    setCvLoading(true); setCvError(""); setCvText(""); setCvFile(file);
    try {
      const token = await user.getIdToken();
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/extract-pdf", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل استخراج النص");
      if (!data.text?.trim()) throw new Error("لم يُعثر على نص في الملف");
      setCvText(data.text.slice(0, 12000));
    } catch (e) {
      setCvError(e instanceof Error ? e.message : "فشل رفع الملف");
      setCvFile(null);
    } finally {
      setCvLoading(false);
    }
  }, [user]);

  const handleSubmit = useCallback(async () => {
    if (loading) return;
    if (mode === "cv-screen") {
      if (!cvText.trim()) { setCvError("ارفع ملف CV أولاً"); return; }
      if (!role.trim()) { setError("أدخل المسمى الوظيفي"); return; }
    } else {
      if (!role.trim()) return;
    }
    setLoading(true); setError(""); setResult("");
    try {
      const token = await user?.getIdToken();
      const body: Record<string, string> = { mode, role, department, experience, skills, context, salary };
      if (mode === "cv-screen") body.cvText = cvText;
      const res = await fetch("/api/hr-ai", {
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
  }, [mode, role, department, experience, skills, context, salary, cvText, loading, user]);

  const inputClass = "w-full bg-slate-900/70 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50 text-sm";
  const currentMode = HR_MODES.find(m => m.id === mode)!;

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
                <Users className="text-orange-400" size={24} />
                مساعد الموارد البشرية
              </h1>
              <p className="text-slate-400 text-sm mt-1">أوصاف وظيفية، فحص CVs، أسئلة مقابلات، وعروض عمل — بالذكاء الاصطناعي</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {HR_MODES.map(({ id, label, icon: Icon, desc }) => (
              <button key={id} onClick={() => { setMode(id); setResult(""); setError(""); setCvError(""); }}
                className={`text-right p-4 rounded-xl border transition-all ${
                  mode === id
                    ? "bg-orange-900/20 border-orange-500/50 shadow-lg"
                    : "bg-slate-800/40 border-slate-700/40 hover:border-slate-600/60"
                }`}>
                <Icon size={18} className={mode === id ? "text-orange-400 mb-1" : "text-slate-400 mb-1"} />
                <div className={`text-sm font-semibold ${mode === id ? "text-orange-300" : "text-slate-300"}`}>{label}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{desc}</div>
              </button>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 space-y-4">

            <div className="flex items-center gap-2 mb-1">
              <currentMode.icon className="text-orange-400" size={18} />
              <span className="font-semibold text-orange-400">{currentMode.label}</span>
            </div>

            {mode === "cv-screen" ? (
              <div className="space-y-4">
                <div>
                  <label className="text-slate-400 text-xs block mb-1.5">المسمى الوظيفي *</label>
                  <input value={role} onChange={e => setRole(e.target.value)}
                    placeholder="مثال: Senior Backend Engineer" className={inputClass} />
                </div>
                <div>
                  <label className="text-slate-400 text-xs block mb-1.5">المتطلبات الأساسية (اختياري)</label>
                  <input value={skills} onChange={e => setSkills(e.target.value)}
                    placeholder="مثال: Python, 5 سنوات خبرة، ماجستير في الحاسوب" className={inputClass} />
                </div>

                <div>
                  <label className="text-slate-400 text-xs block mb-1.5">ملف السيرة الذاتية (PDF)</label>
                  <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleCvUpload(f); }} />
                  {!cvFile ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleCvUpload(f); }}
                      onDragOver={e => e.preventDefault()}
                      className="border-2 border-dashed border-slate-700/60 hover:border-orange-500/50 rounded-xl p-6 text-center cursor-pointer transition-all group">
                      {cvLoading ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 size={22} className="animate-spin text-orange-400" />
                          <p className="text-sm text-slate-400">جاري استخراج نص CV...</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Upload size={22} className="text-slate-500 group-hover:text-orange-400 transition-colors" />
                          <p className="text-sm text-slate-400 group-hover:text-slate-300">اسحب ملف PDF أو اضغط للاختيار</p>
                          <p className="text-xs text-slate-600">PDF حتى 10 MB</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-slate-900/60 border border-orange-500/20 rounded-xl p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText size={16} className="text-orange-400" />
                        <div>
                          <p className="text-sm text-white">{cvFile.name}</p>
                          <p className="text-xs text-slate-400">{cvText.length} حرف مستخرَج</p>
                        </div>
                      </div>
                      <button onClick={() => { setCvFile(null); setCvText(""); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                        className="text-slate-500 hover:text-rose-400 transition-colors"><X size={14} /></button>
                    </div>
                  )}
                  {cvError && <p className="text-xs text-rose-400 mt-1 flex items-center gap-1"><AlertCircle size={11} />{cvError}</p>}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 text-xs block mb-1.5">المسمى الوظيفي *</label>
                    <input value={role} onChange={e => setRole(e.target.value)}
                      placeholder="مثال: Senior Frontend Engineer" className={inputClass} />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs block mb-1.5">القسم</label>
                    <select value={department} onChange={e => setDepartment(e.target.value)} className={inputClass}>
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs block mb-1.5">سنوات الخبرة المطلوبة</label>
                    <input value={experience} onChange={e => setExperience(e.target.value)}
                      placeholder="مثال: 3-5 سنوات" className={inputClass} />
                  </div>
                  {mode === "offer" && (
                    <div>
                      <label className="text-slate-400 text-xs block mb-1.5">نطاق الراتب</label>
                      <input value={salary} onChange={e => setSalary(e.target.value)}
                        placeholder="مثال: 15,000 - 20,000 جنيه" className={inputClass} />
                    </div>
                  )}
                  <div className={mode === "offer" ? "col-span-2" : ""}>
                    <label className="text-slate-400 text-xs block mb-1.5">المهارات الأساسية المطلوبة</label>
                    <input value={skills} onChange={e => setSkills(e.target.value)}
                      placeholder="مثال: React, TypeScript, GraphQL" className={inputClass} />
                  </div>
                  <div className="col-span-2">
                    <label className="text-slate-400 text-xs block mb-1.5">سياق إضافي عن الشركة/الدور</label>
                    <textarea value={context} onChange={e => setContext(e.target.value)}
                      placeholder={mode === "jobdesc"
                        ? "مثال: شركة SaaS ناشئة في مرحلة Seed، فريق من 8 أشخاص..."
                        : mode === "performance"
                        ? "مثال: مطوّر في الشركة منذ 6 أشهر، يعمل على منتج X، أداؤه متوسط..."
                        : "مثال: نريد التركيز على قدرة حل المشكلات وروح الفريق..."}
                      rows={2}
                      className="w-full bg-slate-900/70 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 resize-none focus:outline-none focus:border-orange-500/50 text-sm" />
                  </div>
                </div>
              </div>
            )}

            <button onClick={handleSubmit}
              disabled={loading || (mode === "cv-screen" ? (!cvText.trim() || !role.trim()) : !role.trim())}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {loading
                ? (mode === "cv-screen" ? "جاري تحليل CV..." : "جاري الإنشاء...")
                : (mode === "cv-screen" ? "حلّل السيرة الذاتية وقيّم التوافق" : `أنشئ ${currentMode.label}`)}
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
                  className="bg-slate-900/50 border border-orange-500/20 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-orange-400 text-sm font-medium flex items-center gap-1">
                      <CheckCircle2 size={14} /> {currentMode.label}
                    </span>
                    <div className="flex gap-2">
                      <button onClick={() => { setResult(""); }}
                        className="text-slate-400 hover:text-white transition-colors"><RefreshCw size={14} /></button>
                      <button onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                        className="text-slate-400 hover:text-white transition-colors">
                        {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      </button>
                      <button onClick={() => { const b = new Blob([result], { type: "text/markdown" }); const u = URL.createObjectURL(b); const a = document.createElement("a"); a.href = u; a.download = `hr-doc-${Date.now()}.md`; a.click(); URL.revokeObjectURL(u); }}
                        className="text-slate-400 hover:text-white transition-colors" title="تحميل">
                        <Download size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="text-sm leading-relaxed prose prose-invert prose-neutral max-w-none
                    prose-headings:text-orange-400 prose-headings:font-bold prose-strong:text-white
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
              { href: "/cofounder-health", label: "صحة الفريق", icon: "🤝" },
              { href: "/founder-agreement", label: "اتفاقية المؤسسين", icon: "📋" },
              { href: "/wellbeing", label: "الصحة النفسية", icon: "💚" },
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

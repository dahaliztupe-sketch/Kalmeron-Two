"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users, Sparkles, ArrowLeft, Loader2, CheckCircle2,
  Copy, Check, RefreshCw, AlertCircle, FileText,
  UserPlus, Star, MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import ReactMarkdown from "react-markdown";

type HRMode = "jobdesc" | "interview" | "performance" | "offer";

const HR_MODES = [
  { id: "jobdesc" as HRMode, label: "وصف وظيفي", icon: FileText, desc: "وصف وظيفي احترافي لأي دور" },
  { id: "interview" as HRMode, label: "أسئلة المقابلة", icon: MessageSquare, desc: "أسئلة مقابلة مُخصَّصة للدور" },
  { id: "performance" as HRMode, label: "تقييم الأداء", icon: Star, desc: "نموذج تقييم أداء شامل" },
  { id: "offer" as HRMode, label: "عرض العمل", icon: UserPlus, desc: "مسوّدة عرض عمل احترافية" },
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

  const handleSubmit = useCallback(async () => {
    if (!role.trim() || loading) return;
    setLoading(true);
    setError("");
    setResult("");
    try {
      const token = await user?.getIdToken();
      const res = await fetch("/api/hr-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ mode, role, department, experience, skills, context, salary }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "حدث خطأ");
      setResult(data.result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  }, [mode, role, department, experience, skills, context, salary, loading, user]);

  const inputClass = "w-full bg-slate-900/70 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50 text-sm";
  const currentMode = HR_MODES.find(m => m.id === mode)!;

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
                <Users className="text-orange-400" size={24} />
                مساعد الموارد البشرية
              </h1>
              <p className="text-slate-400 text-sm mt-1">أوصاف وظيفية، أسئلة مقابلات، وعروض عمل بالذكاء الاصطناعي</p>
            </div>
          </motion.div>

          {/* Mode Cards */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="grid grid-cols-2 gap-3">
            {HR_MODES.map(({ id, label, icon: Icon, desc }) => (
              <button key={id} onClick={() => { setMode(id); setResult(""); setError(""); }}
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

          {/* Form */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 space-y-4">

            <div className="flex items-center gap-2 mb-1">
              <currentMode.icon className="text-orange-400" size={18} />
              <span className="font-semibold text-orange-400">{currentMode.label}</span>
            </div>

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

            <button onClick={handleSubmit} disabled={loading || !role.trim()}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {loading ? "جاري الإنشاء..." : `أنشئ ${currentMode.label}`}
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

          {/* Quick Links */}
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

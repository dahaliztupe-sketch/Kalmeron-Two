"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Mail, Sparkles, ArrowLeft, Loader2, CheckCircle2,
  Copy, Check, RefreshCw, AlertCircle,
  Send, FileText, MessageSquare, Handshake,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import ReactMarkdown from "react-markdown";

type EmailMode = "outreach" | "followup" | "proposal" | "partnership";

const EMAIL_MODES = [
  { id: "outreach" as EmailMode, label: "Cold Outreach", icon: Send, desc: "رسالة تواصل أولى لعميل محتمل" },
  { id: "followup" as EmailMode, label: "متابعة ذكية", icon: RefreshCw, desc: "رسالة متابعة لا تبدو ملحّة" },
  { id: "proposal" as EmailMode, label: "عرض خدمات", icon: FileText, desc: "عرض خدمات احترافي ومقنع" },
  { id: "partnership" as EmailMode, label: "طلب شراكة", icon: Handshake, desc: "رسالة شراكة أو تعاون استراتيجي" },
];

const TONES = [
  { value: "professional", label: "احترافي رسمي" },
  { value: "friendly", label: "ودي ومريح" },
  { value: "direct", label: "مباشر وموجز" },
  { value: "arabic", label: "عربي أصيل" },
];

export default function EmailAIPage() {
  const { user } = useAuth();
  const [mode, setMode] = useState<EmailMode>("outreach");
  const [sender, setSender] = useState("");
  const [recipient, setRecipient] = useState("");
  const [context, setContext] = useState("");
  const [goal, setGoal] = useState("");
  const [tone, setTone] = useState("professional");
  const [language, setLanguage] = useState<"ar" | "en">("ar");

  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!context.trim() || loading) return;
    setLoading(true);
    setError("");
    setResult("");
    try {
      const token = await user?.getIdToken();
      const res = await fetch("/api/email-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ mode, sender, recipient, context, goal, tone, language }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "حدث خطأ");
      setResult(data.result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  }, [mode, sender, recipient, context, goal, tone, language, loading, user]);

  const inputClass = "w-full bg-slate-900/70 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 text-sm";
  const currentMode = EMAIL_MODES.find(m => m.id === mode)!;

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
                <Mail className="text-indigo-400" size={24} />
                كاتب البريد الذكي
              </h1>
              <p className="text-slate-400 text-sm mt-1">رسائل بريد إلكتروني احترافية ومُقنعة بالذكاء الاصطناعي</p>
            </div>
          </motion.div>

          {/* Mode Cards */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="grid grid-cols-2 gap-3">
            {EMAIL_MODES.map(({ id, label, icon: Icon, desc }) => (
              <button key={id} onClick={() => { setMode(id); setResult(""); setError(""); }}
                className={`text-right p-4 rounded-xl border transition-all ${
                  mode === id
                    ? "bg-indigo-900/20 border-indigo-500/50 shadow-lg"
                    : "bg-slate-800/40 border-slate-700/40 hover:border-slate-600/60"
                }`}>
                <Icon size={18} className={mode === id ? "text-indigo-400 mb-1" : "text-slate-400 mb-1"} />
                <div className={`text-sm font-semibold ${mode === id ? "text-indigo-300" : "text-slate-300"}`}>{label}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{desc}</div>
              </button>
            ))}
          </motion.div>

          {/* Form */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 space-y-4">

            <div className="flex items-center gap-2 mb-1">
              <currentMode.icon className="text-indigo-400" size={18} />
              <span className="font-semibold text-indigo-400">{currentMode.label}</span>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-xs block mb-1.5">المُرسِل (أنت / شركتك)</label>
                  <input value={sender} onChange={e => setSender(e.target.value)}
                    placeholder="مثال: أحمد، مؤسس منصة X" className={inputClass} />
                </div>
                <div>
                  <label className="text-slate-400 text-xs block mb-1.5">المُستلِم</label>
                  <input value={recipient} onChange={e => setRecipient(e.target.value)}
                    placeholder="مثال: مدير مشتريات شركة Y" className={inputClass} />
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-xs block mb-1.5">السياق والخلفية *</label>
                <textarea value={context} onChange={e => setContext(e.target.value)}
                  placeholder={mode === "outreach"
                    ? "مثال: أبيع نظام إدارة مخزون للمطاعم، وجدت الشركة عبر LinkedIn وأريد حجز اجتماع..."
                    : mode === "followup"
                    ? "مثال: أرسلت رسالة أسبوع مضى عن عرض الخدمات ولم يردوا..."
                    : "مثال: نريد التعاون مع X لأن منتجينا يستهدفان نفس الشريحة..."}
                  rows={3}
                  className="w-full bg-slate-900/70 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 resize-none focus:outline-none focus:border-indigo-500/50 text-sm" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 text-xs block mb-1.5">الهدف المطلوب</label>
                  <input value={goal} onChange={e => setGoal(e.target.value)}
                    placeholder="اجتماع / عرض / رد" className={inputClass} />
                </div>
                <div>
                  <label className="text-slate-400 text-xs block mb-1.5">النبرة</label>
                  <select value={tone} onChange={e => setTone(e.target.value)} className={inputClass}>
                    {TONES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-xs block mb-1.5">اللغة</label>
                  <select value={language} onChange={e => setLanguage(e.target.value as "ar" | "en")} className={inputClass}>
                    <option value="ar">عربي</option>
                    <option value="en">إنجليزي</option>
                  </select>
                </div>
              </div>
            </div>

            <button onClick={handleSubmit} disabled={loading || !context.trim()}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {loading ? "جاري الكتابة..." : `اكتب ${currentMode.label}`}
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
                  className="bg-slate-900/50 border border-indigo-500/20 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-indigo-400 text-sm font-medium flex items-center gap-1">
                      <CheckCircle2 size={14} /> الرسالة جاهزة
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
                    prose-headings:text-indigo-400 prose-headings:font-bold prose-strong:text-white
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
              { href: "/pitch-practice", label: "تدريب الـ Pitch", icon: "🎤" },
              { href: "/brand-voice", label: "صوت العلامة", icon: "✨" },
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

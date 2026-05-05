"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users, Sparkles, ArrowLeft, Loader2, Plus, Trash2,
  MessageSquare, FileText, Target, CheckCircle2, Copy, Check, Download,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";

type TabType = "discovery" | "script";

export default function CustomerDiscoveryPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<TabType>("discovery");
  const [businessIdea, setBusinessIdea] = useState("");
  const [targetSegment, setTargetSegment] = useState("");
  const [hypotheses, setHypotheses] = useState<string[]>(["", ""]);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const addHypothesis = () => setHypotheses(h => [...h, ""]);
  const removeHypothesis = (i: number) => setHypotheses(h => h.filter((_, idx) => idx !== i));
  const updateHypothesis = (i: number, val: string) => setHypotheses(h => h.map((hh, idx) => idx === i ? val : hh));

  const validHypotheses = hypotheses.filter(h => h.trim());
  const canSubmit = businessIdea.trim().length > 10 && validHypotheses.length >= 1 && !loading;

  const handleAnalyze = useCallback(async () => {
    if (!canSubmit) return;
    setLoading(true);
    setResult("");
    setError("");
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (user) headers["Authorization"] = `Bearer ${await user.getIdToken()}`;
      const res = await fetch("/api/customer-discovery", {
        method: "POST",
        headers,
        body: JSON.stringify({ businessIdea, targetSegment, hypotheses: validHypotheses }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطأ في الخادم");
      setResult(data.result ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  }, [businessIdea, targetSegment, validHypotheses, user, canSubmit]);

  const handleScript = useCallback(async () => {
    if (!businessIdea.trim() || loading) return;
    setLoading(true);
    setResult("");
    setError("");
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (user) headers["Authorization"] = `Bearer ${await user.getIdToken()}`;
      const res = await fetch("/api/customer-discovery", {
        method: "POST",
        headers,
        body: JSON.stringify({ mode: "script", businessIdea, targetSegment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطأ");
      setResult(data.result ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ");
    } finally {
      setLoading(false);
    }
  }, [businessIdea, targetSegment, user, loading]);

  const copyResult = async () => {
    await navigator.clipboard.writeText(result).catch(() => null);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const exportPersonaPdf = useCallback(async () => {
    if (!result || !user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/customer-discovery/persona-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ personaText: result, businessIdea, targetSegment }),
      });
      if (!res.ok) throw new Error("فشل التصدير");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `persona-card-${Date.now()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // silent — user can copy text manually
    }
  }, [result, user, businessIdea, targetSegment]);

  return (
    <AppShell>
      <div dir="rtl" className="max-w-4xl mx-auto space-y-6 pb-16">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-cyan-400 font-medium uppercase tracking-wide">Customer Discovery</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-2">اكتشاف العملاء</h1>
            <p className="text-white/50 max-w-xl text-sm">
              اختبر فرضياتك بأسلوب Mom Test قبل بناء أي شيء — ٩٠٪ من الستارت أبس تفشل لأنها بنت ما لا يريده أحد.
            </p>
          </div>
          <Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors">
            <ArrowLeft className="w-4 h-4" /> لوحة القيادة
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.07] w-fit">
          {[
            { key: "discovery" as const, label: "تحليل الفرضيات", icon: Target },
            { key: "script" as const, label: "سكريبت المقابلة", icon: MessageSquare },
          ].map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => { setTab(key); setResult(""); setError(""); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === key ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "text-white/40 hover:text-white/70"}`}>
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Mom Test Info */}
        <div className="rounded-xl border border-cyan-500/15 bg-cyan-500/5 p-4 text-xs text-cyan-200/70 leading-relaxed">
          <strong className="text-cyan-300">Mom Test:</strong> لا تسأل &quot;هل تحب فكرتي؟&quot; — اسأل عن حياة العميل الفعلية. الناس يكذبون لأنهم يريدون إرضاءك — البيانات لا تكذب.
        </div>

        {/* Common Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <label className="block text-xs text-white/50 mb-2 font-medium">الفكرة التجارية</label>
            <textarea
              value={businessIdea}
              onChange={e => setBusinessIdea(e.target.value)}
              placeholder="مثال: تطبيق لإدارة مخزون المطاعم الصغيرة في مصر..."
              rows={3}
              className="w-full bg-transparent text-white text-sm placeholder:text-white/20 resize-none focus:outline-none"
            />
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <label className="block text-xs text-white/50 mb-2 font-medium">الشريحة المستهدفة</label>
            <textarea
              value={targetSegment}
              onChange={e => setTargetSegment(e.target.value)}
              placeholder="مثال: أصحاب المطاعم الصغيرة (٥-١٥ طاولة) في القاهرة الكبرى..."
              rows={3}
              className="w-full bg-transparent text-white text-sm placeholder:text-white/20 resize-none focus:outline-none"
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {tab === "discovery" && !result && (
            <motion.div key="discovery-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              {/* Hypotheses */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-semibold text-white">الفرضيات التي تريد اختبارها</label>
                  <button onClick={addHypothesis} className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 border border-cyan-500/20 rounded-lg px-2.5 py-1 transition-colors">
                    <Plus className="w-3 h-3" /> أضف فرضية
                  </button>
                </div>
                <div className="space-y-3">
                  {hypotheses.map((h, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="mt-2.5 text-xs text-white/30 w-5 shrink-0">{i + 1}.</span>
                      <input
                        value={h}
                        onChange={e => updateHypothesis(i, e.target.value)}
                        placeholder={`مثال: أصحاب المطاعم يضيعون > ٢ ساعة يومياً في جرد المخزون يدوياً`}
                        className="flex-1 bg-white/[0.04] border border-white/[0.07] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-500/40 transition-colors"
                      />
                      {hypotheses.length > 1 && (
                        <button onClick={() => removeHypothesis(i)} className="mt-2 text-white/20 hover:text-rose-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-white/30 mt-3">
                  اكتب كل فرضية كجملة قابلة للاختبار — مثلاً: &quot;العملاء يدفعون حالياً أكثر من ٥٠٠ ج.م لحل هذا&quot;
                </p>
              </div>

              <button onClick={handleAnalyze} disabled={!canSubmit}
                className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-sm hover:opacity-90 disabled:opacity-40 transition-all shadow-lg shadow-cyan-500/20">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                {loading ? "يحلل الفرضيات..." : "حلّل الفرضيات وولّد أسئلة المقابلة"}
              </button>

              {error && <p className="text-rose-400 text-sm rounded-xl border border-rose-500/20 bg-rose-500/5 p-3">{error}</p>}
            </motion.div>
          )}

          {tab === "script" && !result && (
            <motion.div key="script-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-sm text-white/60 mb-2">
                  سيُنشئ الوكيل سكريبت مقابلة كاملاً (١٥-٢٠ دقيقة) بأسلوب حواري طبيعي يناسب ثقافة السوق المصري.
                </p>
                <ul className="text-xs text-white/40 space-y-1 list-disc list-inside">
                  <li>فتح المحادثة وكسر الجليد</li>
                  <li>أسئلة الألم والسلوك (Mom Test)</li>
                  <li>استكشاف الحلول الحالية</li>
                  <li>اختبار الاستعداد للدفع</li>
                  <li>إنهاء المقابلة والخطوات التالية</li>
                </ul>
              </div>
              <button onClick={handleScript} disabled={!businessIdea.trim() || loading}
                className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-bold text-sm hover:opacity-90 disabled:opacity-40 transition-all">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
                {loading ? "يكتب السكريبت..." : "ولّد سكريبت المقابلة"}
              </button>
              {error && <p className="text-rose-400 text-sm rounded-xl border border-rose-500/20 bg-rose-500/5 p-3">{error}</p>}
            </motion.div>
          )}

          {result && (
            <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-semibold text-white">
                    {tab === "discovery" ? "تحليل الفرضيات" : "سكريبت المقابلة"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={copyResult}
                    className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 border border-white/10 rounded-lg px-3 py-1.5 transition-colors">
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? "تم النسخ" : "نسخ"}
                  </button>
                  {tab === "discovery" && (
                    <button onClick={exportPersonaPdf}
                      className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 border border-emerald-500/20 rounded-lg px-3 py-1.5 transition-colors">
                      <Download className="w-3 h-3" /> تصدير Persona PDF
                    </button>
                  )}
                  <button onClick={() => setResult("")}
                    className="text-xs text-cyan-400 hover:text-cyan-300 border border-cyan-500/20 rounded-lg px-3 py-1.5 transition-colors">
                    تحليل جديد
                  </button>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <div className="prose prose-invert prose-sm max-w-none text-white/80 leading-relaxed whitespace-pre-wrap">{result}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}

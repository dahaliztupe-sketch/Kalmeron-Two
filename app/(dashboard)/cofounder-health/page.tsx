"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Users, ArrowLeft, Loader2, Plus, Trash2, Heart, AlertTriangle, CheckCircle2, Copy, Check } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";

const DIMENSIONS = [
  { key: "visionAlignment", label: "توافق الرؤية", sub: "هل تتفقون على اتجاه الشركة والأهداف الكبرى؟" },
  { key: "roleClarity", label: "وضوح الأدوار", sub: "هل كل مؤسس يعرف مسؤولياته بدقة؟" },
  { key: "communicationQuality", label: "جودة التواصل", sub: "هل تتحدثون بصراحة وبدون مشاعر مكتومة؟" },
  { key: "conflictResolution", label: "حل النزاعات", sub: "كيف تتعاملون مع الخلافات عند حدوثها؟" },
  { key: "commitmentLevel", label: "مستوى الالتزام", sub: "هل الجميع ملتزم بنفس المستوى من الجهد؟" },
  { key: "decisionMaking", label: "اتخاذ القرار", sub: "هل القرارات تُتخذ بكفاءة وبدون شلل؟" },
] as const;

type DimKey = typeof DIMENSIONS[number]["key"];

interface Founder {
  name: string;
  role: string;
  equity: number;
  answers: Partial<Record<DimKey, number>>;
}

const STAGES = ["idea", "validation", "foundation", "mvp", "growth", "scaling"];
const STAGE_LABELS: Record<string, string> = { idea: "فكرة", validation: "تحقق", foundation: "تأسيس", mvp: "MVP", growth: "نمو", scaling: "توسع" };
const RATING_LABELS = ["ضعيف", "مقبول", "جيد", "جيد جداً", "ممتاز"];

export default function CofounderHealthPage() {
  const { user } = useAuth();
  const [founders, setFounders] = useState<Founder[]>([{ name: "", role: "", equity: 50, answers: {} }, { name: "", role: "", equity: 50, answers: {} }]);
  const [stage, setStage] = useState("foundation");
  const [challenges, setChallenges] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const addFounder = () => setFounders(f => [...f, { name: "", role: "", equity: 0, answers: {} }]);
  const removeFounder = (i: number) => setFounders(f => f.filter((_, idx) => idx !== i));
  const updateFounder = (i: number, field: keyof Omit<Founder, "answers">, value: string | number) => setFounders(f => f.map((ff, idx) => idx === i ? { ...ff, [field]: value } : ff));
  const updateAnswer = (fi: number, key: DimKey, val: number) => setFounders(f => f.map((ff, idx) => idx === fi ? { ...ff, answers: { ...ff.answers, [key]: val } } : ff));

  const totalEquity = founders.reduce((s, f) => s + Number(f.equity), 0);
  const allAnswered = founders.every(f => Object.keys(f.answers).length === DIMENSIONS.length);
  const canSubmit = founders.length >= 1 && founders.every(f => f.name.trim()) && allAnswered && !loading;

  const handleAnalyze = useCallback(async () => {
    if (!canSubmit) return;
    setLoading(true);
    setResult("");
    setError("");
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (user) headers["Authorization"] = `Bearer ${await user.getIdToken()}`;
      const res = await fetch("/api/cofounder-health", { method: "POST", headers, body: JSON.stringify({ founders: founders.map(f => ({ ...f, answers: f.answers as Record<DimKey, number> })), companyStage: stage, specificChallenges: challenges }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطأ");
      setResult(data.result ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ");
    } finally {
      setLoading(false);
    }
  }, [founders, stage, challenges, user, canSubmit]);

  const copyResult = async () => { await navigator.clipboard.writeText(result).catch(() => null); setCopied(true); setTimeout(() => setCopied(false), 1500); };

  return (
    <AppShell>
      <div dir="rtl" className="max-w-4xl mx-auto space-y-6 pb-16">
        <div className="flex items-start justify-between flex-wrap gap-4"><div><div className="flex items-center gap-2 mb-2"><Users className="w-4 h-4 text-violet-400" /><span className="text-xs text-violet-400 font-medium uppercase tracking-wide">Co-Founder Health</span></div><h1 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-2">فحص صحة فريق المؤسسين</h1><p className="text-white/50 max-w-xl text-sm">٦٥٪ من فشل الستارت أبس سببه خلافات المؤسسين — اكشف المشكلات قبل أن تتفاقم.</p></div><Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors"><ArrowLeft className="w-4 h-4" /> لوحة القيادة</Link></div>

        {!result ? (
          <div className="space-y-5">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><label className="block text-xs text-white/50 mb-3 font-medium">مرحلة الشركة</label><div className="flex flex-wrap gap-2">{STAGES.map(s => <button key={s} onClick={() => setStage(s)} className={`px-3 py-1.5 rounded-lg text-sm transition-all ${stage === s ? "bg-violet-500/20 text-violet-300 border border-violet-500/40" : "bg-white/[0.03] text-white/40 border border-white/10 hover:text-white/70"}`}>{STAGE_LABELS[s]}</button>)}</div></div>

            {founders.map((founder, fi) => (
              <motion.div key={fi} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-5">
                <div className="flex items-start justify-between gap-4"><div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-300 font-bold text-sm">{fi + 1}</div><span className="text-sm font-semibold text-white">المؤسس {fi + 1}</span></div>{founders.length > 1 && <button onClick={() => removeFounder(fi)} className="text-white/20 hover:text-rose-400 transition-colors"><Trash2 className="w-4 h-4" /></button>}</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3"><input value={founder.name} onChange={e => updateFounder(fi, "name", e.target.value)} placeholder="الاسم" className="bg-white/[0.04] border border-white/[0.07] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/40 transition-colors" /><input value={founder.role} onChange={e => updateFounder(fi, "role", e.target.value)} placeholder="الدور (CEO, CTO...)" className="bg-white/[0.04] border border-white/[0.07] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/40 transition-colors" /><div className="relative"><input type="number" min={0} max={100} value={founder.equity} onChange={e => updateFounder(fi, "equity", Number(e.target.value))} className="w-full bg-white/[0.04] border border-white/[0.07] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/40 transition-colors" /><span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">٪</span></div></div>
                <div className="space-y-4">{DIMENSIONS.map(dim => <div key={dim.key}><div className="flex items-start justify-between mb-2"><div><p className="text-sm text-white font-medium">{dim.label}</p><p className="text-xs text-white/40">{dim.sub}</p></div><span className="text-xs text-white/30">{founder.answers[dim.key] ? `${founder.answers[dim.key]}/5` : "—"}</span></div><div className="flex gap-2">{[1, 2, 3, 4, 5].map(v => <button key={v} onClick={() => updateAnswer(fi, dim.key, v)} className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${founder.answers[dim.key] === v ? "bg-violet-500/30 text-violet-200 border border-violet-500/50" : "bg-white/[0.03] text-white/30 border border-white/[0.07] hover:text-white/60"}`}>{RATING_LABELS[v - 1]}</button>)}</div></div>)}</div>
              </motion.div>
            ))}

            {totalEquity !== 100 && founders.some(f => f.equity > 0) && <div className="flex items-center gap-2 text-amber-400 text-xs rounded-lg border border-amber-500/20 bg-amber-500/5 p-3"><AlertTriangle className="w-3.5 h-3.5" /> مجموع الحصص {totalEquity}٪ — يجب أن يكون ١٠٠٪</div>}
            <div className="flex items-center gap-3"><button onClick={addFounder} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white/60 hover:text-white/90 text-sm transition-colors"><Plus className="w-4 h-4" /> أضف مؤسساً</button></div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><label className="block text-xs text-white/50 mb-2 font-medium">تحديات محددة تواجهونها (اختياري)</label><textarea value={challenges} onChange={e => setChallenges(e.target.value)} placeholder="مثال: لدينا خلاف على أولويات المنتج، أو أحد المؤسسين أقل التزاماً..." rows={3} className="w-full bg-transparent text-white text-sm placeholder:text-white/20 resize-none focus:outline-none" /></div>
            <button onClick={handleAnalyze} disabled={!canSubmit} className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-bold text-sm hover:opacity-90 disabled:opacity-40 transition-all shadow-lg shadow-violet-500/20">{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Heart className="w-5 h-5" />}{loading ? "يحلل صحة الفريق..." : "احصل على تقرير صحة الفريق"}</button>
            {!canSubmit && founders.some(f => f.name) && !allAnswered && <p className="text-xs text-amber-400 text-center">أجب على جميع الأسئلة لكل مؤسس للمتابعة</p>}
            {error && <p className="text-rose-400 text-sm rounded-xl border border-rose-500/20 bg-rose-500/5 p-3">{error}</p>}
          </div>
        ) : (
          <AnimatePresence>
            <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="flex items-center justify-between"><div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /><span className="text-sm font-semibold text-white">تقرير صحة الفريق</span></div><div className="flex items-center gap-2"><button onClick={copyResult} className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 border border-white/10 rounded-lg px-3 py-1.5 transition-colors">{copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}{copied ? "تم" : "نسخ"}</button><button onClick={() => setResult("")} className="text-xs text-violet-400 hover:text-violet-300 border border-violet-500/20 rounded-lg px-3 py-1.5 transition-colors">تحليل جديد</button></div></div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"><div className="prose prose-invert prose-sm max-w-none text-white/80 leading-relaxed whitespace-pre-wrap">{result}</div></div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </AppShell>
  );
}

"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Scale, Sparkles, ArrowLeft, Loader2, Plus, Trash2,
  CheckCircle2, Copy, Check, AlertTriangle, Download,
  Users, DollarSign, Briefcase, Shield,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";

interface Founder {
  name: string;
  role: string;
  equity: string;
  responsibilities: string;
  commitment: string;
}

type Step = "founders" | "terms" | "generate";

export default function FounderAgreementPage() {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>("founders");
  const [founders, setFounders] = useState<Founder[]>([
    { name: "", role: "", equity: "", responsibilities: "", commitment: "" },
    { name: "", role: "", equity: "", responsibilities: "", commitment: "" },
  ]);
  const [companyName, setCompanyName] = useState("");
  const [companyType, setCompanyType] = useState("LLC");
  const [vestingPeriod, setVestingPeriod] = useState("4");
  const [cliffMonths, setCliffMonths] = useState("12");
  const [disputeResolution, setDisputeResolution] = useState("تحكيم تجاري");
  const [ipOwnership, setIpOwnership] = useState("الشركة");
  const [nonCompete, setNonCompete] = useState("سنتان");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const addFounder = useCallback(() => {
    setFounders(prev => [...prev, { name: "", role: "", equity: "", responsibilities: "", commitment: "" }]);
  }, []);

  const removeFounder = useCallback((i: number) => {
    setFounders(prev => prev.filter((_, j) => j !== i));
  }, []);

  const updateFounder = useCallback((i: number, field: keyof Founder, value: string) => {
    setFounders(prev => prev.map((f, j) => j === i ? { ...f, [field]: value } : f));
  }, []);

  const totalEquity = founders.reduce((sum, f) => sum + (Number(f.equity) || 0), 0);

  const handleGenerate = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    setError("");
    setResult("");
    try {
      const token = await user?.getIdToken();
      const res = await fetch("/api/cofounder-health", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          mode: "agreement",
          founders: founders.map(f => ({
            name: f.name,
            role: f.role,
            equity: Number(f.equity),
            answers: {
              responsibilities: f.responsibilities,
              commitment: f.commitment,
            },
          })),
          companyName,
          companyType,
          terms: { vestingPeriod, cliffMonths, disputeResolution, ipOwnership, nonCompete },
          companyStage: "early",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "حدث خطأ");
      setResult(data.result);
      setStep("generate");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  }, [loading, user, founders, companyName, companyType, vestingPeriod, cliffMonths, disputeResolution, ipOwnership, nonCompete]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [result]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([result], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `founder-agreement-${companyName || "startup"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [result, companyName]);

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
                <Scale className="text-emerald-400" size={24} />
                معالج اتفاقية المؤسسين
              </h1>
              <p className="text-slate-400 text-sm mt-1">أنشئ اتفاقية مؤسسين شاملة بمساعدة الذكاء الاصطناعي</p>
            </div>
          </motion.div>

          {/* Progress */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex items-center gap-2">
            {[
              { id: "founders" as Step, label: "المؤسسون", icon: Users },
              { id: "terms" as Step, label: "الشروط", icon: Shield },
              { id: "generate" as Step, label: "الاتفاقية", icon: CheckCircle2 },
            ].map(({ id, label, icon: Icon }, i) => (
              <div key={id} className="flex items-center gap-2">
                <button
                  onClick={() => step !== "generate" && setStep(id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    step === id
                      ? "bg-gradient-to-r from-emerald-600 to-green-600 text-white"
                      : "bg-slate-800/60 text-slate-400 hover:text-white"
                  }`}
                >
                  <Icon size={14} /> {label}
                </button>
                {i < 2 && <span className="text-slate-600">←</span>}
              </div>
            ))}
          </motion.div>

          <AnimatePresence mode="wait">
            {/* Step 1: Founders */}
            {step === "founders" && (
              <motion.div key="founders" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 space-y-4">
                  <h2 className="font-semibold text-slate-200 flex items-center gap-2">
                    <Briefcase size={16} className="text-emerald-400" /> معلومات الشركة
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-400 text-xs block mb-1.5">اسم الشركة</label>
                      <input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Kalmeron AI" className={inputClass} />
                    </div>
                    <div>
                      <label className="text-slate-400 text-xs block mb-1.5">الشكل القانوني</label>
                      <select value={companyType} onChange={e => setCompanyType(e.target.value)} className={inputClass}>
                        <option value="LLC">شركة ذات مسؤولية محدودة (LLC)</option>
                        <option value="JSC">شركة مساهمة (JSC)</option>
                        <option value="C-Corp">C-Corporation</option>
                        <option value="Delaware">Delaware LLC</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="font-semibold text-slate-200 flex items-center gap-2">
                    <Users size={16} className="text-emerald-400" /> المؤسسون
                    <span className={`text-xs mr-auto ${Math.abs(totalEquity - 100) < 0.01 ? "text-emerald-400" : "text-amber-400"}`}>
                      إجمالي الحصص: {totalEquity.toFixed(1)}% {Math.abs(totalEquity - 100) > 0.01 && "(يجب أن يكون 100%)"}
                    </span>
                  </h2>

                  {founders.map((founder, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-300">المؤسس {i + 1}</span>
                        {founders.length > 2 && (
                          <button onClick={() => removeFounder(i)} className="text-slate-500 hover:text-red-400 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-slate-400 text-xs block mb-1">الاسم</label>
                          <input value={founder.name} onChange={e => updateFounder(i, "name", e.target.value)} placeholder="أحمد محمد" className={inputClass} />
                        </div>
                        <div>
                          <label className="text-slate-400 text-xs block mb-1">الدور</label>
                          <input value={founder.role} onChange={e => updateFounder(i, "role", e.target.value)} placeholder="CEO / CTO" className={inputClass} />
                        </div>
                        <div>
                          <label className="text-slate-400 text-xs block mb-1 flex items-center gap-1">
                            <DollarSign size={10} /> الحصة %
                          </label>
                          <input value={founder.equity} onChange={e => updateFounder(i, "equity", e.target.value)} placeholder="50" type="number" min="0" max="100" className={inputClass} />
                        </div>
                      </div>
                      <div>
                        <label className="text-slate-400 text-xs block mb-1">المسؤوليات الرئيسية</label>
                        <input value={founder.responsibilities} onChange={e => updateFounder(i, "responsibilities", e.target.value)}
                          placeholder="مثال: تطوير المنتج، إدارة الفريق التقني" className={inputClass} />
                      </div>
                      <div>
                        <label className="text-slate-400 text-xs block mb-1">مستوى الالتزام</label>
                        <select value={founder.commitment} onChange={e => updateFounder(i, "commitment", e.target.value)} className={inputClass}>
                          <option value="">اختر...</option>
                          <option value="full-time">دوام كامل</option>
                          <option value="part-time">دوام جزئي</option>
                          <option value="advisory">مستشار</option>
                        </select>
                      </div>
                    </motion.div>
                  ))}

                  <button onClick={addFounder} className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-sm transition-colors">
                    <Plus size={14} /> إضافة مؤسس آخر
                  </button>
                </div>

                <button
                  onClick={() => setStep("terms")}
                  disabled={founders.some(f => !f.name || !f.role || !f.equity)}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  التالي: شروط الاتفاقية ←
                </button>
              </motion.div>
            )}

            {/* Step 2: Terms */}
            {step === "terms" && (
              <motion.div key="terms" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-6">
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 space-y-4">
                  <h2 className="font-semibold text-slate-200 flex items-center gap-2">
                    <Shield size={16} className="text-emerald-400" /> شروط رئيسية للاتفاقية
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-400 text-xs block mb-1.5">فترة الاستحقاق (Vesting) - سنوات</label>
                      <select value={vestingPeriod} onChange={e => setVestingPeriod(e.target.value)} className={inputClass}>
                        <option value="2">سنتان</option>
                        <option value="3">٣ سنوات</option>
                        <option value="4">٤ سنوات (الأكثر شيوعاً)</option>
                        <option value="5">٥ سنوات</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-400 text-xs block mb-1.5">فترة الـ Cliff - أشهر</label>
                      <select value={cliffMonths} onChange={e => setCliffMonths(e.target.value)} className={inputClass}>
                        <option value="0">بدون cliff</option>
                        <option value="6">٦ أشهر</option>
                        <option value="12">١٢ شهراً (الأكثر شيوعاً)</option>
                        <option value="18">١٨ شهراً</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-400 text-xs block mb-1.5">ملكية الملكية الفكرية</label>
                      <select value={ipOwnership} onChange={e => setIpOwnership(e.target.value)} className={inputClass}>
                        <option value="الشركة">الشركة بالكامل</option>
                        <option value="مشترك">مشترك بحسب المساهمة</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-400 text-xs block mb-1.5">فترة عدم المنافسة</label>
                      <select value={nonCompete} onChange={e => setNonCompete(e.target.value)} className={inputClass}>
                        <option value="سنة واحدة">سنة واحدة</option>
                        <option value="سنتان">سنتان</option>
                        <option value="ثلاث سنوات">ثلاث سنوات</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="text-slate-400 text-xs block mb-1.5">آلية حل النزاعات</label>
                      <select value={disputeResolution} onChange={e => setDisputeResolution(e.target.value)} className={inputClass}>
                        <option value="تحكيم تجاري">تحكيم تجاري (Cairo Regional Centre for Arbitration)</option>
                        <option value="محاكم مصرية">المحاكم التجارية المصرية</option>
                        <option value="وساطة ثم تحكيم">وساطة أولاً ثم تحكيم</option>
                        <option value="ICC">ICC International Court of Arbitration</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-900/20 border border-amber-500/20 rounded-xl p-4 flex gap-3">
                  <AlertTriangle size={16} className="text-amber-400 mt-0.5 shrink-0" />
                  <p className="text-amber-200/80 text-xs leading-relaxed">
                    هذه الاتفاقية للمراجعة والنقاش فقط. يجب مراجعتها مع محامٍ مرخص قبل التوقيع.
                  </p>
                </div>

                {error && (
                  <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-4 text-red-300 text-sm">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? <><Loader2 size={16} className="animate-spin" /> جاري إنشاء الاتفاقية...</> : <><Sparkles size={16} /> إنشاء الاتفاقية</>}
                </button>
              </motion.div>
            )}

            {/* Step 3: Result */}
            {step === "generate" && result && (
              <motion.div key="generate" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-400 font-semibold flex items-center gap-2">
                    <CheckCircle2 size={16} /> اتفاقية المؤسسين — مسودة أولية
                  </span>
                  <div className="flex gap-2">
                    <button onClick={handleDownload}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700/60 hover:bg-slate-600/60 text-white rounded-lg text-xs transition-colors">
                      <Download size={13} /> تنزيل
                    </button>
                    <button onClick={handleCopy}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700/60 hover:bg-slate-600/60 text-white rounded-lg text-xs transition-colors">
                      {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      {copied ? "تم النسخ" : "نسخ"}
                    </button>
                  </div>
                </div>
                <div className="bg-slate-900/50 rounded-xl p-5 max-h-[600px] overflow-y-auto">
                  <pre className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">{result}</pre>
                </div>
                <button
                  onClick={() => { setStep("founders"); setResult(""); }}
                  className="text-slate-400 hover:text-white text-sm transition-colors flex items-center gap-1"
                >
                  ← بدء من جديد
                </button>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </AppShell>
  );
}

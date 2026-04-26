"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Users, Plus, Trash2, FileCheck2, Download, Copy, Check, ShieldAlert, Scale, Briefcase } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { generateFounderAgreement, type FounderShare } from "@/src/lib/founder-tools/founder-agreement";

const STEPS = ["معلومات الشركة", "المؤسّسون والحصص", "البنود الحماية", "آليّة القرارات", "النتيجة"];

export default function FounderAgreementWizard() {
  const [step, setStep] = useState(0);
  const [companyName, setCompanyName] = useState("");
  const [jurisdiction, setJurisdiction] = useState("القاهرة، جمهوريّة مصر العربيّة");
  const [founders, setFounders] = useState<FounderShare[]>([
    { name: "", role: "الرئيس التنفيذي (CEO)", equityPct: 50, vestingMonths: 48, cliffMonths: 12 },
    { name: "", role: "المدير التقني (CTO)", equityPct: 50, vestingMonths: 48, cliffMonths: 12 },
  ]);
  const [ipAssignment, setIpAssignment] = useState(true);
  const [nonCompete, setNonCompete] = useState(true);
  const [founderSalaries, setFounderSalaries] = useState(false);
  const [disputeMethod, setDisputeMethod] = useState<"arbitration" | "courts">("arbitration");
  const [exitMechanism, setExitMechanism] = useState<"majority" | "unanimous" | "drag-along">("drag-along");
  const [copied, setCopied] = useState(false);

  const totalEquity = founders.reduce((s, f) => s + (Number(f.equityPct) || 0), 0);
  const equityValid = totalEquity === 100;
  const namesValid = founders.every((f) => f.name.trim().length > 0);

  const output = useMemo(
    () =>
      step === 4
        ? generateFounderAgreement({
            companyName: companyName || "[اسم الشركة]",
            founders,
            ipAssignment,
            nonCompete,
            disputeMethod,
            jurisdiction,
            founderSalaries,
            exitMechanism,
          })
        : "",
    [step, companyName, founders, ipAssignment, nonCompete, disputeMethod, jurisdiction, founderSalaries, exitMechanism],
  );

  const updateFounder = (i: number, patch: Partial<FounderShare>) =>
    setFounders((prev) => prev.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));

  const addFounder = () => setFounders((p) => [...p, { name: "", role: "مؤسّس مشارك", equityPct: 0, vestingMonths: 48, cliffMonths: 12 }]);
  const removeFounder = (i: number) => setFounders((p) => p.filter((_, idx) => idx !== i));

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `اتّفاقيّة-مؤسّسين-${companyName || "شركتي"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const canNext = () => {
    if (step === 0) return companyName.trim().length > 0;
    if (step === 1) return equityValid && namesValid;
    return true;
  };

  return (
    <AppShell>
      <div dir="rtl" className="max-w-4xl mx-auto space-y-8 pb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Scale className="w-4 h-4 text-violet-400" />
            <span className="text-xs text-violet-400 font-medium uppercase tracking-wide">Founder Agreement Wizard</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-2">معالج اتّفاقيّة المؤسّسين</h1>
          <p className="text-text-secondary max-w-2xl">
            ٤٠٪ من الستارت أبس تنهار بسبب خلافات المؤسّسين. هذه الاتّفاقيّة تحمي الجميع — Vesting، IP، عدم منافسة، آليّة قرارات وخروج. ٧ خطوات ودقيقتان.
          </p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto py-2">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-2 flex-shrink-0">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold border ${i <= step ? "bg-violet-500/20 border-violet-500/50 text-violet-200" : "bg-white/5 border-white/10 text-neutral-500"}`}>{i + 1}</div>
              <span className={`text-sm whitespace-nowrap ${i === step ? "text-white font-semibold" : "text-neutral-500"}`}>{label}</span>
              {i < STEPS.length - 1 && <div className={`w-6 md:w-12 h-px ${i < step ? "bg-violet-500/40" : "bg-white/10"}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8 min-h-[400px]"
          >
            {step === 0 && (
              <div className="space-y-5">
                <h2 className="text-xl font-bold text-white">معلومات الشركة الأساسيّة</h2>
                <Field label="اسم الشركة الكامل">
                  <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="مثال: كلميرون للذكاء الاصطناعي ش.م.م" className="input-field" />
                </Field>
                <Field label="الاختصاص القضائي (لفضّ النزاعات)">
                  <input value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value)} className="input-field" />
                </Field>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">المؤسّسون وتوزيع الحصص</h2>
                  <button onClick={addFounder} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/15 text-violet-200 border border-violet-500/30 text-sm hover:bg-violet-500/25 transition-colors">
                    <Plus className="w-4 h-4" /> إضافة مؤسّس
                  </button>
                </div>

                <div className={`text-sm rounded-lg p-3 border ${equityValid ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" : "bg-amber-500/10 border-amber-500/30 text-amber-300"}`}>
                  مجموع الحصص: <strong>{totalEquity}٪</strong> — {equityValid ? "✅ صحيح" : `⚠️ يجب أن يساوي ١٠٠٪ بالضبط (تبقّى ${100 - totalEquity}٪)`}
                </div>

                {founders.map((f, i) => (
                  <div key={i} className="rounded-xl border border-white/10 bg-black/30 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-400">المؤسّس #{i + 1}</span>
                      {founders.length > 2 && (
                        <button onClick={() => removeFounder(i)} className="text-red-400/70 hover:text-red-400 text-sm flex items-center gap-1">
                          <Trash2 className="w-3.5 h-3.5" /> حذف
                        </button>
                      )}
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <input value={f.name} onChange={(e) => updateFounder(i, { name: e.target.value })} placeholder="الاسم الكامل" className="input-field" />
                      <input value={f.role} onChange={(e) => updateFounder(i, { role: e.target.value })} placeholder="الدور" className="input-field" />
                    </div>
                    <div className="grid md:grid-cols-3 gap-3">
                      <Field tiny label="الحصّة (٪)"><input type="number" value={f.equityPct} onChange={(e) => updateFounder(i, { equityPct: Number(e.target.value) })} className="input-field" /></Field>
                      <Field tiny label="Vesting (شهور)"><input type="number" value={f.vestingMonths} onChange={(e) => updateFounder(i, { vestingMonths: Number(e.target.value) })} className="input-field" /></Field>
                      <Field tiny label="Cliff (شهور)"><input type="number" value={f.cliffMonths} onChange={(e) => updateFounder(i, { cliffMonths: Number(e.target.value) })} className="input-field" /></Field>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white">بنود الحماية</h2>
                <Toggle on={ipAssignment} setOn={setIpAssignment} title="تنازل الملكيّة الفكريّة (IP Assignment)" desc="ينقل ملكيّة كل ما يبدعه المؤسّسون للشركة. ضروري لأي تمويل مستقبلي." critical />
                <Toggle on={nonCompete} setOn={setNonCompete} title="عدم المنافسة (Non-Compete)" desc="يمنع المؤسّسين من بدء/الانضمام لمشاريع منافسة لمدّة سنة بعد المغادرة." />
                <Toggle on={founderSalaries} setOn={setFounderSalaries} title="رواتب فوريّة للمؤسّسين" desc="إن لم تُفعَّل، يعمل المؤسّسون بـ Sweat Equity حتى استقرار الإيراد." />
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <h2 className="text-xl font-bold text-white">آليّة القرارات والنزاعات</h2>
                <Field label="آليّة فضّ النزاعات">
                  <select value={disputeMethod} onChange={(e) => setDisputeMethod(e.target.value as never)} className="input-field">
                    <option value="arbitration">التحكيم (CRCICA) — أسرع، أكثر سرّيّة</option>
                    <option value="courts">المحاكم المختصّة — أرخص، أبطأ</option>
                  </select>
                </Field>
                <Field label="آليّة القرارات الكبرى">
                  <select value={exitMechanism} onChange={(e) => setExitMechanism(e.target.value as never)} className="input-field">
                    <option value="majority">أغلبيّة بسيطة (٥١٪)</option>
                    <option value="unanimous">إجماع — يعطي كل مؤسّس حقّ veto</option>
                    <option value="drag-along">أغلبيّة الثلثين + Drag-Along (الأنسب للجولات التمويليّة)</option>
                  </select>
                </Field>
                <div className="rounded-lg p-4 bg-amber-500/10 border border-amber-500/30 text-sm text-amber-200 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>المستثمرون يفضّلون عادةً Drag-Along لأنّه يضمن إمكانيّة بيع الشركة لاحقاً بدون اعتراض مؤسّس واحد.</span>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="w-5 h-5 text-emerald-400" />
                    <h2 className="text-xl font-bold text-white">اتّفاقيّتك جاهزة!</h2>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleCopy} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 text-sm transition-colors">
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      {copied ? "تمّ النسخ" : "نسخ"}
                    </button>
                    <button onClick={handleDownload} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 text-violet-200 border border-violet-500/40 text-sm transition-colors">
                      <Download className="w-4 h-4" /> تنزيل .md
                    </button>
                  </div>
                </div>
                <pre className="text-xs text-neutral-300 bg-black/40 border border-white/10 rounded-lg p-4 max-h-[500px] overflow-auto whitespace-pre-wrap leading-relaxed font-sans">{output}</pre>
                <div className="rounded-lg p-3 bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-200 flex items-start gap-2">
                  <Briefcase className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>راجع الاتّفاقيّة مع محامٍ مرخّص قبل التوقيع — خاصّة بنود الـ IP والضرائب.</span>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Nav */}
        <div className="flex justify-between gap-3">
          <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            <ArrowRight className="w-4 h-4 icon-flip" /> السابق
          </button>
          {step < 4 ? (
            <button onClick={() => canNext() && setStep((s) => Math.min(4, s + 1))} disabled={!canNext()} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 text-violet-200 border border-violet-500/40 text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              التالي <ArrowLeft className="w-4 h-4 icon-flip" />
            </button>
          ) : (
            <Link href="/legal-templates" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-sm transition-colors">
              مكتبة العقود الأخرى <ArrowLeft className="w-4 h-4 icon-flip" />
            </Link>
          )}
        </div>
      </div>

      <style jsx>{`
        :global(.input-field) {
          width: 100%;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.5rem;
          padding: 0.625rem 0.875rem;
          color: white;
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.15s;
        }
        :global(.input-field:focus) {
          border-color: rgba(139, 92, 246, 0.5);
        }
      `}</style>
    </AppShell>
  );
}

function Field({ label, children, tiny }: { label: string; children: React.ReactNode; tiny?: boolean }) {
  return (
    <label className="block">
      <span className={`block text-${tiny ? "xs" : "sm"} text-neutral-400 mb-1.5`}>{label}</span>
      {children}
    </label>
  );
}

function Toggle({ on, setOn, title, desc, critical }: { on: boolean; setOn: (v: boolean) => void; title: string; desc: string; critical?: boolean }) {
  return (
    <button onClick={() => setOn(!on)} className={`w-full text-right rounded-xl border p-4 transition-colors ${on ? (critical ? "bg-emerald-500/10 border-emerald-500/40" : "bg-violet-500/10 border-violet-500/40") : "bg-black/20 border-white/10 hover:border-white/20"}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-white font-semibold mb-1">{title} {critical && <span className="text-xs text-emerald-300">· موصى به</span>}</div>
          <div className="text-xs text-neutral-400 leading-relaxed">{desc}</div>
        </div>
        <div className={`w-11 h-6 rounded-full p-0.5 transition-colors flex-shrink-0 ${on ? (critical ? "bg-emerald-500" : "bg-violet-500") : "bg-white/10"}`}>
          <div className={`w-5 h-5 bg-white rounded-full transition-transform ${on ? "translate-x-[-1.25rem]" : ""}`} />
        </div>
      </div>
    </button>
  );
}

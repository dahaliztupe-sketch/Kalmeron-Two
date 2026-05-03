'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  Users, FileText, Play, CheckCircle2, Loader2,
  Copy, Check, Download, Upload, X, AlertCircle, Sparkles, Plus, Trash2,
} from 'lucide-react';
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { cn } from "@/src/lib/utils";

interface StepResult {
  id: string;
  label: string;
  output?: string;
  status: 'pending' | 'running' | 'done' | 'error';
}

interface CvEntry {
  id: string;
  file: File;
  text: string;
  result?: string;
  loading: boolean;
  error?: string;
}

const INITIAL_STEPS: StepResult[] = [
  { id: 'roles',    label: 'تحديد الأدوار الحرجة',   status: 'pending' },
  { id: 'jd',       label: 'كتابة الوصف الوظيفي',    status: 'pending' },
  { id: 'interview',label: 'تصميم مسار المقابلة',     status: 'pending' },
];

type Tab = 'pipeline' | 'cv-screen';

export default function HRDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('pipeline');

  // Pipeline state
  const [jobTitle, setJobTitle] = useState('');
  const [budget, setBudget] = useState('');
  const [stage, setStage] = useState('Seed');
  const [steps, setSteps] = useState<StepResult[]>(INITIAL_STEPS);
  const [isRunning, setIsRunning] = useState(false);
  const [finalResult, setFinalResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Multi-CV screening state
  const [cvRole, setCvRole] = useState('');
  const [cvRequirements, setCvRequirements] = useState('');
  const [cvEntries, setCvEntries] = useState<CvEntry[]>([]);
  const [comparisonResult, setComparisonResult] = useState('');
  const [comparing, setComparing] = useState(false);
  const [compCopied, setCompCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateStep = (id: string, patch: Partial<StepResult>) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
  };

  // Hiring pipeline
  const startHRCrew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle.trim() || !user) return;
    setIsRunning(true);
    setFinalResult(null);
    setSteps(INITIAL_STEPS.map(s => ({ ...s, status: 'pending', output: undefined })));
    try {
      const token = await user.getIdToken();
      updateStep('roles', { status: 'running' });
      const res = await fetch('/api/workflows/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ workflowId: 'hiring-plan', inputs: { stage, product: jobTitle, budget: budget || '50000' } }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'فشل التشغيل');

      const stepResults = data.steps as Record<string, { text?: string; error?: string }> || {};
      for (const step of INITIAL_STEPS) {
        const r = stepResults[step.id];
        updateStep(step.id, { status: r?.error ? 'error' : 'done', output: r?.text || r?.error || '' });
      }
      setFinalResult(INITIAL_STEPS.map(s => `## ${s.label}\n\n${stepResults[s.id]?.text || ''}`).join('\n\n---\n\n'));
      toast.success('انتهت فرقة التوظيف!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
      setSteps(prev => prev.map(s => s.status === 'running' ? { ...s, status: 'error' } : s));
    } finally {
      setIsRunning(false);
    }
  };

  // Upload a single CV file and extract text
  const uploadCv = useCallback(async (file: File): Promise<void> => {
    if (!user) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('حجم الملف يتجاوز 10 MB'); return; }

    const entryId = crypto.randomUUID();
    setCvEntries(prev => [...prev, { id: entryId, file, text: '', loading: true }]);

    try {
      const token = await user.getIdToken();
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/extract-pdf', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل استخراج النص');
      if (!data.text?.trim()) throw new Error('لم يُعثر على نص في الملف');

      setCvEntries(prev => prev.map(e => e.id === entryId
        ? { ...e, text: data.text.slice(0, 12000), loading: false }
        : e
      ));
      toast.success(`تم استخراج ${data.text.length.toLocaleString()} حرف من ${file.name}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'فشل رفع الملف';
      setCvEntries(prev => prev.map(e => e.id === entryId ? { ...e, loading: false, error: msg } : e));
    }
  }, [user]);

  const removeCv = (id: string) => setCvEntries(prev => prev.filter(e => e.id !== id));

  // Analyze all CVs individually, then compare
  const handleBatchScreen = useCallback(async () => {
    const ready = cvEntries.filter(e => e.text.trim() && !e.loading);
    if (!ready.length || !cvRole.trim() || comparing) return;
    setComparing(true);
    setComparisonResult('');

    try {
      const token = await user?.getIdToken();

      // Screen each CV individually
      const screenedEntries = await Promise.all(
        ready.map(async entry => {
          const res = await fetch('/api/hr-ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ mode: 'cv-screen', role: cvRole, skills: cvRequirements, cvText: entry.text }),
          });
          const data = await res.json();
          return { name: entry.file.name, result: res.ok ? data.result : `خطأ: ${data.error}` };
        })
      );

      // If multiple CVs, build a comparative summary
      if (screenedEntries.length === 1) {
        setComparisonResult(screenedEntries[0].result);
      } else {
        const summaries = screenedEntries.map((e, i) => `## المرشح ${i + 1}: ${e.name}\n\n${e.result}`).join('\n\n---\n\n');
        const compareRes = await fetch('/api/hr-ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            mode: 'cv-compare',
            role: cvRole,
            skills: cvRequirements,
            cvText: summaries.slice(0, 12000),
          }),
        });
        const compareData = await compareRes.json();
        const compareSection = compareRes.ok
          ? `\n\n---\n\n## 🏆 المقارنة النهائية\n\n${compareData.result}`
          : '';
        setComparisonResult(summaries + compareSection);
      }

      toast.success(`تم تحليل ${ready.length} سير ذاتية!`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setComparing(false);
    }
  }, [cvEntries, cvRole, cvRequirements, comparing, user]);

  const inputCls = 'w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-blue-500 transition-colors';

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 py-8 text-white" dir="rtl">

        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/[0.06] px-3 py-1 text-[11px] text-blue-200 mb-3">
            <Users className="w-3.5 h-3.5" />الموارد البشرية · AI Recruitment
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-3 mb-2">
            <Users className="w-7 h-7 text-blue-400" />فرقة الموارد البشرية
          </h1>
          <p className="text-neutral-400 text-sm max-w-xl">
            أتمتة التوظيف من تحديد الأدوار، إلى فحص وتقييم ومقارنة CVs متعددة بالذكاء الاصطناعي.
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-neutral-800">
          {([
            { id: 'pipeline' as Tab, label: 'خطة التوظيف', icon: Play },
            { id: 'cv-screen' as Tab, label: 'فحص السير الذاتية', icon: Upload },
          ]).map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px',
                tab === id ? 'border-blue-500 text-blue-400' : 'border-transparent text-neutral-500 hover:text-neutral-300',
              )}>
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* Pipeline tab */}
          {tab === 'pipeline' && (
            <motion.div key="pipeline" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <form onSubmit={startHRCrew} className="bg-neutral-900/60 border border-neutral-700/50 rounded-2xl p-6 mb-6">
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div className="md:col-span-1">
                    <label className="block text-xs text-neutral-400 mb-1.5">المسمى الوظيفي / نوع المنتج</label>
                    <input type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)}
                      placeholder="تطبيق جوال للتوصيل" className={inputCls} required />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1.5">مرحلة الشركة</label>
                    <select value={stage} onChange={e => setStage(e.target.value)} className={inputCls}>
                      <option>Pre-Seed</option><option>Seed</option><option>Series A</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1.5">ميزانية الرواتب الشهرية (EGP)</label>
                    <input type="number" value={budget} onChange={e => setBudget(e.target.value)}
                      placeholder="50000" className={inputCls} />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button type="submit" disabled={!jobTitle.trim() || isRunning}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 text-sm transition-all">
                    {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    {isRunning ? 'جاري التشغيل...' : 'تشغيل فرقة التوظيف'}
                  </button>
                </div>
              </form>

              <AnimatePresence>
                {(isRunning || finalResult) && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    className="mb-6 bg-neutral-900/60 border border-neutral-700/50 rounded-2xl p-5">
                    <h3 className="text-sm font-semibold text-neutral-300 mb-4">تقدّم الفرقة</h3>
                    <div className="space-y-3">
                      {steps.map(step => (
                        <div key={step.id} className="flex items-center gap-3">
                          <div className={cn('w-6 h-6 rounded-full flex items-center justify-center shrink-0',
                            step.status === 'done' ? 'bg-emerald-500/20 text-emerald-400' :
                            step.status === 'running' ? 'bg-blue-500/20 text-blue-400' :
                            step.status === 'error' ? 'bg-rose-500/20 text-rose-400' : 'bg-neutral-800 text-neutral-600')}>
                            {step.status === 'done' ? <CheckCircle2 className="w-3.5 h-3.5" /> :
                             step.status === 'running' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
                             <span className="w-1.5 h-1.5 rounded-full bg-current" />}
                          </div>
                          <span className={cn('text-sm',
                            step.status === 'done' ? 'text-white' :
                            step.status === 'running' ? 'text-blue-300' : 'text-neutral-500')}>
                            {step.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {finalResult && (
                  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-neutral-900/60 border border-neutral-700/50 rounded-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-800">
                      <span className="text-sm font-semibold text-neutral-200">خطة التوظيف الكاملة</span>
                      <div className="flex items-center gap-3">
                        <button onClick={async () => { await navigator.clipboard.writeText(finalResult); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                          className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors">
                          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          {copied ? 'تم' : 'نسخ'}
                        </button>
                        <button onClick={() => { const b = new Blob([finalResult], { type: 'text/markdown' }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = `hiring-plan-${Date.now()}.md`; a.click(); URL.revokeObjectURL(u); }}
                          className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors">
                          <Download className="w-3.5 h-3.5" />تحميل
                        </button>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="prose prose-invert prose-sm max-w-none prose-headings:text-blue-300 prose-strong:text-white prose-li:text-neutral-300" dir="auto">
                        <ReactMarkdown>{finalResult}</ReactMarkdown>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* CV Screening tab — supports multiple CVs + comparison */}
          {tab === 'cv-screen' && (
            <motion.div key="cv-screen" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-5">

              <div className="bg-neutral-900/60 border border-neutral-700/50 rounded-2xl p-6 space-y-4">
                <div>
                  <h2 className="font-bold text-base flex items-center gap-2 mb-1">
                    <Upload className="w-5 h-5 text-blue-400" />فحص ومقارنة السير الذاتية
                  </h2>
                  <p className="text-neutral-400 text-xs">ارفع حتى 10 ملفات PDF دفعةً واحدة — Gemini يحلل كل سيرة على حدة ثم يقارنها ويرتبها.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1.5">المسمى الوظيفي *</label>
                    <input value={cvRole} onChange={e => setCvRole(e.target.value)}
                      placeholder="مثال: Senior Backend Engineer" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1.5">المتطلبات الأساسية (اختياري)</label>
                    <input value={cvRequirements} onChange={e => setCvRequirements(e.target.value)}
                      placeholder="مثال: Python, 5 سنوات, ماجستير" className={inputCls} />
                  </div>
                </div>

                {/* Drop zone */}
                <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" multiple className="hidden"
                  onChange={e => {
                    Array.from(e.target.files ?? []).slice(0, 10 - cvEntries.length).forEach(f => uploadCv(f));
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }} />
                <div onClick={() => fileInputRef.current?.click()}
                  onDrop={e => { e.preventDefault(); Array.from(e.dataTransfer.files).slice(0, 10 - cvEntries.length).forEach(f => uploadCv(f)); }}
                  onDragOver={e => e.preventDefault()}
                  className="border-2 border-dashed border-neutral-700 hover:border-blue-500/50 rounded-xl p-6 text-center cursor-pointer transition-all group">
                  <Plus className="w-6 h-6 text-neutral-500 group-hover:text-blue-400 transition-colors mx-auto mb-2" />
                  <p className="text-sm text-neutral-400 group-hover:text-neutral-300">اسحب ملفات PDF أو اضغط للاختيار (حتى 10 ملفات)</p>
                </div>

                {/* CV list */}
                {cvEntries.length > 0 && (
                  <div className="space-y-2">
                    {cvEntries.map((entry, idx) => (
                      <div key={entry.id} className="flex items-center gap-3 bg-neutral-800/50 rounded-xl px-4 py-3">
                        {entry.loading ? (
                          <Loader2 className="w-4 h-4 animate-spin text-blue-400 shrink-0" />
                        ) : entry.error ? (
                          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                        <FileText className="w-4 h-4 text-neutral-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">المرشح {idx + 1}: {entry.file.name}</p>
                          <p className="text-xs text-neutral-500">
                            {entry.loading ? 'جاري الاستخراج...' :
                             entry.error ? entry.error :
                             `${entry.text.length.toLocaleString()} حرف مستخرَج`}
                          </p>
                        </div>
                        <button onClick={() => removeCv(entry.id)}
                          className="text-neutral-600 hover:text-rose-400 transition-colors shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button onClick={handleBatchScreen}
                  disabled={!cvEntries.some(e => e.text.trim()) || !cvRole.trim() || comparing}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-all">
                  {comparing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {comparing ? 'جاري التحليل والمقارنة...' :
                   cvEntries.filter(e => e.text.trim()).length > 1
                     ? `حلّل وقارن ${cvEntries.filter(e => e.text.trim()).length} سير ذاتية`
                     : 'حلّل السيرة الذاتية'}
                </button>
              </div>

              <AnimatePresence>
                {comparisonResult && (
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-neutral-900/60 border border-blue-500/20 rounded-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-800">
                      <span className="text-sm font-semibold text-blue-300 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />تقرير الفحص والمقارنة
                      </span>
                      <div className="flex items-center gap-3">
                        <button onClick={async () => { await navigator.clipboard.writeText(comparisonResult); setCompCopied(true); setTimeout(() => setCompCopied(false), 2000); }}
                          className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors">
                          {compCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          {compCopied ? 'تم' : 'نسخ'}
                        </button>
                        <button onClick={() => { const b = new Blob([comparisonResult], { type: 'text/markdown' }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = `cv-report-${Date.now()}.md`; a.click(); URL.revokeObjectURL(u); }}
                          className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors">
                          <Download className="w-3.5 h-3.5" />تحميل
                        </button>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="prose prose-invert prose-sm max-w-none prose-headings:text-blue-300 prose-strong:text-white prose-li:text-neutral-300" dir="auto">
                        <ReactMarkdown>{comparisonResult}</ReactMarkdown>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}

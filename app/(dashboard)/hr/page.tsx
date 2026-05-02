'use client';

import React, { useState } from 'react';
import { Users, FileText, Calendar, Play, CheckCircle2, Loader2, Copy, Check, Download } from 'lucide-react';
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

const INITIAL_STEPS: StepResult[] = [
  { id: 'roles',    label: 'تحديد الأدوار الحرجة',   status: 'pending' },
  { id: 'jd',       label: 'كتابة الوصف الوظيفي',    status: 'pending' },
  { id: 'interview',label: 'تصميم مسار المقابلة',     status: 'pending' },
];

const AGENTS_INFO = [
  { icon: FileText, color: 'text-purple-400', title: 'وصف وظيفي (JD Agent)', desc: 'يولّد وصفاً وظيفياً احترافياً مكتملاً بالمتطلبات والراتب المقترح.' },
  { icon: Users,    color: 'text-blue-400',   title: 'فحص السير (Screening)', desc: 'يفرز السير الذاتية ويستخرج المرشح الأفضل بناءً على معايير محددة.' },
  { icon: Calendar, color: 'text-emerald-400',title: 'المجدول (Scheduler)',   desc: 'يجدول مواعيد المقابلات ويرسل التأكيدات آلياً.' },
  { icon: Users,    color: 'text-rose-400',   title: 'رفيق المقابلة',         desc: 'يقترح أسئلة حية ويسجّل ملاحظات وقت المقابلة.' },
];

export default function HRDashboard() {
  const { user } = useAuth();
  const [jobTitle, setJobTitle] = useState('');
  const [budget, setBudget] = useState('');
  const [stage, setStage] = useState('Seed');
  const [steps, setSteps] = useState<StepResult[]>(INITIAL_STEPS);
  const [isRunning, setIsRunning] = useState(false);
  const [finalResult, setFinalResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const updateStep = (id: string, patch: Partial<StepResult>) => {
    setSteps((prev) => prev.map((s) => s.id === id ? { ...s, ...patch } : s));
  };

  const startHRCrew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle.trim() || !user) return;
    setIsRunning(true);
    setFinalResult(null);
    setSteps(INITIAL_STEPS.map((s) => ({ ...s, status: 'pending', output: undefined })));

    try {
      const token = await user.getIdToken();
      updateStep('roles', { status: 'running' });
      const res = await fetch('/api/workflows/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          workflowId: 'hiring-plan',
          inputs: { stage, product: jobTitle, budget: budget || '50000' },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'فشل التشغيل');

      const stepResults = data.steps as Record<string, { text?: string; error?: string }> || {};
      for (const step of INITIAL_STEPS) {
        const r = stepResults[step.id];
        updateStep(step.id, {
          status: r?.error ? 'error' : 'done',
          output: r?.text || r?.error || '',
        });
      }
      const allText = INITIAL_STEPS
        .map((s) => `## ${s.label}\n\n${stepResults[s.id]?.text || ''}`)
        .join('\n\n---\n\n');
      setFinalResult(allText);
      toast.success('انتهت فرقة التوظيف! اطّلع على النتائج أدناه.');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
      setSteps((prev) => prev.map((s) => s.status === 'running' ? { ...s, status: 'error' } : s));
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopy = async () => {
    if (!finalResult) return;
    await navigator.clipboard.writeText(finalResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!finalResult) return;
    const blob = new Blob([`# خطة التوظيف — كلميرون\n\n${finalResult}`], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hiring-plan-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 py-8 text-white" dir="rtl">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/[0.06] px-3 py-1 text-[11px] text-blue-200 mb-3">
            <Users className="w-3.5 h-3.5" />
            الموارد البشرية · AI Recruitment
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-3 mb-2">
            <Users className="w-7 h-7 text-blue-400" />
            فرقة الموارد البشرية
          </h1>
          <p className="text-neutral-400 text-sm max-w-xl">
            أتمتة التوظيف من تحديد الأدوار إلى تصميم مسار المقابلة — بضغطة واحدة.
          </p>
        </motion.div>

        {/* Input Form */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <form onSubmit={startHRCrew} className="bg-neutral-900/60 border border-neutral-700/50 rounded-2xl p-6 mb-6">
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div className="md:col-span-1">
                <label className="block text-xs text-neutral-400 mb-1.5">المسمى الوظيفي / نوع المنتج</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="تطبيق جوال للتوصيل"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-400 mb-1.5">مرحلة الشركة</label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-blue-500 transition-colors"
                >
                  <option>Pre-Seed</option>
                  <option>Seed</option>
                  <option>Series A</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-neutral-400 mb-1.5">ميزانية الرواتب الشهرية (EGP)</label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="50000"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!jobTitle.trim() || isRunning}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 text-sm transition-all"
              >
                {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                {isRunning ? 'جاري التشغيل...' : 'تشغيل فرقة التوظيف'}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Progress Steps */}
        <AnimatePresence>
          {(isRunning || finalResult) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 bg-neutral-900/60 border border-neutral-700/50 rounded-2xl p-5"
            >
              <h3 className="text-sm font-semibold text-neutral-300 mb-4">تقدّم الفرقة</h3>
              <div className="space-y-3">
                {steps.map((step) => (
                  <div key={step.id} className="flex items-center gap-3">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                      step.status === 'done' ? 'bg-emerald-500/20 text-emerald-400' :
                      step.status === 'running' ? 'bg-blue-500/20 text-blue-400' :
                      step.status === 'error' ? 'bg-rose-500/20 text-rose-400' :
                      'bg-neutral-800 text-neutral-600'
                    )}>
                      {step.status === 'done' ? <CheckCircle2 className="w-3.5 h-3.5" /> :
                       step.status === 'running' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
                       <span className="w-1.5 h-1.5 rounded-full bg-current" />}
                    </div>
                    <span className={cn(
                      "text-sm",
                      step.status === 'done' ? 'text-white' :
                      step.status === 'running' ? 'text-blue-300' :
                      'text-neutral-500'
                    )}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Agent Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {AGENTS_INFO.map((a, i) => {
            const Icon = a.icon;
            return (
              <div key={i} className="bg-neutral-900/60 p-5 rounded-2xl border border-neutral-700/50">
                <Icon className={cn("w-5 h-5 mb-3", a.color)} />
                <h4 className="font-bold text-sm mb-1">{a.title}</h4>
                <p className="text-xs text-neutral-500">{a.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Final Result */}
        <AnimatePresence>
          {finalResult && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-neutral-900/60 border border-neutral-700/50 rounded-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-800">
                <span className="text-sm font-semibold text-neutral-200">خطة التوظيف الكاملة</span>
                <div className="flex items-center gap-3">
                  <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors">
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'تم' : 'نسخ'}
                  </button>
                  <button onClick={handleDownload} className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors">
                    <Download className="w-3.5 h-3.5" />
                    تحميل
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
      </div>
    </AppShell>
  );
}

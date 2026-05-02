'use client';

import React, { useState } from 'react';
import { Target, Users, Megaphone, Send, BarChart, Loader2, CheckCircle2, Copy, Check, Download, Play } from 'lucide-react';
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
  { id: 'channels', label: 'تحديد القنوات الأمثل',     status: 'pending' },
  { id: 'calendar', label: 'بناء تقويم المحتوى 30 يوم', status: 'pending' },
  { id: 'posts',    label: 'كتابة أول 10 منشورات',     status: 'pending' },
];

const AGENT_CARDS = [
  { icon: Target,   color: 'text-indigo-400', title: 'مساعد البحث (SDR)',  desc: 'يستخرج أفضل 50 عميل محتمل مطابق لمعاييرك من الشبكات المهنية.' },
  { icon: Users,    color: 'text-emerald-400',title: 'كاتب المحتوى',       desc: 'يصيغ رسائل مخصصة لكل عميل باستخدام نبرة علامتك التجارية.' },
  { icon: BarChart, color: 'text-amber-400',  title: 'محلل الأداء',        desc: 'يراقب استجابات الحملة ويقترح تحسينات A/B فورية.' },
];

export default function SalesMarketingPage() {
  const { user } = useAuth();
  const [brand, setBrand] = useState('');
  const [audience, setAudience] = useState('');
  const [goal, setGoal] = useState('زيادة المبيعات');
  const [steps, setSteps] = useState<StepResult[]>(INITIAL_STEPS);
  const [isRunning, setIsRunning] = useState(false);
  const [finalResult, setFinalResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const updateStep = (id: string, patch: Partial<StepResult>) => {
    setSteps((prev) => prev.map((s) => s.id === id ? { ...s, ...patch } : s));
  };

  const startSalesCrew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand.trim() || !user) return;
    setIsRunning(true);
    setFinalResult(null);
    setSteps(INITIAL_STEPS.map((s) => ({ ...s, status: 'pending', output: undefined })));

    try {
      const token = await user.getIdToken();
      updateStep('channels', { status: 'running' });
      const res = await fetch('/api/workflows/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          workflowId: 'social-media-strategy',
          inputs: { brand, audience: audience || 'رواد الأعمال المصريون', goal },
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
      toast.success('انتهت حملة التواصل! اطّلع على النتائج أدناه.');
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
    const blob = new Blob([`# استراتيجية التسويق — كلميرون\n\n${finalResult}`], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-strategy-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 py-8 text-white" dir="rtl">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/[0.06] px-3 py-1 text-[11px] text-blue-200 mb-3">
            <Megaphone className="w-3.5 h-3.5" />
            المبيعات والتسويق · AI-Driven
          </div>
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-3 mb-2">
                <Megaphone className="w-7 h-7 text-blue-500" />
                فريق المبيعات والتسويق الآلي
              </h1>
              <p className="text-neutral-400 text-sm max-w-xl">
                استراتيجية تواصل اجتماعي كاملة لـ 30 يوماً مع تقويم محتوى وأول 10 منشورات جاهزة للنشر.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 bg-blue-900/40 border border-blue-500/30 text-blue-300 px-4 py-2 rounded-full text-sm font-bold">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500" />
              </span>
              نشط
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <form onSubmit={startSalesCrew} className="bg-neutral-900/60 border border-neutral-700/50 rounded-2xl p-6 mb-6">
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs text-neutral-400 mb-1.5">اسم العلامة التجارية</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="مثال: متجر ملابس محلي"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-400 mb-1.5">الجمهور المستهدف</label>
                <input
                  type="text"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="مثال: نساء مصريات 20-35"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-400 mb-1.5">الهدف الرئيسي</label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-blue-500 transition-colors"
                >
                  <option>زيادة المبيعات</option>
                  <option>بناء متابعين</option>
                  <option>تعزيز الوعي بالعلامة</option>
                  <option>توليد عملاء محتملين</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!brand.trim() || isRunning}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 text-sm transition-all"
              >
                {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                {isRunning ? 'جاري بناء الاستراتيجية...' : 'تشغيل حملة التواصل'}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Progress */}
        <AnimatePresence>
          {(isRunning || finalResult) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 bg-neutral-900/60 border border-neutral-700/50 rounded-2xl p-5"
            >
              <h3 className="text-sm font-semibold text-neutral-300 mb-4">تقدّم الفريق</h3>
              <div className="space-y-3">
                {steps.map((step) => (
                  <div key={step.id} className="flex items-center gap-3">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                      step.status === 'done'    ? 'bg-emerald-500/20 text-emerald-400' :
                      step.status === 'running' ? 'bg-blue-500/20 text-blue-400' :
                      step.status === 'error'   ? 'bg-rose-500/20 text-rose-400' :
                      'bg-neutral-800 text-neutral-600'
                    )}>
                      {step.status === 'done'    ? <CheckCircle2 className="w-3.5 h-3.5" /> :
                       step.status === 'running' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
                       <span className="w-1.5 h-1.5 rounded-full bg-current" />}
                    </div>
                    <span className={cn(
                      "text-sm",
                      step.status === 'done'    ? 'text-white' :
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
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {AGENT_CARDS.map((a, i) => {
            const Icon = a.icon;
            return (
              <div key={i} className="bg-neutral-900/60 border border-neutral-700/50 rounded-2xl p-5">
                <Icon className={cn("w-5 h-5 mb-3", a.color)} />
                <h3 className="font-bold text-sm mb-1">{a.title}</h3>
                <p className="text-xs text-neutral-500">{a.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Result */}
        <AnimatePresence>
          {finalResult && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-neutral-900/60 border border-neutral-700/50 rounded-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-800">
                <span className="text-sm font-semibold text-neutral-200">الاستراتيجية التسويقية الكاملة</span>
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

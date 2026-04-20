'use client';

import React from 'react';
import { AppShell } from "@/components/layout/AppShell";
import { Activity, AlertTriangle, ShieldAlert, BarChart3, BrainCircuit, CheckCircle2 } from 'lucide-react';

export default function ObservabilityDashboard() {
  const metrics = [
    { title: 'دقة استرجاع البيانات (RAG Accuracy)', value: '96.4%', trend: '+1.2%', status: 'good' },
    { title: 'معدل الهلوسة (Hallucination Rate)', value: '0.8%', trend: '-0.3%', status: 'excellent' },
    { title: 'انحراف الوكيل (Agent Drift)', value: '2.1%', trend: '+0.5%', status: 'warning' },
    { title: 'متوسط زمن الاستجابة (Latency)', value: '450ms', trend: '-20ms', status: 'good' },
  ];

  return (
    <AppShell>
      <div className="p-8 max-w-7xl mx-auto text-white" dir="rtl">
        <header className="mb-10">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Activity className="w-8 h-8 text-fuchsia-500" />
            مركز المراقبة المتقدمة (Advanced Observability)
          </h1>
          <p className="text-neutral-400 mt-2">
            مراقبة جودة نماذج الذكاء الاصطناعي، تتبع الانحراف السلوكي (Drift)، وتدقيق مدى دقة الإجابات المالية والقانونية.
          </p>
        </header>

        {/* Top Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {metrics.map((m, i) => (
            <div key={i} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
              <span className="text-sm text-neutral-400 block mb-2">{m.title}</span>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-white">{m.value}</span>
                <span className={`text-sm ${m.trend.startsWith('+') && m.status !== 'warning' ? 'text-green-400' : m.status === 'warning' ? 'text-amber-400' : 'text-green-400'}`}>
                  {m.trend}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Custom Evaluations */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
              <ShieldAlert className="w-6 h-6 text-indigo-400" />
              التقييمات السيادية (Policy Evaluations)
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-neutral-950 rounded-lg flex justify-between items-center border border-neutral-800/50">
                <div>
                  <h3 className="font-bold text-neutral-200">الامتثال القانوني (Legal Agent)</h3>
                  <p className="text-xs text-neutral-500 mt-1">تطابق النصائح مع تشريعات الشركات (CMA/GDPR)</p>
                </div>
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle2 className="w-5 h-5"/>
                  <span className="font-mono">99.9%</span>
                </div>
              </div>
              <div className="p-4 bg-neutral-950 rounded-lg flex justify-between items-center border border-neutral-800/50">
                <div>
                  <h3 className="font-bold text-neutral-200">الدقة المالية (CFO Agent)</h3>
                  <p className="text-xs text-neutral-500 mt-1">خلو التحليلات من التوصيات الاستثمارية المباشرة</p>
                </div>
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle2 className="w-5 h-5"/>
                  <span className="font-mono">100%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Agent Drift Logs */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
              <BrainCircuit className="w-6 h-6 text-amber-400" />
              سجل تنبيهات انحراف السلوك (Drift Logs)
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-amber-950/20 border border-amber-900/50 rounded-lg">
                <div className="flex items-center gap-2 text-amber-400 mb-2">
                  <AlertTriangle className="w-4 h-4"/>
                  <span className="font-bold text-sm">تنبيه انحراف (Marketing Agent)</span>
                </div>
                <p className="text-sm text-neutral-300">
                  <span className="opacity-50">#10293 - </span>
                  الوكيل التسويقي بدأ يستخدم لهجة حادة (Aggressive Tone) تختلف عن أسلوب العلامة التجارية المحدد في النظام. تم التراجع التلقائي إلى نقطة الحفظ (Checkpoint).
                </p>
              </div>
              <div className="p-4 bg-neutral-950 rounded-lg border border-neutral-800/50">
                <p className="text-sm text-neutral-500 text-center py-4">لا توجد تنبيهات أخرى خلال آخر 24 ساعة.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </AppShell>
  );
}

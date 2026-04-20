'use client';

import React from 'react';
import { AppShell } from "@/components/layout/AppShell";
import { Clock, CheckCircle2, PlayCircle, Layers } from 'lucide-react';

export default function WorkflowsPage() {
  // محاكاة لجلب حالة المهام من Temporal Workflow
  const workflows = [
    { id: 'wf-9812', name: 'بناء خطة العمل شاملة (Plan Builder)', status: 'completed', duration: '12 دقيقة' },
    { id: 'wf-9813', name: 'تحليل سلسلة الإمداد العالمي', status: 'in_progress', duration: 'مستمر (4 ساعات)' },
    { id: 'wf-9814', name: 'تدقيق الامتثال القانوني (GDPR)', status: 'queued', duration: 'قيد الانتظار' }
  ];

  return (
    <AppShell>
      <div className="p-8 max-w-5xl mx-auto" dir="rtl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
            <Layers className="text-indigo-500 w-8 h-8" />
            سير العمليات الوكيلية (Durable Workflows)
          </h1>
          <p className="text-neutral-400 mt-2">مراقبة المهام طويلة الأمد المدارة بواسطة Temporal Orchestration.</p>
        </header>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
          <table className="w-full text-right text-white">
            <thead className="bg-neutral-950 border-b border-neutral-800">
              <tr>
                <th className="p-4 text-neutral-400 font-medium">مُعرف المهمة</th>
                <th className="p-4 text-neutral-400 font-medium">اسم العملية الوكيلية</th>
                <th className="p-4 text-neutral-400 font-medium">الحالة</th>
                <th className="p-4 text-neutral-400 font-medium">المدة</th>
              </tr>
            </thead>
            <tbody>
              {workflows.map(wf => (
                <tr key={wf.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/20">
                  <td className="p-4 font-mono text-sm">{wf.id}</td>
                  <td className="p-4 font-medium">{wf.name}</td>
                  <td className="p-4">
                    {wf.status === 'completed' && <span className="flex items-center gap-1 text-green-400 text-sm bg-green-400/10 w-fit px-2 py-1 rounded"><CheckCircle2 className="w-4 h-4"/> مكتملة</span>}
                    {wf.status === 'in_progress' && <span className="flex items-center gap-1 text-indigo-400 text-sm bg-indigo-400/10 w-fit px-2 py-1 rounded"><PlayCircle className="w-4 h-4 animate-pulse"/> قيد التنفيذ</span>}
                    {wf.status === 'queued' && <span className="flex items-center gap-1 text-amber-400 text-sm bg-amber-400/10 w-fit px-2 py-1 rounded"><Clock className="w-4 h-4"/> بالانتظار</span>}
                  </td>
                  <td className="p-4 text-neutral-400 text-sm">{wf.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}

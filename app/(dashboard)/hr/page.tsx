'use client';

import React, { useState } from 'react';
import { Users, FileText, Calendar, PlusCircle } from 'lucide-react';
import { AppShell } from "@/components/layout/AppShell";

export default function HRDashboard() {
  const [jobTitle, setJobTitle] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const startHRCrew = (e: React.FormEvent) => {
    e.preventDefault();
    setIsRunning(true);
    setTimeout(() => setIsRunning(false), 3000);
  };

  return (
    <AppShell>
      <div className="p-8 max-w-5xl mx-auto text-white" dir="rtl">
        <header className="mb-10">
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
            <Users className="w-8 h-8 text-blue-400" />
            فرقة الموارد البشرية والتوظيف (HR Swarm)
          </h1>
          <p className="text-neutral-400">
            أتمتة الذكاء الاصطناعي الشاملة (End-to-End Recruitment) عبر 4 مساعدين و Workday MCP.
          </p>
        </header>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 mb-8 flex flex-col md:flex-row gap-4 items-end">
           <div className="flex-1 w-full">
             <label className="block text-sm text-neutral-400 mb-2">المسمى الوظيفي المستهدف</label>
             <input aria-label="مثال: مدير عمليات المبيعات" type="text" value={jobTitle} onChange={e=>setJobTitle(e.target.value)} placeholder="مثال: مدير عمليات المبيعات" className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white outline-none" required />
           </div>
           <button onClick={startHRCrew} disabled={isRunning} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2 shrink-0 h-[50px]">
             {isRunning ? 'جاري مراجعة السير...' : 'تشغيل فرقة التوظيف'} <PlusCircle className="w-5 h-5" />
           </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
           <div className="bg-neutral-900 p-5 rounded-xl border border-neutral-800 opacity-80">
             <FileText className="w-5 h-5 text-purple-400 mb-3" />
             <h4 className="font-bold text-sm mb-1">وصف وظيفي (JD Agent)</h4>
             <p className="text-xs text-neutral-500">يستخدم Gemini 3 Flash لتوليد وصف وظيفي محترف ونشره.</p>
           </div>
           <div className="bg-neutral-900 p-5 rounded-xl border border-neutral-800 opacity-80">
             <Users className="w-5 h-5 text-blue-400 mb-3" />
             <h4 className="font-bold text-sm mb-1">فحص السير (Screening)</h4>
             <p className="text-xs text-neutral-500">يفرز 100+ سيرة ذاتية في ثوانٍ لاستخراج المرشح الأفضل.</p>
           </div>
           <div className="bg-neutral-900 p-5 rounded-xl border border-neutral-800 opacity-80">
             <Calendar className="w-5 h-5 text-emerald-400 mb-3" />
             <h4 className="font-bold text-sm mb-1">المجدول (Scheduler)</h4>
             <p className="text-xs text-neutral-500">يتواصل عبر البريد ليجدول المواعيد آلياً مثل مستشار Olivia.</p>
           </div>
           <div className="bg-neutral-900 p-5 rounded-xl border border-neutral-800 opacity-80">
             <Users className="w-5 h-5 text-rose-400 mb-3" />
             <h4 className="font-bold text-sm mb-1">الرفيق (Interview Companion)</h4>
             <p className="text-xs text-neutral-500">يقترح أسئلة حية وتدوين ملاحظات وقت المقابلة.</p>
           </div>
        </div>

        <div className="mt-8 bg-[#111115] rounded-xl border border-warning/10 p-4 border-l-4 border-l-amber-500">
           <p className="text-sm text-neutral-300">
             <span className="font-bold text-amber-500">حالة MCP:</span> اتصال أداة Workday ناجح عبر Composio. النظام مستعد للقراءة من قاعدة بيانات الموظفين وحفظ طلبات التوظيف الجديدة بشكل آمن.
           </p>
        </div>
      </div>
    </AppShell>
  );
}

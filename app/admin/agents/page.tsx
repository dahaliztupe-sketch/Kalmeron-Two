'use client';

import React from 'react';
import { Activity, ShieldCheck, Eye, Search, AlertCircle } from 'lucide-react';
import { AppShell } from "@/components/layout/AppShell";

export default function AdminAgentsHub() {
  return (
    <AppShell>
      <div className="p-8 max-w-7xl mx-auto text-white" dir="rtl">
        <header className="mb-10">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-neutral-400" />
            مركز المشرفين وحوكمة الوكلاء (Agent OS Hub)
          </h1>
          <p className="text-neutral-400 mt-2">
            لوحة التحكم المركزية لمجموعة مراقبي الذكاء الاصطناعي (Admin Agents Suite). تخضع جميع العمليات لمعايير Agent Governance Toolkit (OPA Policies).
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
           
           {/* Dashboard Monitor */}
           <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-3">
                   <Activity className="w-6 h-6 text-indigo-400" />
                   <h2 className="text-lg font-bold">مراقب لوحة التحكم</h2>
                 </div>
                 <span className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded">مستقر</span>
              </div>
              <div className="bg-neutral-950 p-4 rounded-lg font-mono text-sm text-neutral-300">
                > آخر الفحوصات (Amplitude): تم رصد زيادة +12% في النشاط.
                <br/><span className="text-neutral-500">تم الإرسال لـ Slack...</span>
              </div>
           </div>

           {/* Compliance Agent */}
           <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-3">
                   <ShieldCheck className="w-6 h-6 text-green-400" />
                   <h2 className="text-lg font-bold">التدقيق والامتثال القانوي</h2>
                 </div>
                 <span className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded">متوافق (EU AI Act)</span>
              </div>
              <div className="bg-neutral-950 p-4 rounded-lg font-mono text-sm text-neutral-300">
                > تدقيق تلقائي RAG Pipeline: مكتمل. 
                <br/><span className="text-neutral-500">تم تأكيد عزل بيانات PII والتوافق مع GDPR.</span>
              </div>
           </div>

           {/* UX Monitor */}
           <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-3">
                   <Eye className="w-6 h-6 text-amber-400" />
                   <h2 className="text-lg font-bold">مراقب تجربة المستخدم</h2>
                 </div>
                 <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-1 rounded">يحتاج تدخل</span>
              </div>
              <div className="bg-amber-950/20 border border-amber-900/50 p-4 rounded-lg font-mono text-sm text-amber-300/80">
                > تم تحليل 1050 جلسة إعادة (Decipher).
                <br/>! تحذير: رصد Rage Clicks في صفحة التسجيل (معدل ارتداد 3%).
              </div>
           </div>

           {/* Security Agent */}
           <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-3">
                   <AlertCircle className="w-6 h-6 text-rose-500" />
                   <h2 className="text-lg font-bold">الأمن السيبراني الاستباقي</h2>
                 </div>
                 <span className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded">محمي</span>
              </div>
              <div className="bg-neutral-950 p-4 rounded-lg font-mono text-sm text-neutral-300">
                > فحص ثغرات (API Dependencies): اجتياز.
                <br/>> تقرير VistaroAI: لا يوجد تهديدات استباقية (Prompt Injection).
              </div>
           </div>

        </div>

      </div>
    </AppShell>
  );
}

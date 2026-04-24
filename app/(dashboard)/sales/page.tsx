'use client';

import React, { useState } from 'react';
import { Target, Users, Megaphone, Send, BarChart } from 'lucide-react';
import { AppShell } from "@/components/layout/AppShell";

export default function SalesMarketingPage() {
  const [industry, setIndustry] = useState('');
  const [role, setRole] = useState('');
  const [valueProp, setValueProp] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const startSalesCrew = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRunning(true);
    // Directly call the flow or via API (represented conceptually here as a timeout)
    setTimeout(() => {
      setIsRunning(false);
    }, 3000);
  };

  return (
    <AppShell>
      <div className="p-8 max-w-5xl mx-auto text-white" dir="rtl">
        <header className="mb-10 flex items-center justify-between">
          <div>
             <h1 className="text-3xl font-bold flex items-center gap-3">
               <Megaphone className="w-8 h-8 text-blue-500" />
               فريق المبيعات والتسويق الآلي
             </h1>
             <p className="text-neutral-400 mt-2">
               شغّل مساعد المبيعات (AI SDR) وكُتاب المحتوى لبناء قوائم العملاء وإرسال رسائل مخصصة وتتبع الأداء.
             </p>
          </div>
          <div className="bg-blue-900/40 border border-blue-500/30 text-blue-300 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
            Mastra Active
          </div>
        </header>

        <form onSubmit={startSalesCrew} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 mb-8 grid md:grid-cols-3 gap-6">
           <div className="col-span-1">
             <label className="block text-sm font-medium text-neutral-400 mb-2">الصناعة المستهدفة</label>
             <input type="text" value={industry} onChange={e=>setIndustry(e.target.value)} placeholder="مثال: عقارات، تقنية صحية" className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none" required />
           </div>
           <div className="col-span-1">
             <label className="block text-sm font-medium text-neutral-400 mb-2">الدور الوظيفي المستهدف</label>
             <input type="text" value={role} onChange={e=>setRole(e.target.value)} placeholder="مثال: مديري التسويق، المؤسسين" className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none" required />
           </div>
           <div className="col-span-1">
             <label className="block text-sm font-medium text-neutral-400 mb-2">عرض القيمة (Value Proposition)</label>
             <input type="text" value={valueProp} onChange={e=>setValueProp(e.target.value)} placeholder="مثال: تخفيض التكاليف بنسبة 30%" className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none" required />
           </div>
           
           <div className="md:col-span-3 flex justify-end mt-4">
             <button disabled={isRunning} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 px-8 rounded-full flex items-center gap-2 transition-all">
                {isRunning ? 'جاري توجيه الفريق...' : 'تشغيل حملة التواصل'} <Send className="w-4 h-4" />
             </button>
           </div>
        </form>

        <div className="grid md:grid-cols-3 gap-6">
           {/* Card 1 */}
           <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 opacity-60">
             <div className="flex items-center gap-3 mb-4">
                <Target className="w-6 h-6 text-indigo-400" />
                <h3 className="font-bold text-lg">مساعد البحث (SDR)</h3>
             </div>
             <p className="text-sm text-neutral-400">يقوم حالياً بالبحث في شبكات الأعمال لاستخراج أفضل 50 عميل محتمل مطابق لمعاييرك.</p>
           </div>

           {/* Card 2 */}
           <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 opacity-60">
             <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-green-400" />
                <h3 className="font-bold text-lg">كاتب المحتوى</h3>
             </div>
             <p className="text-sm text-neutral-400">ينتظر قائمة العملاء لصياغة رسائل البريد الإلكتروني و DMs مخصصة لكل شخص باستخدام Gemini 3.0 Flash.</p>
           </div>

           {/* Card 3 */}
           <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 opacity-60">
             <div className="flex items-center gap-3 mb-4">
                <BarChart className="w-6 h-6 text-amber-400" />
                <h3 className="font-bold text-lg">محلل الأداء</h3>
             </div>
             <p className="text-sm text-neutral-400">يراقب أداء الحملة ويقيم استجابات العملاء لاقتراح قوالب A/B باستخدام التفكير العميق (Gemini Pro).</p>
           </div>
        </div>

      </div>
    </AppShell>
  );
}

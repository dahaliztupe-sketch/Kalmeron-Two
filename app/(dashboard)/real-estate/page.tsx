'use client';

import React, { useState } from 'react';
import { Home, DollarSign, Calculator, Search } from 'lucide-react';
import { AppShell } from "@/components/layout/AppShell";

export default function RealEstateAnalyzer() {
  const [analyzing, setAnalyzing] = useState(false);
  const [location, setLocation] = useState('');

  const analyzeDeal = (e: React.FormEvent) => {
    e.preventDefault();
    setAnalyzing(true);
    setTimeout(() => setAnalyzing(false), 3000);
  };

  return (
    <AppShell>
      <div className="p-8 max-w-6xl mx-auto text-white" dir="rtl">
         <header className="mb-10">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Home className="w-8 h-8 text-blue-500" />
            مُحلل الصفقات العقارية الافتراضي (Investra)
          </h1>
          <p className="text-neutral-400 mt-2">
            اطلب من مساعد الذكاء الاصطناعي معالجة بيانات المجمعات العقارية لاحتساب المقاييس النقدية، ROI ومعدلات العائد (Cap Rates) واعتماد خط الدفاع الأول.
          </p>
         </header>

         <form onSubmit={analyzeDeal} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 mb-8 flex gap-4">
           <input 
             type="text" 
             value={location} 
             onChange={e=>setLocation(e.target.value)} 
             placeholder="ابحث عن عقار استثماري للتحليل (مثال: القاهرة الجديدة)..." 
             className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white outline-none focus:border-blue-500" 
             required 
           />
           <button disabled={analyzing} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2">
             {analyzing ? 'جاري التحليل المعمق...' : 'بحث وتحليل'} <Search className="w-5 h-5" />
           </button>
         </form>

         {/* Mock Data representation after analysis */}
         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className={`bg-neutral-900 border border-neutral-800 rounded-2xl p-6 relative overflow-hidden transition-all ${analyzing ? 'opacity-50' : ''}`}>
               <div className="absolute top-0 right-0 bg-green-500/20 text-green-400 text-xs px-3 py-1 font-bold rounded-bl-lg">Strong Buy</div>
               <h3 className="font-bold text-xl mt-4 mb-1">فيلا 3 غرف - الياسمين</h3>
               <p className="text-neutral-400 text-sm mb-6">السعر التقديري: 4,500,000 EGP</p>
               
               <div className="space-y-3">
                 <div className="flex justify-between items-center text-sm border-b border-neutral-800 pb-2">
                   <span className="text-neutral-500">التدفق النقدي:</span>
                   <span className="font-mono text-green-400">+12,500 EGP/ش</span>
                 </div>
                 <div className="flex justify-between items-center text-sm border-b border-neutral-800 pb-2">
                   <span className="text-neutral-500">العائد على الاستثمار ROI:</span>
                   <span className="font-mono text-white">11.4%</span>
                 </div>
                 <div className="flex justify-between items-center text-sm border-b border-neutral-800 pb-2">
                   <span className="text-neutral-500">معدل العائد (Cap Rate):</span>
                   <span className="font-mono text-white">8.5%</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-neutral-500">قاعدة الـ 1%:</span>
                   <span className="font-mono text-green-400">محققة ✓</span>
                 </div>
               </div>
               
               <button className="w-full mt-6 bg-white/5 hover:bg-white/10 py-2 rounded text-sm transition-colors flex items-center justify-center gap-2">
                  <Calculator className="w-4 h-4"/> تفاصيل القرض والمصروفات
               </button>
            </div>
         </div>
      </div>
    </AppShell>
  );
}

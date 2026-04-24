'use client';

import { useState } from 'react';
import { Package, Truck, Activity, ArrowRightLeft } from 'lucide-react';
import { AppShell } from "@/components/layout/AppShell";
import { DocumentUploader } from "@/components/rag/DocumentUploader";

export default function SupplyChainDashboard() {
  const [analyzing, setAnalyzing] = useState(false);

  const runAnalysis = () => {
    setAnalyzing(true);
    setTimeout(() => setAnalyzing(false), 3000);
  };

  return (
    <AppShell>
      <div className="p-8 max-w-6xl mx-auto text-white" dir="rtl">
        <header className="mb-10 flex items-center justify-between">
          <div>
             <h1 className="text-3xl font-bold flex items-center gap-3">
               <Truck className="w-8 h-8 text-teal-400" />
               سرب الإمداد واللوجستيات (Supply Chain Swarm)
             </h1>
             <p className="text-neutral-400 mt-2">
               مساعدين ذكاء اصطناعي يتفاوضون لتحسين المخزون، وتوقع الطلبات عبر (TimeCopilot/Nixtla)، وتتبع الشحنات.
             </p>
          </div>
          <button onClick={runAnalysis} disabled={analyzing} className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg flex items-center gap-2">
            {analyzing ? 'يتم تحسين المخزون...' : 'تشغيل تحسين السلسلة (Swarm)'}
          </button>
        </header>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Demand Agent */}
          <div className={`bg-neutral-900 border border-neutral-800 rounded-2xl p-6 transition-all ${analyzing ? 'border-teal-500/50 shadow-[0_0_15px_rgba(20,184,166,0.2)]' : ''}`}>
             <div className="flex items-center gap-3 mb-4">
               <Activity className="w-6 h-6 text-indigo-400" />
               <h3 className="font-bold text-lg">التنبؤ بالطلب</h3>
             </div>
             <p className="text-sm text-neutral-400 mb-4">يعتمد على Gemini 3.1 Pro لمراجعة الأنماط الموسمية للمنتجات.</p>
             <div className="bg-neutral-950 rounded p-3 text-xs text-green-400 font-mono">
               {`>`} أحدث تقرير: +15% طلب متوقع على المنتجات التقنية في الربع القادم.
             </div>
          </div>

          {/* Inventory Agent */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
             <div className="flex items-center gap-3 mb-4">
               <Package className="w-6 h-6 text-amber-400" />
               <h3 className="font-bold text-lg">موازنة المخزون</h3>
             </div>
             <p className="text-sm text-neutral-400 mb-4">يراقب النواقص الزائدة وتكاليف التخزين لتقديم مستويات خدمة أفضل من 98%.</p>
             <div className="bg-neutral-950 rounded p-3 text-xs text-amber-400 font-mono">
               {`>`} تنبيه: المنتج #205 المخزون أقل من النسبة الآمنة (Safety Stock). يتم نقل شحنات...
             </div>
          </div>

          {/* Logistics Agent */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
             <div className="flex items-center gap-3 mb-4">
               <ArrowRightLeft className="w-6 h-6 text-rose-400" />
               <h3 className="font-bold text-lg">مسارات التتبع</h3>
             </div>
             <p className="text-sm text-neutral-400 mb-4">Disruption Management - يتعقب الشحنات عالمياً ويبحث عن تعطيلات الطرق.</p>
             <div className="bg-neutral-950 rounded p-3 text-xs text-rose-400 font-mono">
               {`>`} مسار بديل مقترح: شحنة X5 لتجنب إغلاقات الميناء الحالية، يوفر 3 أيام.
             </div>
          </div>
        </div>

        <div className="mt-8">
          <DocumentUploader title="مستندات سلسلة الإمداد (قوائم موردين، عقود، فواتير شحن)" />
          <p className="text-xs text-neutral-500 mt-2">
            ارفع بيانات المخزون والموردين ليستشهد بها سرب الإمداد عند توصياته في المحادثة.
          </p>
        </div>
      </div>
    </AppShell>
  );
}

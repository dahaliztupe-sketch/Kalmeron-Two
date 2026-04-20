'use client';
import { AppShell } from "@/components/layout/AppShell";
import { Target, TrendingUp, AlertCircle } from "lucide-react";

export default function OpportunitiesRadar() {
  return (
    <AppShell>
      <div className="max-w-5xl mx-auto text-white p-8" dir="rtl">
        <header className="mb-10">
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-4">
            <Target className="w-8 h-8 text-rose-500" />
            رادار الفرص الاستثمارية (Radar)
          </h1>
          <p className="text-neutral-400">تحليل فجوات السوق بناءً على تقارير هيئة الاستثمار والأسواق الناشئة محلياً.</p>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 blur-3xl rounded-full" />
            <TrendingUp className="w-8 h-8 text-rose-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">الطاقة النظيفة (Green Tech)</h3>
            <p className="text-neutral-400 text-sm mb-4">فرصة استثمارية عالية بسبب توجهات الدعم الحكومي لمشاريع الهيدروجين الأخضر والطاقة المتجددة.</p>
            <div className="flex gap-2">
              <span className="text-xs bg-rose-500/20 text-rose-300 px-2 py-1 rounded">فجوة سوقية 35%</span>
            </div>
          </div>
          
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full" />
            <AlertCircle className="w-8 h-8 text-indigo-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">تكنولوجيا الزراعة (AgriTech)</h3>
            <p className="text-neutral-400 text-sm mb-4">دعم لوجستيات التصدير وتقنيات الري الذكي تشهد تدفقات نقدية قوية (VC Inflows) في الربع الأخير.</p>
            <div className="flex gap-2">
              <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded">تمويل سريع النمو</span>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

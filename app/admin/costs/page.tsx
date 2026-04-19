import React from 'react';
import { AppShell } from "@/components/layout/AppShell";
import { BentoGrid, BentoCard } from "@/src/components/ui/BentoGrid";
import { DollarSign, Activity, AlertTriangle, Users } from 'lucide-react';

export default function CostsDashboardPage() {
  return (
    <AppShell>
      <div className="max-w-7xl mx-auto p-8" dir="rtl">
        <div className="flex items-center gap-3 mb-8">
          <DollarSign className="w-8 h-8 text-rose-500" />
          <h1 className="text-3xl font-bold text-white">مراقبة التكاليف والموارد</h1>
        </div>

        <BentoGrid>
          {/* Summary */}
          <BentoCard span={4} className="p-6 flex justify-between items-center bg-black/40 border border-rose-500/20">
            <div>
               <h2 className="text-neutral-400 font-medium">إجمالي التكلفة (هذا الشهر)</h2>
               <div className="text-4xl font-black text-rose-500 mt-2">$248.50</div>
            </div>
            <div className="flex gap-4">
               <div className="text-center">
                  <div className="text-xl font-bold text-white">$12.40</div>
                  <div className="text-xs text-neutral-500">اليوم</div>
               </div>
               <div className="text-center">
                  <div className="text-xl font-bold text-[#D4AF37]">$85.20</div>
                  <div className="text-xs text-neutral-500">الأسبوع</div>
               </div>
            </div>
          </BentoCard>

          {/* Cost by Model */}
          <BentoCard span={2} className="p-6">
             <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-[#0A66C2]" />
                <h3 className="text-lg font-bold">التكلفة حسب النموذج (AI Models)</h3>
             </div>
             <div className="space-y-4">
                 <div>
                    <div className="flex justify-between text-sm mb-1 text-white"><span>Gemini-3.1-Pro</span> <span>$140.00</span></div>
                    <div className="w-full bg-white/10 rounded-full h-2"><div className="bg-[#0A66C2] h-2 rounded-full w-[60%]"></div></div>
                 </div>
                 <div>
                    <div className="flex justify-between text-sm mb-1 text-white"><span>Gemini-3.1-Flash</span> <span>$80.50</span></div>
                    <div className="w-full bg-white/10 rounded-full h-2"><div className="bg-[#D4AF37] h-2 rounded-full w-[30%]"></div></div>
                 </div>
                 <div>
                    <div className="flex justify-between text-sm mb-1 text-white"><span>Flash-Lite</span> <span>$28.00</span></div>
                    <div className="w-full bg-white/10 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full w-[10%]"></div></div>
                 </div>
             </div>
          </BentoCard>

          {/* User Limits */}
          <BentoCard span={2} className="p-6">
             <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-neutral-300" />
                <h3 className="text-lg font-bold">توزيع الاستخدام</h3>
             </div>
             <div className="flex items-center justify-center py-4 text-neutral-400 text-sm">
                مخطط دائري (Pie Chart Template)
             </div>
          </BentoCard>

          {/* Alerts */}
          <BentoCard span={4} className="p-6 border border-rose-500/20">
             <div className="flex items-center gap-2 mb-4 text-rose-500">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-lg font-bold">تنبيهات وحالات تجاوز الحد</h3>
             </div>
             <div className="bg-black/40 p-4 rounded-xl border border-white/5 flex justify-between items-center">
                <span className="text-neutral-300 text-sm">⚠️ المستخدم (uid: 9x8A...) تجاوز الحد اليومي ($5.00) ووصل إلى $5.20. تم استخدام التوجيه الذكي (AI Gateway) لتقييد النماذج المكلفة.</span>
                <span className="text-xs text-neutral-500">منذ 10 دقائق</span>
             </div>
          </BentoCard>

        </BentoGrid>
      </div>
    </AppShell>
  );
}

// @ts-nocheck
'use client';
import { AppShell } from "@/components/layout/AppShell";
import { FileText, Cpu } from "lucide-react";

export default function BusinessPlanGen() {
  return (
    <AppShell>
      <div className="h-full flex flex-col items-center justify-center text-center p-8 text-white min-h-[70vh]" dir="rtl">
        <div className="relative mb-8">
          <div className="absolute -inset-4 bg-emerald-500/20 blur-xl rounded-full" />
          <FileText className="w-16 h-16 text-emerald-400 relative z-10" />
        </div>
        <h1 className="text-4xl font-bold mb-4">مولّد خطة العمل التلقائي</h1>
        <p className="text-neutral-400 max-w-lg mx-auto mb-8">
          سيقوم مدير التخطيط الاستراتيجي بإنشاء خطة عمل مكونة من 30 صفحة تشمل النموذج المالي والتسويقي متوافقة مع متطلبات (VCs).
        </p>
        <button className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2">
          <Cpu className="w-5 h-5" />
          توليد خطة العمل باستخدام وكلاء Temporal
        </button>
      </div>
    </AppShell>
  );
}

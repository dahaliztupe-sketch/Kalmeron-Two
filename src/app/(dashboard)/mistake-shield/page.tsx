'use client';
import { AppShell } from "@/components/layout/AppShell";
import { ShieldAlert, AlertTriangle } from "lucide-react";

export default function MistakeShield() {
  return (
    <AppShell>
      <div className="max-w-4xl mx-auto p-8 text-white" dir="rtl">
        <header className="mb-10 text-center">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h1 className="text-4xl font-bold mb-4">حارس الأخطاء (Mistake Shield)</h1>
          <p className="text-neutral-400">الوكيل القانوني يقوم بتحليل النماذج لاكتشاف ومنع الأخطاء الشائعة للمؤسسين لتجنب الكوارث القانونية.</p>
        </header>

        <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-6">
          <div className="flex items-start gap-4">
            <div className="mt-1 bg-red-500/20 p-2 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div>
               <h3 className="text-xl font-bold text-red-400 mb-2">تحذير قانوني: اتفاقية المؤسسين</h3>
               <p className="text-neutral-300 text-sm leading-relaxed mb-4">تبين عدم وجود شرط الـ (Vesting Schedule) في المسودة الحالية الخاص بشركائك المؤسسين. هذا قد يخلق ثغرة قانونية كبرى في حال انسحاب أحدهم مبكراً ويؤرق المستثمرين. هل تريد أن نقوم بكتابة وصياغة الملحق نيابة عنك؟</p>
               <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                 صياغة الملحق الآمن (Vesting Addendum)
               </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

'use client';
import { AppShell } from "@/components/layout/AppShell";
import { Lightbulb, ArrowRight } from "lucide-react";

export default function IdeaAnalyzer() {
  return (
    <AppShell>
      <div className="max-w-4xl mx-auto text-white p-8" dir="rtl">
        <header className="mb-10 text-center">
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lightbulb className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-4xl font-bold mb-4">مختبر تحليل الأفكار (Idea Lab)</h1>
          <p className="text-neutral-400 text-lg">أدخل فكرتك وسيقوم فريق الوكلاء بإجراء تحليل SWOT، وتقييم حجم السوق المحلي.</p>
        </header>

        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8">
          <textarea 
            className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-6 text-white placeholder-neutral-500 min-h-[150px] resize-none focus:outline-none focus:border-amber-500/50 transition-colors"
            placeholder="مثال: منصة سحابية لربط المزارعين المصريين بمصانع التغليف..."
          />
          <div className="mt-6 flex justify-end">
            <button className="bg-amber-500 hover:bg-amber-600 text-black font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-all">
              بدء التحليل الشامل (Swarm Analyze)
              <ArrowRight className="w-5 h-5 -scale-x-100" />
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

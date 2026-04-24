'use client';

import React from 'react';
import { AppShell } from "@/components/layout/AppShell";
import { Play, Save, Plus, Database, Cpu, MessageSquare } from 'lucide-react';

export default function AgentBuilderPage() {
  return (
    <AppShell>
      <div className="h-[calc(100vh-4rem)] flex flex-col bg-neutral-950" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/50">
          <div>
            <h1 className="text-xl font-bold text-white">منشئ المساعدين (No-Code Agent Builder)</h1>
            <p className="text-xs text-neutral-400 mt-1">صمم مساعدك الخاص بأسلوب السحب والإفلات وتصديره إلى LangGraph</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors border border-white/10 text-sm">
              <Play className="w-4 h-4 text-emerald-400" />
              تجربة المساعد المدمج
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors font-medium text-sm">
              <Save className="w-4 h-4" />
              حفظ وتجميع (Compile)
            </button>
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar / Node Palette */}
          <div className="w-64 border-l border-white/10 bg-black/20 p-4 space-y-6 overflow-y-auto">
            <div>
              <h3 className="text-sm font-semibold text-neutral-400 mb-3 uppercase tracking-wider">نقاط الإطلاق (Triggers)</h3>
              <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg cursor-grab hover:border-emerald-500/50 transition-colors flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-emerald-500/20 flex items-center justify-center text-emerald-400"><Plus className="w-4 h-4"/></div>
                <span className="text-sm text-neutral-200">استلام طلب/حدث</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-neutral-400 mb-3 uppercase tracking-wider">كتل الذكاء (AI Blocks)</h3>
              <div className="space-y-2">
                <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg cursor-grab hover:border-blue-500/50 transition-colors flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-blue-500/20 flex items-center justify-center text-blue-400"><Cpu className="w-4 h-4"/></div>
                  <span className="text-sm text-neutral-200">موجه ذكي (Prompt)</span>
                </div>
                <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg cursor-grab hover:border-amber-500/50 transition-colors flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-amber-500/20 flex items-center justify-center text-amber-400"><MessageSquare className="w-4 h-4"/></div>
                  <span className="text-sm text-neutral-200">شرط اتخاذ قرار (Condition)</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-neutral-400 mb-3 uppercase tracking-wider">البيانات (Data)</h3>
              <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg cursor-grab hover:border-purple-500/50 transition-colors flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-purple-500/20 flex items-center justify-center text-purple-400"><Database className="w-4 h-4"/></div>
                <span className="text-sm text-neutral-200">بحث في المعرفة (RAG)</span>
              </div>
            </div>
          </div>

          {/* Infinite Canvas */}
          <div className="flex-1 bg-[#0a0a0a] relative" style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
            {/* Visual placeholder for the drag-and-drop workspace */}
            <div className="absolute inset-0 flex items-center justify-center text-neutral-600 font-medium">
              <div className="text-center">
                 <div className="inline-block p-4 border-2 border-dashed border-neutral-700 rounded-xl mb-4 text-neutral-500">
                    اسحب الكتل من القائمة هنا (React Flow Canvas)
                 </div>
                 <p className="text-sm">سيتم تحويل هذه الكتل تلقائياً إلى رسم بياني في LangGraph عند الحفظ.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

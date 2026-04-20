// @ts-nocheck
'use client';

import React from 'react';
import { AppShell } from "@/components/layout/AppShell";
import { Brain, Code, Terminal, Network, Search, Zap, Cpu, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function P3LandingHub() {
  const features = [
    {
      title: 'مركز المراقبة المتقدمة (Observability Hub)',
      description: 'مراقبة أداء الوكلاء، تتبع مستويات ההلوسة (Hallucination)، وتحليل مسارات اتخاذ القرار لحظياً.',
      icon: <Search className="w-8 h-8 text-fuchsia-500" />,
      link: '/admin/observability',
      color: 'bg-fuchsia-500/10 border-fuchsia-500/20'
    },
    {
      title: 'التفاعل الصوتي المباشر (Voice Agent)',
      description: 'جلسات صوتية فورية مع المستشار المالي (CFO) باستخدام Gemini Multimodal Live API.',
      icon: <Brain className="w-8 h-8 text-indigo-500" />,
      link: '/voice-advisor',
      color: 'bg-indigo-500/10 border-indigo-500/20'
    },
    {
      title: 'سير العمليات الطويلة (Durable Workflows)',
      description: 'لوحة تحكم مركزية لمهام Temporal التي تعمل في الخلفية لتجهيز دراسات الجدوى والخطط.',
      icon: <Network className="w-8 h-8 text-emerald-500" />,
      link: '/workflows',
      color: 'bg-emerald-500/10 border-emerald-500/20'
    }
  ];

  return (
    <AppShell>
      <div className="min-h-screen text-white p-8 max-w-6xl mx-auto" dir="rtl">
        <header className="mb-16 mt-8 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4 fill-amber-500" />
            <span>مرحلة P3 نشطة</span>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight mb-6">
            مرحلة النضج المؤسسي <span className="text-transparent bg-clip-text bg-gradient-to-l from-indigo-400 to-fuchsia-500">للوكلاء المتقدمين</span>
          </h1>
          <p className="text-xl text-neutral-400 max-w-2xl">
            لقد تم تفعيل نظام المراقبة المعرفية والذكاء الصوتي اللحظي. اختر الأنظمة الجديدة لاختبار قدرات Kalmeron Two في تحليل وتتبع وحوكمة الوكلاء.
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <Link key={i} href={f.link}>
              <div className={`p-8 rounded-3xl border border-neutral-800 bg-neutral-900 transition-all hover:bg-neutral-800 hover:scale-[1.02] cursor-pointer h-full flex flex-col`}>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border ${f.color}`}>
                  {f.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3">{f.title}</h3>
                <p className="text-neutral-400 flex-grow mb-6 leading-relaxed">
                  {f.description}
                </p>
                <div className="flex items-center gap-2 text-sm font-mono text-neutral-500 mt-auto">
                  <span>فتح النظام</span>
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

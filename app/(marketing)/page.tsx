"use client";

import Link from 'next/link';
import Image from 'next/image';
import { LineChart, Users, Scale, ShieldCheck, Activity, ChevronLeft, Lightbulb, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { BentoGrid, BentoCard } from '@/src/components/ui/BentoGrid';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const { user, dbUser } = useAuth();
  
  const isActualAdmin = user?.email === 'abdalrahman32008@gmail.com' || (dbUser as any)?.isAdmin;
  const [testAdminMode, setTestAdminMode] = useState(false);
  const isAdmin = isActualAdmin || testAdminMode;

  const userModules = [
    {
      title: 'محرك الإشراف',
      description: 'حلل فكرتك وقم ببناء مسار الشركة مع المنسق الذكي.',
      href: '/chat',
      icon: <Lightbulb className="w-10 h-10 text-[rgb(var(--gold))]" />,
      span: 2 as const
    },
    {
      title: 'مختبر أبحاث السوق',
      description: 'مستهلكون تركيبيون لاختبار Market Fit.',
      href: '/market-lab/results/demo',
      icon: <Users className="w-8 h-8 text-[rgb(var(--tech-blue))]" />,
      span: 1 as const
    },
    {
      title: 'المدير المالي (CFO)',
      description: 'نماذج مالية متقدمة وتوقعات السيولة.',
      href: '/cfo',
      icon: <LineChart className="w-8 h-8 text-neutral-300" />,
      span: 1 as const
    },
    {
      title: 'النماذج القانونية',
      description: 'عقود NDA ومؤسسين متوافقة مع قانون 151.',
      href: '/legal-templates',
      icon: <Scale className="w-8 h-8 text-neutral-300" />,
      span: 1 as const
    }
  ];

  const adminModules = [
    {
      title: 'صحة الوكلاء (Meta-AI)',
      description: 'مراقبة الانجراف، والأداء العام لجيش الذكاء الاصطناعي.',
      href: '/admin/agents-health',
      icon: <Activity className="w-8 h-8 text-cyan-500" />,
      span: 2 as const
    },
    {
      title: 'لوحة الامتثال',
      description: 'تتبع توافق GDPR وقانون 151.',
      href: '/admin/compliance',
      icon: <ShieldCheck className="w-8 h-8 text-rose-500" />,
      span: 1 as const
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden" dir="rtl">
      {/* Aurora Gradients Background */}
      <div className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-[rgb(var(--gold))] opacity-20 blur-[150px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[rgb(var(--tech-blue))] opacity-20 blur-[120px] pointer-events-none mix-blend-screen" />

      <div className="max-w-7xl mx-auto space-y-16 p-8 relative z-10">
        
        {/* Navigation & Admin Toggle */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
             <Image src="/brand/logo.svg" alt="Kalmeron Two Logo" width={200} height={60} className="h-10 w-auto" />
          </div>
          
          <div className="flex items-center gap-2 glass-panel px-4 py-2 rounded-full cursor-pointer transition-all hover:bg-white/5" onClick={() => setTestAdminMode(!testAdminMode)}>
            <div className={`w-3 h-3 rounded-full ${isAdmin ? 'bg-green-500 shadow-[0_0_10px_#10B981]' : 'bg-neutral-600'}`}></div>
            <span className="text-sm text-neutral-300">وضع الإدارة <span dir="ltr">(Admin)</span></span>
          </div>
        </div>

        {/* Hero Section (Glassmorphism 2.0) */}
        <section className="text-center pt-10 pb-6">
          <GlassCard className="max-w-4xl mx-auto p-12 border border-white/10 shadow-2xl relative overflow-hidden">
            {/* Subtle inner top glow */}
            <div className="absolute top-0 left-0 right-0 h-px brand-gradient opacity-50" />
            
            <div className="inline-block px-6 py-2 rounded-full bg-black/40 border border-white/20 text-sm font-medium mb-6 brand-gradient-text backdrop-blur-md">
              Kalmeron Two OS v3.0 (Liquid Engine)
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6 leading-tight text-white drop-shadow-md">
              نظام التشغيل <span className="brand-gradient-text">الريادي</span> المتكامل.
            </h1>
            <p className="text-xl text-neutral-300 max-w-2xl mx-auto drop-shadow-sm">
              من فكرة على ورق إلى كيان قانوني مدعوم مالياً ومُختبر سوقياً، يدار بواسطة جيش من وكلاء الذكاء الاصطناعي الأذكياء.
            </p>
          </GlassCard>
        </section>

        {/* Bento Grid - User Modules */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 border-b border-white/10 pb-4">
            <h2 className="text-3xl font-bold text-white">أدوات رائد الأعمال</h2>
            <div className="h-px flex-1 brand-gradient opacity-20" />
          </div>
          
          <BentoGrid>
            {userModules.map((module, i) => (
              <BentoCard key={i} span={module.span} className="group hover:bg-white/5 hover:border-white/20 transition-all duration-500 flex flex-col justify-between overflow-hidden relative p-8 cursor-pointer">
                <Link href={module.href} className="absolute inset-0 z-10" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div>
                  <div className="mb-6 w-16 h-16 rounded-2xl flex items-center justify-center bg-black/40 border border-white/5 group-hover:scale-110 group-hover:bg-white/10 transition-all shadow-inner relative z-20">
                    {module.icon}
                  </div>
                  <h3 className="text-2xl font-bold flex items-center justify-between text-white relative z-20">
                    {module.title}
                    <ChevronLeft className="w-6 h-6 opacity-0 group-hover:opacity-100 group-hover:-translate-x-2 transition-all text-neutral-400" />
                  </h3>
                </div>
                <p className="text-neutral-400 text-lg leading-relaxed mt-4 relative z-20">
                  {module.description}
                </p>
              </BentoCard>
            ))}
          </BentoGrid>
        </section>

        {/* Admin Modules Grid */}
        <AnimatePresence>
          {isAdmin && (
            <motion.section 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-8 overflow-hidden"
            >
              <div className="flex items-center gap-4 border-b border-rose-500/20 pb-4 mt-12">
                <Lock className="w-8 h-8 text-rose-500" />
                <h2 className="text-3xl font-bold text-white">لوحة الإدارة السريّة</h2>
                <div className="h-px flex-1 bg-gradient-to-l from-rose-500/20 to-transparent" />
              </div>

              <BentoGrid>
                {adminModules.map((module, i) => (
                  <BentoCard key={i} span={module.span} className="group border-rose-500/10 hover:bg-rose-500/5 hover:border-rose-500/30 transition-all duration-500 flex flex-col justify-between overflow-hidden p-8 cursor-pointer relative">
                    <Link href={module.href} className="absolute inset-0 z-10" />
                    <div>
                      <div className="mb-6 w-16 h-16 rounded-2xl flex items-center justify-center bg-black/40 border border-white/5 group-hover:scale-110 transition-transform shadow-inner relative z-20">
                        {module.icon}
                      </div>
                      <h3 className="text-2xl font-bold flex items-center justify-between text-white relative z-20">
                        {module.title}
                        <ChevronLeft className="w-6 h-6 opacity-0 group-hover:opacity-100 group-hover:-translate-x-2 transition-all text-neutral-400" />
                      </h3>
                    </div>
                    <p className="text-neutral-400 text-lg leading-relaxed mt-4 relative z-20">
                      {module.description}
                    </p>
                  </BentoCard>
                ))}
              </BentoGrid>
            </motion.section>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { motion } from "motion/react";
import {
  Flame, ExternalLink, Star, ArrowLeft, Sparkles,
  TrendingUp, Brain, Zap, Globe, BookOpen, Code2,
  BarChart3, MessageSquareText, Image, Video, Music,
  Cpu, Search, Filter,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/src/lib/utils";

interface AiTool {
  name: string;
  nameAr: string;
  desc: string;
  category: string;
  badge?: string;
  badgeColor?: string;
  rating: number;
  url: string;
  useFor: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  free: boolean;
}

const TOOLS: AiTool[] = [
  {
    name: "ChatGPT",
    nameAr: "ChatGPT",
    desc: "الأقوى للكتابة، الكود، التحليل، والمحادثة العامة",
    category: "عام",
    badge: "🔥 الأشهر",
    badgeColor: "text-amber-300 bg-amber-500/15 border-amber-500/30",
    rating: 4.8,
    url: "https://chat.openai.com",
    useFor: "كتابة المحتوى، الكود، تحليل البيانات",
    icon: Brain,
    gradient: "from-emerald-500 to-teal-600",
    free: true,
  },
  {
    name: "Claude",
    nameAr: "Claude",
    desc: "مثالي للتحليل العميق والوثائق الطويلة والكتابة الدقيقة",
    category: "عام",
    badge: "جديد",
    badgeColor: "text-cyan-300 bg-cyan-500/15 border-cyan-500/30",
    rating: 4.7,
    url: "https://claude.ai",
    useFor: "تحليل الوثائق، الكتابة الأكاديمية",
    icon: Sparkles,
    gradient: "from-orange-500 to-amber-600",
    free: true,
  },
  {
    name: "Gemini",
    nameAr: "Gemini",
    desc: "AI من Google مع تكامل Google Workspace الكامل",
    category: "عام",
    badge: "محدَّث",
    badgeColor: "text-blue-300 bg-blue-500/15 border-blue-500/30",
    rating: 4.5,
    url: "https://gemini.google.com",
    useFor: "البحث، Google Docs/Sheets",
    icon: Search,
    gradient: "from-blue-500 to-indigo-600",
    free: true,
  },
  {
    name: "Perplexity",
    nameAr: "Perplexity",
    desc: "محرك بحث AI مع مصادر موثّقة في الوقت الفعلي",
    category: "بحث",
    badge: "🔥 رائج",
    badgeColor: "text-amber-300 bg-amber-500/15 border-amber-500/30",
    rating: 4.6,
    url: "https://www.perplexity.ai",
    useFor: "البحث المتعمق، التحقق من المعلومات",
    icon: Search,
    gradient: "from-cyan-500 to-blue-600",
    free: true,
  },
  {
    name: "Midjourney",
    nameAr: "Midjourney",
    desc: "أفضل أداة لتوليد الصور الاحترافية بالذكاء الاصطناعي",
    category: "تصميم",
    badge: "🔥 رائج",
    badgeColor: "text-amber-300 bg-amber-500/15 border-amber-500/30",
    rating: 4.9,
    url: "https://www.midjourney.com",
    useFor: "تصميم المنتجات، التسويق البصري",
    icon: Image,
    gradient: "from-purple-500 to-pink-600",
    free: false,
  },
  {
    name: "Cursor",
    nameAr: "Cursor",
    desc: "محرر كود مدعوم بـ AI — أسرع طريقة لبناء المنتجات",
    category: "برمجة",
    badge: "الأفضل للمؤسسين التقنيين",
    badgeColor: "text-violet-300 bg-violet-500/15 border-violet-500/30",
    rating: 4.8,
    url: "https://cursor.sh",
    useFor: "بناء MVPs وتطبيقات الويب",
    icon: Code2,
    gradient: "from-indigo-500 to-violet-600",
    free: true,
  },
  {
    name: "Notion AI",
    nameAr: "Notion AI",
    desc: "AI مدمج في Notion لإدارة المعرفة والمشاريع",
    category: "إنتاجية",
    badge: "محدَّث",
    badgeColor: "text-blue-300 bg-blue-500/15 border-blue-500/30",
    rating: 4.4,
    url: "https://notion.so",
    useFor: "الوثائق، OKRs، إدارة المعرفة",
    icon: BookOpen,
    gradient: "from-neutral-500 to-slate-600",
    free: true,
  },
  {
    name: "Gamma",
    nameAr: "Gamma",
    desc: "يبني Pitch Decks وعروض تقديمية احترافية بجملة واحدة",
    category: "عروض",
    badge: "جديد",
    badgeColor: "text-cyan-300 bg-cyan-500/15 border-cyan-500/30",
    rating: 4.5,
    url: "https://gamma.app",
    useFor: "Pitch Decks، عروض المستثمرين",
    icon: BarChart3,
    gradient: "from-pink-500 to-rose-600",
    free: true,
  },
  {
    name: "ElevenLabs",
    nameAr: "ElevenLabs",
    desc: "توليد صوت بشري احترافي بأي لغة بما فيها العربية",
    category: "صوت",
    rating: 4.7,
    url: "https://elevenlabs.io",
    useFor: "البودكاست، محتوى التسويق الصوتي",
    icon: Music,
    gradient: "from-amber-500 to-orange-600",
    free: true,
  },
  {
    name: "Make (Integromat)",
    nameAr: "Make",
    desc: "أتمتة عمليات الشركة بدون كود — أقوى من Zapier",
    category: "أتمتة",
    badge: "🔥 رائج",
    badgeColor: "text-amber-300 bg-amber-500/15 border-amber-500/30",
    rating: 4.6,
    url: "https://make.com",
    useFor: "أتمتة المبيعات، التسويق، العمليات",
    icon: Zap,
    gradient: "from-violet-500 to-purple-600",
    free: true,
  },
  {
    name: "Runway",
    nameAr: "Runway",
    desc: "توليد وتحرير الفيديو بالذكاء الاصطناعي",
    category: "فيديو",
    badge: "جديد",
    badgeColor: "text-cyan-300 bg-cyan-500/15 border-cyan-500/30",
    rating: 4.5,
    url: "https://runwayml.com",
    useFor: "إنتاج محتوى التسويق والفيديو",
    icon: Video,
    gradient: "from-rose-500 to-red-600",
    free: false,
  },
  {
    name: "Otter.ai",
    nameAr: "Otter.ai",
    desc: "تسجيل ونسخ وتلخيص الاجتماعات تلقائياً",
    category: "إنتاجية",
    rating: 4.4,
    url: "https://otter.ai",
    useFor: "اجتماعات الفريق، مقابلات العملاء",
    icon: MessageSquareText,
    gradient: "from-blue-500 to-cyan-600",
    free: true,
  },
  {
    name: "Dify",
    nameAr: "Dify",
    desc: "منصة مفتوحة المصدر لبناء تطبيقات AI بدون كود",
    category: "برمجة",
    badge: "مفتوح المصدر",
    badgeColor: "text-emerald-300 bg-emerald-500/15 border-emerald-500/30",
    rating: 4.6,
    url: "https://dify.ai",
    useFor: "بناء chatbots وأتمتة workflows بـ AI",
    icon: Cpu,
    gradient: "from-teal-500 to-emerald-600",
    free: true,
  },
  {
    name: "v0 by Vercel",
    nameAr: "v0",
    desc: "يبني واجهات React/Next.js من وصف نصي",
    category: "برمجة",
    badge: "جديد",
    badgeColor: "text-cyan-300 bg-cyan-500/15 border-cyan-500/30",
    rating: 4.5,
    url: "https://v0.dev",
    useFor: "بناء UI بسرعة، Prototyping",
    icon: Code2,
    gradient: "from-slate-500 to-gray-700",
    free: true,
  },
  {
    name: "HeyGen",
    nameAr: "HeyGen",
    desc: "يبني فيديو بشخصية افتراضية تشرح منتجك بالعربي",
    category: "فيديو",
    badge: "🔥 رائج",
    badgeColor: "text-amber-300 bg-amber-500/15 border-amber-500/30",
    rating: 4.6,
    url: "https://www.heygen.com",
    useFor: "فيديوهات التسويق، التدريب",
    icon: Video,
    gradient: "from-violet-500 to-pink-600",
    free: false,
  },
  {
    name: "Lovable",
    nameAr: "Lovable",
    desc: "يبني تطبيقات ويب كاملة من وصف نصي",
    category: "برمجة",
    badge: "جديد",
    badgeColor: "text-cyan-300 bg-cyan-500/15 border-cyan-500/30",
    rating: 4.4,
    url: "https://lovable.dev",
    useFor: "بناء MVPs وتطبيقات SaaS",
    icon: Sparkles,
    gradient: "from-pink-500 to-rose-600",
    free: true,
  },
];

const CATEGORIES = ["الكل", "عام", "بحث", "تصميم", "برمجة", "إنتاجية", "عروض", "صوت", "فيديو", "أتمتة"];

const TIPS = [
  { icon: "💡", tip: "ادمج كلميرون مع ChatGPT: استخدم كلميرون للاستراتيجية واستخدم ChatGPT للكتابة" },
  { icon: "🚀", tip: "Cursor + كلميرون = المؤسس التقني المثالي. بنّي بسرعة وفكّر بذكاء" },
  { icon: "📊", tip: "استخدم Gamma لعروض المستثمرين، وكلميرون لبناء الأرقام التي تعبّئها" },
  { icon: "⚡", tip: "Make.com + كلميرون = أتمتة كاملة لعمليات شركتك" },
];

export default function TrendingToolsPage() {
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [freeOnly, setFreeOnly] = useState(false);

  const filtered = TOOLS.filter(t => {
    const matchCat = activeCategory === "الكل" || t.category === activeCategory;
    const matchFree = !freeOnly || t.free;
    return matchCat && matchFree;
  });

  return (
    <AppShell>
      <div dir="rtl" className="max-w-7xl mx-auto pb-24">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs text-amber-400 font-semibold uppercase tracking-widest">رائج الآن</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-1">
                أدوات AI <span className="brand-gradient-text">الرائجة</span>
              </h1>
              <p className="text-neutral-400 text-sm max-w-lg">
                أفضل {TOOLS.length} أداة اصطناعي يستخدمها رواد الأعمال في 2025 — ومكيفة على السياق المصري
              </p>
            </div>
          </div>
        </div>

        {/* Pro Tips Banner */}
        <div className="mb-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 overflow-x-auto no-scrollbar">
          <p className="text-xs font-bold text-amber-300 mb-2.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> نصائح الاستخدام الذكي
          </p>
          <div className="flex gap-4">
            {TIPS.map((t, i) => (
              <div key={i} className="flex items-start gap-2 min-w-[220px] text-xs text-neutral-300">
                <span className="text-base leading-none">{t.icon}</span>
                <span className="leading-relaxed">{t.tip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2 items-center">
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border",
                  activeCategory === cat
                    ? "bg-amber-600 text-white border-amber-500 shadow-[0_4px_16px_-4px_rgb(245_158_11/0.5)]"
                    : "bg-white/[0.03] text-neutral-400 border-white/[0.07] hover:border-white/[0.15] hover:text-white"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
          <button
            onClick={() => setFreeOnly(!freeOnly)}
            className={cn(
              "px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border",
              freeOnly
                ? "bg-emerald-600 text-white border-emerald-500"
                : "bg-white/[0.03] text-neutral-400 border-white/[0.07] hover:text-white"
            )}
          >
            مجاني فقط
          </button>
        </div>

        {/* Tools grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((tool, i) => {
            const Icon = tool.icon;
            return (
              <motion.a
                key={tool.name}
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                className={cn(
                  "group relative rounded-2xl border p-5 block transition-all duration-300",
                  "bg-[#0D1225]/60 hover:bg-[#111830]/80",
                  "border-white/[0.07] hover:border-white/[0.18]",
                  "hover:shadow-[0_0_30px_-10px_rgb(245_158_11/0.3)]"
                )}
              >
                {tool.badge && (
                  <div className="absolute -top-2.5 right-4">
                    <span className={cn("text-[10px] font-bold px-2.5 py-0.5 rounded-full border", tool.badgeColor)}>
                      {tool.badge}
                    </span>
                  </div>
                )}

                <div className="flex items-start gap-3 mb-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                    `bg-gradient-to-br ${tool.gradient}`
                  )}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-sm">{tool.nameAr}</h3>
                      {tool.free ? (
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-1.5 py-0.5 rounded-md">مجاني</span>
                      ) : (
                        <span className="text-[10px] text-neutral-400 bg-neutral-500/10 border border-neutral-500/20 px-1.5 py-0.5 rounded-md">مدفوع</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} className={cn("w-2.5 h-2.5", j < Math.round(tool.rating) ? "text-amber-400 fill-amber-400" : "text-neutral-600")} />
                      ))}
                      <span className="text-[10px] text-neutral-500 mr-1">{tool.rating}</span>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-neutral-600 group-hover:text-white transition-colors flex-shrink-0 mt-1" />
                </div>

                <p className="text-neutral-400 text-xs leading-relaxed mb-3 line-clamp-2">
                  {tool.desc}
                </p>

                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className="text-neutral-500">استخدمه لـ:</span>
                  <span className="text-neutral-300 font-medium">{tool.useFor}</span>
                </div>

                <div className="mt-3 pt-3 border-t border-white/[0.05]">
                  <span className="text-[11px] font-bold text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> افتح الأداة
                  </span>
                </div>
              </motion.a>
            );
          })}
        </div>

        {/* Integration CTA */}
        <div className="mt-10 rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-fuchsia-500/5 p-8 text-center">
          <div className="text-4xl mb-4">🤝</div>
          <h3 className="font-display text-xl font-bold text-white mb-2">
            كلميرون يعمل مع كل هذه الأدوات
          </h3>
          <p className="text-neutral-400 text-sm mb-5 max-w-lg mx-auto">
            استخدم كلميرون للاستراتيجية والتفكير، وادمجه مع الأدوات المتخصصة للتنفيذ
          </p>
          <Link
            href="/chat?q=كيف أدمج كلميرون مع أدوات AI الأخرى لأقصى إنتاجية؟"
            className="btn-primary inline-flex items-center gap-2 text-sm font-bold px-6 py-3 rounded-xl"
          >
            <Sparkles className="w-4 h-4" /> اسألني عن الدمج الأمثل
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  CheckCircle2, XCircle, Minus, ArrowLeft, BarChart3, Target, Sparkles,
} from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { TrustBadges } from "@/components/marketing/TrustBadges";

const tools = [
  { id: "kalmeron", name: "كلميرون", badge: null, isKalmeron: true },
  { id: "consultants", name: "مستشارون", badge: null, isKalmeron: false },
  { id: "chatgpt", name: "ChatGPT", badge: null, isKalmeron: false },
  { id: "notion", name: "Notion + Sheets", badge: null, isKalmeron: false },
];

type CellValue = true | false | "partial" | string;

interface ComparisonRow {
  category: string;
  feature: string;
  kalmeron: CellValue;
  consultants: CellValue;
  chatgpt: CellValue;
  notion: CellValue;
  note?: string;
}

const ROWS: ComparisonRow[] = [
  { category: "الذكاء الاصطناعي", feature: "مساعد ذكاء اصطناعي متعدد الأغراض", kalmeron: true, consultants: false, chatgpt: true, notion: false },
  { category: "الذكاء الاصطناعي", feature: "مساعدون بالذكاء الاصطناعي لأدوار الشركة (تجريبي)", kalmeron: true, consultants: false, chatgpt: false, notion: false, note: "مسودات غير مراجعة بشرياً وليست استشارة مهنية" },
  { category: "الذكاء الاصطناعي", feature: "تنسيق تلقائي بين المساعدين", kalmeron: true, consultants: false, chatgpt: false, notion: false },
  { category: "الذكاء الاصطناعي", feature: "ذاكرة طويلة الأمد وتعلم من سياقك", kalmeron: true, consultants: "partial", chatgpt: false, notion: false },
  { category: "الذكاء الاصطناعي", feature: "دعم عربي مصري أصيل", kalmeron: true, consultants: "partial", chatgpt: "partial", notion: false, note: "فهم العامية المصرية والسياق المحلي" },
  { category: "الأعمال", feature: "تحليل الأفكار والسوق", kalmeron: true, consultants: true, chatgpt: "partial", notion: false },
  { category: "الأعمال", feature: "خطة عمل كاملة للمستثمر", kalmeron: true, consultants: true, chatgpt: "partial", notion: false },
  { category: "الأعمال", feature: "نمذجة مالية واختبار السيناريوهات", kalmeron: true, consultants: true, chatgpt: false, notion: "partial" },
  { category: "الأعمال", feature: "مختبر سوق افتراضي (focus group AI)", kalmeron: true, consultants: false, chatgpt: false, notion: false },
  { category: "الأعمال", feature: "رادار الفرص والتمويل", kalmeron: true, consultants: false, chatgpt: false, notion: false, note: "تنبيهات فورية بالفرص المناسبة لك" },
  { category: "القانون والامتثال", feature: "عقود قانونية جاهزة للتخصيص", kalmeron: true, consultants: true, chatgpt: false, notion: false },
  { category: "القانون والامتثال", feature: "إرشادات التأسيس والامتثال القانوني", kalmeron: true, consultants: true, chatgpt: "partial", notion: false },
  { category: "الحماية والمخاطر", feature: "حارس الأخطاء الاستباقي", kalmeron: true, consultants: "partial", chatgpt: false, notion: false, note: "يحذرك من الأخطاء قبل وقوعها" },
  { category: "الحماية والمخاطر", feature: "تحليل المخاطر القانونية والمالية", kalmeron: true, consultants: true, chatgpt: "partial", notion: false },
  { category: "الإنتاجية", feature: "تقارير PDF جاهزة للمستثمر", kalmeron: true, consultants: true, chatgpt: false, notion: "partial" },
  { category: "الإنتاجية", feature: "تكامل مع الوثائق والملفات", kalmeron: true, consultants: false, chatgpt: "partial", notion: true },
];

function CellIcon({ value, isKalmeron }: { value: CellValue; isKalmeron?: boolean }) {
  if (value === true) return <CheckCircle2 className={`w-5 h-5 ${isKalmeron ? "text-emerald-400" : "text-emerald-400/70"}`} />;
  if (value === false) return <XCircle className="w-5 h-5 text-rose-400/50" />;
  if (value === "partial") return <Minus className="w-5 h-5 text-amber-400/70" />;
  return <span className="text-xs text-neutral-400 text-center leading-tight">{value}</span>;
}

const CATEGORIES = Array.from(new Set(ROWS.map((r) => r.category)));

export default function ComparePage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expandedNote, setExpandedNote] = useState<number | null>(null);

  const filteredRows = activeCategory ? ROWS.filter((r) => r.category === activeCategory) : ROWS;

  return (
    <div className="min-h-screen bg-[#05070D] text-white" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#05070D]/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <BrandLogo size={36} iconOnly href={null} />
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/auth/login" className="text-sm text-neutral-400 hover:text-white px-3 py-2 transition-colors">دخول</Link>
            <Link href="/auth/signup" className="btn-primary text-sm font-bold rounded-full px-5 py-2.5 flex items-center gap-1.5">
              ابدأ مجاناً <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative px-4 pt-20 pb-12 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(79,70,229,0.2),transparent)] pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="relative max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/5 text-xs text-indigo-300 mb-6">
            <Target className="w-3.5 h-3.5" /> المقارنة الشاملة
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-extrabold text-white mb-4 leading-tight">
            كلميرون مقابل<br />
            <span className="brand-gradient-text">كل البدائل</span>
          </h1>
          <p className="text-neutral-400 text-lg leading-relaxed mb-8">
            مقارنة وصفية عامة. الأسعار والميزات تتغير، فراجع موقع كل بديل مباشرة قبل أي قرار.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/auth/signup" className="btn-primary flex items-center gap-2 px-6 py-3 rounded-full font-bold">
              ابدأ مجاناً الآن <ArrowLeft className="w-4 h-4" />
            </Link>
            <a href="#comparison" className="btn-ghost flex items-center gap-2 px-6 py-3 rounded-full">
              <BarChart3 className="w-4 h-4" /> شاهد المقارنة
            </a>
          </div>
        </motion.div>
      </section>

      {/* Trust Badges */}
      <section className="px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <TrustBadges />
        </div>
      </section>

      {/* Full Feature Comparison */}
      <section id="comparison" className="px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-white text-center mb-3">مقارنة شاملة بالميزات</h2>
          <p className="text-neutral-400 text-center mb-8 text-sm">اضغط على فئة لتصفية النتائج</p>
          <p className="text-amber-300 text-center mb-6 text-xs">تنبيه: هذه مقارنة عامة أعدّها فريق كلميرون بلا اختبار مستقل، وبعض الميزات قيد التطوير أو لم تُراجَع جودتها. تحقق بنفسك قبل أي قرار.</p>

          {/* Category Filter */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            <button onClick={() => setActiveCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${!activeCategory ? "bg-indigo-500/20 border-indigo-400/40 text-white" : "bg-white/5 border-white/10 text-neutral-300 hover:border-white/20"}`}
            >
              الكل
            </button>
            {CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${activeCategory === cat ? "bg-indigo-500/20 border-indigo-400/40 text-white" : "bg-white/5 border-white/10 text-neutral-300 hover:border-white/20"}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <p className="mb-4 rounded-xl border border-amber-400/30 bg-amber-400/[0.06] px-4 py-3 text-sm text-amber-100 leading-relaxed">
            مقارنة تقريبية غير موثّقة بمصادر، ولم تُختبر ضد المنتجات الأخرى. ميزات كلميرون هنا تجريبية ومخرجاتها مسودات غير مراجعة بشرياً.
          </p>

          {/* Table */}
          <div className="rounded-3xl border border-white/10 overflow-hidden overflow-x-auto">
            <div className="grid min-w-[680px]" style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr" }}>
              {/* Header */}
              <div className="p-4 bg-white/[0.03] border-b border-white/10 text-sm text-neutral-400 font-medium">الميزة</div>
              {tools.map((tool) => (
                <div key={tool.id} className={`p-4 border-b border-white/10 text-center ${tool.isKalmeron ? "bg-indigo-500/5" : "bg-white/[0.02]"}`}>
                  <div className={`text-sm font-bold ${tool.isKalmeron ? "text-white" : "text-neutral-300"}`}>{tool.name}</div>
                  {tool.badge && (
                    <div className="text-[10px] text-emerald-400 mt-0.5 bg-emerald-400/10 px-2 py-0.5 rounded-full inline-block">{tool.badge}</div>
                  )}
                </div>
              ))}

              {/* Rows */}
              {filteredRows.map((row, i) => (
                <React.Fragment key={i}>
                  <div className={`p-3 md:p-4 text-sm text-neutral-300 border-b border-white/[0.04] flex items-center gap-2 ${i % 2 === 0 ? "" : "bg-white/[0.01]"}`}>
                    <span className="flex-1">{row.feature}</span>
                    {row.note && (
                      <button onClick={() => setExpandedNote(expandedNote === i ? null : i)}
                        className="shrink-0 text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full hover:bg-indigo-500/20 transition-all"
                      >
                        ملاحظة
                      </button>
                    )}
                  </div>
                  {tools.map((tool) => (
                    <div key={tool.id} className={`p-3 md:p-4 border-b border-white/[0.04] flex items-center justify-center ${tool.isKalmeron ? "bg-indigo-500/[0.03]" : i % 2 === 0 ? "" : "bg-white/[0.01]"}`}>
                      <CellIcon value={row[tool.id as keyof ComparisonRow] as CellValue} isKalmeron={tool.isKalmeron} />
                    </div>
                  ))}
                  {expandedNote === i && row.note && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="col-span-5 bg-indigo-500/5 border-b border-indigo-500/10 px-4 py-3 text-xs text-indigo-300"
                    >
                      💡 {row.note}
                    </motion.div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-6 text-xs text-neutral-400">
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> مدعوم بالكامل</span>
            <span className="flex items-center gap-2"><Minus className="w-4 h-4 text-amber-400" /> دعم جزئي</span>
            <span className="flex items-center gap-2"><XCircle className="w-4 h-4 text-rose-400/50" /> غير مدعوم</span>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-16 bg-gradient-to-b from-transparent via-indigo-950/10 to-transparent">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-4">
              الاختيار واضح —<br /><span className="brand-gradient-text">ابدأ اليوم مجاناً</span>
            </h2>
            <p className="text-neutral-400 mb-8">لا بطاقة ائتمان. لا التزامات. فقط فريقك المؤسس الذكي جاهز فوراً.</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/auth/signup" className="btn-primary flex items-center gap-2 px-8 py-4 rounded-full text-base font-bold">
                ابدأ مجاناً الآن <ArrowLeft className="w-5 h-5" />
              </Link>
              <Link href="/pricing" className="btn-ghost flex items-center gap-2 px-8 py-4 rounded-full text-base">
                شاهد الأسعار <Sparkles className="w-4 h-4" />
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-xs text-neutral-400">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> مجاني للبداية</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> ألغ في أي وقت</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> دعم فوري</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] px-4 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-neutral-400">
          <span>© {new Date().getFullYear()} Kalmeron AI. جميع الحقوق محفوظة.</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-neutral-400 transition-colors">الخصوصية</Link>
            <Link href="/terms" className="hover:text-neutral-400 transition-colors">الشروط</Link>
            <Link href="/" className="hover:text-neutral-400 transition-colors">الرئيسية</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

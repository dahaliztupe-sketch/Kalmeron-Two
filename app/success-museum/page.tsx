"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import {
  Trophy, ArrowLeft, Star, TrendingUp, Rocket, Globe2, Users,
  Coins, Clock, Zap, Brain, Target, BookOpen, Sparkles,
  Building2, ChevronDown, ChevronUp, ExternalLink,
  Lightbulb, BarChart3, CheckCircle2,
} from "lucide-react";
import { cn } from "@/src/lib/utils";

interface SuccessStory {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  category: string;
  founded: string;
  founders: string[];
  shortDesc: string;
  fullStory: string;
  achievement: string;
  valuation?: string;
  metric1: { label: string; value: string };
  metric2: { label: string; value: string };
  keyLessons: string[];
  kalmeronInsight: string;
  color: string;
}

const STORIES: SuccessStory[] = [
  {
    id: "swvl",
    name: "Swvl",
    emoji: "🚌",
    tagline: "حوّل الفوضى إلى يونيكورن",
    category: "تنقل ذكي",
    founded: "2017",
    founders: ["مصطفى كندة", "محمود نوح", "أحمد عبدالحميد"],
    shortDesc: "كيف تحولت أزمة المواصلات العشوائية في مصر لشركة يونيكورن مدرجة في بورصة ناسداك.",
    fullStory: "بدأ مصطفى كندة بملاحظة بسيطة: ملايين المصريين يكافحون يومياً للوصول إلى العمل عبر مواصلات مزدحمة وغير منتظمة. بدلاً من اختراع وسيلة نقل جديدة، قرر تحويل الحافلات الخاصة الموجودة إلى شبكة ذكية ومنظمة. في أقل من سنة، توسعت Swvl خارج مصر لتشمل 10+ دول، وجمعت تمويلاً تجاوز 100 مليون دولار، ثم أُدرجت في ناسداك عبر صفقة SPAC بقيمة 1.5 مليار دولار.",
    achievement: "يونيكورن مدرج في ناسداك",
    valuation: "$1.5 مليار",
    metric1: { label: "دول الانتشار", value: "11+" },
    metric2: { label: "رحلة يومياً (ذروة)", value: "100K+" },
    keyLessons: [
      "ابحث في مشاكل الملايين اليومية — ليس فقط مشاكل النخبة",
      "الحل لا يحتاج أن يكون اختراعاً — التنظيم وحده قد يغير صناعة",
      "التوسع الإقليمي السريع يُقوّي التقييم قبل جولات التمويل الكبيرة",
    ],
    kalmeronInsight: "استخدام كلميرون لتحليل فجوات سوق التنقل ورسم خارطة التوسع الجغرافي كان سيوفر أشهراً من البحث اليدوي.",
    color: "violet",
  },
  {
    id: "instabug",
    name: "Instabug",
    emoji: "🐛",
    tagline: "مشروع تخرج يخدم مطوري فيسبوك",
    category: "SaaS تقني",
    founded: "2013",
    founders: ["عمر طاهر", "موسى محمد"],
    shortDesc: "من مشروع تخرج في جامعة القاهرة إلى أداة أساسية يستخدمها مطورو فيسبوك وBuzz Feed.",
    fullStory: "في عام 2012، كان عمر طاهر وموسى محمد طلاباً في جامعة القاهرة يعانون من صعوبة جمع تقارير الأخطاء من مستخدمي التطبيقات. قرروا بناء أداة تُبسّط العملية برمّتها: مستخدم يهز الهاتف، يظهر نموذج الإبلاغ مع screenshot تلقائي وبيانات الجهاز كاملة. قُبلت الفكرة في Y Combinator عام 2016، وتوسع الفريق من 2 إلى 150+ موظف، وأصبحت Instabug موجودة في 25,000+ تطبيق حول العالم.",
    achievement: "Y Combinator + 25K+ تطبيق مُدمج",
    valuation: "$50M+",
    metric1: { label: "تطبيق يستخدمها", value: "25,000+" },
    metric2: { label: "دولة حول العالم", value: "75+" },
    keyLessons: [
      "احل مشكلتك الشخصية — غالباً آلاف غيرك يعانون منها",
      "التركيز على شريحة ضيقة جداً (Mobile developers) يبني ميزة تنافسية",
      "الجودة التقنية العالية هي أفضل تسويق في عالم SaaS",
    ],
    kalmeronInsight: "تحليل مختبر السوق كان سيُساعد في تحديد الشريحة الأسرع نمواً ورسم استراتيجية التسعير المثلى لكل حجم شركة.",
    color: "cyan",
  },
  {
    id: "maxab",
    name: "MaxAB",
    emoji: "🛒",
    tagline: "رقمنة قطاع التجزئة التقليدي",
    category: "B2B لوجستيات",
    founded: "2018",
    founders: ["أميل إرفانيان", "محمد بن حلب"],
    shortDesc: "رقمنة تجارة الجملة والتجزئة في مصر — من البقّال المحلي إلى منصة ربحت تمويلاً بـ 40 مليون دولار.",
    fullStory: "لاحظ المؤسسون أن سلاسل إمداد التجزئة في مصر تعمل بأسلوب منذ عقود: وسطاء كثيرون، لا شفافية في الأسعار، ولا تتبع للمخزون. بنوا MaxAB لتربط المصانع والموزعين مباشرة بالبقّالين الصغار عبر تطبيق بسيط. النتيجة: بقّال يطلب ويستلم خلال 24 ساعة بأسعار أفضل، ومصنع يرى بيانات الطلب فوراً.",
    achievement: "40M$ Series A + 100K+ بائع",
    valuation: "غير معلنة",
    metric1: { label: "بائع تجزئة مُخدَّم", value: "100K+" },
    metric2: { label: "مدينة في مصر والمغرب", value: "15+" },
    keyLessons: [
      "القطاعات التقليدية المُهملة = فرص ضخمة بمنافسة أقل",
      "خدم العميل الأصعب وصولاً — البقّال الصغير — وستفتح سوقاً هائلاً",
      "البيانات هي المنتج الثانوي الأكثر قيمة في منصات B2B",
    ],
    kalmeronInsight: "رادار الفرص في كلميرون يُساعد في اكتشاف هذه القطاعات التقليدية المهملة بتحليل منهجي للسوق — قبل أن يسبقك المنافسون.",
    color: "emerald",
  },
  {
    id: "breadfast",
    name: "Breadfast",
    emoji: "🥐",
    tagline: "من توصيل خبز إلى منصة Q-Commerce",
    category: "Q-Commerce / FMCG",
    founded: "2017",
    founders: ["مصطفى فؤاد", "محمد إبراهيم"],
    shortDesc: "بدأت بتوصيل خبز طازج في الصباح — ثم تحوّلت لمنصة Quick Commerce رائدة في أفريقيا.",
    fullStory: "الفكرة بدأت بسيطة جداً: توصيل خبز طازج ومنتجات صباحية لمنازل القاهرة قبل موعد الإفطار. لكن الفريق اكتشف سريعاً أن العميل يريد أكثر من مجرد خبز — يريد تسوق يومي سريع. حوّلوا النموذج إلى منصة Quick Commerce تُوصّل آلاف المنتجات في أقل من 30 دقيقة. جمعت الشركة أكثر من 100 مليون دولار وأصبحت مثالاً رائداً في أفريقيا.",
    achievement: "100M$+ تمويل إجمالي",
    valuation: "$200M+",
    metric1: { label: "دولة أفريقية", value: "3+" },
    metric2: { label: "SKU في الكتالوج", value: "5,000+" },
    keyLessons: [
      "ابدأ صغيراً جداً ومحدداً جداً — الخبز الصباحي — ثم توسّع",
      "استمع لبيانات الطلب: العملاء يخبرونك بالتوسع المنطقي التالي",
      "الـ Retention في التسوق اليومي أعلى بكثير من الـ E-Commerce التقليدي",
    ],
    kalmeronInsight: "نموذج Pivoting من خبز لـ Q-Commerce هو نموذج مثالي لما يساعدك كلميرون على اكتشافه: Signals من بيانات العملاء تُوجّه التوسع.",
    color: "amber",
  },
  {
    id: "paymob",
    name: "Paymob",
    emoji: "💳",
    tagline: "بنية تحتية للمدفوعات الرقمية في MENA",
    category: "Fintech / إنفراستركتشر",
    founded: "2015",
    founders: ["إسلام شوقي", "عمر قبة", "مصطفى باهر"],
    shortDesc: "بنى Paymob البنية التحتية لمدفوعات التجارة الإلكترونية في مصر — الآن يخدم 250K+ تاجر.",
    fullStory: "عندما أراد المؤسسون قبول المدفوعات الإلكترونية لمشروعهم الأول، وجدوا الأمر بالغ التعقيد والتكلفة. قرروا بناء الحل بأنفسهم ثم تقديمه للسوق. بدأوا بـ Payment Gateway بسيطة ثم توسعوا للمحافظ الرقمية وأجهزة POS والـ Buy Now Pay Later. اليوم يخدمون 250,000+ تاجر في 7 دول ويعالجون مليارات الجنيهات شهرياً.",
    achievement: "250K+ تاجر في 7 دول",
    valuation: "$100M+",
    metric1: { label: "تاجر مُدمج", value: "250K+" },
    metric2: { label: "معالجة سنوية", value: "مليارات ج.م" },
    keyLessons: [
      "Infrastructure plays = عائد أعلى وتعلّق أقوى من تطبيقات المستهلكين",
      "ابنِ الحل لمشكلتك أولاً، ثم حوّله لمنتج يخدم الآخرين",
      "الشراكة مع البنوك والجهات التنظيمية مبكراً يُبني حصناً تنافسياً",
    ],
    kalmeronInsight: "المرشد القانوني والمدير المالي في كلميرون كانا سيُسرّعان الحصول على التراخيص التنظيمية — أحد أكبر عوائق Fintech في مصر.",
    color: "indigo",
  },
  {
    id: "trella",
    name: "Trella",
    emoji: "🚛",
    tagline: "Uber للشاحنات في الشرق الأوسط",
    category: "Logistics Tech",
    founded: "2018",
    founders: ["فؤاد منصور", "عمر الصعيدي"],
    shortDesc: "ربط أصحاب الشاحنات بالشركات المحتاجة للنقل — بشكل رقمي وشفاف لأول مرة في المنطقة.",
    fullStory: "قطاع الشحن في مصر والشرق الأوسط كان يعتمد على الاتصالات الهاتفية والوسطاء. Trella جاءت لتُرقمن كل المعادلة: شركة تريد شحن بضاعة؟ انشر الطلب. صاحب شاحنة فارغة؟ قبّل العرض. الكل يتتبع في الوقت الفعلي. توسعت Trella لـ 5 دول وجمعت 42 مليون دولار.",
    achievement: "$42M تمويل + 5 دول",
    valuation: "غير معلنة",
    metric1: { label: "دول العمل", value: "5+" },
    metric2: { label: "تمويل مُجمَّع", value: "$42M" },
    keyLessons: [
      "المعادلات ذات الطرفين (Two-sided markets) صعبة البداية لكن قوية جداً عند التوسع",
      "رقمنة قطاع يعتمد على الهاتف = قيمة ضخمة بجهد محدود في البداية",
      "بيانات الشحن المتراكمة = ميزة تنافسية لا يمكن شراؤها",
    ],
    kalmeronInsight: "تحليل مختبر السوق ومحاكاة العميل كانا سيُساعدان في فهم الحوافز الصحيحة لكلا طرفي المنصة قبل الإطلاق.",
    color: "rose",
  },
];

const colorConfig: Record<string, { badge: string; accent: string; border: string; bg: string; text: string }> = {
  violet: { badge: "bg-violet-500/10 border-violet-500/20 text-violet-300", accent: "text-violet-400", border: "border-violet-500/20", bg: "bg-violet-500/5", text: "from-violet-400 to-purple-500" },
  cyan: { badge: "bg-cyan-500/10 border-cyan-500/20 text-cyan-300", accent: "text-cyan-400", border: "border-cyan-500/20", bg: "bg-cyan-500/5", text: "from-cyan-400 to-indigo-400" },
  emerald: { badge: "bg-emerald-500/10 border-emerald-500/20 text-emerald-300", accent: "text-emerald-400", border: "border-emerald-500/20", bg: "bg-emerald-500/5", text: "from-emerald-400 to-teal-400" },
  amber: { badge: "bg-amber-500/10 border-amber-500/20 text-amber-300", accent: "text-amber-400", border: "border-amber-500/20", bg: "bg-amber-500/5", text: "from-amber-400 to-orange-400" },
  indigo: { badge: "bg-indigo-500/10 border-indigo-500/20 text-indigo-300", accent: "text-indigo-400", border: "border-indigo-500/20", bg: "bg-indigo-500/5", text: "from-indigo-400 to-violet-400" },
  rose: { badge: "bg-rose-500/10 border-rose-500/20 text-rose-300", accent: "text-rose-400", border: "border-rose-500/20", bg: "bg-rose-500/5", text: "from-rose-400 to-pink-400" },
};

export default function SuccessMuseumPage() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <AppShell>
      <div dir="rtl" className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-amber-400 font-medium uppercase tracking-wide">Success Museum</span>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-1.5">
                متحف النجاح المصري
              </h1>
              <p className="text-text-secondary max-w-xl">
                قصص شركات مصرية غيّرت قواعد اللعبة. تحليل معمق لكل نجاح وأهم الدروس التي يمكنك تطبيقها اليوم.
              </p>
            </div>
            <Link href="/chat?q=حلل استراتيجية نجاح شركة مثل Swvl وكيف أطبقها في مشروعي"
              className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shrink-0"
            >
              <Brain className="w-4 h-4" /> تعلم من هذه القصص
            </Link>
          </div>
        </motion.div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { v: STORIES.length + "+", l: "قصة نجاح مصرية", icon: Trophy },
            { v: "$1.8B+", l: "إجمالي التقييمات", icon: Coins },
            { v: "15+", l: "دولة وصلت لها", icon: Globe2 },
            { v: "2013", l: "أقدم شركة في القائمة", icon: Clock },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={s.l} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="glass-panel rounded-2xl p-4 text-center"
              >
                <Icon className="w-4 h-4 text-amber-400 mx-auto mb-1.5 opacity-70" />
                <div className="font-display text-xl font-extrabold brand-gradient-text">{s.v}</div>
                <div className="text-[11px] text-text-secondary mt-0.5">{s.l}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Stories */}
        <div className="space-y-4">
          {STORIES.map((story, i) => {
            const cfg = colorConfig[story.color];
            const isOpen = expanded === story.id;
            return (
              <motion.div key={story.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <div className={cn("glass-panel rounded-3xl overflow-hidden border transition-all", isOpen ? cfg.border : "border-white/[0.08]", isOpen && cfg.bg)}>
                  {/* Header Row */}
                  <button className="w-full flex items-center gap-4 p-5 md:p-6 text-right"
                    onClick={() => setExpanded(isOpen ? null : story.id)}
                  >
                    <div className="text-4xl shrink-0">{story.emoji}</div>
                    <div className="flex-1 text-right min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-display font-extrabold text-xl text-white">{story.name}</h3>
                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", cfg.badge)}>{story.category}</span>
                        {story.valuation && (
                          <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">
                            ⭐ {story.valuation}
                          </span>
                        )}
                      </div>
                      <p className={cn("text-sm font-bold", cfg.accent)}>{story.tagline}</p>
                      <p className="text-xs text-text-secondary mt-0.5 line-clamp-1">{story.shortDesc}</p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="hidden md:grid grid-cols-2 gap-3 text-center">
                        <div>
                          <div className={cn("font-display text-lg font-extrabold", cfg.accent)}>{story.metric1.value}</div>
                          <div className="text-[10px] text-text-secondary">{story.metric1.label}</div>
                        </div>
                        <div>
                          <div className={cn("font-display text-lg font-extrabold", cfg.accent)}>{story.metric2.value}</div>
                          <div className="text-[10px] text-text-secondary">{story.metric2.label}</div>
                        </div>
                      </div>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-neutral-500" /> : <ChevronDown className="w-4 h-4 text-neutral-500" />}
                    </div>
                  </button>

                  {/* Expanded content */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 md:px-6 pb-6 space-y-5 border-t border-white/[0.06] pt-5">
                          {/* Founders */}
                          <div className="flex items-center gap-2 text-xs text-text-secondary">
                            <Users className="w-3.5 h-3.5" />
                            المؤسسون: {story.founders.join("، ")}
                            <span className="mr-1">·</span>
                            <Clock className="w-3.5 h-3.5" />
                            تأسست {story.founded}
                          </div>

                          {/* Mobile metrics */}
                          <div className="grid grid-cols-2 gap-3 md:hidden">
                            <div className={cn("rounded-xl p-3 text-center", cfg.bg, `border ${cfg.border}`)}>
                              <div className={cn("font-bold text-lg", cfg.accent)}>{story.metric1.value}</div>
                              <div className="text-[10px] text-text-secondary">{story.metric1.label}</div>
                            </div>
                            <div className={cn("rounded-xl p-3 text-center", cfg.bg, `border ${cfg.border}`)}>
                              <div className={cn("font-bold text-lg", cfg.accent)}>{story.metric2.value}</div>
                              <div className="text-[10px] text-text-secondary">{story.metric2.label}</div>
                            </div>
                          </div>

                          {/* Full Story */}
                          <div>
                            <h4 className="text-xs font-bold text-neutral-400 mb-2 flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5" /> القصة الكاملة
                            </h4>
                            <p className="text-sm text-neutral-300 leading-relaxed">{story.fullStory}</p>
                          </div>

                          {/* Key Lessons */}
                          <div>
                            <h4 className="text-xs font-bold text-neutral-400 mb-2 flex items-center gap-1.5">
                              <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> الدروس الأساسية
                            </h4>
                            <ul className="space-y-1.5">
                              {story.keyLessons.map((lesson) => (
                                <li key={lesson} className="flex items-start gap-2 text-xs text-neutral-300">
                                  <CheckCircle2 className={cn("w-3.5 h-3.5 shrink-0 mt-0.5", cfg.accent)} />
                                  {lesson}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Kalmeron Insight */}
                          <div className={cn("rounded-xl p-4 flex items-start gap-3", cfg.bg, `border ${cfg.border}`)}>
                            <Sparkles className={cn("w-4 h-4 shrink-0 mt-0.5", cfg.accent)} />
                            <div>
                              <div className={cn("text-xs font-bold mb-1", cfg.accent)}>كيف كان كلميرون سيُساعد؟</div>
                              <p className="text-xs text-neutral-300 leading-relaxed">{story.kalmeronInsight}</p>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-3">
                            <Link href={`/chat?q=${encodeURIComponent(`حلل قصة نجاح ${story.name} وأخبرني كيف أُطبق نفس الاستراتيجية في مشروعي`)}`}
                              className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold"
                            >
                              <Brain className="w-3.5 h-3.5" /> طبّق هذه الاستراتيجية
                            </Link>
                            <button onClick={() => setExpanded(null)}
                              className="text-xs text-neutral-500 hover:text-white transition-colors"
                            >
                              إخفاء
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="glass-panel rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-5 justify-between border-amber-500/20 bg-amber-500/[0.02]"
        >
          <div>
            <h3 className="text-xl font-bold text-white mb-1.5">استلهم من قصص النجاح لبناء قصتك</h3>
            <p className="text-text-secondary text-sm">اسأل كلميرون كيف يمكنك تطبيق استراتيجيات هذه الشركات في سياقك المحدد.</p>
          </div>
          <Link href="/chat?q=حلل قصص نجاح الشركات المصرية وأخبرني أي الاستراتيجيات تنطبق على مشروعي"
            className="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold shrink-0"
          >
            <Trophy className="w-4 h-4" /> ابنِ قصة نجاحك الآن
          </Link>
        </motion.div>
      </div>
    </AppShell>
  );
}

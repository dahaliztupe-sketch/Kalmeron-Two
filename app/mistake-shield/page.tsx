"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import {
  ShieldAlert, AlertTriangle, ArrowLeft, CheckCircle2, XCircle,
  Lightbulb, TrendingDown, Coins, Users, Zap, Sparkles,
  BarChart3, Scale, ChevronDown, ChevronUp,
} from "lucide-react";
import { cn } from "@/src/lib/utils";

type Severity = "critical" | "high" | "medium";

interface Mistake {
  id: string;
  title: string;
  severity: Severity;
  category: string;
  description: string;
  symptoms: string[];
  fix: string;
  preventionTip: string;
  realExample?: string;
  icon: any;
}

const MISTAKES: Mistake[] = [
  {
    id: "m1", severity: "critical", category: "المنتج",
    title: "بناء المنتج قبل سؤال العميل",
    icon: AlertTriangle,
    description: "الغالبية العظمى من الشركات الفاشلة بنت منتجاً رائعاً لا يريده أحد. قضوا 12-18 شهراً في البناء ثم اكتشفوا أن المشكلة التي يحلونها غير موجودة أو غير مؤلمة بما يكفي.",
    symptoms: ["تبدأ بالتصميم والبرمجة قبل أي مقابلات", "تعتقد أنك 'تعرف' ما يريده العميل", "ليس لديك 10 عملاء تحدثت معهم هذا الشهر"],
    fix: "قبل بناء أي شيء: 20 مقابلة عميل حقيقي. اسأل عن مشاكلهم لا عن رأيهم في فكرتك.",
    preventionTip: "اطلب من كلميرون تصميم مقابلات عميل مُحكمة تكشف الاحتياج الحقيقي.",
    realExample: "منتج أُغلق رغم 500,000$ استثمار لأن المؤسسين لم يتحدثوا مع عملاء قبل البناء.",
  },
  {
    id: "m2", severity: "critical", category: "المالية",
    title: "حرق النقدية قبل PMF",
    icon: Coins,
    description: "إنفاق رأس المال على مكاتب فاخرة وإعلانات مكثفة قبل التحقق من ملائمة المنتج للسوق. هذا يُسرّع الطريق إلى الإفلاس.",
    symptoms: ["تنفق على التسويق وأنت لا تعرف Customer Acquisition Cost", "Runway أقل من 9 أشهر وليس لديك Plan B", "تكاليف ثابتة عالية قبل Revenue مستقر"],
    fix: "ضع قاعدة: لا تُنفق على Paid Ads قبل تحديد LTV:CAC ratio يساوي 3:1 على الأقل.",
    preventionTip: "اطلب من المدير المالي الذكي حساب Runway ونقطة الخطر كل أسبوع.",
  },
  {
    id: "m3", severity: "critical", category: "الشراكة",
    title: "اختيار شريك مؤسس بالحدس",
    icon: Users,
    description: "الشراكة المؤسسية تزيد احتمالية الفشل إذا لم يكن هناك اتفاق واضح على الرؤية وتوزيع الحصص والمهام والخروج.",
    symptoms: ["لا يوجد اتفاقية مساهمين موقعة", "الحصص لم تُحدَّد بشكل رسمي", "لا يوجد Vesting Schedule للمؤسسين"],
    fix: "وقّع SHA (اتفاقية المساهمين) في أول 30 يوماً. نص صريح على Vesting وآلية الخروج.",
    preventionTip: "استخدم مُعد اتفاقية المساهمين لإنشاء مسودة SHA مُخصصة لمشروعك.",
    realExample: "90% من خلافات المؤسسين كانت ستُحل بـ SHA موقع في البداية.",
  },
  {
    id: "m4", severity: "high", category: "القانونية",
    title: "التأسيس القانوني المتأخر أو الخاطئ",
    icon: Scale,
    description: "تأجيل التأسيس الرسمي للشركة يُعقّد الأمور مع المستثمرين والموردين والعملاء. اختيار نوع الكيان الخاطئ يكلفك ضرائب وتعقيدات قانونية.",
    symptoms: ["لم تسجّل شركتك بعد", "لا تعرف الفرق بين شركة أشخاص وأموال", "عقودك مع الموردين شفهية"],
    fix: "سجّل شركتك في أول 3 أشهر من البدء. في مصر: شركة ذات مسؤولية محدودة للشركات الناشئة.",
    preventionTip: "اطلب من المرشد القانوني خارطة طريق التأسيس خطوة بخطوة.",
  },
  {
    id: "m5", severity: "high", category: "المالية",
    title: "خلط الحسابات الشخصية بالشركة",
    icon: BarChart3,
    description: "استخدام حسابك الشخصي لمصاريف الشركة يُدمّر دفاترك المحاسبية ويُخيف المستثمرين ويُعرّضك لمشاكل ضريبية.",
    symptoms: ["تدفع لمورد الشركة من بطاقتك الشخصية", "لا يوجد فصل واضح في المصاريف", "ليس لديك كشف حساب موحّد للشركة"],
    fix: "افتح حساباً بنكياً منفصلاً للشركة في أول يوم. استخدم أدوات محاسبة بسيطة.",
    preventionTip: "اسأل المدير المالي عن أفضل هيكل مالي لمرحلتك.",
  },
  {
    id: "m6", severity: "high", category: "التوسع",
    title: "التوسع قبل التحقق من PMF",
    icon: TrendingDown,
    description: "التوسع (Scaling) قبل إثبات نموذج عمل مربح يُسرّع الخسائر لا الأرباح. كل مبيعة جديدة تزيد النزيف.",
    symptoms: ["تفكر في فتح فرع جديد أو دولة جديدة", "لم تحقق Retention أكثر من 30% بعد 3 أشهر", "CAC يتزايد مع كل حملة تسويقية"],
    fix: "قاعدة ذهبية: لا تُسرّع النمو قبل أن تُثبت أن نموذج عملك مربح في نطاق صغير.",
    preventionTip: "اطلب تحليل PMF Assessment من مساعد مختبر السوق.",
  },
  {
    id: "m7", severity: "medium", category: "الفريق",
    title: "التوظيف بناءً على العلاقات لا الكفاءة",
    icon: Users,
    description: "توظيف أصدقاء أو أقارب بدون معايير واضحة يُلحق ضرراً بالغاً بثقافة العمل ويجعل القرارات الصعبة (كالفصل) مُؤلمة جداً.",
    symptoms: ["معظم موظفيك من دائرتك الاجتماعية", "لا يوجد Job Description واضح لكل وظيفة", "لم تتحدث مع موظف بشأن أداء ضعيف قط"],
    fix: "ضع Job Description، اختبر عملياً، استشِر 3 مراجع قبل أي توظيف.",
    preventionTip: "اطلب من مساعد الموارد البشرية نموذج توظيف محترف.",
  },
  {
    id: "m8", severity: "medium", category: "التسويق",
    title: "محاولة استهداف الكل في وقت واحد",
    icon: Lightbulb,
    description: "\"منتجنا لكل الناس\" = لا أحد يشتريه. التخصص يبني ميزة تنافسية. التعميم يُضيّع الميزانية التسويقية.",
    symptoms: ["Buyer Persona واسعة جداً: '18-65 سنة'", "رسالتك التسويقية تخاطب الجميع", "معدل تحويلك (Conversion Rate) أقل من 1%"],
    fix: "حدد شريحتك المثالية (ICP) بدقة شديدة وركّز عليها حصرياً في البداية.",
    preventionTip: "استخدم محلل الجمهور المستهدف لبناء ICP دقيق.",
  },
];

const SEVERITY_CONFIG = {
  critical: { label: "خطير جداً", color: "text-rose-400 bg-rose-500/10 border-rose-500/20", dot: "bg-rose-400" },
  high: { label: "عالي الأثر", color: "text-amber-400 bg-amber-500/10 border-amber-500/20", dot: "bg-amber-400" },
  medium: { label: "متوسط", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20", dot: "bg-yellow-400" },
};

const CATEGORIES = ["الكل", "المنتج", "المالية", "الشراكة", "القانونية", "التوسع", "الفريق", "التسويق"];

export default function MistakeShieldPage() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<Severity | "all">("all");
  const [filterCategory, setFilterCategory] = useState("الكل");

  const filtered = MISTAKES.filter((m) => {
    const matchSev = filterSeverity === "all" || m.severity === filterSeverity;
    const matchCat = filterCategory === "الكل" || m.category === filterCategory;
    return matchSev && matchCat;
  });

  return (
    <AppShell>
      <div dir="rtl" className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span className="text-xs text-rose-400 font-medium uppercase tracking-wide">Mistake Shield</span>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-1.5">
                درع الأخطاء الفادحة
              </h1>
              <p className="text-text-secondary max-w-xl">
                أكثر الأخطاء شيوعاً التي أفشلت الشركات الناشئة المصرية — تعلّمها قبل أن تدفع ثمنها.
              </p>
            </div>
            <Link href="/chat?q=راجع مشروعي وأخبرني بالمخاطر والأخطاء المحتملة"
              className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shrink-0"
            >
              <Zap className="w-4 h-4" /> افحص مشروعي الآن
            </Link>
          </div>
        </motion.div>

        {/* Danger Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { v: "72%", l: "شركات ناشئة تفشل خلال 5 سنوات", c: "rose" },
            { v: MISTAKES.filter(m => m.severity === "critical").length + "", l: "خطأ قاتل في هذا الدليل", c: "rose" },
            { v: MISTAKES.filter(m => m.severity === "high").length + "", l: "خطأ عالي الأثر", c: "amber" },
            { v: "90%", l: "من الإخفاقات قابلة للوقاية", c: "emerald" },
          ].map((s, i) => (
            <motion.div key={s.l} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="glass-panel rounded-2xl p-4 text-center"
            >
              <div className={cn(
                "font-display text-2xl font-extrabold",
                s.c === "rose" ? "text-rose-400" : s.c === "amber" ? "text-amber-400" : "text-emerald-400"
              )}>{s.v}</div>
              <div className="text-[11px] text-text-secondary mt-0.5 leading-tight">{s.l}</div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="space-y-2.5">
          <div className="flex gap-2 flex-wrap">
            {(["all", "critical", "high", "medium"] as const).map((sev) => (
              <button key={sev} onClick={() => setFilterSeverity(sev)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                  filterSeverity === sev ? "bg-white/15 border-white/30 text-white" : "bg-white/5 border-white/10 text-neutral-400 hover:border-white/20"
                )}
              >
                {sev === "all" ? "كل المستويات" : SEVERITY_CONFIG[sev].label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => setFilterCategory(cat)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                  filterCategory === cat ? "bg-white/15 border-white/30 text-white" : "bg-white/5 border-white/10 text-neutral-400 hover:border-white/20"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Mistakes List */}
        <div className="space-y-3">
          {filtered.map((mistake, i) => {
            const Icon = mistake.icon;
            const sev = SEVERITY_CONFIG[mistake.severity];
            const isOpen = expanded === mistake.id;
            return (
              <motion.div key={mistake.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <div className="glass-panel rounded-2xl overflow-hidden">
                  <button className="w-full flex items-center gap-4 p-5 text-right"
                    onClick={() => setExpanded(isOpen ? null : mistake.id)}
                  >
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", sev.color.split(" ").slice(1).join(" "))}>
                      <Icon className={cn("w-5 h-5", sev.color.split(" ")[0])} />
                    </div>
                    <div className="flex-1 text-right">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-bold text-white text-base">{mistake.title}</h3>
                        <span className={cn("text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border", sev.color)}>
                          {sev.label}
                        </span>
                        <span className="text-[9px] bg-white/5 text-neutral-500 border border-white/10 px-2 py-0.5 rounded-full">
                          {mistake.category}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary line-clamp-1">{mistake.description}</p>
                    </div>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-neutral-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-neutral-500 shrink-0" />}
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 space-y-4 border-t border-white/[0.06] pt-4">
                          <p className="text-sm text-neutral-300 leading-relaxed">{mistake.description}</p>

                          {/* Symptoms */}
                          <div>
                            <h4 className="text-xs font-bold text-rose-400 mb-2 flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5" /> علامات التحذير — هل تعاني منها؟
                            </h4>
                            <ul className="space-y-1.5">
                              {mistake.symptoms.map((s) => (
                                <li key={s} className="flex items-start gap-2 text-xs text-neutral-400">
                                  <XCircle className="w-3.5 h-3.5 text-rose-500/60 shrink-0 mt-0.5" /> {s}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Fix */}
                          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
                            <h4 className="text-xs font-bold text-emerald-400 mb-1.5 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5" /> الحل الصحيح
                            </h4>
                            <p className="text-xs text-neutral-300 leading-relaxed">{mistake.fix}</p>
                          </div>

                          {mistake.realExample && (
                            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
                              <p className="text-xs text-amber-300/80 leading-relaxed">💡 {mistake.realExample}</p>
                            </div>
                          )}

                          <Link href={`/chat?q=${encodeURIComponent(mistake.preventionTip)}`}
                            className="flex items-center gap-2 text-xs text-brand-cyan hover:text-white transition-colors group"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            {mistake.preventionTip}
                            <ArrowLeft className="w-3.5 h-3.5 group-hover:translate-x-[-3px] transition-transform" />
                          </Link>
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
          className="glass-panel rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-5 justify-between border-rose-500/20 bg-rose-500/[0.02]"
        >
          <div>
            <h3 className="text-xl font-bold text-white mb-1.5">هل مشروعك في خطر؟</h3>
            <p className="text-text-secondary text-sm">درع كلميرون يفحص مشروعك ويُحدد نقاط الخطر مع خطة وقاية مخصصة.</p>
          </div>
          <Link href="/chat?q=افحص مشروعي وأخبرني بالأخطاء والمخاطر الجوهرية مع خطة وقاية"
            className="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold shrink-0"
          >
            <ShieldAlert className="w-4 h-4" /> افحص مشروعي الآن
          </Link>
        </motion.div>
      </div>
    </AppShell>
  );
}

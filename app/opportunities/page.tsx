"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import {
  Target, ArrowLeft, Calendar, Coins, Trophy, Building2, Zap, Radar,
  ExternalLink, Filter, Search, Clock, CheckCircle2, Loader2, Sparkles,
  Globe2, Users, TrendingUp, BookOpen, GraduationCap, Rocket, Star,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

type OppCategory = "all" | "funding" | "hackathon" | "incubator" | "competition" | "event";

interface Opportunity {
  id: string;
  category: OppCategory;
  type: string;
  title: string;
  desc: string;
  organizer: string;
  deadline: string;
  amount?: string;
  tags: string[];
  featured?: boolean;
  link?: string;
  icon: string;
}

const OPPORTUNITIES: Opportunity[] = [
  {
    id: "1", category: "hackathon", type: "هاكاثون", title: "تحدي صناع التكنولوجيا 2026",
    desc: "فرصة ذهبية لتقديم حلك التقني أمام لجان تحكيم من كبرى حاضنات الأعمال. جوائز تصل لـ 200 ألف جنيه وعرض أمام مستثمرين مباشرة.",
    organizer: "ITIDA", deadline: "20 مايو 2026", amount: "200,000 ج.م",
    tags: ["تكنولوجيا", "مصر", "جميع المراحل"], featured: true, icon: "🏆",
  },
  {
    id: "2", category: "incubator", type: "برنامج احتضان", title: "رواد النيل — الدورة العاشرة",
    desc: "احتضان كامل 6 أشهر: مساحات عمل مجانية، تسجيل قانوني، تمويل أولي 50,000 ج.م، وشبكة علاقات واسعة مع أبرز رواد الأعمال.",
    organizer: "هيئة تنمية صناعة تكنولوجيا المعلومات", deadline: "1 يونيو 2026", amount: "50,000 ج.م",
    tags: ["MVP", "تكنولوجيا", "بداية"], icon: "🏗️",
  },
  {
    id: "3", category: "funding", type: "منحة", title: "منحة الابتكار الرقمي",
    desc: "تمويل لا يُردّ (Equity-free) لشركات مرحلة MVP المتخصصة في التجارة الإلكترونية والتقنيات المالية. بدون تنازل عن حصص.",
    organizer: "وزارة الاتصالات وتكنولوجيا المعلومات", deadline: "مفتوح دائماً", amount: "100,000 ج.م",
    tags: ["Fintech", "E-commerce", "بدون حصص"], featured: true, icon: "💰",
  },
  {
    id: "4", category: "competition", type: "مسابقة", title: "جائزة مصر للابتكار 2026",
    desc: "أكبر مسابقة لريادة الأعمال في مصر. تُغطي 12 قطاعاً مختلفاً بجوائز إجمالية تتجاوز مليون جنيه ووصول مباشر لصناع القرار.",
    organizer: "مجلس الوزراء المصري", deadline: "15 يوليو 2026", amount: "+1,000,000 ج.م",
    tags: ["جميع القطاعات", "الفائزون السابقون"], icon: "🥇",
  },
  {
    id: "5", category: "incubator", type: "مسرّع", title: "Flat6Labs Cairo — Cycle 18",
    desc: "أشهر مسرّع أعمال في الشرق الأوسط. 4 أشهر من الإرشاد المكثف مع أفضل المرشدين، وصول لـ 500+ مستثمر، واستثمار أولي.",
    organizer: "Flat6Labs", deadline: "30 يونيو 2026", amount: "$20,000",
    tags: ["Pre-seed", "MENA", "مُثبَت"], featured: true, icon: "⚡",
  },
  {
    id: "6", category: "event", type: "فعالية", title: "قمة Techne Summit الإسكندرية",
    desc: "أكبر مؤتمر تقني في شمال أفريقيا. 3 أيام مليئة بالجلسات، ورش العمل، وفرص التواصل مع مئات المستثمرين والشركاء.",
    organizer: "Techne Group", deadline: "10 أغسطس 2026",
    tags: ["تواصل", "مستثمرون", "عرض"], icon: "🎪",
  },
  {
    id: "7", category: "funding", type: "قرض ميسّر", title: "مبادرة دعم الشركات الناشئة — البنك الأهلي",
    desc: "قرض بفائدة 5% فقط للشركات التقنية الناشئة بضمانات مرنة. مناسب لمرحلة التوسع والنمو مع فترة سماح 18 شهراً.",
    organizer: "البنك الأهلي المصري", deadline: "مستمر",
    amount: "حتى 2,000,000 ج.م", tags: ["تمويل", "بنوك", "توسع"], icon: "🏦",
  },
  {
    id: "8", category: "hackathon", type: "هاكاثون", title: "Health Innovation Hackathon",
    desc: "هاكاثون متخصص في ابتكارات الرعاية الصحية الرقمية. 48 ساعة من الإبداع مع خبراء من كبرى المستشفيات والشركات الدوائية.",
    organizer: "Cairo University Health Hub", deadline: "5 يونيو 2026", amount: "150,000 ج.م",
    tags: ["HealthTech", "طلاب", "خريجين"], icon: "🏥",
  },
  {
    id: "9", category: "incubator", type: "حاضنة", title: "AUC Venture Lab — Cohort 2026",
    desc: "حاضنة الجامعة الأمريكية بالقاهرة للشركات الناشئة في مراحلها الأولى. تشمل مساحات عمل ودعماً قانونياً وبرنامج إرشاد متخصص.",
    organizer: "AUC", deadline: "مفتوح",
    tags: ["Cairo", "بداية", "تقنية وغير تقنية"], icon: "🎓",
  },
];

const CATEGORIES: { id: OppCategory; label: string; icon: any; count: number }[] = [
  { id: "all", label: "الكل", icon: Radar, count: OPPORTUNITIES.length },
  { id: "funding", label: "تمويل ومنح", icon: Coins, count: OPPORTUNITIES.filter(o => o.category === "funding").length },
  { id: "hackathon", label: "هاكاثون", icon: Trophy, count: OPPORTUNITIES.filter(o => o.category === "hackathon").length },
  { id: "incubator", label: "حاضنات ومسرعات", icon: Building2, count: OPPORTUNITIES.filter(o => o.category === "incubator").length },
  { id: "competition", label: "مسابقات", icon: Star, count: OPPORTUNITIES.filter(o => o.category === "competition").length },
  { id: "event", label: "فعاليات", icon: Calendar, count: OPPORTUNITIES.filter(o => o.category === "event").length },
];

const STATS = [
  { value: "9+", label: "فرصة متاحة", icon: Target },
  { value: "3M+", label: "جنيه في الجوائز والمنح", icon: Coins },
  { value: "12", label: "جهة منظِّمة", icon: Building2 },
  { value: "يومياً", label: "تُحدَّث الفرص", icon: Zap },
];

export default function OpportunitiesPage() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState<OppCategory>("all");
  const [search, setSearch] = useState("");
  const [aiQuery, setAiQuery] = useState("");

  const filtered = OPPORTUNITIES.filter((opp) => {
    const matchCategory = activeCategory === "all" || opp.category === activeCategory;
    const matchSearch = !search || opp.title.includes(search) || opp.organizer.includes(search) || opp.tags.some(t => t.includes(search));
    return matchCategory && matchSearch;
  });

  const featured = filtered.filter((o) => o.featured);
  const regular = filtered.filter((o) => !o.featured);

  return (
    <AppShell>
      <div dir="rtl" className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-400 font-medium uppercase tracking-wide">يُحدَّث يومياً</span>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-1 flex items-center gap-3">
                <Radar className="w-8 h-8 text-brand-cyan" />
                رادار الفرص
              </h1>
              <p className="text-text-secondary max-w-xl">
                أحدث جولات التمويل والهاكاثونات والحاضنات مُصفّاة لرواد الأعمال المصريين.
              </p>
            </div>
            <Link href={`/chat?q=${encodeURIComponent("ابحثلي عن فرص تمويل مناسبة لمشروعي")}`}
              className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shrink-0"
            >
              <Sparkles className="w-4 h-4" /> فرص مخصصة لي
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {STATS.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="glass-panel rounded-2xl p-4 text-center"
              >
                <Icon className="w-4 h-4 text-brand-cyan mx-auto mb-1.5 opacity-70" />
                <div className="font-display text-2xl font-extrabold brand-gradient-text">{s.value}</div>
                <div className="text-[11px] text-text-secondary mt-0.5">{s.label}</div>
              </motion.div>
            );
          })}
        </div>

        {/* AI Search */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="glass-panel rounded-2xl p-4 border-indigo-500/20"
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-medium text-white">بحث ذكي بالذكاء الاصطناعي</span>
          </div>
          <div className="flex gap-2">
            <input
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder="مثال: أبحث عن تمويل لشركة HealthTech في مرحلة MVP..."
              className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-neutral-600 outline-none focus:border-indigo-400/40 transition-all"
            />
            <Link href={`/chat?q=${encodeURIComponent(aiQuery || "ابحثلي عن أفضل الفرص لمشروعي")}`}
              className="btn-primary px-4 py-2.5 rounded-xl text-sm font-bold"
            >
              ابحث
            </Link>
          </div>
        </motion.div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border whitespace-nowrap transition-all shrink-0",
                  activeCategory === cat.id
                    ? "bg-indigo-500/20 border-indigo-400/40 text-white"
                    : "bg-white/5 border-white/10 text-neutral-300 hover:border-white/20"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.label}
                <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded-full">{cat.count}</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم أو الجهة أو التخصص..."
            className="w-full bg-white/[0.04] border border-white/10 rounded-2xl pr-10 pl-4 py-3 text-sm text-white placeholder-neutral-600 outline-none focus:border-white/20 transition-all"
          />
        </div>

        {/* Featured Opportunities */}
        {featured.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-neutral-400 mb-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" /> فرص مميزة
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {featured.map((opp, i) => (
                <motion.div key={opp.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <OppCard opp={opp} featured />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Regular Opportunities */}
        {regular.length > 0 && (
          <div>
            {featured.length > 0 && <h2 className="text-sm font-semibold text-neutral-400 mb-3">المزيد من الفرص</h2>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {regular.map((opp, i) => (
                <motion.div key={opp.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                  <OppCard opp={opp} />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="glass-panel rounded-3xl p-12 text-center">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-white font-bold mb-2">لا توجد نتائج</h3>
            <p className="text-text-secondary text-sm">جرّب بحثاً مختلفاً أو اسأل كلميرون مباشرة</p>
            <Link href="/chat?q=ابحثلي عن فرص مناسبة"
              className="inline-flex items-center gap-2 mt-4 text-sm text-brand-cyan hover:underline"
            >
              <Sparkles className="w-4 h-4" /> اسأل كلميرون
            </Link>
          </div>
        )}

        {/* CTA */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="glass-panel rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-5 justify-between border-indigo-500/20 bg-gradient-to-r from-indigo-500/5 to-cyan-500/5"
        >
          <div>
            <h3 className="text-xl font-bold text-white mb-1.5">هل تبحث عن فرصة محددة؟</h3>
            <p className="text-text-secondary text-sm">رادار كلميرون يمسح السوق يومياً ويُطابق الفرص مع مرحلتك وقطاعك تلقائياً.</p>
          </div>
          <Link href="/chat?q=ابحثلي عن فرص تمويل وهاكاثونات مناسبة لمشروعي"
            className="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold shrink-0"
          >
            <Radar className="w-4 h-4" /> فعّل رادار الفرص الآن
          </Link>
        </motion.div>
      </div>
    </AppShell>
  );
}

function OppCard({ opp, featured }: { opp: Opportunity; featured?: boolean }) {
  const categoryColor: Record<string, string> = {
    funding: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    hackathon: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    incubator: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    competition: "text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20",
    event: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  };

  return (
    <div className={cn(
      "glass-panel rounded-3xl p-5 h-full flex flex-col hover:border-white/20 transition-all card-lift group",
      featured && "border-amber-400/20 bg-amber-500/[0.02]"
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{opp.icon}</span>
          <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border", categoryColor[opp.category] || "text-neutral-400 bg-white/5 border-white/10")}>
            {opp.type}
          </span>
        </div>
        {featured && (
          <span className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full font-medium">مميز ⭐</span>
        )}
      </div>

      <h3 className="text-base font-bold text-white mb-2 leading-snug group-hover:text-brand-cyan transition-colors">{opp.title}</h3>
      <p className="text-xs text-text-secondary leading-relaxed mb-4 flex-1 line-clamp-3">{opp.desc}</p>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
          <Building2 className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
          {opp.organizer}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
          <Calendar className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
          <span className={opp.deadline === "مفتوح دائماً" || opp.deadline === "مفتوح" || opp.deadline === "مستمر" ? "text-emerald-400" : "text-amber-400"}>
            {opp.deadline}
          </span>
        </div>
        {opp.amount && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
            <Coins className="w-3.5 h-3.5 shrink-0" />
            {opp.amount}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-1 mb-4">
        {opp.tags.map((tag) => (
          <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] text-neutral-400 border border-white/[0.07]">{tag}</span>
        ))}
      </div>

      <Link href={`/chat?q=${encodeURIComponent(`أخبرني المزيد عن ${opp.title} وكيف أتقدم إليها`)}`}
        className="flex items-center justify-between text-xs text-brand-cyan hover:text-white transition-colors group/link"
      >
        <span>تقديم وتفاصيل</span>
        <ArrowLeft className="w-4 h-4 group-hover/link:translate-x-[-4px] transition-transform" />
      </Link>
    </div>
  );
}

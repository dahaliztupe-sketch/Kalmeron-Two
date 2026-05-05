"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/src/lib/firebase";
import { collection, getDocs, orderBy, query, limit } from "firebase/firestore";
import {
  FlaskConical, Plus, ArrowLeft, Loader2, Microscope, Play, CheckCircle2, Users, BarChart3, Lightbulb, Target, Clock, Zap,
  Brain,
} from "lucide-react";
import { cn } from "@/src/lib/utils";

interface Experiment {
  id: string;
  title: string;
  status: "running" | "completed" | "failed";
  createdAt?: { seconds: number };
  hypothesis?: string;
  resultSummary?: string;
  personaCount?: number;
  interviewCount?: number;
  insightCount?: number;
}

const QUICK_EXPERIMENTS = [
  {
    title: "اختبار فكرة منتج جديد",
    icon: Lightbulb,
    color: "cyan",
    prompt: "ساعدني في تصميم تجربة سوقية لاختبار فكرتي عن [وصف الفكرة] مع عملاء حقيقيين",
    description: "شخصيات افتراضية + مقابلات محاكاة",
  },
  {
    title: "اختبار نموذج التسعير",
    icon: BarChart3,
    color: "indigo",
    prompt: "كيف أختبر إذا كان تسعيري صحيحاً؟ منتجي بسعر [السعر] لـ [الشريحة]",
    description: "A/B testing + willingness to pay",
  },
  {
    title: "اختبار شريحة السوق",
    icon: Target,
    color: "fuchsia",
    prompt: "ساعدني أحدد أفضل شريحة سوق لمنتجي [وصف المنتج]",
    description: "تحليل الشرائح + التعمق في الاحتياجات",
  },
  {
    title: "محاكاة focus group",
    icon: Users,
    color: "amber",
    prompt: "نفّذ لي focus group افتراضي مع 10 عملاء من [الشريحة] عن [الموضوع]",
    description: "10 شخصيات مختلفة + ردود فعل حقيقية",
  },
];

const HOW_IT_WORKS = [
  { step: "01", title: "صف فكرتك", desc: "أخبر كلميرون عن منتجك والسوق المستهدف", icon: FlaskConical },
  { step: "02", title: "يُنشئ الشخصيات", desc: "مساعد الشخصيات يبني 5-20 عميل افتراضي واقعي", icon: Users },
  { step: "03", title: "المقابلات تبدأ", desc: "كل شخصية تُجيب كما لو أنها عميل حقيقي", icon: Play },
  { step: "04", title: "تحليل Insights", desc: "محلل الرؤى يستخلص القرارات الاستراتيجية", icon: Brain },
];

export default function MarketLabPage() {
  const { user } = useAuth();
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    (async () => {
      if (!user) { setLoading(false); return; }
      try {
        const q = query(
          collection(db, "users", user.uid, "market_experiments"),
          orderBy("createdAt", "desc"),
          limit(20)
        );
        const snap = await getDocs(q);
        if (!cancel) {
          setExperiments(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Experiment, "id">) })));
        }
      } catch {
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [user]);

  return (
    <AppShell>
      <div dir="rtl" className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FlaskConical className="w-5 h-5 text-fuchsia-400" />
                <span className="text-xs text-fuchsia-400 font-medium uppercase tracking-wide">Market Lab</span>
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-1.5">مختبر السوق</h1>
              <p className="text-text-secondary max-w-xl">
                اختبر فكرتك مع عملاء افتراضيين واقعيين قبل إنفاق جنيه واحد. <br className="hidden md:block" />
                كل تجربة تنتهي بقرار واضح: تحقّق، تكييف، أو إيقاف.
              </p>
            </div>
            <Link href="/chat?q=ابدأ تجربة جديدة في مختبر السوق"
              className="btn-primary flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold shrink-0"
            >
              <Plus className="w-4 h-4" /> تجربة جديدة
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        {experiments.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { v: experiments.length, l: "تجارب مكتملة", icon: Microscope, c: "fuchsia" },
              { v: experiments.filter(e => e.status === "completed").length, l: "ناجحة", icon: CheckCircle2, c: "emerald" },
              { v: experiments.reduce((s, e) => s + (e.personaCount || 0), 0), l: "شخصية افتراضية", icon: Users, c: "cyan" },
              { v: experiments.reduce((s, e) => s + (e.insightCount || 0), 0), l: "insight مستخلص", icon: Lightbulb, c: "amber" },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div key={s.l} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                  className="glass-panel rounded-2xl p-4 text-center"
                >
                  <Icon className="w-4 h-4 mx-auto mb-1.5 opacity-70 text-brand-cyan" />
                  <div className="font-display text-2xl font-extrabold brand-gradient-text">{s.v || "—"}</div>
                  <div className="text-[11px] text-text-secondary mt-0.5">{s.l}</div>
                </motion.div>
              );
            })}
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-3 text-text-secondary py-20 justify-center">
            <Loader2 className="w-5 h-5 animate-spin" /> جاري تحميل تجاربك...
          </div>
        ) : experiments.length === 0 ? (
          <>
            {/* Empty state — How It Works */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="glass-panel rounded-3xl p-6 md:p-8"
            >
              <div className="text-center mb-8">
                <div className="text-5xl mb-4">🔬</div>
                <h3 className="text-xl font-bold text-white mb-2">لا توجد تجارب بعد</h3>
                <p className="text-text-secondary text-sm max-w-md mx-auto">
                  ابدأ أول تجربة لاختبار فكرتك مع عملاء افتراضيين — في دقائق وليس أسابيع.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {HOW_IT_WORKS.map((s, _i) => {
                  const Icon = s.icon;
                  return (
                    <div key={s.step} className="text-center">
                      <div className="relative w-12 h-12 mx-auto mb-3">
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-fuchsia-500/20 to-indigo-500/20" />
                        <div className="relative w-full h-full rounded-xl border border-white/10 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-gradient-to-br from-fuchsia-500 to-indigo-500 flex items-center justify-center text-[9px] text-white font-bold">
                          {s.step}
                        </div>
                      </div>
                      <div className="font-bold text-sm text-white mb-1">{s.title}</div>
                      <div className="text-[11px] text-text-secondary">{s.desc}</div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-center">
                <Link href="/chat?q=ساعدني في تصميم تجربة سوقية لاختبار فكرتي"
                  className="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl font-bold"
                >
                  <Microscope className="w-4 h-4" /> ابدأ أول تجربة
                </Link>
              </div>
            </motion.div>

            {/* Quick Experiment Templates */}
            <div>
              <h2 className="text-sm font-semibold text-neutral-400 mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" /> قوالب جاهزة لبدء سريع
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {QUICK_EXPERIMENTS.map((exp, i) => {
                  const Icon = exp.icon;
                  const colorMap: Record<string, string> = {
                    cyan: "border-cyan-500/20 hover:border-cyan-400/40 bg-cyan-500/5",
                    indigo: "border-indigo-500/20 hover:border-indigo-400/40 bg-indigo-500/5",
                    fuchsia: "border-fuchsia-500/20 hover:border-fuchsia-400/40 bg-fuchsia-500/5",
                    amber: "border-amber-500/20 hover:border-amber-400/40 bg-amber-500/5",
                  };
                  const iconColorMap: Record<string, string> = {
                    cyan: "from-cyan-500 to-indigo-500",
                    indigo: "from-indigo-500 to-violet-500",
                    fuchsia: "from-fuchsia-500 to-pink-500",
                    amber: "from-amber-500 to-orange-500",
                  };
                  return (
                    <motion.div key={exp.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                      <Link href={`/chat?q=${encodeURIComponent(exp.prompt)}`}
                        className={cn("flex items-center gap-4 p-4 rounded-2xl border transition-all card-lift group", colorMap[exp.color])}
                      >
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${iconColorMap[exp.color]} flex items-center justify-center shrink-0 shadow-md`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 text-right">
                          <div className="font-bold text-white text-sm">{exp.title}</div>
                          <div className="text-xs text-text-secondary mt-0.5">{exp.description}</div>
                        </div>
                        <ArrowLeft className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors shrink-0" />
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <motion.div initial="hidden" animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {/* New Experiment Card */}
            <motion.div variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}>
              <Link href="/chat?q=ابدأ تجربة جديدة في مختبر السوق"
                className="block h-full glass-panel rounded-3xl p-6 border-dashed border-white/20 hover:border-fuchsia-400/30 hover:bg-fuchsia-500/5 transition-all group text-center"
              >
                <div className="flex flex-col items-center justify-center h-full gap-3 py-4">
                  <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus className="w-6 h-6 text-fuchsia-400" />
                  </div>
                  <div className="font-bold text-white">تجربة جديدة</div>
                  <div className="text-xs text-text-secondary">اختبر فكرة سوقية جديدة</div>
                </div>
              </Link>
            </motion.div>

            {experiments.map((exp) => (
              <motion.div key={exp.id} variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } }}>
                <Link href={`/market-lab/results/${exp.id}`} className="block h-full">
                  <div className="glass-panel rounded-3xl p-5 h-full hover:border-fuchsia-400/30 transition-all card-lift group">
                    <div className="flex items-center justify-between mb-3">
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border",
                        exp.status === "completed" && "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
                        exp.status === "running" && "bg-blue-500/10 text-blue-300 border-blue-500/20 animate-pulse",
                        exp.status === "failed" && "bg-rose-500/10 text-rose-300 border-rose-500/20"
                      )}>
                        {exp.status === "completed" ? "✓ مكتملة" : exp.status === "running" ? "⚡ جارية" : "✕ فشلت"}
                      </span>
                      {exp.createdAt && (
                        <span className="text-[10px] text-text-secondary flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(exp.createdAt.seconds * 1000).toLocaleDateString("ar-EG")}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-white mb-2 leading-snug group-hover:text-brand-cyan transition-colors">
                      {exp.title || "تجربة بلا عنوان"}
                    </h3>

                    {exp.hypothesis && (
                      <p className="text-xs text-text-secondary leading-relaxed line-clamp-2 mb-3">{exp.hypothesis}</p>
                    )}

                    <div className="flex items-center gap-3 text-xs text-text-secondary mb-3">
                      {exp.personaCount && (
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {exp.personaCount} شخصية</span>
                      )}
                      {exp.insightCount && (
                        <span className="flex items-center gap-1"><Lightbulb className="w-3 h-3" /> {exp.insightCount} insight</span>
                      )}
                    </div>

                    {exp.resultSummary && (
                      <p className="text-xs text-fuchsia-300/80 leading-relaxed line-clamp-2 border-t border-white/[0.05] pt-3 mt-auto">
                        {exp.resultSummary}
                      </p>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </AppShell>
  );
}

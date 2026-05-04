"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import {
  Rocket, Sparkles, MapPin, Briefcase, CheckCircle2,
  ArrowLeft, ArrowRight, Brain, FlaskConical, Scale,
  Radar, Shield, Building2, ShoppingCart, HeartPulse,
  GraduationCap, Cpu, Leaf, Home, Banknote, Utensils,
  ChevronLeft, Target, TrendingUp, Gavel,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";

// ─── Data ────────────────────────────────────────────────────────────────────

const STAGES = [
  { id: "idea",       label: "فكرة أولية",       desc: "عندي فكرة لكن لم أبدأ بعد",              icon: "💡" },
  { id: "validation", label: "اختبار السوق",      desc: "بدأت التحقق من الفكرة مع عملاء",          icon: "🔬" },
  { id: "mvp",        label: "بناء MVP",           desc: "أعمل على النموذج الأولي",                 icon: "🛠️" },
  { id: "foundation", label: "مرحلة التأسيس",     desc: "أسست الشركة وبدأت البيع",                 icon: "🏗️" },
  { id: "growth",     label: "نمو وتوسع",          desc: "شركة قائمة وأبحث عن تسريع النمو",         icon: "📈" },
];

const INDUSTRIES = [
  { id: "fintech",        label: "مالية ومصرفية",       icon: Banknote,       color: "emerald" },
  { id: "tech",           label: "تكنولوجيا وبرمجيات",  icon: Cpu,            color: "cyan"    },
  { id: "ecommerce",      label: "تجارة إلكترونية",     icon: ShoppingCart,   color: "indigo"  },
  { id: "health",         label: "صحة وطب",             icon: HeartPulse,     color: "rose"    },
  { id: "education",      label: "تعليم وتدريب",        icon: GraduationCap,  color: "violet"  },
  { id: "food",           label: "أغذية ومطاعم",        icon: Utensils,       color: "amber"   },
  { id: "realestate",     label: "عقارات",              icon: Home,           color: "orange"  },
  { id: "sustainability", label: "استدامة وبيئة",       icon: Leaf,           color: "teal"    },
  { id: "other",          label: "مجال آخر",            icon: Building2,      color: "neutral" },
];

const GOVERNORATES = [
  "السعودية", "الإمارات", "مصر", "الكويت", "قطر",
  "البحرين", "عُمان", "الأردن", "المغرب", "تونس",
  "الجزائر", "ليبيا", "العراق", "لبنان", "فلسطين",
  "اليمن", "السودان", "سوريا", "أمريكا الشمالية", "أوروبا",
  "المملكة المتحدة", "كندا", "أستراليا", "جنوب شرق آسيا", "أفريقيا جنوب الصحراء",
  "دولة أخرى",
];

const GOALS = [
  { id: "idea_analysis",  label: "تحليل فكرتي",           icon: Brain,     color: "cyan"    },
  { id: "business_plan",  label: "خطة عمل للمستثمر",      icon: Briefcase, color: "indigo"  },
  { id: "market_research", label: "بحث سوقي",             icon: FlaskConical, color: "fuchsia" },
  { id: "legal",           label: "تأسيس قانوني",         icon: Scale,     color: "amber"   },
  { id: "funding",         label: "إيجاد تمويل",          icon: Radar,     color: "emerald" },
  { id: "risk",            label: "تجنب الأخطاء",         icon: Shield,    color: "rose"    },
];

const STEPS = [
  { id: "welcome",  title: "فريقك المؤسّس جاهز!", subtitle: "٥٧ مساعداً ذكياً يعملون من أجلك — دعنا نخصّصهم لمشروعك" },
  { id: "name",     title: "ما اسمك؟",                   subtitle: "سنناديك به في كل محادثة" },
  { id: "company",  title: "ما اسم مشروعك أو شركتك؟",   subtitle: "لا يهم إن لم يكن لديك اسم بعد — اكتب وصفاً مختصراً" },
  { id: "stage",    title: "في أي مرحلة أنت الآن؟",     subtitle: "سنفعّل المساعدين الأنسب لمرحلتك تحديداً" },
  { id: "industry", title: "ما مجال مشروعك؟",            subtitle: "٥٧ مساعداً مدرّبون على تفاصيل مجالك وسوقك المستهدف" },
  { id: "location", title: "من أي دولة أو منطقة؟",       subtitle: "سنخصّص توصياتنا وفق ديناميكيات سوقك المحلي" },
  { id: "goals",    title: "ماذا تريد تحقيقه؟",          subtitle: "اختر كل ما ينطبق عليك — يمكنك تغييره لاحقاً" },
];

// ─── Stage-aware mission config ───────────────────────────────────────────────

interface MissionCard {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  primaryLabel: string;
  href: string;
  gradient: string;
  border: string;
  iconBg: string;
}

type GoalMissionBase = Omit<MissionCard, "href"> & {
  baseHref: string;
  chatPromptByStage?: Record<string, string>;
};

const GOAL_MISSIONS: Record<string, GoalMissionBase> = {
  idea_analysis: {
    id: "idea_analysis",
    icon: Brain,
    title: "حلّل فكرتك الآن",
    description: "مختبر الأفكار يدرس جدوى مشروعك ويكشف نقاط القوة والمخاطر قبل أن تبدأ.",
    primaryLabel: "افتح مختبر الأفكار",
    baseHref: "/ideas/analyze",
    gradient: "from-cyan-500/15 to-indigo-500/10",
    border: "border-cyan-500/30",
    iconBg: "bg-cyan-500/15 text-cyan-400",
  },
  business_plan: {
    id: "business_plan",
    icon: Briefcase,
    title: "ابنِ خطة عملك",
    description: "المدير المالي الذكي يبني نموذجك المالي وخطة العمل الجاهزة للمستثمرين.",
    primaryLabel: "ابدأ مع المدير المالي",
    baseHref: "/chat?q=",
    chatPromptByStage: {
      idea:       "أريد خطة عمل للمرحلة الأولية — ساعدني على رسم فكرة عملي وإمكانياتها التجارية",
      validation: "أريد خطة عمل تعكس نتائج اختبار السوق الأولية مع عملاء حقيقيين",
      mvp:        "أريد خطة عمل تُظهر المنتج الأولي ومؤشرات الجدوى لجذب المستثمرين",
      foundation: "أريد خطة عمل احترافية لشركة قائمة تبحث عن تمويل في المرحلة الأولى",
      growth:     "أريد خطة عمل للتوسع ورفع جولة تمويل متقدمة مبنية على بيانات النمو",
    },
    gradient: "from-indigo-500/15 to-violet-500/10",
    border: "border-indigo-500/30",
    iconBg: "bg-indigo-500/15 text-indigo-400",
  },
  market_research: {
    id: "market_research",
    icon: FlaskConical,
    title: "استكشف سوقك",
    description: "تحليل عميق للسوق والمنافسين وحجم الفرصة المتاحة لمشروعك.",
    primaryLabel: "ابدأ البحث السوقي",
    baseHref: "/competitor-watch",
    gradient: "from-fuchsia-500/15 to-pink-500/10",
    border: "border-fuchsia-500/30",
    iconBg: "bg-fuchsia-500/15 text-fuchsia-400",
  },
  legal: {
    id: "legal",
    icon: Gavel,
    title: "أسّس مشروعك بشكل صحيح",
    description: "المستشار القانوني يرشدك لاختيار الهيكل القانوني المناسب وخطوات التأسيس.",
    primaryLabel: "اسأل المستشار القانوني",
    baseHref: "/legal-ai",
    gradient: "from-amber-500/15 to-orange-500/10",
    border: "border-amber-500/30",
    iconBg: "bg-amber-500/15 text-amber-400",
  },
  funding: {
    id: "funding",
    icon: Target,
    title: "اكتشف فرص التمويل",
    description: "رادار الفرص يرصد المنح والمسابقات والمستثمرين المناسبين لمرحلتك.",
    primaryLabel: "افتح رادار الفرص",
    baseHref: "/opportunities",
    chatPromptByStage: {
      idea:       "ما مصادر التمويل الأنسب لفكرة في مرحلتها الأولى قبل بناء المنتج؟",
      validation: "ما خيارات التمويل المتاحة لمشروع في مرحلة اختبار السوق؟",
      mvp:        "كيف أحصل على تمويل مبكر لمشروع MVP جاهز؟",
      foundation: "كيف أجهّز ملف المستثمر للجولة الأولى seed round؟",
      growth:     "ما خيارات التمويل للشركات في مرحلة التوسع Series A+؟",
    },
    gradient: "from-emerald-500/15 to-teal-500/10",
    border: "border-emerald-500/30",
    iconBg: "bg-emerald-500/15 text-emerald-400",
  },
  risk: {
    id: "risk",
    icon: Shield,
    title: "تجنّب الأخطاء القاتلة",
    description: "درع الأخطاء يحدد أكبر المخاطر في مشروعك ويضع خطة وقاية فعّالة.",
    primaryLabel: "فعّل درع الأخطاء",
    baseHref: "/chat?q=",
    chatPromptByStage: {
      idea:       "ما الأخطاء القاتلة في مرحلة الفكرة الأولية وكيف أتجنبها قبل البدء؟",
      validation: "ما أكبر أخطاء مرحلة اختبار السوق وكيف أتحقق من الفكرة بشكل صحيح؟",
      mvp:        "ما الأخطاء الشائعة في مرحلة بناء MVP وكيف أبني المنتج الصحيح؟",
      foundation: "ما المخاطر الشائعة لشركة ناشئة في مرحلة التأسيس وكيف أديرها؟",
      growth:     "ما الأخطاء التي تقتل الشركات في مرحلة النمو وكيف أتجنبها؟",
    },
    gradient: "from-rose-500/15 to-red-500/10",
    border: "border-rose-500/30",
    iconBg: "bg-rose-500/15 text-rose-400",
  },
};

function buildMissionCards(goals: string[], stage: string): MissionCard[] {
  return goals
    .filter((g) => GOAL_MISSIONS[g])
    .slice(0, 3)
    .map((goalId) => {
      const base = GOAL_MISSIONS[goalId];
      let href = base.baseHref;
      if (base.chatPromptByStage) {
        const prompt = base.chatPromptByStage[stage] ?? base.chatPromptByStage["idea"] ?? "";
        if (base.baseHref === "/chat?q=" || base.baseHref.startsWith("/chat?q=")) {
          href = "/chat?q=" + encodeURIComponent(prompt);
        } else {
          href = base.baseHref;
        }
      }
      return { ...base, href };
    });
}

// ─── Color maps ───────────────────────────────────────────────────────────────

const COLOR_MAPS: Record<string, string> = {
  emerald: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  cyan:    "border-cyan-500/40 bg-cyan-500/10 text-cyan-400",
  indigo:  "border-indigo-500/40 bg-indigo-500/10 text-indigo-400",
  rose:    "border-rose-500/40 bg-rose-500/10 text-rose-400",
  violet:  "border-violet-500/40 bg-violet-500/10 text-violet-400",
  amber:   "border-amber-500/40 bg-amber-500/10 text-amber-400",
  orange:  "border-orange-500/40 bg-orange-500/10 text-orange-400",
  teal:    "border-teal-500/40 bg-teal-500/10 text-teal-400",
  fuchsia: "border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-400",
  neutral: "border-neutral-500/40 bg-neutral-500/10 text-neutral-400",
};

// ─── Persistence helpers ──────────────────────────────────────────────────────

const PERSIST_KEY = "kalmeron_onboarding_progress";

interface SavedProgress {
  step?: number;
  name?: string;
  companyName?: string;
  stage?: string;
  industry?: string;
  location?: string;
  goals?: string[];
  showFirstMission?: boolean;
}

function saveProgress(data: SavedProgress) {
  try { sessionStorage.setItem(PERSIST_KEY, JSON.stringify(data)); } catch {}
}

function loadProgress(): SavedProgress | null {
  try {
    const raw = sessionStorage.getItem(PERSIST_KEY);
    return raw ? (JSON.parse(raw) as SavedProgress) : null;
  } catch {
    return null;
  }
}

function clearProgress() {
  try { sessionStorage.removeItem(PERSIST_KEY); } catch {}
}

// ─── Component ────────────────────────────────────────────────────────────────

export function OnboardingForm() {
  const { user, mergeDBUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    try { router.prefetch("/dashboard"); } catch {}
  }, [router]);

  // Lazy initializers — only run on the client after mount to avoid
  // SSR/client hydration mismatches caused by sessionStorage access.
  const displayName = user?.displayName?.split(" ")[0] ?? "";
  const [step,             setStep           ] = useState(() => loadProgress()?.step ?? 0);
  const [name,             setName           ] = useState(() => loadProgress()?.name ?? displayName);
  const [companyName,      setCompanyName    ] = useState(() => loadProgress()?.companyName ?? "");
  const [stage,            setStage          ] = useState(() => loadProgress()?.stage ?? "");
  const [industry,         setIndustry       ] = useState(() => loadProgress()?.industry ?? "");
  const [location,         setLocation       ] = useState(() => loadProgress()?.location ?? "");
  const [goals,            setGoals          ] = useState<string[]>(() => loadProgress()?.goals ?? []);
  const [direction,        setDirection      ] = useState(1);
  const [showFirstMission, setShowFirstMission] = useState(() => loadProgress()?.showFirstMission ?? false);

  // Persist state on every meaningful change
  useEffect(() => {
    saveProgress({ step, name, companyName, stage, industry, location, goals, showFirstMission });
  }, [step, name, companyName, stage, industry, location, goals, showFirstMission]);

  const totalSteps = STEPS.length;
  const progress = ((step + 1) / totalSteps) * 100;

  const canNext = (() => {
    if (step === 0) return true;
    if (step === 1) return name.trim().length >= 2;
    if (step === 2) return companyName.trim().length >= 2;
    if (step === 3) return !!stage;
    if (step === 4) return !!industry;
    if (step === 5) return !!location;
    if (step === 6) return goals.length > 0;
    return false;
  })();

  const goNext = () => {
    if (!canNext) return;
    if (step < totalSteps - 1) {
      setDirection(1);
      setStep((s) => s + 1);
    } else {
      handleSubmit();
    }
  };

  const goBack = () => {
    if (step > 0) {
      setDirection(-1);
      setStep((s) => s - 1);
    }
  };

  const toggleGoal = (id: string) => {
    setGoals((prev) => prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]);
  };

  // Save form data to Firestore WITHOUT marking profile_completed=true yet.
  // Profile completion happens when the user interacts with the First Mission screen.
  const handleSubmit = () => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    updateDoc(userRef, {
      name,
      company_name: companyName,
      startup_stage: stage,
      industry,
      governorate: location,
      goals,
      // profile_completed intentionally left unset here —
      // it is set in finalizeOnboarding() below so the _page-client redirect
      // does not fire before the user interacts with the First Mission screen.
    }).catch((err) => {
      console.error("Failed to persist partial onboarding profile:", err);
    });

    setShowFirstMission(true);
  };

  // Called when user either picks a mission or skips. Completes the profile.
  const finalizeOnboarding = (destination: string) => {
    if (!user) return;

    clearProgress();

    // Set a guard flag BEFORE calling mergeDBUser so that _page-client.tsx
    // does not race to redirect to /dashboard when it sees profile_completed=true
    // while we're navigating to a different destination.
    try {
      sessionStorage.setItem("kalmeron_just_onboarded", "1");
      sessionStorage.setItem("kalmeron_onboarding_completing", "1");
    } catch {}

    // Mark profile as complete in auth context so AuthGuard on the destination
    // page lets the user through without bouncing back to /onboarding.
    mergeDBUser({
      name,
      company_name: companyName,
      startup_stage: stage,
      industry,
      governorate: location,
      profile_completed: true,
    });

    // Persist ALL fields to Firestore in background. Including full form data
    // here makes this write idempotent — if the earlier partial write failed,
    // this one will recover all fields correctly.
    const userRef = doc(db, "users", user.uid);
    updateDoc(userRef, {
      name,
      company_name: companyName,
      startup_stage: stage,
      industry,
      governorate: location,
      goals,
      profile_completed: true,
      onboarded_at: new Date(),
    }).catch((err) => {
      console.error("Failed to finalize onboarding profile:", err);
    });

    router.replace(destination);
  };

  const missionCards = buildMissionCards(goals, stage);

  const variants = {
    enter:  (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0, scale: 0.97 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit:   (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0, scale: 0.97 }),
  };

  // ── First Mission Screen ─────────────────────────────────────────────────────
  if (showFirstMission) {
    return (
      <div className="min-h-screen bg-[#05070D] flex flex-col items-center justify-center p-4 relative overflow-hidden" dir="rtl">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-indigo-600/8 rounded-full blur-[140px]" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-600/8 rounded-full blur-[120px]" />
          <div className="absolute inset-0 opacity-[0.015] [background-image:linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:50px_50px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative w-full max-w-lg z-10"
        >
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-extrabold text-white text-xl tracking-tight">KALMERON</span>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#0B1020]/90 backdrop-blur-xl shadow-2xl overflow-hidden">
            <div className="p-6 md:p-8">
              {/* Header */}
              <div className="text-center mb-7">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.35 }}
                  className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-4"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  الإعداد مكتمل
                </motion.div>
                <h2 className="font-display text-2xl md:text-3xl font-extrabold text-white mb-2">
                  مهمتك الأولى، {name}
                </h2>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  اخترنا لك أفضل نقطة انطلاق بناءً على أهدافك ومرحلتك — ابدأ الآن أو انتقل للوحة التحكم
                </p>
              </div>

              {/* Mission Cards */}
              <div className="space-y-3">
                {missionCards.map((card, i) => {
                  const Icon = card.icon;
                  return (
                    <motion.div
                      key={card.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + i * 0.1, duration: 0.4 }}
                      className={cn(
                        "rounded-2xl border p-4 bg-gradient-to-br transition-all",
                        card.gradient, card.border
                      )}
                    >
                      <div className="flex items-start gap-3.5">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", card.iconBg)}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-white text-sm mb-0.5">{card.title}</h3>
                          <p className="text-neutral-400 text-xs leading-relaxed">{card.description}</p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <button
                          onClick={() => finalizeOnboarding(card.href)}
                          className="w-full flex items-center justify-center gap-2 font-bold text-sm py-2.5 rounded-xl btn-primary"
                        >
                          {card.primaryLabel}
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Footer: Skip to dashboard */}
            <div className="px-6 md:px-8 pb-6 md:pb-8">
              <button
                onClick={() => finalizeOnboarding("/dashboard")}
                className="w-full flex items-center justify-center gap-2 text-sm font-semibold py-3 rounded-2xl border border-white/10 bg-white/[0.04] text-neutral-300 hover:bg-white/[0.07] hover:text-white transition-all"
              >
                <TrendingUp className="w-4 h-4 text-brand-cyan" />
                انتقل للوحة التحكم
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-neutral-600 mt-4">
            يمكنك دائماً تغيير أهدافك من <span className="text-neutral-400">الإعدادات</span>
          </p>
        </motion.div>
      </div>
    );
  }

  // ── Onboarding Steps ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#05070D] flex flex-col items-center justify-center p-4 relative overflow-hidden" dir="rtl">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.02] [background-image:linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:50px_50px]" />
      </div>

      <div className="relative w-full max-w-lg z-10">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-extrabold text-white text-xl tracking-tight">KALMERON</span>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs mb-2.5">
            <span className="text-neutral-500">الخطوة {step + 1} من {totalSteps}</span>
            <span className={cn(
              "font-semibold tabular-nums transition-colors",
              progress >= 70 ? "text-emerald-400" : "text-indigo-400"
            )}>
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-fuchsia-500 rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
          <div className="flex items-center justify-center gap-1.5 mt-3">
            {STEPS.map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  width: i === step ? 24 : i < step ? 16 : 6,
                  backgroundColor:
                    i < step  ? "rgb(52 211 153)" :
                    i === step ? "rgb(129 140 248)" :
                    "rgba(255,255,255,0.12)",
                }}
                transition={{ duration: 0.25 }}
                className="h-1.5 rounded-full"
              />
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="relative rounded-3xl border border-white/10 bg-[#0B1020]/90 backdrop-blur-xl shadow-2xl overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: "easeInOut" }}
              className="p-6 md:p-8"
            >
              {/* Step Header */}
              <div className="text-center mb-7">
                <h2 className="font-display text-2xl md:text-3xl font-extrabold text-white mb-1.5 leading-tight">
                  {STEPS[step].title}
                </h2>
                <p className="text-neutral-400 text-sm leading-relaxed">{STEPS[step].subtitle}</p>
              </div>

              {/* Step 0: Welcome */}
              {step === 0 && (
                <div className="text-center space-y-5">
                  <div className="relative mx-auto w-24 h-24">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-fuchsia-500/30 blur-2xl" />
                    <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-white/10 flex items-center justify-center text-4xl">
                      🚀
                    </div>
                  </div>
                  <div className="space-y-2.5 text-sm text-neutral-300">
                    {[
                      { icon: "🤖", text: "٥٧ مساعداً ذكياً في ٧ أقسام — بالعربية الأصيلة" },
                      { icon: "📊", text: "خطط عمل ونمذجة مالية احترافية لسوقك" },
                      { icon: "⚖️", text: "إرشاد قانوني متوافق مع أطر التأسيس" },
                      { icon: "🎯", text: "رادار فرص تمويل ومنح مخصص لمرحلتك" },
                    ].map((item) => (
                      <div
                        key={item.text}
                        className="flex items-center gap-3 bg-white/[0.035] rounded-xl px-4 py-3 text-right border border-white/[0.05]"
                      >
                        <span className="text-xl shrink-0">{item.icon}</span>
                        <span className="flex-1 text-neutral-300">{item.text}</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 1: Name */}
              {step === 1 && (
                <div className="space-y-4">
                  <input
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && goNext()}
                    placeholder="اكتب اسمك الأول..."
                    className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-5 py-4 text-white text-xl text-center placeholder-neutral-600 outline-none focus:border-indigo-400/50 focus:bg-white/[0.06] transition-all font-display font-bold"
                  />
                  <p className="text-center text-xs text-neutral-600">سيناديك كلميرون باسمك في كل محادثة 🤝</p>
                </div>
              )}

              {/* Step 2: Company Name */}
              {step === 2 && (
                <div className="space-y-4">
                  <input
                    autoFocus
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && canNext && goNext()}
                    placeholder="مثال: تك برو، سوق ماكس، طبيب أونلاين..."
                    className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-5 py-4 text-white text-xl text-center placeholder-neutral-600 outline-none focus:border-indigo-400/50 focus:bg-white/[0.06] transition-all font-display font-bold"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    {["لم أحدد بعد", "مشروع جديد", "شركة ناشئة", "مشروع تجاري"].map((hint) => (
                      <button
                        key={hint}
                        type="button"
                        onClick={() => setCompanyName(hint)}
                        className={cn(
                          "text-xs border px-3 py-2.5 rounded-xl transition-all font-medium",
                          companyName === hint
                            ? "bg-indigo-500/15 border-indigo-400/40 text-indigo-300"
                            : "text-neutral-400 bg-white/[0.03] hover:bg-white/[0.07] border-white/[0.07]"
                        )}
                      >
                        {hint}
                      </button>
                    ))}
                  </div>
                  <p className="text-center text-xs text-neutral-600">يمكنك تغيير اسم مشروعك لاحقاً من الإعدادات 🏢</p>
                </div>
              )}

              {/* Step 3: Stage */}
              {step === 3 && (
                <div className="space-y-2">
                  {STAGES.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setStage(s.id)}
                      className={cn(
                        "w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-right",
                        stage === s.id
                          ? "bg-indigo-500/15 border-indigo-400/50 shadow-lg shadow-indigo-500/10"
                          : "bg-white/[0.025] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/12"
                      )}
                    >
                      <span className="text-2xl shrink-0 leading-none">{s.icon}</span>
                      <div className="flex-1 text-right">
                        <div className={cn("font-bold text-sm", stage === s.id ? "text-white" : "text-neutral-200")}>
                          {s.label}
                        </div>
                        <div className="text-xs text-neutral-500 mt-0.5">{s.desc}</div>
                      </div>
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all",
                        stage === s.id ? "border-emerald-400 bg-emerald-400/20" : "border-white/20"
                      )}>
                        {stage === s.id && <div className="w-2 h-2 rounded-full bg-emerald-400" />}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Step 4: Industry */}
              {step === 4 && (
                <div className="grid grid-cols-3 gap-2.5">
                  {INDUSTRIES.map((ind) => {
                    const Icon = ind.icon;
                    const isSelected = industry === ind.id;
                    return (
                      <button
                        key={ind.id}
                        onClick={() => setIndustry(ind.id)}
                        className={cn(
                          "flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all",
                          isSelected
                            ? COLOR_MAPS[ind.color]
                            : "border-white/[0.06] bg-white/[0.025] hover:bg-white/[0.05] hover:border-white/12"
                        )}
                      >
                        <Icon className={cn("w-6 h-6", isSelected ? "" : "text-neutral-400")} />
                        <span className={cn("text-xs font-medium text-center leading-tight", isSelected ? "font-bold" : "text-neutral-300")}>
                          {ind.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Step 5: Location */}
              {step === 5 && (
                <div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-72 overflow-y-auto scrollbar-thin pl-1">
                    {GOVERNORATES.map((gov) => (
                      <button
                        key={gov}
                        onClick={() => setLocation(gov)}
                        className={cn(
                          "px-3 py-2.5 rounded-xl border text-sm font-medium transition-all",
                          location === gov
                            ? "bg-indigo-500/20 border-indigo-400/50 text-white"
                            : "bg-white/[0.025] border-white/[0.06] text-neutral-300 hover:bg-white/[0.06] hover:border-white/15"
                        )}
                      >
                        {gov}
                      </button>
                    ))}
                  </div>
                  {location && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 flex items-center gap-2 text-sm text-emerald-400"
                    >
                      <MapPin className="w-4 h-4" /> اخترت: <span className="font-semibold">{location}</span>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Step 6: Goals */}
              {step === 6 && (
                <div className="space-y-2">
                  <p className="text-xs text-neutral-500 text-center mb-3">اختر هدفاً واحداً أو أكثر</p>
                  <div className="grid grid-cols-2 gap-2.5">
                    {GOALS.map((goal) => {
                      const Icon = goal.icon;
                      const isSelected = goals.includes(goal.id);
                      return (
                        <button
                          key={goal.id}
                          onClick={() => toggleGoal(goal.id)}
                          className={cn(
                            "flex items-center gap-3 p-3.5 rounded-2xl border transition-all text-right",
                            isSelected
                              ? COLOR_MAPS[goal.color]
                              : "bg-white/[0.025] border-white/[0.06] hover:bg-white/[0.05]"
                          )}
                        >
                          <Icon className={cn("w-5 h-5 shrink-0", isSelected ? "" : "text-neutral-400")} />
                          <span className={cn("text-sm font-medium flex-1", isSelected ? "text-white font-semibold" : "text-neutral-300")}>
                            {goal.label}
                          </span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                  {goals.length > 0 && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center text-xs text-emerald-400/80 mt-1"
                    >
                      اخترت {goals.length} {goals.length === 1 ? "هدف" : "أهداف"} ✓
                    </motion.p>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center gap-3 px-6 md:px-8 pb-6 md:pb-8">
            {step > 0 && (
              <button
                onClick={goBack}
                className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] px-4 py-3 rounded-2xl transition-all"
              >
                <ArrowRight className="w-4 h-4" /> رجوع
              </button>
            )}
            <button
              onClick={goNext}
              disabled={!canNext}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 font-bold py-3.5 rounded-2xl transition-all",
                canNext
                  ? "btn-primary"
                  : "bg-white/5 text-neutral-600 cursor-not-allowed border border-white/10"
              )}
            >
              {step === totalSteps - 1 ? (
                <><Rocket className="w-5 h-5" /> انطلق مع كلميرون!</>
              ) : (
                <>التالي <ArrowLeft className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-neutral-600 mt-4">
          بمتابعتك، أنت توافق على{" "}
          <a href="/terms" className="text-neutral-400 hover:text-white transition-colors">الشروط</a>
          {" "}و<a href="/privacy" className="text-neutral-400 hover:text-white transition-colors">سياسة الخصوصية</a>
        </p>
      </div>
    </div>
  );
}

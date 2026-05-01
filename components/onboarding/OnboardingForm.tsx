"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { Loader2, Rocket, Sparkles, MapPin, Briefcase, CheckCircle2, ArrowLeft, ArrowRight, Brain, FlaskConical, Scale, Radar, Shield, Building2, ShoppingCart, HeartPulse, GraduationCap, Cpu, Leaf, Home, Banknote, Utensils } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";

const STAGES = [
  { id: "idea", label: "فكرة أولية", desc: "عندي فكرة لكن لم أبدأ بعد", icon: "💡" },
  { id: "validation", label: "اختبار السوق", desc: "بدأت التحقق من الفكرة مع عملاء", icon: "🔬" },
  { id: "mvp", label: "بناء MVP", desc: "أعمل على النموذج الأولي", icon: "🛠️" },
  { id: "foundation", label: "مرحلة التأسيس", desc: "أسست الشركة وبدأت البيع", icon: "🏗️" },
  { id: "growth", label: "نمو وتوسع", desc: "شركة قائمة وأبحث عن تسريع النمو", icon: "📈" },
];

const INDUSTRIES = [
  { id: "fintech", label: "مالية ومصرفية", icon: Banknote, color: "emerald" },
  { id: "tech", label: "تكنولوجيا وبرمجيات", icon: Cpu, color: "cyan" },
  { id: "ecommerce", label: "تجارة إلكترونية", icon: ShoppingCart, color: "indigo" },
  { id: "health", label: "صحة وطب", icon: HeartPulse, color: "rose" },
  { id: "education", label: "تعليم وتدريب", icon: GraduationCap, color: "violet" },
  { id: "food", label: "أغذية ومطاعم", icon: Utensils, color: "amber" },
  { id: "realestate", label: "عقارات", icon: Home, color: "orange" },
  { id: "sustainability", label: "استدامة وبيئة", icon: Leaf, color: "teal" },
  { id: "other", label: "مجال آخر", icon: Building2, color: "neutral" },
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
  { id: "idea_analysis", label: "تحليل فكرتي", icon: Brain, color: "cyan" },
  { id: "business_plan", label: "خطة عمل للمستثمر", icon: Briefcase, color: "indigo" },
  { id: "market_research", label: "بحث سوقي", icon: FlaskConical, color: "fuchsia" },
  { id: "legal", label: "تأسيس قانوني", icon: Scale, color: "amber" },
  { id: "funding", label: "إيجاد تمويل", icon: Radar, color: "emerald" },
  { id: "risk", label: "تجنب الأخطاء", icon: Shield, color: "rose" },
];

const STEPS = [
  { id: "welcome",  title: "فريقك المؤسّس جاهز!", subtitle: "٥٧ مساعداً ذكياً يعملون من أجلك — دعنا نخصّصهم لمشروعك" },
  { id: "name",     title: "ما اسمك؟", subtitle: "سنناديك به في كل محادثة" },
  { id: "company",  title: "ما اسم مشروعك أو شركتك؟", subtitle: "لا يهم إن لم يكن لديك اسم بعد — اكتب وصفاً مختصراً" },
  { id: "stage",    title: "في أي مرحلة أنت الآن؟", subtitle: "سنفعّل المساعدين الأنسب لمرحلتك تحديداً" },
  { id: "industry", title: "ما مجال مشروعك؟", subtitle: "٥٧ مساعداً مدرّبون على تفاصيل مجالك وسوقك المستهدف" },
  { id: "location", title: "من أي دولة أو منطقة؟", subtitle: "سنخصّص توصياتنا وفق ديناميكيات سوقك المحلي" },
  { id: "goals",    title: "ماذا تريد تحقيقه؟", subtitle: "اختر كل ما ينطبق عليك — يمكنك تغييره لاحقاً" },
];

export function OnboardingForm() {
  const { user, mergeDBUser } = useAuth();
  const router = useRouter();

  // Prefetch the dashboard route as soon as the form mounts so the post-submit
  // navigation feels instant instead of waiting on the dashboard bundle.
  useEffect(() => {
    try { router.prefetch("/dashboard"); } catch {}
  }, [router]);

  const [step, setStep] = useState(0);
  const [name, setName] = useState(user?.displayName?.split(" ")[0] || "");
  const [companyName, setCompanyName] = useState("");
  const [stage, setStage] = useState("");
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [direction, setDirection] = useState(1);

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

  const handleSubmit = () => {
    if (!user) return;
    setLoading(true);

    // 1) Merge optimistically into auth context so AuthGuard on /dashboard
    //    sees profile_completed=true immediately and does NOT bounce back here.
    mergeDBUser({
      name,
      company_name: companyName,
      startup_stage: stage,
      industry,
      governorate: location,
      profile_completed: true,
    });

    // 2) Navigate right away — the dashboard skeleton paints instantly thanks
    //    to the prefetch above. The user no longer sits on a disabled
    //    "جاري التجهيز" button waiting for Firestore + route transition.
    router.replace("/dashboard");

    // 3) Persist to Firestore in the background. We deliberately do NOT await
    //    this because the user has already moved on. Failures are logged.
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
      console.error("Failed to persist onboarding profile:", err);
    });
  };

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0, scale: 0.97 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0, scale: 0.97 }),
  };

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
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
            <span>الخطوة {step + 1} من {totalSteps}</span>
            <span>{Math.round(progress)}% مكتمل</span>
          </div>
          <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-fuchsia-500 rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
          {/* Step dots */}
          <div className="flex items-center justify-center gap-1.5 mt-3">
            {STEPS.map((_, i) => (
              <div key={i} className={cn(
                "rounded-full transition-all duration-300",
                i < step ? "w-4 h-1.5 bg-emerald-400" :
                i === step ? "w-6 h-1.5 bg-indigo-400" :
                "w-1.5 h-1.5 bg-white/15"
              )} />
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
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="p-6 md:p-8"
            >
              {/* Step Header */}
              <div className="text-center mb-7">
                <h2 className="font-display text-2xl md:text-3xl font-extrabold text-white mb-1.5">{STEPS[step].title}</h2>
                <p className="text-neutral-400 text-sm">{STEPS[step].subtitle}</p>
              </div>

              {/* Step 0: Welcome */}
              {step === 0 && (
                <div className="text-center space-y-5">
                  <div className="relative mx-auto w-28 h-28">
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/40 to-fuchsia-500/40 blur-2xl animate-pulse" />
                    <div className="relative w-full h-full rounded-3xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-white/10 flex items-center justify-center text-5xl">
                      🚀
                    </div>
                  </div>
                  <div className="space-y-3 text-sm text-neutral-300">
                    {[
                      { icon: "🤖", text: "٥٧ مساعداً ذكياً في ٧ أقسام — بالعربية الأصيلة" },
                      { icon: "📊", text: "خطط عمل ونمذجة مالية احترافية لسوقك المستهدف" },
                      { icon: "⚖️", text: "إرشاد قانوني متوافق مع أطر التأسيس الدولية" },
                      { icon: "🎯", text: "رادار فرص تمويل ومنح مخصص لمرحلتك" },
                    ].map((item) => (
                      <div key={item.text} className="flex items-center gap-3 bg-white/[0.04] rounded-xl px-4 py-3 text-right border border-white/[0.06]">
                        <span className="text-xl">{item.icon}</span>
                        <span>{item.text}</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mr-auto shrink-0" />
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
                    className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-5 py-4 text-white text-xl text-center placeholder-neutral-600 outline-none focus:border-indigo-400/50 transition-all font-display font-bold"
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
                    className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-5 py-4 text-white text-xl text-center placeholder-neutral-600 outline-none focus:border-indigo-400/50 transition-all font-display font-bold"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    {["لم أحدد بعد", "مشروع جديد", "شركة ناشئة", "مشروع تجاري"].map((hint) => (
                      <button
                        key={hint}
                        type="button"
                        onClick={() => setCompanyName(hint)}
                        className="text-xs text-neutral-400 bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.07] px-3 py-2 rounded-xl transition-all"
                      >
                        {hint}
                      </button>
                    ))}
                  </div>
                  <p className="text-center text-xs text-neutral-600">يمكنك تغيير اسم مشروعك لاحقاً 🏢</p>
                </div>
              )}

              {/* Step 3: Stage */}
              {step === 3 && (
                <div className="space-y-2.5">
                  {STAGES.map((s) => (
                    <button key={s.id} onClick={() => setStage(s.id)}
                      className={cn(
                        "w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-right",
                        stage === s.id
                          ? "bg-indigo-500/15 border-indigo-400/50 shadow-lg"
                          : "bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.06] hover:border-white/15"
                      )}
                    >
                      <span className="text-2xl shrink-0">{s.icon}</span>
                      <div className="flex-1">
                        <div className={cn("font-bold text-sm", stage === s.id ? "text-white" : "text-neutral-200")}>{s.label}</div>
                        <div className="text-xs text-neutral-500 mt-0.5">{s.desc}</div>
                      </div>
                      {stage === s.id && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
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
                    const colorMap: Record<string, string> = {
                      emerald: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
                      cyan: "border-cyan-500/40 bg-cyan-500/10 text-cyan-400",
                      indigo: "border-indigo-500/40 bg-indigo-500/10 text-indigo-400",
                      rose: "border-rose-500/40 bg-rose-500/10 text-rose-400",
                      violet: "border-violet-500/40 bg-violet-500/10 text-violet-400",
                      amber: "border-amber-500/40 bg-amber-500/10 text-amber-400",
                      orange: "border-orange-500/40 bg-orange-500/10 text-orange-400",
                      teal: "border-teal-500/40 bg-teal-500/10 text-teal-400",
                      neutral: "border-neutral-500/40 bg-neutral-500/10 text-neutral-400",
                    };
                    return (
                      <button key={ind.id} onClick={() => setIndustry(ind.id)}
                        className={cn(
                          "flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all",
                          isSelected ? colorMap[ind.color] : "border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06]"
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
                      <button key={gov} onClick={() => setLocation(gov)}
                        className={cn(
                          "px-3 py-2.5 rounded-xl border text-sm font-medium transition-all",
                          location === gov
                            ? "bg-indigo-500/20 border-indigo-400/50 text-white"
                            : "bg-white/[0.03] border-white/[0.07] text-neutral-300 hover:bg-white/[0.07] hover:border-white/20"
                        )}
                      >
                        {gov}
                      </button>
                    ))}
                  </div>
                  {location && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      className="mt-3 flex items-center gap-2 text-sm text-emerald-400"
                    >
                      <MapPin className="w-4 h-4" /> اخترت: {location}
                    </motion.div>
                  )}
                </div>
              )}

              {/* Step 6: Goals */}
              {step === 6 && (
                <div className="space-y-2">
                  <p className="text-xs text-neutral-500 text-center mb-4">يمكنك اختيار أكثر من هدف</p>
                  <div className="grid grid-cols-2 gap-2.5">
                    {GOALS.map((goal) => {
                      const Icon = goal.icon;
                      const isSelected = goals.includes(goal.id);
                      const colorMap: Record<string, string> = {
                        cyan: "border-cyan-500/40 bg-cyan-500/10",
                        indigo: "border-indigo-500/40 bg-indigo-500/10",
                        fuchsia: "border-fuchsia-500/40 bg-fuchsia-500/10",
                        amber: "border-amber-500/40 bg-amber-500/10",
                        emerald: "border-emerald-500/40 bg-emerald-500/10",
                        rose: "border-rose-500/40 bg-rose-500/10",
                      };
                      return (
                        <button key={goal.id} onClick={() => toggleGoal(goal.id)}
                          className={cn(
                            "flex items-center gap-3 p-3.5 rounded-2xl border transition-all text-right",
                            isSelected ? colorMap[goal.color] : "bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.06]"
                          )}
                        >
                          <Icon className={cn("w-5 h-5 shrink-0", isSelected ? "text-white" : "text-neutral-400")} />
                          <span className={cn("text-sm font-medium", isSelected ? "text-white" : "text-neutral-300")}>
                            {goal.label}
                          </span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400 mr-auto shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center gap-3 px-6 md:px-8 pb-6 md:pb-8">
            {step > 0 && (
              <button onClick={goBack}
                className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-3 rounded-2xl transition-all"
              >
                <ArrowRight className="w-4 h-4" /> رجوع
              </button>
            )}
            <button onClick={goNext} disabled={!canNext || loading}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 font-bold py-3.5 rounded-2xl transition-all",
                canNext ? "btn-primary" : "bg-white/5 text-neutral-600 cursor-not-allowed border border-white/10"
              )}
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> جاري التجهيز...</>
              ) : step === totalSteps - 1 ? (
                <><Rocket className="w-5 h-5" /> انطلق مع كلميرون!</>
              ) : (
                <>التالي <ArrowLeft className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-neutral-600 mt-4">
          بمتابعتك، أنت توافق على <a href="/terms" className="text-neutral-400 hover:text-white transition-colors">الشروط</a> و<a href="/privacy" className="text-neutral-400 hover:text-white transition-colors">سياسة الخصوصية</a>
        </p>
      </div>
    </div>
  );
}

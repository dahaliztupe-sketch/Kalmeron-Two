"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import {
  Rocket, Loader2, CheckCircle2, Circle, Clock, ArrowLeft,
  Sparkles, Brain, DollarSign, Package, Shield, Megaphone,
  TrendingUp, Layers, AlertTriangle, RefreshCw, Download,
  Copy, Check,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import Link from "next/link";

const STAGES = [
  { id: "idea_validator",     label: "تحليل الفكرة",       icon: Brain,       color: "cyan" },
  { id: "plan_builder",       label: "خطة العمل",          icon: Layers,      color: "indigo" },
  { id: "cfo_agent",          label: "النموذج المالي",      icon: DollarSign,  color: "emerald" },
  { id: "product_crew",       label: "المنتج / MVP",        icon: Package,     color: "violet" },
  { id: "security_agent",     label: "التدقيق الأمني",      icon: Shield,      color: "amber" },
  { id: "marketing_crew",     label: "استراتيجية التسويق",  icon: Megaphone,   color: "fuchsia" },
  { id: "investor_relations", label: "عرض المستثمرين",      icon: TrendingUp,  color: "rose" },
  { id: "orchestrator",       label: "الحزمة النهائية",     icon: Rocket,      color: "orange" },
];

const COLOR_MAP: Record<string, { icon: string; bg: string; border: string; pulse: string }> = {
  cyan:    { icon: "text-cyan-400",    bg: "bg-cyan-500/10",    border: "border-cyan-500/30",    pulse: "bg-cyan-400" },
  indigo:  { icon: "text-indigo-400",  bg: "bg-indigo-500/10",  border: "border-indigo-500/30",  pulse: "bg-indigo-400" },
  emerald: { icon: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", pulse: "bg-emerald-400" },
  violet:  { icon: "text-violet-400",  bg: "bg-violet-500/10",  border: "border-violet-500/30",  pulse: "bg-violet-400" },
  amber:   { icon: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/30",   pulse: "bg-amber-400" },
  fuchsia: { icon: "text-fuchsia-400", bg: "bg-fuchsia-500/10", border: "border-fuchsia-500/30", pulse: "bg-fuchsia-400" },
  rose:    { icon: "text-rose-400",    bg: "bg-rose-500/10",    border: "border-rose-500/30",    pulse: "bg-rose-400" },
  orange:  { icon: "text-orange-400",  bg: "bg-orange-500/10",  border: "border-orange-500/30",  pulse: "bg-orange-400" },
};

const IDEA_EXAMPLES = [
  "تطبيق توصيل أدوية من الصيدليات في القاهرة خلال 30 دقيقة",
  "منصة SaaS لإدارة المطاعم والمخازن تجمع POS مع المحاسبة",
  "خدمة تنظيف منازل بالاشتراك الشهري في المدن المصرية الكبرى",
  "تطبيق تعليمي للأطفال يعلّم البرمجة باللغة العربية",
  "منصة للحرفيين المصريين لبيع منتجاتهم اليدوية محلياً ودولياً",
];

export default function LaunchpadPage() {
  const { user } = useAuth();
  const [idea, setIdea] = useState("");
  const [runId, setRunId] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [run, setRun] = useState<Record<string, any> | null>(null);
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const charCount = idea.length;

  async function launch() {
    if (!idea.trim() || running) return;
    setRunning(true);
    setRun(null);
    setRunId(null);
    try {
      const token = user ? await user.getIdToken().catch(() => null) : null;
      const r = await fetch("/api/launchpad", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ idea }),
      });
      const j = await r.json();
      setRunId(j.runId);
      setRun(j);
    } catch {
      toast.error("حدث خطأ أثناء الإطلاق. يرجى المحاولة مرة أخرى.");
    } finally {
      setRunning(false);
    }
  }

  useEffect(() => {
    if (!runId || run?.bundle) return;
    const t = setInterval(async () => {
      try {
        const r = await fetch(`/api/launchpad?runId=${runId}`);
        const j = await r.json();
        if (j.run) setRun(j.run);
        if (j.run?.status === "completed") clearInterval(t);
      } catch { /* silent */ }
    }, 2500);
    return () => clearInterval(t);
  }, [runId, run]);

  const lastPct = run?.lastProgress?.pct ?? (run?.bundle ? 100 : 0);
  const lastStageId = run?.lastProgress?.stage;
  const lastStageIdx = STAGES.findIndex((s) => s.id === lastStageId);
  const isCompleted = run?.bundle || run?.status === "completed";

  async function copyBundle() {
    if (!run?.bundle) return;
    await navigator.clipboard.writeText(JSON.stringify(run.bundle, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("تم نسخ الحزمة الكاملة");
  }

  return (
    <AppShell>
      <div dir="rtl" className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
              <span className="text-xs text-orange-400 font-semibold uppercase tracking-widest">منصة الإطلاق</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-1">
              حوّل <span className="brand-gradient-text">فكرتك</span> إلى مشروع حقيقي
            </h1>
            <p className="text-neutral-400 text-sm">
              8 وكلاء متخصصون يعملون معاً على تحليل فكرتك وبناء حزمة إطلاق كاملة
            </p>
          </div>
          <Link href="/workflows-runner"
            className="hidden md:flex items-center gap-2 text-sm text-neutral-400 hover:text-white border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl transition-all"
          >
            سير العمل <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Input Section */}
        <div className="glass-panel rounded-3xl p-6 mb-6 relative overflow-hidden">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-orange-600/8 rounded-full blur-3xl pointer-events-none" />
          <div className="relative">
            <label className="block text-sm font-semibold text-white mb-3">
              <Sparkles className="w-4 h-4 text-orange-400 inline ml-1.5" />
              اكتب فكرة مشروعك بكل تفاصيلها
            </label>
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="مثال: تطبيق جوال يربط الأطباء بالمرضى في الريف المصري للاستشارات عن بُعد مقابل 30 جنيه للاستشارة..."
              rows={4}
              disabled={running}
              className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3.5 text-white placeholder-neutral-600 outline-none focus:border-orange-400/40 transition-all resize-none text-sm leading-relaxed"
            />
            <div className="flex items-center justify-between mt-2 mb-4">
              <div className="flex flex-wrap gap-1.5">
                {IDEA_EXAMPLES.slice(0, 3).map((ex, i) => (
                  <button key={i} onClick={() => setIdea(ex)}
                    className="text-[11px] text-neutral-500 hover:text-neutral-200 bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] px-2.5 py-1 rounded-lg transition-all"
                  >
                    مثال {i + 1}
                  </button>
                ))}
              </div>
              <span className={cn("text-xs", charCount > 500 ? "text-rose-400" : "text-neutral-600")}>
                {charCount}/500
              </span>
            </div>
            <button
              onClick={launch}
              disabled={running || !idea.trim() || charCount > 500}
              className={cn(
                "w-full flex items-center justify-center gap-3 font-bold py-4 rounded-2xl text-base transition-all",
                idea.trim() && !running ? "btn-primary" : "bg-white/5 text-neutral-600 border border-white/10 cursor-not-allowed"
              )}
            >
              {running ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> الوكلاء يعملون على فكرتك...</>
              ) : (
                <><Rocket className="w-5 h-5" /> إطلاق تحليل المشروع</>
              )}
            </button>
          </div>
        </div>

        {/* Progress Section */}
        <AnimatePresence>
          {runId && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel rounded-3xl p-6 mb-6"
            >
              {/* Progress bar */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-400" />
                  تقدم التحليل
                </h3>
                <span className="text-sm font-bold text-orange-400">{Math.round(lastPct)}%</span>
              </div>
              <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden mb-6">
                <motion.div
                  animate={{ width: `${lastPct}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-orange-400 via-fuchsia-500 to-indigo-500 rounded-full"
                />
              </div>

              {/* Stages grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {STAGES.map((stage, idx) => {
                  const colors = COLOR_MAP[stage.color];
                  const Icon = stage.icon;
                  const isDone = isCompleted || idx < lastStageIdx;
                  const isActive = stage.id === lastStageId && !isCompleted;
                  const isPending = !isDone && !isActive;

                  return (
                    <div key={stage.id}
                      className={cn(
                        "rounded-2xl border p-3 transition-all",
                        isDone ? `${colors.bg} ${colors.border}` :
                        isActive ? `${colors.bg} ${colors.border} ring-1 ring-${stage.color}-400/30` :
                        "bg-white/[0.02] border-white/[0.05]"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className={cn(
                          "w-6 h-6 rounded-lg flex items-center justify-center",
                          isDone ? colors.bg : "bg-white/[0.04]"
                        )}>
                          {isDone ? (
                            <CheckCircle2 className={cn("w-4 h-4", colors.icon)} />
                          ) : isActive ? (
                            <Loader2 className={cn("w-4 h-4 animate-spin", colors.icon)} />
                          ) : (
                            <Circle className="w-4 h-4 text-neutral-700" />
                          )}
                        </div>
                        {isActive && (
                          <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", colors.pulse)} />
                        )}
                      </div>
                      <p className={cn(
                        "text-xs font-medium leading-tight",
                        isDone || isActive ? "text-white" : "text-neutral-600"
                      )}>
                        {stage.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Section */}
        <AnimatePresence>
          {isCompleted && run?.bundle && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

              {/* Success banner */}
              <div className="glass-panel rounded-3xl p-5 bg-emerald-500/5 border border-emerald-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">اكتملت حزمة الإطلاق!</p>
                      <p className="text-xs text-emerald-400/80">8 وكلاء أنهوا تحليلهم — الحزمة جاهزة للتنزيل</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={copyBundle}
                      className="flex items-center gap-2 text-sm text-neutral-300 hover:text-white border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl transition-all"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      {copied ? "تم النسخ" : "نسخ"}
                    </button>
                    <button
                      onClick={() => {
                        const blob = new Blob([JSON.stringify(run.bundle, null, 2)], { type: "application/json" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `kalmeron-launch-${Date.now()}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                        toast.success("تم تنزيل الحزمة");
                      }}
                      className="flex items-center gap-2 text-sm btn-primary px-4 py-2 rounded-xl"
                    >
                      <Download className="w-4 h-4" /> تنزيل
                    </button>
                  </div>
                </div>
              </div>

              {/* Bundle sections */}
              {Object.entries(run.bundle as Record<string, unknown>).map(([key, value]) => {
                const stage = STAGES.find((s) => s.id === key || s.label.includes(key));
                const colors = stage ? COLOR_MAP[stage.color] : COLOR_MAP.indigo;
                const Icon = stage?.icon || Sparkles;
                const isOpen = activeSection === key;

                return (
                  <div key={key} className={cn("glass-panel rounded-3xl overflow-hidden border", colors.border)}>
                    <button
                      onClick={() => setActiveSection(isOpen ? null : key)}
                      className="w-full flex items-center justify-between p-5 text-right"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", colors.bg)}>
                          <Icon className={cn("w-4 h-4", colors.icon)} />
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{stage?.label || key}</p>
                          <p className="text-xs text-neutral-500">انقر لعرض التفاصيل</p>
                        </div>
                      </div>
                      <ArrowLeft className={cn("w-4 h-4 text-neutral-500 transition-transform", isOpen && "-rotate-90")} />
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 border-t border-white/[0.06] pt-4">
                            <div className="prose prose-invert prose-sm max-w-none text-neutral-300 leading-relaxed text-sm">
                              <ReactMarkdown>{String(value)}</ReactMarkdown>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}

              {/* Next steps */}
              <div className="glass-panel rounded-3xl p-6">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" /> الخطوات التالية المقترحة
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { icon: Brain, href: "/ideas/analyze", label: "تحليل أعمق للفكرة", color: "cyan" },
                    { icon: DollarSign, href: "/investor", label: "حضّر للمستثمرين", color: "emerald" },
                    { icon: RefreshCw, href: "/workflows-runner", label: "ابدأ سير عمل متخصص", color: "indigo" },
                  ].map((item) => {
                    const c = COLOR_MAP[item.color];
                    const ItemIcon = item.icon;
                    return (
                      <Link key={item.href} href={item.href}
                        className={cn("flex items-center gap-3 rounded-2xl border p-4 transition-all hover:border-opacity-50", c.bg, c.border)}
                      >
                        <ItemIcon className={cn("w-5 h-5", c.icon)} />
                        <span className="text-sm font-semibold text-white">{item.label}</span>
                        <ArrowLeft className="w-4 h-4 text-neutral-500 mr-auto" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state with capabilities */}
        {!runId && !running && (
          <div className="glass-panel rounded-3xl p-6">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" /> ماذا تشمل حزمة الإطلاق؟
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {STAGES.map((stage) => {
                const colors = COLOR_MAP[stage.color];
                const Icon = stage.icon;
                return (
                  <div key={stage.id} className={cn("rounded-2xl border p-4 text-center", colors.bg, colors.border)}>
                    <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-2", colors.bg)}>
                      <Icon className={cn("w-4 h-4", colors.icon)} />
                    </div>
                    <p className="text-xs font-semibold text-white">{stage.label}</p>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-neutral-500 text-center mt-4">
              كل وكيل يعمل باستقلالية ثم تُجمَع النتائج في حزمة واحدة قابلة للتنزيل
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { AppShell } from "@/components/layout/AppShell";
import {
  Calculator, TrendingUp, Clock, DollarSign, Zap, CheckCircle2,
  ArrowLeft, Sparkles, Users, BarChart3, Coins, Target, Rocket,
  Shield, Brain,
} from "lucide-react";
import { cn } from "@/lib/utils";

function formatEGP(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} مليون ج.م`;
  if (n >= 1_000) return `${Math.round(n / 1_000).toLocaleString("ar-EG")} ألف ج.م`;
  return `${Math.round(n).toLocaleString("ar-EG")} ج.م`;
}

const CONSULTANT_RATES: Record<string, number> = {
  idea: 5000,
  cfo: 8000,
  legal: 7000,
  market: 6000,
  strategy: 10000,
};

const TASK_TIME: Record<string, { consultant: number; kalmeron: number; label: string }> = {
  businessPlan: { consultant: 14, kalmeron: 0.5, label: "خطة عمل كاملة" },
  marketResearch: { consultant: 7, kalmeron: 0.25, label: "بحث سوقي" },
  financialModel: { consultant: 10, kalmeron: 0.33, label: "نموذج مالي" },
  pitchDeck: { consultant: 5, kalmeron: 0.2, label: "عرض تقديمي للمستثمرين" },
  legalDocs: { consultant: 21, kalmeron: 0.5, label: "وثائق قانونية" },
  competitorAnalysis: { consultant: 7, kalmeron: 0.25, label: "تحليل المنافسين" },
};

const STAGES = [
  { id: "idea", label: "فكرة", desc: "أبحث عن التحقق من فكرتي" },
  { id: "mvp", label: "MVP", desc: "أبني نموذجاً أولياً" },
  { id: "launch", label: "إطلاق", desc: "أطلقت وأبحث عن نمو" },
  { id: "growth", label: "توسع", desc: "شركة قائمة تبحث عن Scale" },
];

const TASKS_NEEDED = [
  { id: "businessPlan", label: "خطة عمل", icon: "📋" },
  { id: "marketResearch", label: "بحث سوقي", icon: "🔍" },
  { id: "financialModel", label: "نموذج مالي", icon: "📊" },
  { id: "pitchDeck", label: "عرض للمستثمر", icon: "🎯" },
  { id: "legalDocs", label: "وثائق قانونية", icon: "⚖️" },
  { id: "competitorAnalysis", label: "تحليل منافسين", icon: "🏆" },
];

export default function ROICalculatorPage() {
  const [stage, setStage] = useState("idea");
  const [selectedTasks, setSelectedTasks] = useState<string[]>(["businessPlan", "marketResearch"]);
  const [teamSize, setTeamSize] = useState(2);
  const [monthlyHours, setMonthlyHours] = useState(40);

  const toggleTask = (id: string) => {
    setSelectedTasks(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  const results = useMemo(() => {
    const tasksData = selectedTasks.map(t => TASK_TIME[t]).filter(Boolean);
    const totalConsultantDays = tasksData.reduce((s, t) => s + t.consultant, 0);
    const totalKalmeronHours = tasksData.reduce((s, t) => s + t.kalmeron * 24, 0);
    const totalKalmeronRealHours = tasksData.reduce((s, t) => s + t.kalmeron, 0);

    const consultantCost = selectedTasks.reduce((s, t) => {
      const base = CONSULTANT_RATES[t] || 5000;
      return s + base;
    }, 0) * Math.ceil(totalConsultantDays / 7);

    const kalmeronPlanCost = 499;
    const timeSavedDays = Math.round(totalConsultantDays - totalKalmeronRealHours / 24);
    const savings = consultantCost - kalmeronPlanCost;
    const savingsPct = Math.round((savings / consultantCost) * 100);
    const speedMultiplier = Math.round(totalConsultantDays / Math.max(totalKalmeronRealHours / 24, 0.1));
    const founderHoursSaved = monthlyHours * teamSize * 0.6;
    const founderValueRecovered = founderHoursSaved * 200;

    return {
      consultantCost,
      kalmeronPlanCost,
      savings,
      savingsPct,
      timeSavedDays,
      speedMultiplier,
      founderHoursSaved: Math.round(founderHoursSaved),
      founderValueRecovered: Math.round(founderValueRecovered),
      totalConsultantDays,
      totalKalmeronHours: Math.round(totalKalmeronRealHours * 60),
    };
  }, [selectedTasks, teamSize, monthlyHours]);

  return (
    <AppShell>
      <div dir="rtl" className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="w-4 h-4 text-brand-cyan" />
            <span className="text-xs text-brand-cyan font-medium uppercase tracking-wide">ROI Calculator</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-1.5">حاسبة العائد على الاستثمار</h1>
          <p className="text-text-secondary max-w-xl">
            احسب كم ستوفر من الوقت والمال باستخدام كلميرون بدل مستشارين تقليديين أو عمل يدوي.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Inputs */}
          <div className="lg:col-span-3 space-y-5">
            {/* Stage */}
            <div className="glass-panel rounded-2xl p-5">
              <h3 className="font-bold text-white mb-3 text-sm">مرحلة مشروعك</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {STAGES.map((s) => (
                  <button key={s.id} onClick={() => setStage(s.id)}
                    className={cn(
                      "p-3 rounded-xl border text-right transition-all",
                      stage === s.id
                        ? "bg-indigo-500/15 border-indigo-400/40 text-white"
                        : "bg-white/[0.03] border-white/[0.07] text-neutral-300 hover:bg-white/[0.06]"
                    )}
                  >
                    <div className="font-bold text-sm">{s.label}</div>
                    <div className="text-[10px] text-neutral-500 mt-0.5 leading-tight">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tasks */}
            <div className="glass-panel rounded-2xl p-5">
              <h3 className="font-bold text-white mb-1 text-sm">المهام التي تحتاجها</h3>
              <p className="text-xs text-text-secondary mb-3">اختر كل المهام التي ستُنجزها مع كلميرون</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {TASKS_NEEDED.map((task) => {
                  const isSelected = selectedTasks.includes(task.id);
                  return (
                    <button key={task.id} onClick={() => toggleTask(task.id)}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-xl border text-right transition-all",
                        isSelected
                          ? "bg-cyan-500/10 border-cyan-500/30 text-white"
                          : "bg-white/[0.03] border-white/[0.07] text-neutral-300 hover:bg-white/[0.06]"
                      )}
                    >
                      <span className="text-lg">{task.icon}</span>
                      <span className="text-xs font-medium">{task.label}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mr-auto shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Team & Hours */}
            <div className="glass-panel rounded-2xl p-5">
              <h3 className="font-bold text-white mb-4 text-sm">تفاصيل فريقك</h3>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-neutral-400">عدد المؤسسين</span>
                    <span className="text-white font-bold">{teamSize} مؤسسين</span>
                  </div>
                  <input type="range" min={1} max={10} value={teamSize} onChange={(e) => setTeamSize(+e.target.value)}
                    className="w-full h-1.5 rounded-full cursor-pointer appearance-none bg-white/10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-neutral-400">ساعات المهام/الشهر</span>
                    <span className="text-white font-bold">{monthlyHours} ساعة</span>
                  </div>
                  <input type="range" min={10} max={200} step={10} value={monthlyHours} onChange={(e) => setMonthlyHours(+e.target.value)}
                    className="w-full h-1.5 rounded-full cursor-pointer appearance-none bg-white/10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Results */}
          <div className="lg:col-span-2 space-y-4">
            {/* Main Savings Card */}
            <motion.div
              key={results.savings}
              initial={{ scale: 0.97 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
              className="glass-panel rounded-3xl p-6 border-emerald-500/30 bg-emerald-500/[0.03] text-center"
            >
              <div className="text-xs text-emerald-400 font-medium mb-2 uppercase tracking-wide">ستوفر</div>
              <div className="font-display text-4xl font-extrabold text-emerald-400 mb-1">
                {formatEGP(results.savings)}
              </div>
              <div className="text-xs text-text-secondary">توفير {results.savingsPct}% مقارنة بالمستشارين</div>

              <div className="mt-4 pt-4 border-t border-white/[0.06] grid grid-cols-2 gap-3 text-center">
                <div>
                  <div className="font-display text-xl font-extrabold text-cyan-400">{results.speedMultiplier}x</div>
                  <div className="text-[10px] text-text-secondary">أسرع</div>
                </div>
                <div>
                  <div className="font-display text-xl font-extrabold text-violet-400">{results.founderHoursSaved}h</div>
                  <div className="text-[10px] text-text-secondary">ساعة مُسترجعة/شهر</div>
                </div>
              </div>
            </motion.div>

            {/* Breakdown */}
            <div className="space-y-2.5">
              {[
                { label: "تكلفة المستشارين التقليديين", value: formatEGP(results.consultantCost), color: "rose", icon: Users },
                { label: "تكلفة كلميرون Pro", value: formatEGP(results.kalmeronPlanCost), color: "emerald", icon: Sparkles },
                { label: "وقت المستشار", value: `${results.totalConsultantDays} يوماً`, color: "amber", icon: Clock },
                { label: "وقت كلميرون", value: `${results.totalKalmeronHours} دقيقة`, color: "cyan", icon: Zap },
                { label: "قيمة وقت الفريق المُسترجع", value: formatEGP(results.founderValueRecovered), color: "violet", icon: Brain },
              ].map((row) => {
                const Icon = row.icon;
                const colorMap: Record<string, string> = {
                  rose: "text-rose-400", emerald: "text-emerald-400", amber: "text-amber-400",
                  cyan: "text-cyan-400", violet: "text-violet-400",
                };
                return (
                  <div key={row.label} className="flex items-center justify-between glass-panel rounded-xl px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <Icon className={cn("w-3.5 h-3.5", colorMap[row.color])} />
                      <span className="text-xs text-neutral-300">{row.label}</span>
                    </div>
                    <span className={cn("text-xs font-bold", colorMap[row.color])}>{row.value}</span>
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <Link href="/pricing"
              className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm"
            >
              <Rocket className="w-4 h-4" />
              ابدأ وحقق هذا التوفير الآن
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <Link href="/chat?q=ساعدني أحسب العائد على الاستثمار لاشتراكي في كلميرون"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-xs text-brand-cyan hover:text-white transition-colors border border-brand-cyan/20 hover:border-brand-cyan/40"
            >
              <Calculator className="w-3.5 h-3.5" />
              احسب ROI مخصص لمشروعي
            </Link>
          </div>
        </div>

        {/* Comparison table */}
        <div className="glass-panel rounded-3xl p-6">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-brand-cyan" />
            مقارنة زمن الإنجاز لكل مهمة
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-right py-2 pr-2 text-neutral-400 font-medium">المهمة</th>
                  <th className="text-center py-2 text-rose-400 font-medium">مستشار تقليدي</th>
                  <th className="text-center py-2 text-cyan-400 font-medium">كلميرون</th>
                  <th className="text-center py-2 text-emerald-400 font-medium">التوفير</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(TASK_TIME).map(([key, val]) => {
                  const isSelected = selectedTasks.includes(key);
                  return (
                    <tr key={key} className={cn("border-b border-white/[0.04]", isSelected && "bg-cyan-500/5")}>
                      <td className="py-2.5 pr-2">
                        <div className="flex items-center gap-1.5">
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                          <span className={isSelected ? "text-white" : "text-neutral-500"}>{val.label}</span>
                        </div>
                      </td>
                      <td className="text-center py-2.5 text-rose-400 font-mono text-xs">{val.consultant} يوم</td>
                      <td className="text-center py-2.5 text-cyan-400 font-mono text-xs">{Math.round(val.kalmeron * 60)} دقيقة</td>
                      <td className="text-center py-2.5">
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                          {Math.round((1 - val.kalmeron / val.consultant) * 100)}% أسرع
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

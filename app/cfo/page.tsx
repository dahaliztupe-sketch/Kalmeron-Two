"use client";

import { useState, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { motion } from "motion/react";
import Link from "next/link";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ComposedChart, Bar, Line,
} from "recharts";
import { DocumentUploader } from "@/components/rag/DocumentUploader";
import {
  BarChart3, TrendingUp, TrendingDown, Wallet, Calculator,
  Sparkles, ArrowLeft, Lightbulb, Zap,
  Target, PiggyBank, AlertTriangle,
} from "lucide-react";
import { cn } from "@/src/lib/utils";

function formatEGP(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M ج.م`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K ج.م`;
  return `${n.toLocaleString("ar-EG")} ج.م`;
}

const QUICK_INSIGHTS = [
  { q: "كيف أحسّن هامش ربحي الصافي؟", icon: TrendingUp },
  { q: "حلل وضع Cash Flow بتاعي وأخبرني المخاطر", icon: AlertTriangle },
  { q: "ما هو أفضل توقيت لجولة تمويل جديدة؟", icon: Target },
  { q: "كيف أخفض تكاليف التشغيل بدون التأثير على الجودة؟", icon: PiggyBank },
];

export default function CFODashboard() {
  const [monthlyRevenue, setMonthlyRevenue] = useState(25000);
  const [growthRate, setGrowthRate] = useState(15);
  const [expenseRatio, setExpenseRatio] = useState(65);
  const [months, setMonths] = useState(12);

  const projections = useMemo(() => {
    const data = [];
    let rev = monthlyRevenue;
    for (let i = 0; i < months; i++) {
      const expenses = rev * (expenseRatio / 100);
      const profit = rev - expenses;
      const MONTH_NAMES_AR = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
      data.push({
        month: MONTH_NAMES_AR[i % 12],
        revenue: Math.round(rev),
        expenses: Math.round(expenses),
        profit: Math.round(profit),
      });
      rev = rev * (1 + growthRate / 100);
    }
    return data;
  }, [monthlyRevenue, growthRate, expenseRatio, months]);

  const totalRevenue = projections.reduce((s, r) => s + r.revenue, 0);
  const totalExpenses = projections.reduce((s, r) => s + r.expenses, 0);
  const totalProfit = projections.reduce((s, r) => s + r.profit, 0);
  const profitMargin = ((totalProfit / totalRevenue) * 100).toFixed(1);
  const _runway = Math.ceil((monthlyRevenue * (expenseRatio / 100)) > 0 ? 12 / (growthRate / 100 + 0.001) : Infinity);

  const breakEvenMonth = projections.findIndex(p => p.profit > 0);

  return (
    <AppShell>
      <div dir="rtl" className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-emerald-400 font-medium uppercase tracking-wide">CFO Intelligence</span>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-1.5">
                المدير المالي الذكي
              </h1>
              <p className="text-text-secondary max-w-xl">
                نماذج مالية تفاعلية ومتوقعات نقدية — عدّل الأرقام وشاهد مستقبلك المالي فوراً.
              </p>
            </div>
            <Link href="/chat?q=حلّل وضعي المالي وأخبرني المخاطر والفرص"
              className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shrink-0"
            >
              <Sparkles className="w-4 h-4" /> استشر المدير المالي
            </Link>
          </div>
        </motion.div>

        {/* Interactive Inputs */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-panel rounded-3xl p-6 border-emerald-500/20 bg-emerald-500/[0.02]"
        >
          <div className="flex items-center gap-2 mb-5">
            <Calculator className="w-4 h-4 text-emerald-400" />
            <h2 className="font-bold text-white">أدخل بيانات مشروعك</h2>
            <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">يُحدَّث فوراً</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <SliderInput
              label="إيراد الشهر الأول"
              value={monthlyRevenue}
              onChange={setMonthlyRevenue}
              min={1000} max={500000} step={1000}
              display={formatEGP(monthlyRevenue)}
              color="emerald"
            />
            <SliderInput
              label="نسبة النمو الشهري"
              value={growthRate}
              onChange={setGrowthRate}
              min={0} max={100} step={1}
              display={`${growthRate}%`}
              color="cyan"
            />
            <SliderInput
              label="نسبة المصروفات"
              value={expenseRatio}
              onChange={setExpenseRatio}
              min={10} max={150} step={5}
              display={`${expenseRatio}%`}
              color={expenseRatio > 100 ? "rose" : expenseRatio > 80 ? "amber" : "teal"}
            />
            <SliderInput
              label="عدد الأشهر"
              value={months}
              onChange={setMonths}
              min={3} max={36} step={3}
              display={`${months} شهراً`}
              color="violet"
            />
          </div>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "إجمالي الإيرادات", value: formatEGP(totalRevenue), icon: TrendingUp, color: "emerald", trend: `+${growthRate}% شهرياً` },
            { label: "إجمالي المصروفات", value: formatEGP(totalExpenses), icon: TrendingDown, color: "rose", trend: `${expenseRatio}% من الإيراد` },
            { label: "صافي الأرباح", value: formatEGP(totalProfit), icon: Wallet, color: totalProfit > 0 ? "emerald" : "rose", trend: `هامش ${profitMargin}%` },
            { label: "Break-even", value: breakEvenMonth >= 0 ? `شهر ${breakEvenMonth + 1}` : "لم يبدأ بعد", icon: Target, color: "amber", trend: "نقطة التعادل" },
          ].map((kpi, i) => {
            const Icon = kpi.icon;
            const colorMap: Record<string, string> = {
              emerald: "text-emerald-400 bg-emerald-500/10",
              rose: "text-rose-400 bg-rose-500/10",
              amber: "text-amber-400 bg-amber-500/10",
              cyan: "text-cyan-400 bg-cyan-500/10",
            };
            return (
              <motion.div key={kpi.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="glass-panel rounded-2xl p-4"
              >
                <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center mb-2", colorMap[kpi.color] || colorMap.emerald)}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className={cn("font-display text-xl font-extrabold mb-0.5", kpi.color === "emerald" ? "text-emerald-400" : kpi.color === "rose" ? "text-rose-400" : kpi.color === "amber" ? "text-amber-400" : "text-white")}>
                  {kpi.value}
                </div>
                <div className="text-[11px] text-text-secondary">{kpi.label}</div>
                <div className="text-[10px] text-neutral-600 mt-0.5">{kpi.trend}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Cash Flow Chart */}
          <div className="glass-panel rounded-3xl p-5">
            <h3 className="font-bold text-white mb-1.5 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              توقعات التدفق النقدي
            </h3>
            <p className="text-xs text-text-secondary mb-4">الإيرادات والأرباح خلال {months} شهراً</p>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projections} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#38BDF8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                  <XAxis dataKey="month" stroke="#555" tick={{ fill: "#666", fontSize: 10 }} />
                  <YAxis stroke="#555" tick={{ fill: "#666", fontSize: 10 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
                  <Tooltip contentStyle={{ backgroundColor: "#0B1020", borderColor: "#ffffff15", borderRadius: 12, color: "#fff", fontSize: 12 }}
                    formatter={(v: number) => [formatEGP(v)]} />
                  <Area type="monotone" dataKey="revenue" name="الإيراد" stroke="#10B981" strokeWidth={2} fill="url(#revGrad)" />
                  <Area type="monotone" dataKey="profit" name="الربح" stroke="#38BDF8" strokeWidth={2} fill="url(#profGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Rev vs Expenses */}
          <div className="glass-panel rounded-3xl p-5">
            <h3 className="font-bold text-white mb-1.5 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-400" />
              إيرادات مقابل مصروفات
            </h3>
            <p className="text-xs text-text-secondary mb-4">هيكل التكاليف والنمو الشهري</p>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={projections} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                  <XAxis dataKey="month" stroke="#555" tick={{ fill: "#666", fontSize: 10 }} />
                  <YAxis stroke="#555" tick={{ fill: "#666", fontSize: 10 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
                  <Tooltip contentStyle={{ backgroundColor: "#0B1020", borderColor: "#ffffff15", borderRadius: 12, color: "#fff", fontSize: 12 }}
                    formatter={(v: number) => [formatEGP(v)]} />
                  <Bar dataKey="revenue" name="الإيراد" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  <Line type="monotone" dataKey="expenses" name="المصروفات" stroke="#F87171" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* AI Quick Insights */}
        <div>
          <h2 className="text-sm font-semibold text-neutral-400 mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" /> اسأل المدير المالي سؤالاً محدداً
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {QUICK_INSIGHTS.map((item, _i) => {
              const Icon = item.icon;
              return (
                <Link key={item.q} href={`/chat?q=${encodeURIComponent(item.q)}`}
                  className="flex items-center gap-3 p-4 rounded-2xl border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/15 transition-all group"
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-amber-400" />
                  </div>
                  <span className="text-sm text-neutral-200 group-hover:text-white transition-colors text-right flex-1">{item.q}</span>
                  <ArrowLeft className="w-4 h-4 text-neutral-600 shrink-0 group-hover:text-white group-hover:translate-x-[-3px] transition-all" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Document Upload */}
        <div className="glass-panel rounded-3xl p-6">
          <h3 className="font-bold text-white mb-1.5 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            اربط مستنداتك المالية الحقيقية
          </h3>
          <p className="text-text-secondary text-sm mb-5">
            ارفع كشوفك البنكية أو الميزانيات أو الفواتير ليستخدمها المدير المالي الذكي في تحليل مخصص لمشروعك.
          </p>
          <DocumentUploader title="مستنداتك المالية (PDF, Excel, صور)" />
        </div>
      </div>
    </AppShell>
  );
}

function SliderInput({ label, value, onChange, min, max, step, display, color }: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; step: number; display: string; color: string;
}) {
  const colorMap: Record<string, string> = {
    emerald: "text-emerald-400",
    cyan: "text-cyan-400",
    rose: "text-rose-400",
    amber: "text-amber-400",
    teal: "text-teal-400",
    violet: "text-violet-400",
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs text-neutral-400">{label}</label>
        <span className={cn("font-display font-bold text-sm", colorMap[color] || "text-white")}>{display}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full outline-none cursor-pointer appearance-none bg-white/10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer"
      />
      <div className="flex justify-between text-[9px] text-neutral-700">
        <span>{typeof min === "number" && min >= 1000 ? formatEGP(min) : `${min}`}</span>
        <span>{typeof max === "number" && max >= 1000 ? formatEGP(max) : `${max}`}</span>
      </div>
    </div>
  );
}

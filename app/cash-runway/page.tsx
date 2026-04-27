"use client";

import { useState, useMemo } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { AlertTriangle, Wallet, Calendar, Lightbulb, ArrowLeft, TrendingDown, ShieldCheck, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { calculateRunway } from "@/src/lib/founder-tools/runway";

const STATUS_STYLES = {
  critical: { bg: "from-red-500/20 to-red-900/10", border: "border-red-500/40", text: "text-red-300", label: "🚨 وضع حرج" },
  warning: { bg: "from-amber-500/20 to-amber-900/10", border: "border-amber-500/40", text: "text-amber-300", label: "⚠️ تحت المراقبة" },
  healthy: { bg: "from-emerald-500/15 to-emerald-900/5", border: "border-emerald-500/40", text: "text-emerald-300", label: "✅ صحّي" },
  profitable: { bg: "from-cyan-500/20 to-cyan-900/10", border: "border-cyan-500/40", text: "text-cyan-300", label: "🎉 ربحي" },
} as const;

function fmt(n: number) {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString("ar-EG");
}

export default function CashRunwayPage() {
  const [cash, setCash] = useState(500_000);
  const [revenue, setRevenue] = useState(40_000);
  const [burn, setBurn] = useState(120_000);
  const [growth, setGrowth] = useState(8);

  const result = useMemo(
    () => calculateRunway({ cashOnHand: cash, monthlyRevenue: revenue, monthlyBurn: burn, growthRatePct: growth }),
    [cash, revenue, burn, growth],
  );

  const style = STATUS_STYLES[result.status];

  return (
    <AppShell>
      <div dir="rtl" className="max-w-6xl mx-auto space-y-8 pb-12">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-amber-400 font-medium uppercase tracking-wide">Cash Runway Alarm</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-2">
            تنبيه نزيف النقد
          </h1>
          <p className="text-text-secondary max-w-2xl">
            ٨٢٪ من فشل الستارت أبس بسبب التدفّق النقدي. ادخل أرقامك الحقيقيّة، احصل على تنبيه فوري + توصيات استباقيّة قبل وصولك للصفر.
          </p>
        </motion.div>

        {/* Inputs */}
        <div className="grid md:grid-cols-4 gap-4">
          <InputCard label="السيولة الحاليّة (ج.م)" value={cash} setValue={setCash} step={50_000} icon={<Wallet className="w-4 h-4" />} />
          <InputCard label="الإيراد الشهري (ج.م)" value={revenue} setValue={setRevenue} step={5_000} icon={<Sparkles className="w-4 h-4" />} />
          <InputCard label="الاحتراق الشهري (ج.م)" value={burn} setValue={setBurn} step={10_000} icon={<TrendingDown className="w-4 h-4" />} />
          <InputCard label="معدّل النموّ (٪/شهر)" value={growth} setValue={setGrowth} step={1} icon={<Calendar className="w-4 h-4" />} />
        </div>

        {/* Status Hero */}
        <motion.div
          key={result.status}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`relative overflow-hidden rounded-2xl border ${style.border} bg-gradient-to-br ${style.bg} p-8`}
        >
          <div className="grid md:grid-cols-3 gap-6 items-center">
            <div>
              <div className={`inline-flex items-center gap-2 text-sm font-semibold mb-3 ${style.text}`}>
                {style.label}
              </div>
              <div className="text-5xl md:text-6xl font-black text-white mb-1">{result.runwayLabel}</div>
              <div className="text-sm text-neutral-400 mt-2">
                {result.zeroDate
                  ? `تاريخ الوصول للصفر: ${result.zeroDate.toLocaleDateString("ar-EG", { year: "numeric", month: "long" })}`
                  : "لا توجد نقطة وصول للصفر — أنت ربحي."}
              </div>
            </div>
            <div className="space-y-2">
              <Stat label="الاحتراق الصافي" value={`${fmt(result.netBurn)} ج/شهر`} red={result.netBurn > 0} />
              <Stat label="نسبة التغطية بالإيراد" value={`${((revenue / Math.max(burn, 1)) * 100).toFixed(0)}٪`} />
              <Stat label="الحدّ الأدنى للأمان" value="٦ أشهر" />
            </div>
            <div className="text-xs text-neutral-300 leading-relaxed bg-black/30 rounded-lg p-4 border border-white/5">
              <strong className="text-white block mb-2">قاعدة الأمان:</strong>
              ينصح المستثمرون بالاحتفاظ بـ <strong>٦ أشهر</strong> من السيولة على الأقلّ في كل وقت.
              تحت ٣ أشهر = حالة طوارئ. تحت شهرين = إعلان أو إغلاق.
            </div>
          </div>
        </motion.div>

        {/* Chart */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <h2 className="text-lg font-bold text-white mb-4">توقّع السيولة على المدى الزمني</h2>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={result.projection}>
              <defs>
                <linearGradient id="cashGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="month" stroke="#ffffff80" tick={{ fill: "#ffffff80", fontSize: 12 }} reversed />
              <YAxis stroke="#ffffff80" tick={{ fill: "#ffffff80", fontSize: 12 }} tickFormatter={fmt} />
              <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "الصفر", fill: "#ef4444", position: "right" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0a0d14", border: "1px solid #ffffff20", borderRadius: 8 }}
                formatter={((v: number) => [`${fmt(v)} ج`, "السيولة"]) as never}
                labelFormatter={(l) => `الشهر ${l}`}
              />
              <Area type="monotone" dataKey="cash" stroke="#06b6d4" fillOpacity={1} fill="url(#cashGradient)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recommendations */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">توصيات استباقيّة لوضعك الحالي</h2>
          </div>
          <ul className="space-y-3">
            {result.recommendations.map((r, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-black/30 border border-white/5"
              >
                <span className="text-amber-400 mt-1 flex-shrink-0">●</span>
                <span className="text-sm text-neutral-200 leading-relaxed">{r}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/cfo" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-sm transition-colors">
            تحدّث مع المدير المالي للتعمّق <ArrowLeft className="w-4 h-4 icon-flip" />
          </Link>
          <Link href="/founder-agreement" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 text-sm transition-colors">
            بناء اتّفاقيّة مؤسّسين <ArrowLeft className="w-4 h-4 icon-flip" />
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

function InputCard({ label, value, setValue, step, icon }: { label: string; value: number; setValue: (v: number) => void; step: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <label className="flex items-center gap-2 text-xs text-neutral-400 mb-2">
        {icon}
        {label}
      </label>
      <input
        type="number"
        value={value}
        step={step}
        onChange={(e) => setValue(Math.max(0, Number(e.target.value)))}
        className="w-full bg-transparent text-xl font-bold text-white outline-none border-b border-transparent focus:border-cyan-500/50 transition-colors"
      />
    </div>
  );
}

function Stat({ label, value, red }: { label: string; value: string; red?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm border-b border-white/5 pb-1.5">
      <span className="text-neutral-400">{label}</span>
      <span className={`font-bold ${red ? "text-red-300" : "text-white"}`}>{value}</span>
    </div>
  );
}

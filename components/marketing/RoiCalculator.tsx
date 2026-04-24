"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Calculator, TrendingUp, Clock, Sparkles, ArrowLeft } from "lucide-react";

/**
 * RoiCalculator — compact, embeddable widget. Used on `/`, `/compare`, and
 * standalone at `/roi`. P0-2 (QW-3) of the 45-expert business audit.
 *
 * Default assumptions are deliberately conservative: a single-founder SMB
 * replacing 1 financial + 1 legal advisory hour per week with Kalmeron Pro.
 */
export interface RoiCalculatorProps {
  variant?: "compact" | "full";
  className?: string;
  showCta?: boolean;
}

const DEFAULT_HOURLY_RATE = 800; // EGP/hour for a junior consultant
const KALMERON_MONTHLY = 499;     // Pro plan in EGP

function fmtEGP(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} مليون ج.م`;
  if (n >= 1_000)     return `${Math.round(n / 1_000).toLocaleString("ar-EG")} ألف ج.م`;
  return `${Math.round(n).toLocaleString("ar-EG")} ج.م`;
}

export function RoiCalculator({ variant = "compact", className = "", showCta = true }: RoiCalculatorProps) {
  const [hours, setHours] = useState(8);          // hours/month replaced by Kalmeron
  const [rate, setRate] = useState(DEFAULT_HOURLY_RATE);

  const result = useMemo(() => {
    const consultantMonthly = hours * rate;
    const savedMonthly = Math.max(0, consultantMonthly - KALMERON_MONTHLY);
    const savedYearly = savedMonthly * 12;
    const roiPct = consultantMonthly > 0
      ? Math.round(((consultantMonthly - KALMERON_MONTHLY) / KALMERON_MONTHLY) * 100)
      : 0;
    return { consultantMonthly, savedMonthly, savedYearly, roiPct };
  }, [hours, rate]);

  const isFull = variant === "full";

  return (
    <div
      dir="rtl"
      className={`rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-6 md:p-8 ${className}`}
    >
      <div className="flex items-start gap-3 mb-6">
        <div className="rounded-xl bg-emerald-500/15 p-2.5 text-emerald-300">
          <Calculator className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h3 className="text-xl font-bold text-white">احسب توفيرك مع كلميرون</h3>
          <p className="text-neutral-400 text-sm mt-1">قارن تكلفة المستشارين الشهرية بكلميرون Pro (499 ج.م/شهر).</p>
        </div>
      </div>

      <div className={`grid gap-4 ${isFull ? "md:grid-cols-2" : ""}`}>
        <Field
          label="ساعات استشارة شهرياً"
          help="عدد الساعات اللي بتقضيها مع محاسب أو محامي أو مستشار."
          value={hours}
          min={1} max={40} step={1}
          onChange={setHours}
          suffix="ساعة"
        />
        <Field
          label="سعر الساعة الواحدة"
          help="متوسط أسعار المستشارين في القاهرة 600–1500 ج.م/ساعة."
          value={rate}
          min={200} max={3000} step={50}
          onChange={setRate}
          suffix="ج.م"
        />
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <Stat
          label="تكلفة المستشارين/شهر"
          value={fmtEGP(result.consultantMonthly)}
          tone="neutral"
          icon={Clock}
        />
        <Stat
          label="توفيرك السنوي"
          value={fmtEGP(result.savedYearly)}
          tone="positive"
          icon={TrendingUp}
        />
        <Stat
          label="ROI"
          value={`${result.roiPct}%`}
          tone="brand"
          icon={Sparkles}
        />
      </div>

      <p className="text-neutral-500 text-xs mt-4 leading-relaxed">
        هذه أرقام تقديرية — التوفير الفعلي يعتمد على معدل استخدامك. كلميرون لا يعوّض الاستشارة المتخصصة لقرارات
        فوق 50,000 ج.م، لكنه يقلل حاجتك إليها بنسبة كبيرة.
      </p>

      {showCta && (
        <div className="mt-6 flex flex-wrap gap-3 items-center">
          <Link
            href="/auth/signup"
            className="rounded-full bg-gradient-to-l from-cyan-500 to-violet-500 px-6 py-3 text-white font-semibold hover:opacity-90 transition inline-flex items-center gap-2"
          >
            ابدأ مجاناً 14 يوم
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <Link
            href="/roi"
            className="text-cyan-300 text-sm hover:text-white transition inline-flex items-center gap-1"
          >
            احسبها بتفصيل أكبر
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}

function Field({
  label, help, value, min, max, step, onChange, suffix,
}: {
  label: string; help?: string; value: number; min: number; max: number; step: number;
  onChange: (n: number) => void; suffix?: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label className="text-sm font-semibold text-neutral-200">{label}</label>
        <span className="text-cyan-300 text-sm tabular-nums font-bold">
          {value.toLocaleString("ar-EG")} {suffix && <span className="text-neutral-400 text-xs font-normal">{suffix}</span>}
        </span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-cyan-500"
      />
      {help && <p className="text-neutral-500 text-[11px] mt-1.5">{help}</p>}
    </div>
  );
}

function Stat({
  label, value, tone, icon: Icon,
}: {
  label: string; value: string;
  tone: "neutral" | "positive" | "brand";
  icon: React.ComponentType<{ className?: string }>;
}) {
  const styles = {
    neutral:  { v: "text-white",        bg: "bg-white/[0.03]",   bd: "border-white/[0.06]",   ic: "text-neutral-400" },
    positive: { v: "text-emerald-300",  bg: "bg-emerald-500/[0.06]", bd: "border-emerald-500/20", ic: "text-emerald-400" },
    brand:    { v: "text-cyan-200",     bg: "bg-cyan-500/[0.06]",    bd: "border-cyan-500/20",    ic: "text-cyan-300"   },
  }[tone];
  return (
    <div className={`rounded-xl border ${styles.bd} ${styles.bg} p-3`}>
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className={`w-3.5 h-3.5 ${styles.ic}`} />
        <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">{label}</span>
      </div>
      <div className={`text-lg font-bold tabular-nums ${styles.v}`}>{value}</div>
    </div>
  );
}

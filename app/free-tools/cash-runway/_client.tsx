"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  Calculator,
  TrendingDown,
  TrendingUp,
  Sparkles,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Rocket,
} from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import {
  buildRecommendations,
  computeRunway,
  DEFAULT_THRESHOLD_MONTHS,
  fmtMonths,
} from "@/src/lib/runway/calc";
import type { RunwayInputs } from "@/src/lib/runway/types";

const fmtEgp = (n: number) =>
  new Intl.NumberFormat("ar-EG").format(Math.round(n));

const ZERO: RunwayInputs = {
  cashEgp: 0,
  monthlyIncomeEgp: 0,
  monthlyBurnEgp: 0,
  thresholdMonths: DEFAULT_THRESHOLD_MONTHS,
};

export default function PublicRunwayPage() {
  const [inputs, setInputs] = useState<RunwayInputs>(ZERO);

  const result = useMemo(() => computeRunway(inputs), [inputs]);
  const recs = useMemo(
    () => buildRecommendations(inputs, result),
    [inputs, result],
  );

  const hasAnyInput =
    inputs.cashEgp > 0 ||
    inputs.monthlyBurnEgp > 0 ||
    inputs.monthlyIncomeEgp > 0;

  const setField = (field: keyof RunwayInputs, value: number) =>
    setInputs((prev) => ({ ...prev, [field]: value }));

  const toneFor = result.kind;
  const toneStyles = {
    healthy: "from-emerald-500/20 to-cyan-500/10 border-emerald-500/30 text-emerald-300",
    warning: "from-amber-500/20 to-rose-500/10 border-amber-500/30 text-amber-300",
    noCash: "from-rose-500/25 to-rose-700/10 border-rose-500/40 text-rose-300",
    infinite: "from-violet-500/20 to-indigo-500/10 border-violet-500/30 text-violet-300",
    noBurn: "from-neutral-700/30 to-neutral-700/10 border-white/10 text-neutral-300",
  }[toneFor];

  const toneIcon = {
    healthy: <TrendingUp className="w-6 h-6" />,
    warning: <AlertTriangle className="w-6 h-6" />,
    noCash: <AlertTriangle className="w-6 h-6" />,
    infinite: <Sparkles className="w-6 h-6" />,
    noBurn: <Calculator className="w-6 h-6" />,
  }[toneFor];

  const headlineLabel = {
    healthy: "وضع صحّي",
    warning: "تحت العتبة — تحرّك",
    noCash: "النقد قارب على النفاد",
    infinite: "نقدك ينمو",
    noBurn: "أدخل أرقامك للبدء",
  }[toneFor];

  return (
    <div dir="rtl" className="min-h-screen bg-[#0B1020] text-white">
      {/* Top bar */}
      <header className="border-b border-white/5 backdrop-blur-md sticky top-0 z-30 bg-[#0B1020]/80">
        <div className="max-w-5xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between">
          <BrandLogo className="h-7 w-auto" />
          <Link
            href="/auth/signup"
            className="text-xs sm:text-sm font-bold btn-primary px-4 py-2 rounded-full flex items-center gap-2"
          >
            <Rocket className="w-3.5 h-3.5" />
            ابدأ مجاناً
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 md:px-8 py-10 md:py-14">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 mb-5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
          <span className="text-[11px] font-bold text-emerald-200 tracking-wide">
            أداة مجانية — بدون تسجيل
          </span>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-3">
          حاسبة <span className="brand-gradient-text">Cash Runway</span> للشركات
          الناشئة المصرية
        </h1>
        <p className="text-base sm:text-lg text-white/70 leading-[1.8] mb-10">
          ادخل ٣ أرقام، اعرف خلال ثوانٍ كم شهراً يبقى فيها رصيدك — واحصل على ٣
          توصيات فوريّة لإطالة المدّة.
        </p>

        {/* Inputs card */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-7 mb-6"
        >
          <div className="grid sm:grid-cols-3 gap-4">
            <Field
              label="الرصيد الحالي (ج.م)"
              value={inputs.cashEgp}
              onChange={(v) => setField("cashEgp", v)}
              placeholder="مثال: 500000"
            />
            <Field
              label="الدخل الشهري (ج.م)"
              value={inputs.monthlyIncomeEgp}
              onChange={(v) => setField("monthlyIncomeEgp", v)}
              placeholder="مثال: 80000"
            />
            <Field
              label="المصروف الشهري (ج.م)"
              value={inputs.monthlyBurnEgp}
              onChange={(v) => setField("monthlyBurnEgp", v)}
              placeholder="مثال: 150000"
            />
          </div>

          <div className="mt-6 pt-5 border-t border-white/5">
            <label className="block text-xs text-white/60 mb-2">
              نبّهني عند هبوط الـ runway تحت{" "}
              <strong className="text-white">{inputs.thresholdMonths}</strong>{" "}
              شهر
            </label>
            <input
              type="range"
              min={1}
              max={24}
              step={1}
              value={inputs.thresholdMonths}
              onChange={(e) => setField("thresholdMonths", Number(e.target.value))}
              className="w-full accent-indigo-400"
              aria-label="Threshold months"
            />
          </div>
        </motion.section>

        {/* Result card */}
        <motion.section
          key={result.kind + String(result.months)}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl border bg-gradient-to-br ${toneStyles} p-5 md:p-7 mb-6`}
        >
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              {toneIcon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1">
                {headlineLabel}
              </div>
              <div className="text-2xl md:text-3xl font-extrabold text-white leading-tight">
                {result.kind === "noBurn"
                  ? "—"
                  : result.kind === "noCash"
                    ? "0 شهر"
                    : `تبقّى ${fmtMonths(result.months)}`}
              </div>
              {result.kind !== "noBurn" && (
                <div className="text-sm text-white/70 mt-2">
                  بمعدّل صافي حرق {fmtEgp(Math.max(0, inputs.monthlyBurnEgp - inputs.monthlyIncomeEgp))} ج.م/شهر
                </div>
              )}
            </div>
          </div>
        </motion.section>

        {/* Recommendations */}
        {hasAnyInput && recs.length > 0 && (
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-7 mb-8">
            <h2 className="font-bold text-lg text-white mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-300" />
              ٣ خطوات مقترحة الآن
            </h2>
            <ol className="space-y-3 list-none">
              {recs.slice(0, 3).map((r, i) => (
                <li key={r.id} className="flex gap-3">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-sm flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div>
                    <div className="font-bold text-white text-sm">{r.title}</div>
                    <div className="text-sm text-white/70 leading-relaxed mt-0.5">
                      {r.body}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Sign-up CTA — the value escalation */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/15 to-fuchsia-500/10 p-6 md:p-8"
        >
          <div className="flex items-center gap-2 text-indigo-200 text-xs font-bold uppercase tracking-wide mb-3">
            <Lock className="w-4 h-4" />
            خاصية مجانية إضافيّة عند التسجيل
          </div>
          <h3 className="font-display text-xl md:text-2xl font-extrabold text-white mb-2 leading-tight">
            تنبيه يومي بالبريد عند هبوط رصيدك تحت العتبة
          </h3>
          <p className="text-white/75 leading-relaxed text-sm md:text-base mb-5">
            احفظ أرقامك مرّة واحدة، وسنتابعها يوميّاً. حين ينزل الـ runway تحت{" "}
            {inputs.thresholdMonths} شهر، يصلك بريد بالعربية بـ ٣ خطوات عمليّة
            تستطيع تنفيذها فوراً. مجاناً، ضمن الباقة الأساسيّة.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/auth/signup?next=${encodeURIComponent("/cash-runway")}`}
              className="btn-primary px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2"
            >
              فعّل التنبيه مجاناً <ArrowLeft className="w-4 h-4" />
            </Link>
            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl border border-white/15 text-white/80 hover:bg-white/5 text-sm font-bold flex items-center gap-2"
            >
              تعرّف على كلميرون
            </Link>
          </div>
        </motion.section>

        {/* Trust footer */}
        <p className="text-center text-xs text-white/40 mt-10">
          أرقامك لا تُرسل لأيّ خادم في هذه الصفحة — تُحسب محليّاً في متصفّحك.
        </p>
      </main>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs text-white/60 mb-1.5">{label}</span>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        value={value || ""}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
        placeholder={placeholder}
        className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-400/50 focus:bg-white/[0.07] transition-colors text-base"
      />
    </label>
  );
}

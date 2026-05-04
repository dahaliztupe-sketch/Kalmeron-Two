"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import {
  Calculator,
  TrendingDown,
  TrendingUp,
  Sparkles,
  ArrowLeft,
  AlertTriangle,
  BellRing,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useRunwaySnapshot } from "@/hooks/useRunwaySnapshot";
import { fmtMonths } from "@/src/lib/runway/calc";

const fmt = (n: number) => new Intl.NumberFormat("ar-EG").format(Math.round(n));

export default function CashRunwayPage() {
  const t = useTranslations("CashRunway");
  const {
    inputs,
    result,
    recommendations,
    loading,
    saving,
    hasSnapshot,
    setInputs,
    save,
  } = useRunwaySnapshot();

  const monthsLabel =
    result.kind === "infinite"
      ? "∞"
      : result.kind === "noCash"
      ? "—"
      : fmtMonths(result.months);

  const tone =
    result.kind === "warning" || result.kind === "noCash"
      ? "rose"
      : result.kind === "healthy" || result.kind === "infinite"
      ? "emerald"
      : "neutral";

  return (
    <AppShell>
      <div dir="rtl" className="max-w-3xl mx-auto">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 text-xs text-cyan-300 font-semibold uppercase tracking-wider mb-2">
            <Calculator className="w-3.5 h-3.5" />
            CFO
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-2">
            {t("title")}
          </h1>
          <p className="text-text-secondary text-sm leading-7">{t("subtitle")}</p>
        </div>

        {/* Inputs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-3xl p-6 md:p-8 mb-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field
              label={t("currentCash")}
              value={inputs.cashEgp}
              onChange={(v) => setInputs({ cashEgp: v })}
            />
            <Field
              label={t("monthlyIncome")}
              value={inputs.monthlyIncomeEgp}
              onChange={(v) => setInputs({ monthlyIncomeEgp: v })}
            />
            <Field
              label={t("monthlyBurn")}
              value={inputs.monthlyBurnEgp}
              onChange={(v) => setInputs({ monthlyBurnEgp: v })}
            />
          </div>

          {/* Threshold + Save */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:items-end">
            <label className="block sm:col-span-2">
              <span className="block text-xs text-text-secondary mb-1.5 inline-flex items-center gap-1.5">
                <BellRing className="w-3.5 h-3.5" />
                {t("alarmThresholdLabel")}
              </span>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={1}
                  max={24}
                  step={1}
                  value={inputs.thresholdMonths}
                  onChange={(e) => setInputs({ thresholdMonths: Number(e.target.value) })}
                  className="flex-1 accent-cyan-400"
                  aria-label={t("alarmThresholdLabel")}
                />
                <span className="text-sm font-bold text-white min-w-[3.5rem] text-center px-2 py-1 rounded-lg bg-white/10">
                  {inputs.thresholdMonths} {t("monthsShort")}
                </span>
              </div>
              <p className="text-[11px] text-text-secondary mt-1.5 leading-5">
                {t("alarmThresholdHint")}
              </p>
            </label>
            <button
              type="button"
              onClick={() => void save()}
              disabled={saving || loading}
              className="btn-primary inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : hasSnapshot ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <BellRing className="w-4 h-4" />
              )}
              {hasSnapshot ? t("updateAlarm") : t("activateAlarm")}
            </button>
          </div>
        </motion.div>

        {/* Result */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`relative overflow-hidden rounded-3xl border p-8 ${
            tone === "rose"
              ? "border-rose-500/30 bg-rose-500/[0.06]"
              : tone === "emerald"
              ? "border-emerald-500/30 bg-emerald-500/[0.06]"
              : "border-white/10 bg-white/[0.04]"
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                tone === "rose"
                  ? "bg-rose-500/20"
                  : tone === "emerald"
                  ? "bg-emerald-500/20"
                  : "bg-white/10"
              }`}
            >
              {tone === "rose" ? (
                <TrendingDown className="w-6 h-6 text-rose-300" />
              ) : tone === "emerald" ? (
                <TrendingUp className="w-6 h-6 text-emerald-300" />
              ) : (
                <Calculator className="w-6 h-6 text-neutral-300" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              {result.kind === "infinite" ? (
                <div className="font-display text-3xl md:text-4xl font-extrabold brand-gradient-text mb-1">
                  ∞
                </div>
              ) : result.kind === "noCash" ? (
                <div className="font-display text-2xl text-neutral-300 mb-1">—</div>
              ) : result.kind === "noBurn" ? (
                <div className="font-display text-2xl text-neutral-300 mb-1">—</div>
              ) : (
                <div className="font-display text-3xl md:text-4xl font-extrabold text-white mb-1">
                  {monthsLabel}
                </div>
              )}
              <p className="text-sm text-text-secondary leading-7">
                {result.kind === "infinite"
                  ? t("infinite")
                  : result.kind === "noCash"
                  ? t("noCash")
                  : result.kind === "noBurn"
                  ? t("noBurn")
                  : result.kind === "warning"
                  ? t("warningBelow", { months: inputs.thresholdMonths })
                  : t("healthy")}
              </p>

              {result.kind !== "infinite" && result.kind !== "noBurn" && result.netBurnEgp > 0 && (
                <div className="mt-3 inline-flex items-center gap-2 text-xs text-text-secondary">
                  <span className="px-2 py-1 rounded-md bg-black/30 border border-white/10">
                    {t("netBurnLabel")} <strong className="text-white">{fmt(result.netBurnEgp)}</strong> {t("currency")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6"
          >
            <div className="flex items-center gap-2 mb-3">
              {result.belowThreshold ? (
                <AlertTriangle className="w-4 h-4 text-amber-300" />
              ) : (
                <Sparkles className="w-4 h-4 text-cyan-300" />
              )}
              <h2 className="font-display text-lg font-bold text-white">
                {result.belowThreshold ? t("urgentActions") : t("growthMoves")}
              </h2>
            </div>
            <ul className="space-y-2.5">
              {recommendations.map((rec) => (
                <li
                  key={rec.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-sm md:text-base font-bold text-white leading-7">
                      {rec.title}
                    </p>
                    {typeof rec.monthsGained === "number" && rec.monthsGained > 0 && (
                      <span className="text-xs font-bold text-emerald-300 whitespace-nowrap px-2 py-0.5 rounded-md bg-emerald-500/15">
                        {t("monthsGained", { months: rec.monthsGained })}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-text-secondary mt-1.5 leading-7">
                    {rec.rationale}
                  </p>
                </li>
              ))}
            </ul>
          </motion.section>
        )}

        <div className="mt-8 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-sm text-text-secondary hover:text-white inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4 icon-flip" />
            {t("backToDashboard")}
          </Link>
          <Link
            href="/chat?q=ساعدني في تحسين الـ runway"
            className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold"
          >
            <Sparkles className="w-4 h-4" />
            {t("consultCfo")}
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="block text-xs text-text-secondary mb-1.5">{label}</span>
      <input
        type="number"
        inputMode="decimal"
        min={0}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(Math.max(0, parseFloat(e.target.value) || 0))}
        className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-base text-white placeholder:text-neutral-500 outline-none focus:border-cyan-400/40 transition-colors"
        placeholder="0"
      />
    </label>
  );
}

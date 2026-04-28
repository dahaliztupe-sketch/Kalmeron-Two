"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Calculator, TrendingDown, TrendingUp, Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";

const fmt = (n: number) => new Intl.NumberFormat("ar-EG").format(Math.round(n));

export default function CashRunwayPage() {
  const t = useTranslations("CashRunway");
  const [income, setIncome] = useState<string>("");
  const [burn, setBurn] = useState<string>("");
  const [cash, setCash] = useState<string>("");

  const result = useMemo(() => {
    const i = parseFloat(income) || 0;
    const b = parseFloat(burn) || 0;
    const c = parseFloat(cash) || 0;
    const net = b - i;
    if (net <= 0) {
      return { kind: "infinite" as const, months: Infinity, message: t("infinite") };
    }
    if (c <= 0) {
      return { kind: "noCash" as const, months: 0, message: t("noBurn") };
    }
    const months = c / net;
    if (months < 6) return { kind: "warning" as const, months, message: t("warning") };
    return { kind: "healthy" as const, months, message: t("healthy") };
  }, [income, burn, cash, t]);

  return (
    <AppShell>
      <div dir="rtl" className="max-w-3xl mx-auto">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 text-xs text-cyan-300 font-semibold uppercase tracking-wider mb-2">
            <Calculator className="w-3.5 h-3.5" />
            CFO
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-2">{t("title")}</h1>
          <p className="text-text-secondary text-sm leading-7">{t("subtitle")}</p>
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-3xl p-6 md:p-8 mb-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label={t("currentCash")} value={cash} onChange={setCash} />
            <Field label={t("monthlyIncome")} value={income} onChange={setIncome} />
            <Field label={t("monthlyBurn")} value={burn} onChange={setBurn} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className={`relative overflow-hidden rounded-3xl border p-8 ${
            result.kind === "warning"
              ? "border-rose-500/30 bg-rose-500/[0.06]"
              : result.kind === "healthy" || result.kind === "infinite"
              ? "border-emerald-500/30 bg-emerald-500/[0.06]"
              : "border-white/10 bg-white/[0.04]"
          }`}
        >
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              result.kind === "warning" ? "bg-rose-500/20" : "bg-emerald-500/20"
            }`}>
              {result.kind === "warning" ? (
                <TrendingDown className="w-6 h-6 text-rose-300" />
              ) : (
                <TrendingUp className="w-6 h-6 text-emerald-300" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              {result.kind === "infinite" ? (
                <div className="font-display text-2xl md:text-3xl font-extrabold brand-gradient-text mb-1">
                  ∞
                </div>
              ) : result.kind === "noCash" ? (
                <div className="font-display text-xl text-neutral-300 mb-1">—</div>
              ) : (
                <div className="font-display text-3xl md:text-4xl font-extrabold text-white mb-1">
                  {fmt(result.months)} <span className="text-lg text-text-secondary">{t("result", { months: "" }).trim()}</span>
                </div>
              )}
              <p className="text-sm text-text-secondary leading-7">{result.message}</p>
            </div>
          </div>
        </motion.div>

        <div className="mt-6 flex items-center justify-between">
          <Link href="/dashboard" className="text-sm text-text-secondary hover:text-white inline-flex items-center gap-1.5">
            <ArrowLeft className="w-4 h-4 icon-flip" />
            العودة للوحة
          </Link>
          <Link href="/chat?q=ساعدني في تحسين الـ runway" className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold">
            <Sparkles className="w-4 h-4" />
            استشر CFO
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="block text-xs text-text-secondary mb-1.5">{label}</span>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-base text-white placeholder:text-neutral-500 outline-none focus:border-cyan-400/40 transition-colors"
        placeholder="0"
      />
    </label>
  );
}

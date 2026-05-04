"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Calculator, Sparkles, ArrowLeft, Loader2, CheckCircle2,
  Copy, Check, RefreshCw, AlertCircle, TrendingUp,
  DollarSign, BarChart3, PieChart,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import ReactMarkdown from "react-markdown";
import { useTranslations } from "next-intl";

const BUSINESS_TYPES = [
  { value: "saas", label: "SaaS / برمجيات كخدمة" },
  { value: "marketplace", label: "Marketplace / منصة تداول" },
  { value: "ecommerce", label: "تجارة إلكترونية" },
  { value: "service", label: "خدمات احترافية" },
  { value: "product", label: "منتج مادي" },
  { value: "food", label: "مطاعم / أغذية" },
  { value: "education", label: "تعليم / تدريب" },
  { value: "fintech", label: "Fintech / مالية" },
  { value: "other", label: "أخرى" },
];

const HORIZONS = [
  { value: "12", label: "12 شهر (سنة واحدة)" },
  { value: "24", label: "24 شهر (سنتان)" },
  { value: "36", label: "36 شهر (3 سنوات)" },
];

export default function FinancialModelPage() {
  const { user } = useAuth();
  const t = useTranslations("FinancialModel");

  const [businessType, setBusinessType] = useState("saas");
  const [description, setDescription] = useState("");
  const [initialRevenue, setInitialRevenue] = useState("");
  const [growthRate, setGrowthRate] = useState("");
  const [fixedCosts, setFixedCosts] = useState("");
  const [variableCosts, setVariableCosts] = useState("");
  const [horizon, setHorizon] = useState("12");
  const [mode, setMode] = useState<"model" | "breakeven" | "uniteconomics">("model");

  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!description.trim() || loading) return;
    setLoading(true);
    setError("");
    setResult("");
    try {
      const token = await user?.getIdToken();
      const res = await fetch("/api/financial-model", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          businessType, description, initialRevenue, growthRate,
          fixedCosts, variableCosts, horizon, mode,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "حدث خطأ");
      setResult(data.result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  }, [businessType, description, initialRevenue, growthRate, fixedCosts, variableCosts, horizon, mode, loading, user]);

  const inputClass = "w-full bg-slate-900/70 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 text-sm";

  const MODES = [
    { id: "model" as const, icon: BarChart3 },
    { id: "breakeven" as const, icon: TrendingUp },
    { id: "uniteconomics" as const, icon: PieChart },
  ];

  return (
    <AppShell>
      <div className="min-h-screen bg-[#0a0a0f] text-white" dir="rtl">
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
            <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Calculator className="text-blue-400" size={24} />
                {t("title")}
              </h1>
              <p className="text-slate-400 text-sm mt-1">{t("subtitle")}</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex gap-2">
            {MODES.map(({ id, icon: Icon }) => (
              <button key={id} onClick={() => { setMode(id); setResult(""); setError(""); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  mode === id
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                    : "bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-700/60"
                }`}>
                <Icon size={14} /> {t(`modes.${id}`)}
              </button>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 space-y-4">

            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="text-blue-400" size={18} />
              <span className="font-semibold text-blue-400">{t(`formTitle.${mode}`)}</span>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-xs block mb-1.5">{t("businessTypeLabel")}</label>
                  <select value={businessType} onChange={e => setBusinessType(e.target.value)} className={inputClass}>
                    {BUSINESS_TYPES.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                {mode === "model" && (
                  <div>
                    <label className="text-slate-400 text-xs block mb-1.5">{t("horizonLabel")}</label>
                    <select value={horizon} onChange={e => setHorizon(e.target.value)} className={inputClass}>
                      {HORIZONS.map(({ value, label }) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="text-slate-400 text-xs block mb-1.5">{t("descriptionLabel")}</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)}
                  placeholder={t("descriptionPlaceholder")}
                  rows={3}
                  className="w-full bg-slate-900/70 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 resize-none focus:outline-none focus:border-blue-500/50 text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-xs block mb-1.5">{t("initialRevenueLabel")}</label>
                  <input value={initialRevenue} onChange={e => setInitialRevenue(e.target.value)}
                    placeholder={t("initialRevenuePlaceholder")} className={inputClass} />
                </div>
                <div>
                  <label className="text-slate-400 text-xs block mb-1.5">{t("growthRateLabel")}</label>
                  <input value={growthRate} onChange={e => setGrowthRate(e.target.value)}
                    placeholder={t("growthRatePlaceholder")} className={inputClass} />
                </div>
                <div>
                  <label className="text-slate-400 text-xs block mb-1.5">{t("fixedCostsLabel")}</label>
                  <input value={fixedCosts} onChange={e => setFixedCosts(e.target.value)}
                    placeholder={t("fixedCostsPlaceholder")} className={inputClass} />
                </div>
                <div>
                  <label className="text-slate-400 text-xs block mb-1.5">{t("variableCostsLabel")}</label>
                  <input value={variableCosts} onChange={e => setVariableCosts(e.target.value)}
                    placeholder={t("variableCostsPlaceholder")} className={inputClass} />
                </div>
              </div>
            </div>

            <button onClick={handleSubmit} disabled={loading || !description.trim()}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Calculator size={16} />}
              {loading ? t("buildingButton") : t("buildButton")}
            </button>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="bg-red-900/30 border border-red-500/30 rounded-xl p-4 text-red-300 text-sm flex items-start gap-2">
                  <AlertCircle size={14} className="mt-0.5 shrink-0" /> {error}
                </motion.div>
              )}
              {result && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-900/50 border border-blue-500/20 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-400 text-sm font-medium flex items-center gap-1">
                      <CheckCircle2 size={14} /> {t(`resultTitle.${mode}`)}
                    </span>
                    <div className="flex gap-2">
                      <button onClick={() => { setResult(""); setDescription(""); }}
                        className="text-slate-400 hover:text-white transition-colors"><RefreshCw size={14} /></button>
                      <button onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                        className="text-slate-400 hover:text-white transition-colors">
                        {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                  <div className="text-sm leading-relaxed prose prose-invert prose-neutral max-w-none
                    prose-headings:text-blue-400 prose-headings:font-bold prose-strong:text-white
                    prose-li:text-slate-300 prose-p:text-slate-300" dir="auto">
                    <ReactMarkdown>{result}</ReactMarkdown>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="grid grid-cols-3 gap-3">
            {[
              { href: "/cash-runway", labelKey: "cashRunway", icon: "🛫" },
              { href: "/smart-pricing", labelKey: "smartPricing", icon: "💰" },
              { href: "/investor", labelKey: "investor", icon: "📊" },
            ].map(({ href, labelKey, icon }) => (
              <Link key={href} href={href}
                className="bg-slate-800/40 border border-slate-700/30 hover:border-slate-600/50 rounded-xl p-4 text-center transition-all group">
                <div className="text-2xl mb-1">{icon}</div>
                <div className="text-slate-300 text-sm font-medium group-hover:text-white transition-colors">{t(`quickLinks.${labelKey}`)}</div>
              </Link>
            ))}
          </motion.div>

        </div>
      </div>
    </AppShell>
  );
}

"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Scale, Sparkles, ArrowLeft, Loader2, CheckCircle2,
  Copy, Check, RefreshCw, AlertCircle,
  FileText, ShieldCheck, Gavel, BookOpen,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import ReactMarkdown from "react-markdown";
import { useTranslations } from "next-intl";

type LegalMode = "contract" | "compliance" | "ip" | "disputes";

const LEGAL_MODES: { id: LegalMode; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { id: "contract", icon: FileText },
  { id: "compliance", icon: ShieldCheck },
  { id: "ip", icon: BookOpen },
  { id: "disputes", icon: Gavel },
];

const CONTRACT_TYPES = [
  "عقد عمل", "عقد خدمات", "اتفاقية سرية (NDA)", "عقد شراكة",
  "عقد إيجار تجاري", "اتفاقية مستوى خدمة (SLA)", "عقد بيع وشراء",
  "عقد وكالة", "عقد ترخيص برمجيات", "أخرى",
];

export default function LegalAIPage() {
  const { user } = useAuth();
  const t = useTranslations("LegalAI");
  const [mode, setMode] = useState<LegalMode>("contract");
  const [contractType, setContractType] = useState("عقد عمل");
  const [description, setDescription] = useState("");
  const [parties, setParties] = useState("");
  const [specificTerms, setSpecificTerms] = useState("");

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
      const res = await fetch("/api/legal-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ mode, contractType, description, parties, specificTerms }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "حدث خطأ");
      setResult(data.result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  }, [mode, contractType, description, parties, specificTerms, loading, user]);

  const inputClass = "w-full bg-slate-900/70 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 text-sm";
  const currentModeLabel = t(`modes.${mode}.label`);

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
                <Scale className="text-amber-400" size={24} />
                {t("title")}
              </h1>
              <p className="text-slate-400 text-sm mt-1">{t("subtitle")}</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}
            className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-3 text-amber-300 text-xs">
            {t("disclaimer")}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="grid grid-cols-2 gap-3">
            {LEGAL_MODES.map(({ id, icon: Icon }) => (
              <button key={id} onClick={() => { setMode(id); setResult(""); setError(""); }}
                className={`text-right p-4 rounded-xl border transition-all ${
                  mode === id
                    ? "bg-amber-900/20 border-amber-500/50 shadow-lg"
                    : "bg-slate-800/40 border-slate-700/40 hover:border-slate-600/60"
                }`}>
                <Icon size={18} className={mode === id ? "text-amber-400 mb-1" : "text-slate-400 mb-1"} />
                <div className={`text-sm font-semibold ${mode === id ? "text-amber-300" : "text-slate-300"}`}>{t(`modes.${id}.label`)}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{t(`modes.${id}.desc`)}</div>
              </button>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 space-y-4">

            <div className="flex items-center gap-2 mb-1">
              <Scale className="text-amber-400" size={18} />
              <span className="font-semibold text-amber-400">{currentModeLabel}</span>
            </div>

            <div className="space-y-3">
              {mode === "contract" && (
                <div>
                  <label className="text-slate-400 text-xs block mb-1.5">{t("contractTypeLabel")}</label>
                  <select value={contractType} onChange={e => setContractType(e.target.value)} className={inputClass}>
                    {CONTRACT_TYPES.map(ct => <option key={ct} value={ct}>{ct}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="text-slate-400 text-xs block mb-1.5">{t("descriptionLabel")}</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)}
                  placeholder={t(`descriptionPlaceholders.${mode}`)}
                  rows={3}
                  className="w-full bg-slate-900/70 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 resize-none focus:outline-none focus:border-amber-500/50 text-sm" />
              </div>

              {mode === "contract" && (
                <>
                  <div>
                    <label className="text-slate-400 text-xs block mb-1.5">{t("partiesLabel")}</label>
                    <input value={parties} onChange={e => setParties(e.target.value)}
                      placeholder={t("partiesPlaceholder")} className={inputClass} />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs block mb-1.5">{t("specificTermsLabel")}</label>
                    <input value={specificTerms} onChange={e => setSpecificTerms(e.target.value)}
                      placeholder={t("specificTermsPlaceholder")} className={inputClass} />
                  </div>
                </>
              )}
            </div>

            <button onClick={handleSubmit} disabled={loading || !description.trim()}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {loading ? t("preparingButton") : t("prepareButton", { mode: currentModeLabel })}
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
                  className="bg-slate-900/50 border border-amber-500/20 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-400 text-sm font-medium flex items-center gap-1">
                      <CheckCircle2 size={14} /> {currentModeLabel}
                    </span>
                    <div className="flex gap-2">
                      <button onClick={() => setResult("")}
                        className="text-slate-400 hover:text-white transition-colors"><RefreshCw size={14} /></button>
                      <button onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                        className="text-slate-400 hover:text-white transition-colors">
                        {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                  <div className="text-sm leading-relaxed prose prose-invert prose-neutral max-w-none
                    prose-headings:text-amber-400 prose-headings:font-bold prose-strong:text-white
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
              { href: "/contract-review", labelKey: "contractReview", icon: "📜" },
              { href: "/founder-agreement", labelKey: "founderAgreement", icon: "🤝" },
              { href: "/setup-egypt", labelKey: "setupEgypt", icon: "🏛️" },
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

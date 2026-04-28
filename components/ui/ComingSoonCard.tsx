"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Sparkles, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type Props = {
  /** Optional — feature title shown in eyebrow */
  feature?: string;
  /** Optional — short description above the form */
  description?: string;
  /** Where to POST the waitlist signup. Defaults to /api/waitlist */
  action?: string;
};

export function ComingSoonCard({ feature, description, action = "/api/waitlist" }: Props) {
  const t = useTranslations("ComingSoon");
  const { user } = useAuth();
  const [company, setCompany] = useState("");
  const [useCase, setUseCase] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await fetch(action, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feature, company, useCase, email }),
      }).catch(() => null);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-950/40 via-[#0B1020] to-cyan-950/30 p-8 md:p-10 shadow-2xl"
    >
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

      <div className="relative">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-cyan-200 mb-4">
          <Sparkles className="w-3 h-3" />
          {feature ? `${feature} · ${t("badge")}` : t("badge")}
        </div>

        <h2 className="font-display text-2xl md:text-3xl font-extrabold text-white mb-2">
          {t("earlyAccessTitle")}
        </h2>
        <p className="text-sm text-neutral-300 max-w-xl leading-7 mb-6">
          {description || t("earlyAccessDescription")}
        </p>

        {submitted ? (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-200">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="text-sm">{t("submitted")}</span>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-3 max-w-md">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@company.com"
              dir="ltr"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-neutral-500 outline-none focus:border-cyan-400/40 transition-colors"
            />
            <input
              type="text"
              required
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder={t("companyName")}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-neutral-500 outline-none focus:border-cyan-400/40 transition-colors"
            />
            <textarea
              value={useCase}
              onChange={(e) => setUseCase(e.target.value)}
              placeholder={t("useCase")}
              rows={2}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-neutral-500 outline-none focus:border-cyan-400/40 transition-colors resize-none"
            />
            <button
              type="submit"
              disabled={submitting || !email || !company}
              className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold disabled:opacity-50"
            >
              {submitting ? "…" : t("submit")}
              <ArrowLeft className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </motion.div>
  );
}

export default ComingSoonCard;

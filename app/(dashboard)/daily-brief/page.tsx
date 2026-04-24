"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  Sun, AlertTriangle, Send, RefreshCw, Sparkles, ArrowLeft, Copy, Check,
} from "lucide-react";

interface BriefBlock {
  type: "anomaly" | "decision" | "message";
  title: string;
  body: string;
  ctaLabel?: string;
}

interface DailyBrief {
  generatedAt: string;
  greeting: string;
  blocks: BriefBlock[];
}

/**
 * Operational Mirror — "Daily Brief" (P1-1 from the 45-expert business audit).
 *
 * One screen, one decision, one message. The user opens this in the morning
 * and is done in 5 minutes.
 *
 * For now the data comes from the static stub at /api/daily-brief; the next
 * iteration will plug it into the LangGraph orchestrator.
 */
export default function DailyBriefPage() {
  const [brief, setBrief] = useState<DailyBrief | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  async function fetchBrief() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/daily-brief", { cache: "no-store" });
      if (!res.ok) throw new Error(`status ${res.status}`);
      const json = (await res.json()) as DailyBrief;
      setBrief(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذّر تحميل الإيجاز اليومي");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void fetchBrief(); }, []);

  function copy(idx: number, text: string) {
    void navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1800);
  }

  return (
    <div dir="rtl" className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <Link href="/dashboard" className="flex items-center gap-2 text-neutral-400 hover:text-white text-sm">
          <ArrowLeft className="w-4 h-4" /> لوحة التحكم
        </Link>
        <button
          onClick={() => void fetchBrief()}
          disabled={loading}
          className="rounded-full border border-white/[0.08] px-4 py-2 text-xs text-neutral-300 hover:bg-white/[0.04] transition inline-flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          تحديث
        </button>
      </div>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-white/[0.08] bg-gradient-to-br from-amber-500/[0.06] via-cyan-500/[0.04] to-violet-500/[0.06] p-8 mb-8"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="rounded-2xl bg-amber-500/15 p-2.5 text-amber-300"><Sun className="w-6 h-6" /></div>
          <div>
            <h1 className="text-2xl font-bold">إيجاز الصباح</h1>
            <p className="text-neutral-400 text-sm mt-0.5">
              {brief?.greeting ?? "قرار واحد. رسالة واحدة. خمس دقائق."}
            </p>
          </div>
        </div>
        {brief?.generatedAt && (
          <p className="text-neutral-500 text-xs">آخر إيجاز: {new Date(brief.generatedAt).toLocaleString("ar-EG")}</p>
        )}
      </motion.div>

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 mb-6 text-red-200 text-sm">
          تعذّر تحميل الإيجاز: {error}
        </div>
      )}

      {loading && !brief && (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-2xl border border-white/[0.04] bg-white/[0.02] h-32 animate-pulse" />
          ))}
        </div>
      )}

      {brief && (
        <div className="space-y-4">
          {brief.blocks.map((block, idx) => {
            const styles = STYLES[block.type];
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.07 }}
                className={`rounded-2xl border p-6 ${styles.border} ${styles.bg}`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={`rounded-xl p-2 ${styles.iconBg} ${styles.iconText}`}>
                    <styles.Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-[11px] font-semibold uppercase tracking-wider mb-1 ${styles.label}`}>
                      {styles.title}
                    </div>
                    <h2 className="text-lg font-bold text-white leading-tight">{block.title}</h2>
                  </div>
                </div>
                <p className="text-neutral-200 text-sm leading-relaxed whitespace-pre-wrap">{block.body}</p>
                {block.ctaLabel && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => copy(idx, block.body)}
                      className="rounded-lg bg-white/[0.06] hover:bg-white/[0.12] transition px-3 py-2 text-xs text-white inline-flex items-center gap-1.5"
                    >
                      {copiedIdx === idx ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedIdx === idx ? "تم النسخ" : "نسخ النص"}
                    </button>
                    <Link
                      href="/chat"
                      className="rounded-lg bg-gradient-to-l from-cyan-500 to-violet-500 hover:opacity-90 transition px-3 py-2 text-xs text-white inline-flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" /> {block.ctaLabel}
                    </Link>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      <p className="text-center text-neutral-600 text-xs mt-10 inline-flex items-center gap-1.5 w-full justify-center">
        <Sparkles className="w-3 h-3" />
        المرآة التشغيلية — تجريبي
      </p>
    </div>
  );
}

const STYLES = {
  anomaly: {
    Icon: AlertTriangle,
    title: "شذوذ يستحق الانتباه",
    label: "text-amber-300",
    border: "border-amber-500/20",
    bg: "bg-amber-500/[0.04]",
    iconBg: "bg-amber-500/15",
    iconText: "text-amber-300",
  },
  decision: {
    Icon: Sparkles,
    title: "القرار اليوم",
    label: "text-cyan-300",
    border: "border-cyan-500/20",
    bg: "bg-cyan-500/[0.04]",
    iconBg: "bg-cyan-500/15",
    iconText: "text-cyan-300",
  },
  message: {
    Icon: Send,
    title: "الرسالة الجاهزة",
    label: "text-violet-300",
    border: "border-violet-500/20",
    bg: "bg-violet-500/[0.04]",
    iconBg: "bg-violet-500/15",
    iconText: "text-violet-300",
  },
} as const;

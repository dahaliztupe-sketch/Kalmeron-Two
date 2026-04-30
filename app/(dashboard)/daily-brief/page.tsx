"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { motion } from "motion/react";
import {
  Sun, AlertTriangle, Send, RefreshCw, Sparkles, ArrowLeft, Copy, Check,
  Mail, MessageCircle, Settings as SettingsIcon, Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

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
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const { user } = useAuth();

  const {
    data: brief,
    isLoading: loading,
    error,
    refetch,
    isRefetching,
  } = useQuery<DailyBrief, Error>({
    queryKey: ["daily-brief", user?.uid ?? "anon"],
    enabled: !!user,
    queryFn: async () => {
      if (!user) throw new Error("not_authenticated");
      const idToken = await user.getIdToken();
      const res = await fetch("/api/daily-brief", {
        cache: "no-store",
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (!res.ok) throw new Error(`status ${res.status}`);
      return (await res.json()) as DailyBrief;
    },
  });
  const fetchBrief = () => refetch();
  const isBusy = loading || isRefetching;

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
          disabled={isBusy}
          className="rounded-full border border-white/[0.08] px-4 py-2 text-xs text-neutral-300 hover:bg-white/[0.04] transition inline-flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isBusy ? "animate-spin" : ""}`} />
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
          تعذّر تحميل الإيجاز: {error.message}
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

      {brief && <DeliveryPanel brief={brief} />}

      <p className="text-center text-neutral-600 text-xs mt-10 inline-flex items-center gap-1.5 w-full justify-center">
        <Sparkles className="w-3 h-3" />
        المرآة التشغيلية — تجريبي
      </p>
    </div>
  );
}

interface DailyBriefPrefs {
  whatsapp?: boolean;
  email?: boolean;
  phoneE164?: string;
  emailAddress?: string;
  sendAtHour?: number;
  timezone?: string;
}

interface DailyBriefSendResult {
  ok?: boolean;
  error?: string;
  hint?: string;
  results?: Record<string, { ok?: boolean; error?: string; preview?: string }>;
}

function DeliveryPanel({ brief }: { brief: DailyBrief }) {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<DailyBriefPrefs | null>(null);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<DailyBriefSendResult | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    user.getIdToken().then((t) =>
      fetch("/api/daily-brief/preferences", { headers: { Authorization: `Bearer ${t}` } }),
    ).then((r) => r.json()).then((j) => setPrefs(j.preferences || {})).catch(() => {});
  }, [user]);

  async function save(next: Partial<DailyBriefPrefs>) {
    if (!user) return;
    setSaving(true);
    try {
      const t = await user.getIdToken();
      const r = await fetch("/api/daily-brief/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${t}` },
        body: JSON.stringify(next),
      });
      const j = await r.json();
      if (j.preferences) setPrefs(j.preferences);
    } finally { setSaving(false); }
  }

  async function send(channel?: string) {
    if (!user) return;
    setSending(true); setResult(null);
    try {
      const t = await user.getIdToken();
      const body: { channels?: string[] } = {};
      if (channel) body.channels = [channel];
      const r = await fetch("/api/daily-brief/send", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${t}` },
        body: JSON.stringify(body),
      });
      setResult(await r.json());
    } catch (e: unknown) {
      setResult({ ok: false, error: (e as Error)?.message });
    } finally { setSending(false); }
  }

  if (!prefs) return null;

  return (
    <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-white font-semibold flex items-center gap-2">
          <Send className="w-4 h-4 text-cyan-300" /> أرسل الإيجاز لي
        </p>
        <button
          onClick={() => setOpen((o) => !o)}
          className="text-xs text-neutral-400 hover:text-white inline-flex items-center gap-1"
        >
          <SettingsIcon className="w-3 h-3" /> {open ? "إخفاء الإعدادات" : "إعدادات التسليم"}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <button
          onClick={() => send("whatsapp")}
          disabled={sending || !prefs.whatsapp || !prefs.phoneE164}
          className="rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-200 border border-emerald-500/30 px-3 py-2 text-xs inline-flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MessageCircle className="w-3.5 h-3.5" />}
          إرسال إلى واتساب
        </button>
        <button
          onClick={() => send("email")}
          disabled={sending || !prefs.email || !prefs.emailAddress}
          className="rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 border border-cyan-500/30 px-3 py-2 text-xs inline-flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
          إرسال على الإيميل
        </button>
        <button
          onClick={() => send()}
          disabled={sending}
          className="rounded-lg bg-gradient-to-l from-cyan-500 to-violet-500 hover:opacity-90 text-white px-3 py-2 text-xs inline-flex items-center gap-1.5 disabled:opacity-40"
        >
          {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          إرسال على كل القنوات المفعّلة
        </button>
      </div>

      {result && (
        <div className={`text-xs rounded-lg p-3 mb-3 ${result.ok ? "bg-emerald-500/10 text-emerald-200 border border-emerald-500/30" : "bg-rose-500/10 text-rose-200 border border-rose-500/30"}`}>
          {result.ok ? "تم الإرسال ✓" : `لم يُرسل: ${result.hint || result.error || "تحقق من الإعدادات"}`}
          {result.results && (
            <pre className="mt-2 text-[10px] opacity-70 whitespace-pre-wrap">{JSON.stringify(result.results, null, 2)}</pre>
          )}
        </div>
      )}

      {open && (
        <div className="space-y-3 border-t border-white/[0.05] pt-3">
          <label className="flex items-center gap-2 text-sm text-neutral-200">
            <input aria-label="خانة اختيار" type="checkbox" checked={!!prefs.whatsapp} onChange={(e) => save({ whatsapp: e.target.checked })} />
            تسليم على واتساب
          </label>
          <input
            type="tel"
            placeholder="رقم واتساب بصيغة دولية (مثال: +201234567890)"
            value={prefs.phoneE164 || ""}
            onChange={(e) => setPrefs({ ...prefs, phoneE164: e.target.value })}
            onBlur={(e) => save({ phoneE164: e.target.value })}
            className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm text-white"
          />

          <label className="flex items-center gap-2 text-sm text-neutral-200">
            <input aria-label="خانة اختيار" type="checkbox" checked={prefs.email !== false} onChange={(e) => save({ email: e.target.checked })} />
            تسليم على الإيميل
          </label>
          <input
            type="email"
            placeholder="بريدك الإلكتروني"
            value={prefs.emailAddress || ""}
            onChange={(e) => setPrefs({ ...prefs, emailAddress: e.target.value })}
            onBlur={(e) => save({ emailAddress: e.target.value })}
            className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm text-white"
          />

          <div className="flex items-center gap-2 text-sm text-neutral-300">
            <span>الإرسال التلقائي يوميّاً عند الساعة</span>
            <input
              type="number" min={0} max={23}
              value={prefs.sendAtHour ?? 8}
              onChange={(e) => setPrefs({ ...prefs, sendAtHour: parseInt(e.target.value, 10) })}
              onBlur={(e) => save({ sendAtHour: parseInt(e.target.value, 10) })}
              className="w-16 rounded-lg bg-black/30 border border-white/10 px-2 py-1 text-sm text-white text-center"
            />
            <span>(توقيت القاهرة)</span>
            {saving && <Loader2 className="w-3 h-3 animate-spin opacity-60" />}
          </div>
          <p className="text-[11px] text-neutral-500">
            تحتاج مفاتيح WhatsApp Cloud + SendGrid في إعدادات النظام لتشغيل الإرسال الفعلي. بدونها، يمكنك دائماً
            مشاهدة الإيجاز في هذه الصفحة.
          </p>
        </div>
      )}
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

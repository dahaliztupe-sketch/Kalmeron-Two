"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import {
  Webhook, Plus, Trash2, Copy, Check, CheckCircle2,
  Zap, ArrowLeft, Loader2, ChevronDown, ChevronUp,
  Code2, Radio,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { apiJson } from "@/src/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const EVENTS = [
  "agent.action.executed",
  "subscription.renewed",
  "credit.depleted",
  "document.indexed",
  "approval.requested",
  "launch.completed",
  "meeting.completed",
];

interface Sub {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  createdAt: number | null;
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handle = async () => {
    await navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handle}
      className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white transition-colors"
    >
      {copied ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
      {copied ? "تمّ" : "نسخ"}
    </button>
  );
}

const EVENT_ICONS: Record<string, string> = {
  "agent.action.executed": "🤖",
  "subscription.renewed": "🔄",
  "credit.depleted": "⚡",
  "document.indexed": "📄",
  "approval.requested": "✅",
  "launch.completed": "🚀",
  "meeting.completed": "🎙️",
};

export default function WebhooksPage() {
  const t = useTranslations("Webhooks");
  const tCs = useTranslations("ComingSoon");
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [storedWorkspace] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("active_workspace") || "";
  });
  const workspaceId = storedWorkspace || user?.uid || "";

  const [url, setUrl] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [newSecret, setNewSecret] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const subsQueryKey = ["webhooks", workspaceId] as const;
  const { data: subs = [], isLoading, error, refetch } = useQuery<Sub[], Error>({
    queryKey: subsQueryKey,
    enabled: !!workspaceId,
    queryFn: async () => {
      const res = await apiJson<{ subscriptions: Sub[] }>(
        `/api/account/webhooks?workspaceId=${encodeURIComponent(workspaceId)}`
      );
      return res.subscriptions || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () =>
      apiJson<{ subscription: { secret: string } }>("/api/account/webhooks", {
        method: "POST",
        body: JSON.stringify({ workspaceId, url, events: selected }),
      }),
    onSuccess: (res) => {
      setNewSecret(res.subscription.secret);
      setUrl("");
      setSelected([]);
      setShowCreate(false);
      toast.success("تم إنشاء الاشتراك");
      queryClient.invalidateQueries({ queryKey: subsQueryKey });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const revokeMutation = useMutation({
    mutationFn: async (id: string) =>
      apiJson(`/api/account/webhooks/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subsQueryKey });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const onCreate = () => {
    if (!url.trim() || selected.length === 0) return;
    createMutation.mutate();
  };

  const onRevoke = (id: string) => {
    if (!confirm("إيقاف هذا الاشتراك؟")) return;
    revokeMutation.mutate(id);
  };

  return (
    <AppShell>
      <div dir="rtl" className="max-w-3xl mx-auto space-y-6 pb-16">

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Radio className="w-4 h-4 text-violet-400" />
              <span className="text-xs text-violet-400 font-medium uppercase tracking-wide">Webhooks</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full border border-violet-400/30 bg-violet-500/10 text-violet-300 font-semibold">
                {tCs("betaQ3")}
              </span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-2">
              {t("title")}
            </h1>
            <p className="text-white/50 max-w-xl text-sm leading-7">{t("intro")}</p>
          </div>
          <Link
            href="/settings"
            className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> الإعدادات
          </Link>
        </div>

        {/* Supported events */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-3xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-violet-400" />
            <h2 className="text-sm font-bold text-white">{t("eventsTitle")}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(["agentActionExecuted", "subscriptionRenewed", "creditDepleted", "documentIndexed", "approvalRequested"] as const).map((key) => (
              <div
                key={key}
                className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.06] bg-white/[0.03]"
              >
                <span className="text-base leading-none">{EVENT_ICONS[EVENTS.find(() => true) ?? ""]}</span>
                <div className="min-w-0">
                  <code className="block text-[11px] font-mono text-violet-300/80 mb-0.5" dir="ltr">
                    {key.replace(/([A-Z])/g, ".$1").toLowerCase().replace(/^\./, "")}
                  </code>
                  <span className="text-xs text-white/50">{t(`events.${key}`)}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Secret reveal */}
        <AnimatePresence>
          {newSecret && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.06] p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                <span className="text-sm font-bold text-emerald-200">
                  السر الموقِّع — احفظه الآن، لن يظهر مرة أخرى
                </span>
              </div>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <code className="flex-1 min-w-0 block p-3 bg-black/40 rounded-xl font-mono text-xs break-all text-white border border-white/10" dir="ltr">
                  {newSecret}
                </code>
                <CopyBtn text={newSecret} />
              </div>
              <p className="text-xs text-white/40 mb-2">
                استخدمه للتحقق من الترويسة{" "}
                <code className="bg-black/30 border border-white/10 px-1.5 py-0.5 rounded text-violet-300" dir="ltr">
                  x-kalmeron-signature
                </code>
              </p>
              <button
                onClick={() => setNewSecret(null)}
                className="text-xs text-white/30 hover:text-white/60 transition-colors"
              >
                إخفاء
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create new subscription — collapsible */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-panel rounded-3xl overflow-hidden"
        >
          <button
            onClick={() => setShowCreate((v) => !v)}
            className="w-full flex items-center justify-between gap-3 p-6 text-right hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-violet-500/15 flex items-center justify-center">
                <Plus className="w-4 h-4 text-violet-400" />
              </div>
              <span className="font-bold text-white">اشتراك جديد</span>
            </div>
            {showCreate
              ? <ChevronUp className="w-4 h-4 text-white/40" />
              : <ChevronDown className="w-4 h-4 text-white/40" />
            }
          </button>

          <AnimatePresence>
            {showCreate && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-6 space-y-4 border-t border-white/[0.06] pt-4">
                  <label className="block">
                    <span className="block text-xs text-white/50 mb-1.5">رابط الـ Webhook</span>
                    <div className="relative">
                      <Code2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                      <input
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://your-server.com/webhook"
                        dir="ltr"
                        className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 pe-10 text-sm text-white placeholder:text-white/25 outline-none focus:border-violet-400/40 transition-colors font-mono"
                      />
                    </div>
                  </label>

                  <div>
                    <span className="block text-xs text-white/50 mb-2">الأحداث المُشترَك بها</span>
                    <div className="flex flex-wrap gap-2">
                      {EVENTS.map((e) => {
                        const active = selected.includes(e);
                        return (
                          <label
                            key={e}
                            className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg cursor-pointer transition-all border ${
                              active
                                ? "border-violet-400/40 bg-violet-500/15 text-violet-200"
                                : "border-white/10 bg-white/[0.03] text-white/50 hover:border-white/20"
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={active}
                              onChange={(ev) =>
                                setSelected((prev) =>
                                  ev.target.checked ? [...prev, e] : prev.filter((x) => x !== e)
                                )
                              }
                            />
                            {active && <Check className="w-3 h-3" />}
                            <span dir="ltr">{e}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    onClick={onCreate}
                    disabled={createMutation.isPending || !url.trim() || selected.length === 0}
                    className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50"
                  >
                    {createMutation.isPending
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Plus className="w-4 h-4" />
                    }
                    {createMutation.isPending ? "جارٍ الإنشاء…" : "إنشاء الاشتراك"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Subscriptions list */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel rounded-3xl p-6"
        >
          <h2 className="font-bold text-white mb-4 flex items-center gap-2">
            <Radio className="w-4 h-4 text-white/40" />
            الاشتراكات الحالية
          </h2>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-white/[0.04] animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/[0.06] p-4 text-sm text-rose-300 flex items-center justify-between gap-3">
              <span>تعذّر تحميل الاشتراكات</span>
              <button onClick={() => refetch()} className="text-xs underline underline-offset-2">
                حاول مجدّداً
              </button>
            </div>
          ) : subs.length === 0 ? (
            <div className="py-10 text-center">
              <Radio className="w-8 h-8 text-white/15 mx-auto mb-3" />
              <p className="text-sm text-white/40">لا توجد اشتراكات — أضف أوّل webhook</p>
            </div>
          ) : (
            <ul className="space-y-2" role="list">
              {subs.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                          s.active
                            ? "bg-emerald-500/15 border border-emerald-500/20 text-emerald-300"
                            : "bg-white/[0.06] border border-white/10 text-white/40"
                        }`}
                      >
                        {s.active ? "نشط" : "موقوف"}
                      </span>
                    </div>
                    <code className="block text-xs font-mono text-white/50 truncate mb-1" dir="ltr">
                      {s.url}
                    </code>
                    <div className="flex flex-wrap gap-1">
                      {s.events.map((ev) => (
                        <span
                          key={ev}
                          className="text-[10px] font-mono text-violet-300/70 bg-violet-500/10 border border-violet-500/15 px-1.5 py-0.5 rounded-md"
                          dir="ltr"
                        >
                          {ev}
                        </span>
                      ))}
                    </div>
                  </div>
                  {s.active && (
                    <button
                      onClick={() => onRevoke(s.id)}
                      disabled={revokeMutation.isPending}
                      className="shrink-0 flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-rose-500/10 disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      إيقاف
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      </div>
    </AppShell>
  );
}

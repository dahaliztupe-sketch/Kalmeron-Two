"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import {
  Key, Plus, Trash2, Copy, Check, Sparkles,
  ShieldCheck, Code2, Loader2, CheckCircle2,
  ArrowLeft, ChevronDown, ChevronUp,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { apiJson } from "@/src/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const SCOPES = [
  "agent:run",
  "launchpad:run",
  "meeting:convene",
  "expert:create",
  "skills:read",
  "skills:write",
];

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  createdAt: number | null;
  lastUsedAt: number | null;
  revoked: boolean;
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

export default function ApiKeysPage() {
  const t = useTranslations("ApiKeys");
  const tCs = useTranslations("ComingSoon");
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [storedWorkspace] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("active_workspace") || "";
  });
  const workspaceId = storedWorkspace || user?.uid || "";

  const [name, setName] = useState("");
  const [selectedScopes, setSelectedScopes] = useState<string[]>(["agent:run"]);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const keysQueryKey = ["api-keys", workspaceId] as const;
  const { data: keys = [], isLoading, error, refetch } = useQuery<ApiKey[], Error>({
    queryKey: keysQueryKey,
    enabled: !!workspaceId,
    queryFn: async () => {
      const res = await apiJson<{ keys: ApiKey[] }>(
        `/api/account/api-keys?workspaceId=${encodeURIComponent(workspaceId)}`
      );
      return res.keys || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () =>
      apiJson<{ key: { raw: string; prefix: string } }>("/api/account/api-keys", {
        method: "POST",
        body: JSON.stringify({ workspaceId, name, scopes: selectedScopes }),
      }),
    onSuccess: (res) => {
      setNewKey(res.key.raw);
      setName("");
      setShowCreate(false);
      toast.success("تم إنشاء المفتاح");
      queryClient.invalidateQueries({ queryKey: keysQueryKey });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const revokeMutation = useMutation({
    mutationFn: async (id: string) =>
      apiJson(`/api/account/api-keys/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("تم الإبطال");
      queryClient.invalidateQueries({ queryKey: keysQueryKey });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const onRevoke = (id: string) => {
    if (!confirm("هل أنت متأكد من إبطال هذا المفتاح؟")) return;
    revokeMutation.mutate(id);
  };

  const onCreate = () => {
    if (!name.trim() || selectedScopes.length === 0) return;
    createMutation.mutate();
  };

  return (
    <AppShell>
      <div dir="rtl" className="max-w-3xl mx-auto space-y-6 pb-16">

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Key className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-cyan-400 font-medium uppercase tracking-wide">API Access</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full border border-cyan-400/30 bg-cyan-500/10 text-cyan-300 font-semibold">
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

        {/* Example key format */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <Code2 className="w-4 h-4 text-neutral-400" />
            <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">
              {t("exampleLabel")}
            </span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <code className="font-mono text-sm text-emerald-300/90 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
              {t("exampleKey")}
            </code>
            <span className="text-white/30 text-xs">← شكل المفاتيح التي ستُنشئها</span>
          </div>
        </motion.div>

        {/* What you can build */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-panel rounded-3xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-bold text-white">{t("scopesTitle")}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(["chat", "agents", "documents", "webhooks"] as const).map((scope) => (
              <div
                key={scope}
                className="flex items-start gap-3 p-3 rounded-xl border border-white/[0.06] bg-white/[0.03]"
              >
                <ShieldCheck className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                <span className="text-sm text-white/70">{t(`scopes.${scope}`)}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* New key reveal */}
        <AnimatePresence>
          {newKey && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.06] p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                <span className="text-sm font-bold text-emerald-200">
                  انسخ المفتاح الآن — لن يظهر مرة أخرى!
                </span>
              </div>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <code className="flex-1 min-w-0 block p-3 bg-black/40 rounded-xl font-mono text-xs break-all text-white border border-white/10">
                  {newKey}
                </code>
                <CopyBtn text={newKey} />
              </div>
              <button
                onClick={() => setNewKey(null)}
                className="text-xs text-white/30 hover:text-white/60 transition-colors"
              >
                إخفاء
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create new key — collapsible */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel rounded-3xl overflow-hidden"
        >
          <button
            onClick={() => setShowCreate((v) => !v)}
            className="w-full flex items-center justify-between gap-3 p-6 text-right hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/15 flex items-center justify-center">
                <Plus className="w-4 h-4 text-cyan-400" />
              </div>
              <span className="font-bold text-white">مفتاح جديد</span>
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
                    <span className="block text-xs text-white/50 mb-1.5">اسم المفتاح</span>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="مثال: سكريبت التشغيل التلقائي"
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-cyan-400/40 transition-colors"
                    />
                  </label>

                  <div>
                    <span className="block text-xs text-white/50 mb-2">الصلاحيات</span>
                    <div className="flex flex-wrap gap-2">
                      {SCOPES.map((s) => {
                        const active = selectedScopes.includes(s);
                        return (
                          <label
                            key={s}
                            className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg cursor-pointer transition-all border ${
                              active
                                ? "border-cyan-400/40 bg-cyan-500/15 text-cyan-200"
                                : "border-white/10 bg-white/[0.03] text-white/50 hover:border-white/20"
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={active}
                              onChange={(e) =>
                                setSelectedScopes((prev) =>
                                  e.target.checked ? [...prev, s] : prev.filter((x) => x !== s)
                                )
                              }
                            />
                            {active && <Check className="w-3 h-3" />}
                            <span dir="ltr">{s}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    onClick={onCreate}
                    disabled={createMutation.isPending || !name.trim() || selectedScopes.length === 0}
                    className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50"
                  >
                    {createMutation.isPending
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Plus className="w-4 h-4" />
                    }
                    {createMutation.isPending ? "جارٍ الإنشاء…" : "إنشاء المفتاح"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Keys list */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-panel rounded-3xl p-6"
        >
          <h2 className="font-bold text-white mb-4 flex items-center gap-2">
            <Key className="w-4 h-4 text-white/40" />
            المفاتيح الحالية
          </h2>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-white/[0.04] animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/[0.06] p-4 text-sm text-rose-300 flex items-center justify-between gap-3">
              <span>تعذّر تحميل المفاتيح</span>
              <button onClick={() => refetch()} className="text-xs underline underline-offset-2">
                حاول مجدّداً
              </button>
            </div>
          ) : keys.length === 0 ? (
            <div className="py-10 text-center">
              <Key className="w-8 h-8 text-white/15 mx-auto mb-3" />
              <p className="text-sm text-white/40">لا توجد مفاتيح بعد — أنشئ أوّل مفتاح لك</p>
            </div>
          ) : (
            <ul className="space-y-2" role="list">
              {keys.map((k) => (
                <li
                  key={k.id}
                  className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-white">{k.name}</span>
                      {k.revoked && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-rose-500/15 border border-rose-500/20 text-rose-300">
                          مبطَل
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="text-xs font-mono text-white/40 bg-black/20 px-2 py-0.5 rounded-md" dir="ltr">
                        {k.prefix}…
                      </code>
                      {!k.revoked && k.lastUsedAt && (
                        <span className="text-[11px] text-white/30">
                          آخر استخدام: {new Date(k.lastUsedAt).toLocaleDateString("ar-EG")}
                        </span>
                      )}
                      {!k.revoked && !k.lastUsedAt && (
                        <span className="text-[11px] text-white/25">لم يُستخدم بعد</span>
                      )}
                    </div>
                  </div>
                  {!k.revoked && (
                    <button
                      onClick={() => onRevoke(k.id)}
                      disabled={revokeMutation.isPending}
                      className="shrink-0 flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-rose-500/10 disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      إبطال
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

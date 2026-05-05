"use client";
import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { motion } from "motion/react";
import { RefreshCw, Activity, Server, Zap, Wifi, WifiOff, Clock } from "lucide-react";

interface Health {
  status: "healthy" | "degraded";
  timestamp: string;
  version: string;
  checks: Record<string, string>;
  meta: Record<string, unknown>;
}

const STATUS_COLOR: Record<string, string> = {
  connected: "bg-emerald-500",
  configured: "bg-emerald-500",
  protected: "bg-emerald-500",
  disabled: "bg-amber-500",
  unconfigured: "bg-amber-500",
  unprotected: "bg-orange-500",
};

const STATUS_LABEL: Record<string, string> = {
  connected: "متصل",
  configured: "مُضبَّط",
  protected: "محمي",
  disabled: "معطّل",
  unconfigured: "غير مُضبَّط",
  unprotected: "غير محمي",
};

function StatusDot({ status }: { status: string }) {
  const color = STATUS_COLOR[status] ?? "bg-red-500";
  return <span className={`inline-block w-2 h-2 rounded-full ${color} shrink-0`} aria-hidden />;
}

const GROUPS: Record<string, { label: string; keys: string[]; icon: React.ComponentType<{ className?: string }> }> = {
  infrastructure: { label: "البنية التحتية", icon: Server, keys: ["firestore", "knowledgeGraph", "firebaseAdmin", "cron"] },
  features: { label: "الميزات الأساسية", icon: Zap, keys: ["learningLoop", "virtualMeeting", "launchpad", "expertFactory", "virtualOffice"] },
  omnichannel: { label: "القنوات", icon: Wifi, keys: ["whatsapp", "telegram", "email"] },
};

export default function SystemHealthPage() {
  const [data, setData] = useState<Health | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [lastLoaded, setLastLoaded] = useState<Date | null>(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const r = await fetch("/api/health", { cache: "no-store" });
      const j = await r.json();
      setData(j);
      setLastLoaded(new Date());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "فشل التحميل");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    const t = setInterval(load, 15_000);
    return () => clearInterval(t);
  }, []);

  const isHealthy = data?.status === "healthy";

  return (
    <AppShell>
      <div dir="rtl" className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] mb-3 ${
              isHealthy
                ? "border-emerald-400/20 bg-emerald-500/[0.06] text-emerald-300"
                : "border-amber-400/20 bg-amber-500/[0.06] text-amber-300"
            }`}>
              <Activity className="w-3.5 h-3.5" />
              حالة النظام · System Health
            </div>
            <h1 className="text-3xl font-bold text-white">مراقبة الأنظمة</h1>
            <p className="text-neutral-400 text-sm mt-1">
              مراقبة مباشرة لجميع الأنظمة الفرعية — تحديث كل 15 ثانية
            </p>
          </div>
          <button
            onClick={() => void load()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] px-4 py-2.5 text-xs text-neutral-300 hover:bg-white/[0.04] transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            تحديث
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-rose-500/25 bg-rose-500/[0.04] p-4 text-rose-200 text-sm">
            {error}
          </div>
        )}

        {/* Overall status */}
        {data && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 rounded-2xl border p-5 flex items-center gap-4 ${
              isHealthy
                ? "border-emerald-500/25 bg-emerald-500/[0.04]"
                : "border-amber-500/25 bg-amber-500/[0.04]"
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isHealthy ? "bg-emerald-500/15" : "bg-amber-500/15"
            }`}>
              {isHealthy
                ? <Wifi className="w-6 h-6 text-emerald-400" />
                : <WifiOff className="w-6 h-6 text-amber-400" />}
            </div>
            <div className="flex-1">
              <div className={`font-bold text-lg ${isHealthy ? "text-emerald-300" : "text-amber-300"}`}>
                {isHealthy ? "النظام يعمل بكامل طاقته ✓" : "النظام يعمل بشكل متدهور ⚠"}
              </div>
              <div className="text-xs text-neutral-500 mt-0.5 flex items-center gap-3">
                <span>الإصدار: {data.version}</span>
                {lastLoaded && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {lastLoaded.toLocaleTimeString("ar-EG")}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {(loading && !data) && (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-32 rounded-2xl border border-white/[0.04] bg-white/[0.02] animate-pulse" />
            ))}
          </div>
        )}

        {/* Groups */}
        {data && (
          <div className="space-y-4">
            {(Object.entries(GROUPS) as Array<[string, { label: string; keys: string[]; icon: React.ComponentType<{ className?: string }> }]>).map(([key, group]) => {
              const Icon = group.icon;
              const keys = group.keys;
              const allOk = keys.every((k) => {
                const s = data.checks[k];
                return s === "connected" || s === "configured" || s === "protected";
              });

              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      allOk ? "bg-emerald-500/10" : "bg-amber-500/10"
                    }`}>
                      <Icon className={`w-4 h-4 ${allOk ? "text-emerald-400" : "text-amber-400"}`} />
                    </div>
                    <span className="font-bold text-sm text-white">{group.label}</span>
                    <span className={`mr-auto text-[10px] px-2 py-0.5 rounded-full border ${
                      allOk
                        ? "text-emerald-300 bg-emerald-500/10 border-emerald-500/25"
                        : "text-amber-300 bg-amber-500/10 border-amber-500/25"
                    }`}>
                      {allOk ? "✓ سليم" : "⚠ يستحق الانتباه"}
                    </span>
                  </div>
                  <ul className="space-y-2.5" role="list">
                    {keys.map((k) => {
                      const status = data.checks[k] || "unreachable";
                      return (
                        <li key={k} className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2 text-neutral-300">
                            <StatusDot status={status} />
                            <span className="font-mono text-xs">{k}</span>
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded border ${
                            status === "connected" || status === "configured" || status === "protected"
                              ? "text-emerald-300 bg-emerald-500/10 border-emerald-500/20"
                              : status === "disabled" || status === "unconfigured"
                              ? "text-amber-300 bg-amber-500/10 border-amber-500/20"
                              : "text-rose-300 bg-rose-500/10 border-rose-500/20"
                          }`}>
                            {STATUS_LABEL[status] || status}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Recent launches */}
        {Array.isArray(data?.meta?.recentLaunchRuns) && (data.meta.recentLaunchRuns as unknown[]).length > 0 && (
          <div className="mt-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
            <div className="font-bold text-sm text-white mb-3">آخر عمليات الإطلاق</div>
            <ul className="space-y-1 text-xs" role="list">
              {(data.meta.recentLaunchRuns as Array<{ id: string; status?: string }>).map((r) => (
                <li key={r.id} className="flex justify-between text-neutral-400">
                  <span className="font-mono">{r.id}</span>
                  <span>{r.status}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </AppShell>
  );
}

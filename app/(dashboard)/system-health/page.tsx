"use client";
import React, { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { motion, AnimatePresence } from "motion/react";
import {
  RefreshCw, Activity, Server, Zap, Wifi, WifiOff, Clock,
  Cpu, Database, BarChart2, FileText, RotateCcw, Info,
} from "lucide-react";

interface Health {
  status: "healthy" | "degraded";
  timestamp: string;
  version: string;
  checks: Record<string, string>;
  meta: Record<string, unknown>;
}

interface WorkerHealth {
  name: string;
  key: string;
  url: string;
  status: "ok" | "warming_up" | "unreachable" | "degraded";
  version?: string;
  uptime_seconds?: number;
  latency_ms?: number;
  detail?: Record<string, unknown>;
  checkedAt: number;
}

interface WorkersResult {
  workers: WorkerHealth[];
  allOk: boolean;
  checkedAt: number;
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

const WORKER_STATUS_CONFIG: Record<WorkerHealth["status"], { label: string; dot: string; badge: string }> = {
  ok: {
    label: "يعمل",
    dot: "bg-emerald-500",
    badge: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
  },
  warming_up: {
    label: "يُحمَّل",
    dot: "bg-amber-400",
    badge: "text-amber-300 bg-amber-500/10 border-amber-500/20",
  },
  unreachable: {
    label: "غير متاح",
    dot: "bg-rose-500",
    badge: "text-rose-300 bg-rose-500/10 border-rose-500/20",
  },
  degraded: {
    label: "متدهور",
    dot: "bg-orange-500",
    badge: "text-orange-300 bg-orange-500/10 border-orange-500/20",
  },
};

const WORKER_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  pdfWorker: FileText,
  egyptCalc: BarChart2,
  llmJudge: Cpu,
  embeddingsWorker: Database,
};

function StatusDot({ status }: { status: string }) {
  const color = STATUS_COLOR[status] ?? "bg-rose-500";
  return <span className={`inline-block w-2 h-2 rounded-full ${color} shrink-0`} aria-hidden />;
}

const GROUPS: Record<string, { label: string; keys: string[]; icon: React.ComponentType<{ className?: string }> }> = {
  infrastructure: { label: "البنية التحتية", icon: Server, keys: ["firestore", "knowledgeGraph", "firebaseAdmin", "cron"] },
  features: { label: "الميزات الأساسية", icon: Zap, keys: ["learningLoop", "virtualMeeting", "launchpad", "expertFactory", "virtualOffice"] },
  omnichannel: { label: "القنوات", icon: Wifi, keys: ["whatsapp", "telegram", "email"] },
};

function fmt(sec: number | undefined): string {
  if (sec == null) return "—";
  if (sec < 60) return `${Math.round(sec)}s`;
  if (sec < 3600) return `${Math.round(sec / 60)}m`;
  return `${(sec / 3600).toFixed(1)}h`;
}

/** Port map for admin restart hints */
const WORKER_PORT_MAP: Record<string, { port: number; dir: string }> = {
  pdfWorker:         { port: 8000, dir: "services/pdf-worker" },
  egyptCalc:         { port: 8008, dir: "services/egypt-calc" },
  llmJudge:          { port: 8080, dir: "services/llm-judge" },
  embeddingsWorker:  { port: 8099, dir: "services/embeddings-worker" },
};

export default function SystemHealthPage() {
  const [data, setData] = useState<Health | null>(null);
  const [workers, setWorkers] = useState<WorkersResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [workersLoading, setWorkersLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastLoaded, setLastLoaded] = useState<Date | null>(null);
  const [restartPanelKey, setRestartPanelKey] = useState<string | null>(null);

  const loadMain = useCallback(async () => {
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
  }, []);

  const loadWorkers = useCallback(async (force = false) => {
    setWorkersLoading(true);
    try {
      const url = force ? "/api/health/workers?force=1" : "/api/health/workers";
      const r = await fetch(url, { cache: "no-store" });
      const j = await r.json();
      setWorkers(j);
    } catch {
    } finally {
      setWorkersLoading(false);
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    await Promise.all([loadMain(), loadWorkers()]);
  }, [loadMain, loadWorkers]);

  const handleRefreshWorkers = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetch("/api/health/workers", { method: "POST" });
      await loadWorkers(true);
    } finally {
      setRefreshing(false);
    }
  }, [loadWorkers]);

  useEffect(() => {
    async function run() { await load(); }
    void run();
    const t = setInterval(() => void loadMain(), 15_000);
    const tw = setInterval(() => void loadWorkers(), 30_000);
    return () => { clearInterval(t); clearInterval(tw); };
  }, [load, loadMain, loadWorkers]);

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

        {/* ── Python Workers Section ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 mb-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              workers?.allOk ? "bg-emerald-500/10" : "bg-amber-500/10"
            }`}>
              <Server className={`w-4 h-4 ${workers?.allOk ? "text-emerald-400" : "text-amber-400"}`} />
            </div>
            <span className="font-bold text-sm text-white">الخدمات الجانبية (Python Sidecars)</span>
            <span className={`mr-auto text-[10px] px-2 py-0.5 rounded-full border ${
              workers?.allOk
                ? "text-emerald-300 bg-emerald-500/10 border-emerald-500/25"
                : "text-amber-300 bg-amber-500/10 border-amber-500/25"
            }`}>
              {workers?.allOk ? "✓ سليم" : "⚠ يستحق الانتباه"}
            </span>
            <button
              onClick={() => void handleRefreshWorkers()}
              disabled={workersLoading || refreshing}
              className="mr-2 inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-lg border border-white/[0.06] text-neutral-400 hover:bg-white/[0.04] transition disabled:opacity-40"
            >
              <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`} />
              فحص الآن
            </button>
          </div>

          {workersLoading && !workers ? (
            <div className="space-y-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-10 rounded-xl bg-white/[0.03] animate-pulse" />
              ))}
            </div>
          ) : workers ? (
            <ul className="space-y-2" role="list">
              {workers.workers.map((w) => {
                const cfg = WORKER_STATUS_CONFIG[w.status];
                const Icon = WORKER_ICONS[w.key] ?? Server;
                const portInfo = WORKER_PORT_MAP[w.key];
                const isDown = w.status === "unreachable" || w.status === "degraded";
                const panelOpen = restartPanelKey === w.key;
                return (
                  <li key={w.key} className="rounded-xl border border-white/[0.04] bg-white/[0.02] overflow-hidden">
                    <div className="flex items-center gap-3 px-3 py-2.5 text-sm">
                      <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} aria-hidden />
                      <Icon className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                      <span className="text-neutral-200 text-xs font-medium flex-1">{w.name}</span>

                      {w.uptime_seconds != null && (
                        <span className="text-[10px] text-neutral-600 tabular-nums">
                          ↑ {fmt(w.uptime_seconds)}
                        </span>
                      )}
                      {w.latency_ms != null && (
                        <span className="text-[10px] text-neutral-600 tabular-nums">
                          {w.latency_ms}ms
                        </span>
                      )}
                      {w.version && (
                        <span className="text-[10px] text-neutral-600 font-mono">{w.version}</span>
                      )}
                      <span className={`text-[10px] px-2 py-0.5 rounded border ${cfg.badge}`}>
                        {cfg.label}
                      </span>
                      {isDown && (
                        <button
                          onClick={() => setRestartPanelKey(panelOpen ? null : w.key)}
                          className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border border-indigo-500/30 text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 transition"
                          aria-expanded={panelOpen}
                          aria-label={`إرشادات إعادة تشغيل ${w.name}`}
                        >
                          <RotateCcw className="w-2.5 h-2.5" />
                          إعادة التشغيل
                        </button>
                      )}
                    </div>

                    <AnimatePresence>
                      {panelOpen && portInfo && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-3 pt-1 border-t border-indigo-500/10 bg-indigo-500/[0.03]">
                            <div className="flex items-start gap-2 mb-2">
                              <Info className="w-3 h-3 text-indigo-400 mt-0.5 shrink-0" />
                              <p className="text-[10px] text-indigo-200/80 leading-relaxed">
                                لإعادة تشغيل هذه الخدمة، انتقل إلى لوحة Workflows في Replit وأعد تشغيل{" "}
                                <span className="font-semibold text-indigo-200">{w.name}</span>.
                              </p>
                            </div>
                            <code className="block text-[10px] bg-black/30 rounded px-2 py-1.5 text-neutral-400 font-mono" dir="ltr">
                              {`cd ${portInfo.dir} && uvicorn main:app --port ${portInfo.port}`}
                            </code>
                            <button
                              onClick={() => {
                                setRestartPanelKey(null);
                                void handleRefreshWorkers();
                              }}
                              className="mt-2 inline-flex items-center gap-1 text-[10px] text-cyan-300 hover:text-cyan-100 transition"
                            >
                              <RefreshCw className="w-2.5 h-2.5" />
                              تحقق من الحالة مجدداً
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ul>
          ) : null}

          {workers && (
            <p className="text-[10px] text-neutral-700 mt-3 text-left" dir="ltr">
              Last checked: {new Date(workers.checkedAt).toLocaleTimeString()} · cache 30s
            </p>
          )}
        </motion.div>

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

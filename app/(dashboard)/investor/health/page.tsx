"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import {
  CheckCircle2, XCircle, RefreshCw, ShieldCheck, Server,
  KeyRound, ArrowRight, AlertTriangle,
} from "lucide-react";

interface SidecarStatus {
  name: string;
  role: string;
  url: string;
  critical: boolean;
  ok: boolean;
  latencyMs: number | null;
  detail?: string;
}

interface EnvStatus {
  key: string;
  label: string;
  critical: boolean;
  set: boolean;
}

interface HealthResponse {
  ok: boolean;
  generatedAt: string;
  readyForDemo: boolean;
  readinessScore: number;
  sidecars: SidecarStatus[];
  environment: EnvStatus[];
  summary: {
    sidecarsTotal: number;
    sidecarsHealthy: number;
    envTotal: number;
    envSet: number;
    criticalSidecarFailures: number;
    criticalEnvMissing: number;
  };
}

function ScoreBadge({ score, ready }: { score: number; ready: boolean }) {
  const color = ready
    ? "from-emerald-500 to-teal-500"
    : score >= 60
    ? "from-amber-500 to-orange-500"
    : "from-rose-500 to-pink-500";
  return (
    <div
      className={`relative size-32 rounded-full bg-gradient-to-br ${color} p-1 shadow-2xl`}
    >
      <div className="size-full rounded-full bg-slate-950/80 flex flex-col items-center justify-center">
        <div className="text-3xl font-bold text-white tabular-nums">{score}</div>
        <div className="text-[10px] text-white/60">من 100</div>
      </div>
    </div>
  );
}

export default function InvestorHealthPage() {
  const [data, setData] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const r = await fetch("/api/investor/health", { cache: "no-store" });
      const json = (await r.json()) as HealthResponse;
      setData(json);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8" dir="rtl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-300/90 mb-2">
              <ShieldCheck className="size-3.5" />
              <span>فحص جاهزية العرض</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              قبل العرض على المستثمر
            </h1>
            <p className="text-white/60 mt-2 max-w-2xl">
              فحص شامل للخدمات الحرجة، المتغيّرات السرّية، والاتصال — لتجنّب أي مفاجأة وقت العرض.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => void load()}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10 disabled:opacity-60"
            >
              <RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "جاري الفحص…" : "إعادة الفحص"}
            </button>
            <Link
              href="/investor"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/15"
            >
              نبضة المنصّة
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        {loading && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center text-white/60">
            جاري تشغيل الفحوصات…
          </div>
        )}

        {!loading && !data && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-red-200">
            تعذّر تشغيل الفحص. حاول إعادة المحاولة.
          </div>
        )}

        {data && (
          <>
            {/* Hero readiness */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/60 to-slate-950/60 p-8 flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <ScoreBadge score={data.readinessScore} ready={data.readyForDemo} />
                <div>
                  <div className="text-xs text-white/60">حالة الجاهزية</div>
                  <h2 className="text-2xl font-bold text-white mt-1">
                    {data.readyForDemo ? "جاهز للعرض" : "تحتاج معالجة قبل العرض"}
                  </h2>
                  <p className="text-sm text-white/70 mt-2 max-w-md">
                    {data.summary.sidecarsHealthy}/{data.summary.sidecarsTotal} خدمات مساعدة •{" "}
                    {data.summary.envSet}/{data.summary.envTotal} متغيّرات بيئة مضبوطة
                  </p>
                </div>
              </div>
              {!data.readyForDemo && (
                <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-amber-200 text-sm max-w-sm">
                  <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                  <div>
                    {data.summary.criticalSidecarFailures > 0 && (
                      <div>
                        خدمات حرجة متوقّفة: {data.summary.criticalSidecarFailures}
                      </div>
                    )}
                    {data.summary.criticalEnvMissing > 0 && (
                      <div>
                        متغيّرات حرجة ناقصة: {data.summary.criticalEnvMissing}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidecars */}
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
                <Server className="size-5 text-cyan-400" />
                الخدمات المساعدة (Sidecars)
              </h3>
              <ul className="space-y-2">
                {data.sidecars.map((s) => (
                  <li
                    key={s.name}
                    className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 ${
                      s.ok
                        ? "border-emerald-500/20 bg-emerald-500/5"
                        : s.critical
                        ? "border-rose-500/30 bg-rose-500/5"
                        : "border-amber-500/20 bg-amber-500/5"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {s.ok ? (
                        <CheckCircle2 className="size-5 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="size-5 text-rose-400 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <div className="text-white font-medium flex items-center gap-2">
                          {s.name}
                          {s.critical && (
                            <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] text-rose-300">
                              حرج
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-white/60">{s.role}</div>
                      </div>
                    </div>
                    <div className="text-xs text-white/60 tabular-nums">
                      {s.ok
                        ? `${s.latencyMs ?? 0}ms`
                        : s.detail ?? "غير متاح"}
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            {/* Environment */}
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
                <KeyRound className="size-5 text-fuchsia-400" />
                المتغيّرات السرّية
              </h3>
              <div className="grid sm:grid-cols-2 gap-2">
                {data.environment.map((e) => (
                  <div
                    key={e.key}
                    className={`flex items-center justify-between gap-3 rounded-xl border p-3 ${
                      e.set
                        ? "border-emerald-500/20 bg-emerald-500/5"
                        : e.critical
                        ? "border-rose-500/30 bg-rose-500/5"
                        : "border-white/10 bg-white/[0.02]"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {e.set ? (
                        <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle
                          className={`size-4 shrink-0 ${
                            e.critical ? "text-rose-400" : "text-white/40"
                          }`}
                        />
                      )}
                      <div className="min-w-0">
                        <div className="text-sm text-white truncate">{e.label}</div>
                        <div className="text-[10px] text-white/40 font-mono truncate">
                          {e.key}
                        </div>
                      </div>
                    </div>
                    {e.critical && !e.set && (
                      <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] text-rose-300 shrink-0">
                        حرج
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <p className="text-xs text-white/40 text-center">
              آخر فحص في {new Date(data.generatedAt).toLocaleString("ar-EG")}
            </p>
          </>
        )}
      </div>
    </AppShell>
  );
}

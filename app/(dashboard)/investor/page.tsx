"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import {
  TrendingUp, ShieldCheck, Globe2, Cpu, DollarSign,
  Languages, Activity, ArrowLeft, Sparkles, Eye,
  CheckCircle2, AlertCircle, Layers,
} from "lucide-react";

interface MetricsResponse {
  ok: boolean;
  generatedAt: string;
  platform: {
    demoReadyAgents: number;
    betaAgents: number;
    totalAgentsRegistered: number;
    supportedLanguages: string[];
    targetMarkets: string[];
    sidecars: number;
    llmProviders: string[];
    defaultDailyBudgetUsd: number;
    observabilityStack: string[];
    complianceModules: string[];
  };
  demoPath: Array<{
    slug: string;
    displayNameAr: string;
    pitchAr: string;
    readiness: "ready" | "beta" | "hidden";
    order: number;
    href: string;
  }>;
  sidecars: Array<{ name: string; role: string; critical: boolean }>;
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent = "from-cyan-500 to-indigo-500",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-[0.07]`} />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-xs text-white/60 mb-1">{label}</div>
          <div className="text-3xl font-bold text-white tabular-nums">{value}</div>
          {sub && <div className="text-xs text-white/50 mt-1">{sub}</div>}
        </div>
        <div className={`rounded-xl bg-gradient-to-br ${accent} p-2.5 shadow-lg`}>
          <Icon className="size-5 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function InvestorMetricsPage() {
  const [data, setData] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/investor/metrics", { cache: "no-store" })
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8" dir="rtl">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-300/90 mb-2">
              <Sparkles className="size-3.5" />
              <span>عرض المستثمرين</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              نبضة المنصّة
            </h1>
            <p className="text-white/60 mt-2 max-w-2xl">
              ملخّص حقائق Kalmeron AI: الوكلاء، الأسواق، البنية التحتية، والحوكمة — مصدر واحد للحقيقة قابل للقراءة في 60 ثانية.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/investor/health"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10"
            >
              <ShieldCheck className="size-4" />
              فحص جاهزية العرض
            </Link>
            <Link
              href="/investor/demo-mode"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:opacity-95"
            >
              <Eye className="size-4" />
              وضع العرض
            </Link>
          </div>
        </div>

        {loading && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center text-white/60">
            جاري تحميل المؤشّرات…
          </div>
        )}

        {!loading && !data && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-red-200">
            تعذّر تحميل المؤشّرات. حاول إعادة تحميل الصفحة.
          </div>
        )}

        {data && (
          <>
            {/* Top stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={Cpu}
                label="مساعدون أذكياء جاهزون للعرض"
                value={data.platform.demoReadyAgents}
                sub={`من إجمالي ${data.platform.totalAgentsRegistered} مساعد ذكي`}
                accent="from-cyan-500 to-indigo-500"
              />
              <StatCard
                icon={Layers}
                label="خدمات بنية تحتية"
                value={data.platform.sidecars}
                sub="حسابات حتمية + RAG محلي"
                accent="from-emerald-500 to-cyan-500"
              />
              <StatCard
                icon={Globe2}
                label="أسواق مستهدفة"
                value={data.platform.targetMarkets.length}
                sub={data.platform.targetMarkets.join("، ")}
                accent="from-fuchsia-500 to-pink-500"
              />
              <StatCard
                icon={DollarSign}
                label="سقف يومي افتراضي"
                value={`$${data.platform.defaultDailyBudgetUsd}`}
                sub="لكل مستخدم — قابل للتعديل"
                accent="from-amber-500 to-orange-500"
              />
            </div>

            {/* Demo Path */}
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <TrendingUp className="size-5 text-cyan-400" />
                    مسار العرض الموصى به
                  </h2>
                  <p className="text-sm text-white/60 mt-1">
                    رحلة مستثمر متماسكة من الفكرة إلى التشغيل في أقل من 10 دقائق.
                  </p>
                </div>
              </div>
              <ol className="space-y-3">
                {data.demoPath.map((step) => (
                  <li
                    key={step.slug}
                    className="flex flex-wrap items-start gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 hover:border-cyan-400/30 transition"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 text-cyan-200 font-bold">
                      {step.order}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-white font-semibold">{step.displayNameAr}</h3>
                        {step.readiness === "ready" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-300">
                            <CheckCircle2 className="size-3" /> جاهز
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] text-amber-300">
                            <AlertCircle className="size-3" /> تجريبي
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-white/70 mt-1">{step.pitchAr}</p>
                    </div>
                    <Link
                      href={step.href}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10"
                    >
                      جرّبه
                      <ArrowLeft className="size-3.5" />
                    </Link>
                  </li>
                ))}
              </ol>
            </section>

            {/* Capabilities grid */}
            <div className="grid md:grid-cols-2 gap-4">
              <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <h3 className="text-white font-semibold flex items-center gap-2 mb-3">
                  <Languages className="size-5 text-fuchsia-400" />
                  لغات وأسواق
                </h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-white/60">اللغات المدعومة</dt>
                    <dd className="text-white text-end">
                      {data.platform.supportedLanguages.join("، ")}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-white/60">الأسواق المستهدفة</dt>
                    <dd className="text-white text-end">
                      {data.platform.targetMarkets.join("، ")}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-white/60">مزوّدو نماذج LLM</dt>
                    <dd className="text-white text-end">
                      {data.platform.llmProviders.join("، ")}
                    </dd>
                  </div>
                </dl>
              </section>

              <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <h3 className="text-white font-semibold flex items-center gap-2 mb-3">
                  <ShieldCheck className="size-5 text-emerald-400" />
                  المراقبة والحوكمة
                </h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-white/60">المراقبة</dt>
                    <dd className="text-white text-end">
                      {data.platform.observabilityStack.join("، ")}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-white/60">وحدات الامتثال</dt>
                    <dd className="text-white text-end text-xs leading-relaxed">
                      {data.platform.complianceModules.join("، ")}
                    </dd>
                  </div>
                </dl>
              </section>
            </div>

            {/* Sidecars */}
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
                <Activity className="size-5 text-cyan-400" />
                الخدمات المساعدة
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {data.sidecars.map((s) => (
                  <div
                    key={s.name}
                    className="rounded-xl border border-white/5 bg-white/[0.02] p-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{s.name}</span>
                      {s.critical && (
                        <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] text-rose-300">
                          حرج
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/60 mt-1">{s.role}</p>
                  </div>
                ))}
              </div>
            </section>

            <p className="text-xs text-white/40 text-center">
              مولّد في {new Date(data.generatedAt).toLocaleString("ar-EG")}
            </p>
          </>
        )}
      </div>
    </AppShell>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import {
  TrendingUp, ShieldCheck, Globe2, Cpu, DollarSign,
  Languages, Activity, ArrowLeft, Sparkles, Eye,
  CheckCircle2, AlertCircle, Layers,
  Rocket, FileText, BarChart3, Users, Target,
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
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-rose-200">
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

            {/* Pitch Deck & Tools */}
            <div className="grid md:grid-cols-3 gap-4">
              {[
                {
                  href: "/workflows-runner?workflow=partnership-deck",
                  icon: FileText,
                  title: "عرض للمستثمرين",
                  description: "اصنع pitch deck احترافي بالذكاء الاصطناعي في 5 دقائق",
                  badge: "مدعوم بـ AI",
                  gradient: "from-amber-500/15 to-orange-500/5",
                  border: "border-amber-500/30",
                  badgeColor: "text-amber-300 bg-amber-500/10 border-amber-500/20",
                  iconColor: "text-amber-400",
                  iconBg: "bg-amber-500/10",
                },
                {
                  href: "/cash-runway",
                  icon: BarChart3,
                  title: "تحليل الـ Runway",
                  description: "احسب الوقت المتبقي لاحتياطي النقد وخطة الإنقاذ",
                  badge: "Excel محسوب",
                  gradient: "from-emerald-500/15 to-teal-500/5",
                  border: "border-emerald-500/30",
                  badgeColor: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
                  iconColor: "text-emerald-400",
                  iconBg: "bg-emerald-500/10",
                },
                {
                  href: "/workflows-runner?workflow=financial-model",
                  icon: Target,
                  title: "نموذج مالي للمستثمر",
                  description: "توقعات الإيرادات والتكاليف لـ 3 سنوات جاهزة للتقديم",
                  badge: "قالب متكامل",
                  gradient: "from-indigo-500/15 to-violet-500/5",
                  border: "border-indigo-500/30",
                  badgeColor: "text-indigo-300 bg-indigo-500/10 border-indigo-500/20",
                  iconColor: "text-indigo-400",
                  iconBg: "bg-indigo-500/10",
                },
              ].map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className={`rounded-2xl border p-5 hover:scale-[1.01] transition-all group bg-gradient-to-br ${tool.gradient} ${tool.border}`}
                >
                  <div className={`w-10 h-10 rounded-xl ${tool.iconBg} flex items-center justify-center mb-3`}>
                    <tool.icon className={`size-5 ${tool.iconColor}`} />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tool.badgeColor} inline-block mb-2`}>
                    {tool.badge}
                  </span>
                  <h3 className="text-white font-bold text-sm mb-1">{tool.title}</h3>
                  <p className="text-white/60 text-xs leading-relaxed">{tool.description}</p>
                  <div className="flex items-center gap-1 mt-3 text-xs text-white/40 group-hover:text-white/70 transition-colors">
                    ابدأ الآن <ArrowLeft className="size-3.5" />
                  </div>
                </Link>
              ))}
            </div>

            {/* Traction KPIs */}
            <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
                <Rocket className="size-5 text-fuchsia-400" />
                قصة النمو — لماذا الآن؟
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                {[
                  { label: "حصة السوق المستهدفة MENA", value: "+6M", sub: "مؤسس ورائد أعمال" },
                  { label: "الوقت للقيمة الأولى", value: "<5 دقائق", sub: "من التسجيل" },
                  { label: "وكلاء AI متخصصون", value: `${data.platform.totalAgentsRegistered}+`, sub: "بالعربية والإنجليزية" },
                  { label: "نموذج الإيراد", value: "SaaS", sub: "اشتراك شهري / سنوي" },
                ].map((kpi) => (
                  <div key={kpi.label} className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
                    <div className="text-2xl font-black text-white mb-1">{kpi.value}</div>
                    <div className="text-[10px] text-white/60 leading-snug">{kpi.label}</div>
                    <div className="text-[10px] text-white/40 mt-1">{kpi.sub}</div>
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

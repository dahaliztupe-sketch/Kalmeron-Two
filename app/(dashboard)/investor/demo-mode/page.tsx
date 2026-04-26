"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import {
  Eye, EyeOff, CheckCircle2, ArrowLeft, Sparkles, Info,
  Shield, Database, Hammer,
} from "lucide-react";

export default function DemoModePage() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/investor/demo-mode", { cache: "no-store" });
      const j = await r.json();
      setEnabled(Boolean(j.enabled));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const toggle = async () => {
    setSaving(true);
    try {
      const next = !enabled;
      const r = await fetch("/api/investor/demo-mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: next }),
      });
      const j = await r.json();
      setEnabled(Boolean(j.enabled));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-8" dir="rtl">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-300/90 mb-2">
            <Sparkles className="size-3.5" />
            <span>وضع العرض على المستثمر</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">
            تشغيل وضع العرض
          </h1>
          <p className="text-white/60 mt-2 max-w-2xl">
            مفتاح واحد يحوّل المنصّة إلى نسخة "آمنة للعرض": يخفي الميزات التجريبية، يفعّل الشارات الجاهزة، ويُبرز المسار الموصى به للمستثمر.
          </p>
        </div>

        {/* Big toggle */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/60 to-slate-950/60 p-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div
                className={`size-16 rounded-2xl flex items-center justify-center ${
                  enabled
                    ? "bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/30"
                    : "bg-white/10"
                }`}
              >
                {enabled ? (
                  <Eye className="size-7 text-white" />
                ) : (
                  <EyeOff className="size-7 text-white/60" />
                )}
              </div>
              <div>
                <div className="text-xs text-white/60">الحالة الحالية</div>
                <h2 className="text-2xl font-bold text-white mt-1">
                  {loading
                    ? "جاري التحميل…"
                    : enabled
                    ? "وضع العرض مُفعَّل"
                    : "وضع العرض متوقّف"}
                </h2>
                <p className="text-sm text-white/60 mt-1">
                  {enabled
                    ? "المنصّة تعرض المسار الموصى به فقط ويُخفى ما هو غير جاهز."
                    : "المنصّة تعمل بالوضع الكامل بكل الميزات والوكلاء."}
                </p>
              </div>
            </div>
            <button
              onClick={toggle}
              disabled={saving || loading}
              className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-lg transition disabled:opacity-60 ${
                enabled
                  ? "bg-white/10 hover:bg-white/15"
                  : "bg-gradient-to-br from-amber-500 to-orange-500 hover:opacity-95"
              }`}
            >
              {saving
                ? "جاري الحفظ…"
                : enabled
                ? "إيقاف وضع العرض"
                : "تفعيل وضع العرض"}
            </button>
          </div>
        </div>

        {/* What it does */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="rounded-xl bg-cyan-500/15 size-10 flex items-center justify-center mb-3">
              <CheckCircle2 className="size-5 text-cyan-300" />
            </div>
            <h3 className="text-white font-semibold mb-1">يُبرز المسار الموصى به</h3>
            <p className="text-sm text-white/60">
              الوكلاء الستة الجاهزون للعرض يظهرون أوّلًا في الصفحة الرئيسية وفي قائمة الوكلاء.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="rounded-xl bg-amber-500/15 size-10 flex items-center justify-center mb-3">
              <Shield className="size-5 text-amber-300" />
            </div>
            <h3 className="text-white font-semibold mb-1">يخفي ما هو غير مكتمل</h3>
            <p className="text-sm text-white/60">
              الوكلاء التجريبيون يظهرون بشارة "تجريبي" لتجنّب الإحراج وقت الأسئلة.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="rounded-xl bg-emerald-500/15 size-10 flex items-center justify-center mb-3">
              <Database className="size-5 text-emerald-300" />
            </div>
            <h3 className="text-white font-semibold mb-1">يُحضّر بيانات الاستعراض</h3>
            <p className="text-sm text-white/60">
              يُمكنك تحميل حساب نموذجي ببيانات شركة افتراضية حقيقية المظهر.
            </p>
          </div>
        </div>

        {/* Steps */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
            <Hammer className="size-5 text-fuchsia-400" />
            قائمة فحص ما قبل العرض
          </h3>
          <ol className="space-y-3 text-sm">
            {[
              { label: "تشغيل وضع العرض من هذه الصفحة", done: enabled },
              { label: "فحص جاهزية الخدمات والمتغيّرات", href: "/investor/health" },
              { label: "مراجعة نبضة المنصّة (المؤشّرات)", href: "/investor" },
              { label: "تجربة المسار الموصى به من بدايته إلى نهايته", href: "/chat" },
              { label: "إعداد حساب نموذجي ببيانات شركة واقعية", href: "/brand-voice" },
              { label: "تجهيز بصفحة عرض المستثمر التفاعلية", href: "/investor-deck" },
            ].map((s, i) => (
              <li
                key={i}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`size-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      s.done
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-white/5 text-white/60"
                    }`}
                  >
                    {s.done ? "✓" : i + 1}
                  </div>
                  <span className="text-white/85">{s.label}</span>
                </div>
                {s.href && (
                  <Link
                    href={s.href}
                    className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10"
                  >
                    افتح
                    <ArrowLeft className="size-3.5" />
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </section>

        <div className="flex items-start gap-3 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4 text-sm text-cyan-100">
          <Info className="size-4 mt-0.5 shrink-0" />
          <p>
            وضع العرض يُحفظ في كوكي على متصفّحك لمدة 24 ساعة فقط، ويمكن إيقافه في أي لحظة من نفس هذه الصفحة.
          </p>
        </div>
      </div>
    </AppShell>
  );
}

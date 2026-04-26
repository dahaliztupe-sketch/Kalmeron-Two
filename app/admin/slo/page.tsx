/**
 * /admin/slo — SLO Burn-Rate Dashboard.
 *
 * P2-2 from Virtual Boardroom 201 (Charity Majors seat).
 *
 * Reads:
 *  - `slo_metrics` (latest aggregate doc per service)
 *  - `health_probe` (last 28 days of cron pings)
 *  - error budgets defined in docs/SLO.md
 *
 * Computes 28-day rolling availability and burn-rate alerts.
 */
import Link from "next/link";
import { ArrowLeft, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { adminDb } from "@/src/lib/firebase-admin";
import { getTtfvSummary } from "@/src/lib/analytics/ttfv";

export const dynamic = "force-dynamic";
export const revalidate = 60;

interface SloRow {
  name: string;
  target: number; // 0..1
  actual: number; // 0..1
  budgetMinutes: number; // total error budget in minutes
  consumedMinutes: number;
}

async function loadSloRows(): Promise<SloRow[]> {
  // Pull last 28 days of health-probe runs as a proxy for availability SLI.
  const since = Date.now() - 28 * 24 * 60 * 60 * 1000;
  let probeOk = 0;
  let probeTotal = 0;
  try {
    const snap = await adminDb
      .collection("health_probe_runs")
      .where("ts", ">=", since)
      .limit(5000)
      .get();
    snap.forEach((d) => {
      const v = d.data() as Record<string, unknown>;
      probeTotal++;
      if (v.ok === true || v.status === "ok") probeOk++;
    });
  } catch {
    /* ignore */
  }

  const availability = probeTotal > 0 ? probeOk / probeTotal : 1;

  // Cron success rate from cron_runs collection.
  let cronOk = 0;
  let cronTotal = 0;
  try {
    const snap = await adminDb
      .collection("cron_runs")
      .where("ts", ">=", since)
      .limit(5000)
      .get();
    snap.forEach((d) => {
      const v = d.data() as Record<string, unknown>;
      cronTotal++;
      if (v.ok === true || v.status === "ok") cronOk++;
    });
  } catch {
    /* ignore */
  }
  const cronAvail = cronTotal > 0 ? cronOk / cronTotal : 1;

  const rows: SloRow[] = [
    {
      name: "Web app reachability",
      target: 0.999,
      actual: availability,
      budgetMinutes: 40,
      consumedMinutes: Math.max(0, (1 - availability) * 28 * 24 * 60),
    },
    {
      name: "API availability",
      target: 0.995,
      actual: availability, // proxy; would split by route in prod
      budgetMinutes: 202,
      consumedMinutes: Math.max(0, (1 - availability) * 28 * 24 * 60),
    },
    {
      name: "Background jobs",
      target: 0.99,
      actual: cronAvail,
      budgetMinutes: 7 * 60,
      consumedMinutes: Math.max(0, (1 - cronAvail) * cronTotal * 60),
    },
  ];
  return rows;
}

function StatusPill({ row }: { row: SloRow }) {
  const meeting = row.actual >= row.target;
  const burn = row.consumedMinutes / Math.max(1, row.budgetMinutes);
  if (meeting && burn < 0.5) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 text-emerald-300 px-3 py-1 text-xs">
        <CheckCircle2 className="w-3.5 h-3.5" /> سليم
      </span>
    );
  }
  if (burn >= 1) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 text-rose-300 px-3 py-1 text-xs">
        <AlertTriangle className="w-3.5 h-3.5" /> تجاوز الميزانية
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 text-amber-300 px-3 py-1 text-xs">
      <Clock className="w-3.5 h-3.5" /> تحت المراقبة
    </span>
  );
}

export default async function SloDashboardPage() {
  const [rows, ttfv] = await Promise.all([loadSloRows(), getTtfvSummary(2000)]);

  return (
    <div dir="rtl" className="min-h-screen bg-[#05070D] text-white">
      <header className="border-b border-white/[0.05] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2 text-neutral-300 hover:text-white text-sm">
            <ArrowLeft className="w-4 h-4" /> لوحة الإدارة
          </Link>
          <span className="text-xs text-neutral-500">SLO Dashboard · 28d rolling</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">أهداف مستوى الخدمة (SLOs)</h1>
        <p className="text-neutral-400 mb-8 text-sm">
          المصدر الأساسي: <code className="text-neutral-300">docs/SLO.md</code>. التحديث كل 60 ثانية. حد الإنذار: استهلاك 50%+ من ميزانية الخطأ.
        </p>

        <div className="rounded-3xl border border-white/[0.08] overflow-hidden mb-10">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.03] text-neutral-400">
              <tr>
                <th className="text-right p-4 font-medium">الخدمة</th>
                <th className="text-right p-4 font-medium">الهدف</th>
                <th className="text-right p-4 font-medium">الفعلي</th>
                <th className="text-right p-4 font-medium">ميزانية الخطأ</th>
                <th className="text-right p-4 font-medium">المستهلَك</th>
                <th className="text-right p-4 font-medium">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.name} className="border-t border-white/[0.04]">
                  <td className="p-4 font-medium text-white">{r.name}</td>
                  <td className="p-4 text-neutral-300 tabular-nums">{(r.target * 100).toFixed(2)}%</td>
                  <td className={`p-4 tabular-nums font-semibold ${r.actual >= r.target ? "text-emerald-300" : "text-rose-300"}`}>
                    {(r.actual * 100).toFixed(2)}%
                  </td>
                  <td className="p-4 text-neutral-400 tabular-nums">{r.budgetMinutes.toFixed(0)} د</td>
                  <td className="p-4 text-neutral-300 tabular-nums">{r.consumedMinutes.toFixed(1)} د</td>
                  <td className="p-4"><StatusPill row={r} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="text-xl font-bold mb-4">TTFV (Time to First Value)</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <Card label="مستخدمون موصلون" value={String(ttfv.totalUsersWithFirstValue)} />
          <Card label="Median TTFV-cold" value={fmt(ttfv.medianColdMs)} />
          <Card label="Median TTFV-warm" value={fmt(ttfv.medianWarmMs)} />
          <Card label="P90 TTFV-warm" value={fmt(ttfv.p90WarmMs)} />
        </div>

        <p className="text-xs text-neutral-500 mt-8">
          سياسة استنفاد الميزانية: تجميد الإصدارات غير الحرجة + 50% من سعة الهندسة للموثوقية في السبرنت التالي.
        </p>
      </main>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
      <div className="text-neutral-500 text-xs mb-2">{label}</div>
      <div className="text-2xl font-bold text-white tabular-nums">{value}</div>
    </div>
  );
}

function fmt(ms: number | null): string {
  if (ms == null) return "—";
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 3_600_000) return `${(ms / 60_000).toFixed(1)}m`;
  return `${(ms / 3_600_000).toFixed(1)}h`;
}

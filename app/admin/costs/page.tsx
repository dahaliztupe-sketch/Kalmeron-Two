/**
 * Cost Dashboard — reads from real `cost_rollups_daily` materialized by the
 * `/api/cron/aggregate-costs` cron. Falls back to a clear empty-state when no
 * rollup data is available yet (e.g. fresh install or in dev).
 */
import React from 'react';
import { AppShell } from "@/components/layout/AppShell";
import { BentoGrid, BentoCard } from "@/src/components/ui/BentoGrid";
import { DollarSign, Activity, AlertTriangle, Users, TrendingUp } from 'lucide-react';
import { queryDailyRollup, queryMonthlyTotal, recentDaily } from '@/src/lib/observability/cost-ledger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 60;

function fmt(n: number): string {
  return `$${n.toFixed(2)}`;
}

function topEntries(rec: Record<string, number> | undefined, n = 5): Array<[string, number]> {
  if (!rec) return [];
  return Object.entries(rec).sort((a, b) => b[1] - a[1]).slice(0, n);
}

export default async function CostsDashboardPage() {
  // Run reads in parallel — if any throws (e.g. Firestore unconfigured),
  // we render an empty state cleanly.
  const [today, month, last14] = await Promise.all([
    queryDailyRollup().catch(() => null),
    queryMonthlyTotal().catch(() => ({ ym: '', totalUsd: 0, byAgent: {}, days: 0 })),
    recentDaily(14).catch(() => []),
  ]);

  const hasData = (last14?.length ?? 0) > 0 || (today?.totalEvents ?? 0) > 0;

  // Sparkline scale.
  const sparkMax = Math.max(1, ...last14.map((r) => r.totalUsd));
  const weekTotal = last14.slice(-7).reduce((s, r) => s + (r.totalUsd ?? 0), 0);
  const dayTotal = today?.totalUsd ?? 0;
  const monthTotal = month.totalUsd;

  const topAgents = topEntries(month.byAgent, 6);
  const topWorkspaces = topEntries(today?.byWorkspace, 5);

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto p-8" dir="rtl">
        <div className="flex items-center gap-3 mb-2">
          <DollarSign className="w-8 h-8 text-rose-500" />
          <h1 className="text-3xl font-bold text-white">مراقبة التكاليف والموارد</h1>
        </div>
        <p className="text-neutral-400 mb-8 text-sm">
          البيانات تُحدَّث كل 15 دقيقة من خلال مهمّة تجميع <code className="px-1 rounded bg-white/5">cost_rollups</code>.
        </p>

        {!hasData && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 mb-8 text-amber-200 text-sm">
            لا توجد بيانات تكاليف بعد. شغّل المهمّة <code className="bg-black/30 px-1 rounded">/api/cron/aggregate-costs</code> أو
            انتظر حتى تُسجَّل أوّل أحداث استهلاك من خلال router النماذج.
          </div>
        )}

        <BentoGrid>
          <BentoCard span={4} className="p-6 flex justify-between items-center bg-black/40 border border-rose-500/20">
            <div>
              <h2 className="text-neutral-400 font-medium">إجمالي تكلفة الشهر</h2>
              <div className="text-4xl font-black text-rose-500 mt-2">{fmt(monthTotal)}</div>
              <div className="text-xs text-neutral-500 mt-1">{month.days} يومًا مُجمَّعًا</div>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-xl font-bold text-white">{fmt(dayTotal)}</div>
                <div className="text-xs text-neutral-500">اليوم</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-[#D4AF37]">{fmt(weekTotal)}</div>
                <div className="text-xs text-neutral-500">آخر 7 أيام</div>
              </div>
            </div>
          </BentoCard>

          <BentoCard span={2} className="p-6 bg-black/40 border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm text-neutral-400">عدد الاستدعاءات اليوم</h3>
            </div>
            <div className="text-3xl font-bold text-white">{today?.totalEvents?.toLocaleString('ar-EG') ?? '0'}</div>
          </BentoCard>

          <BentoCard span={2} className="p-6 bg-black/40 border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-sky-400" />
              <h3 className="text-sm text-neutral-400">عدد المساحات النشطة اليوم</h3>
            </div>
            <div className="text-3xl font-bold text-white">{Object.keys(today?.byWorkspace ?? {}).length}</div>
          </BentoCard>

          <BentoCard span={4} className="p-6 bg-black/40 border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm text-neutral-400">آخر 14 يومًا</h3>
            </div>
            <div className="flex items-end gap-1 h-32" dir="ltr">
              {last14.map((r, i) => {
                const h = Math.max(2, Math.round(((r.totalUsd ?? 0) / sparkMax) * 100));
                return (
                  <div
                    key={r.ymd ?? i}
                    title={`${r.ymd}: ${fmt(r.totalUsd ?? 0)}`}
                    className="flex-1 bg-rose-500/60 hover:bg-rose-500 transition rounded-t"
                    style={{ height: `${h}%` }}
                  />
                );
              })}
              {last14.length === 0 && <div className="w-full text-center text-neutral-500 text-sm">لا توجد قياسات</div>}
            </div>
          </BentoCard>

          <BentoCard span={2} className="p-6 bg-black/40 border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm text-neutral-400">أعلى الوكلاء استهلاكًا (الشهر)</h3>
            </div>
            <ul className="space-y-2 text-sm">
              {topAgents.length === 0 && <li className="text-neutral-500">لا توجد بيانات</li>}
              {topAgents.map(([name, cost]) => (
                <li key={name} className="flex justify-between text-white">
                  <span className="truncate ml-2">{name}</span>
                  <span className="text-rose-400 font-mono">{fmt(cost)}</span>
                </li>
              ))}
            </ul>
          </BentoCard>

          <BentoCard span={2} className="p-6 bg-black/40 border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-sky-400" />
              <h3 className="text-sm text-neutral-400">أعلى المساحات استهلاكًا (اليوم)</h3>
            </div>
            <ul className="space-y-2 text-sm">
              {topWorkspaces.length === 0 && <li className="text-neutral-500">لا توجد بيانات</li>}
              {topWorkspaces.map(([id, cost]) => (
                <li key={id} className="flex justify-between text-white">
                  <span className="truncate ml-2 font-mono text-xs text-neutral-300">{id}</span>
                  <span className="text-sky-400 font-mono">{fmt(cost)}</span>
                </li>
              ))}
            </ul>
          </BentoCard>
        </BentoGrid>
      </div>
    </AppShell>
  );
}

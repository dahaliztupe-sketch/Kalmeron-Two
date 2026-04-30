'use client';

import { useEffect, useState } from 'react';
import type { ProviderId } from '@/src/lib/llm/providers';

interface CircuitRow { provider: ProviderId; state: string; failures: number; openedAt?: number }
interface CacheStats { entries: number; capacity: number; threshold: number; ttlMs: number }
interface BudgetRow { model: string; spentUsd: number; capUsd: number; pct: number }
interface CostRow { model: string; inputTokens: number; outputTokens: number; costUsd: number; calls: number }

interface Props {
  enabled: ProviderId[];
  circuits: CircuitRow[];
  cache: CacheStats;
  budgets: BudgetRow[];
  costs: CostRow[];
}

function Card(props: { title: string; children: React.ReactNode }) {
  return (
    <section className="border rounded-lg p-4 bg-card">
      <h2 className="text-lg font-semibold mb-3">{props.title}</h2>
      {props.children}
    </section>
  );
}

function StateBadge({ state }: { state: string }) {
  // State → colour mapping kept inline so we don't pull in a UI lib just for a chip.
  const colour =
    state === 'closed'    ? 'bg-emerald-100 text-emerald-800' :
    state === 'half_open' ? 'bg-amber-100   text-amber-800' :
                            'bg-red-100     text-red-800';
  return <span className={`px-2 py-0.5 rounded text-xs ${colour}`}>{state}</span>;
}

export default function ModelsClient({ enabled, circuits, cache, budgets, costs }: Props) {
  const [autoRefresh, setAutoRefresh] = useState(false);
  // Cheap auto-refresh — full server reload every 10s when enabled. Keeps
  // the UI honest without us building a websocket or SSE channel for what
  // is otherwise a low-traffic admin page.
  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => location.reload(), 10_000);
    return () => clearInterval(id);
  }, [autoRefresh]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          المزودون النشطون: <strong>{enabled.length}</strong>
          {enabled.length > 0 && <> — {enabled.join('، ')}</>}
        </div>
        <label className="text-sm flex items-center gap-2">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
          />
          تحديث تلقائي كل 10 ثوان
        </label>
      </div>

      <Card title="حالة المزودين (Circuit Breakers)">
        {circuits.length === 0 ? (
          <p className="text-sm text-muted-foreground">لم يُسجَّل أي طلب بعد.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-right">
              <tr className="border-b">
                <th className="py-2">المزود</th>
                <th>الحالة</th>
                <th>إخفاقات أخيرة</th>
                <th>تاريخ الفتح</th>
              </tr>
            </thead>
            <tbody>
              {circuits.map((c) => (
                <tr key={c.provider} className="border-b">
                  <td className="py-2 font-mono">{c.provider}</td>
                  <td><StateBadge state={c.state} /></td>
                  <td>{c.failures}</td>
                  <td>{c.openedAt ? new Date(c.openedAt).toLocaleString('ar-EG') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Card title="تكلفة النماذج (Per-Model)">
        {costs.length === 0 ? (
          <p className="text-sm text-muted-foreground">لا توجد استدعاءات مُسجَّلة.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-right">
              <tr className="border-b">
                <th className="py-2">النموذج</th>
                <th>الاستدعاءات</th>
                <th>tokens (in/out)</th>
                <th>التكلفة (USD)</th>
              </tr>
            </thead>
            <tbody>
              {costs.map((c) => (
                <tr key={c.model} className="border-b">
                  <td className="py-2 font-mono">{c.model}</td>
                  <td>{c.calls}</td>
                  <td>{c.inputTokens.toLocaleString()} / {c.outputTokens.toLocaleString()}</td>
                  <td>${c.costUsd.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Card title="الميزانيات الشهرية">
        {budgets.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            لم تُعرَّف ميزانيات. اضبط <code className="font-mono">MODEL_BUDGETS</code> في البيئة.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-right">
              <tr className="border-b">
                <th className="py-2">النموذج</th>
                <th>المُنفَق MTD</th>
                <th>الحد</th>
                <th>الاستهلاك %</th>
              </tr>
            </thead>
            <tbody>
              {budgets.map((b) => (
                <tr key={b.model} className="border-b">
                  <td className="py-2 font-mono">{b.model}</td>
                  <td>${b.spentUsd.toFixed(4)}</td>
                  <td>${Number.isFinite(b.capUsd) ? b.capUsd.toFixed(2) : '∞'}</td>
                  <td className={b.pct >= 100 ? 'text-red-600 font-bold' : b.pct >= 80 ? 'text-amber-600' : ''}>
                    {b.pct.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Card title="الذاكرة المؤقتة الدلالية">
        <ul className="text-sm space-y-1">
          <li>عدد الإدخالات: <strong>{cache.entries}</strong> / {cache.capacity}</li>
          <li>عتبة التشابه: <strong>{cache.threshold}</strong></li>
          <li>عمر الإدخال (TTL): <strong>{Math.round(cache.ttlMs / 60000)} دقيقة</strong></li>
        </ul>
      </Card>
    </div>
  );
}

"use client";
import { useEffect, useRef, useState, useCallback } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/contexts/AuthContext';

interface AgentMetrics {
  invocations: number;
  avgLatencyMs: number;
  successRate: number;
}
interface AlertItem {
  severity?: string;
  source?: string;
  timestamp: number | string;
  message?: string;
}
interface Snapshot {
  agents: Record<string, AgentMetrics>;
  dailyCostUsd: number;
  dailyLimit: number;
  alertsRecent: AlertItem[];
}

type CheckStatus = 'connected' | 'unreachable' | 'disabled' | 'configured' | 'unconfigured' | 'protected' | 'unprotected';
interface HealthSnapshot {
  status: 'healthy' | 'degraded';
  timestamp: string;
  version: string;
  checks: Record<string, CheckStatus>;
  meta: Record<string, unknown>;
}

const CHECK_LABELS: Record<string, string> = {
  firestore: 'قاعدة البيانات',
  knowledgeGraph: 'الرسم المعرفي',
  pdfWorker: 'معالج PDF',
  egyptCalc: 'حاسبة مصر',
  llmJudge: 'محكّم LLM',
  embeddingsWorker: 'التضمينات',
  llmProviders: 'مزوّدو الذكاء الاصطناعي',
  firebaseAdmin: 'Firebase Admin',
  stripe: 'Stripe',
  fawry: 'فوري',
  email: 'البريد الإلكتروني',
  whatsapp: 'واتساب',
  telegram: 'تيليجرام',
  cron: 'المهام المجدولة',
  virtualOffice: 'المكتب الافتراضي',
};

const STATUS_CONFIG: Record<CheckStatus, { label: string; color: string; dot: string }> = {
  connected:    { label: 'متصل',       color: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30', dot: 'bg-emerald-400' },
  configured:   { label: 'مُضبوط',     color: 'text-blue-300 bg-blue-500/10 border-blue-500/30',         dot: 'bg-blue-400' },
  protected:    { label: 'محميّ',       color: 'text-purple-300 bg-purple-500/10 border-purple-500/30',   dot: 'bg-purple-400' },
  disabled:     { label: 'معطَّل',      color: 'text-neutral-400 bg-neutral-800/60 border-white/10',      dot: 'bg-neutral-500' },
  unreachable:  { label: 'غير متاح',   color: 'text-rose-300 bg-red-500/10 border-red-500/30',           dot: 'bg-red-400 animate-pulse' },
  unconfigured: { label: 'غير مُضبوط', color: 'text-amber-300 bg-amber-500/10 border-amber-500/30',      dot: 'bg-amber-400' },
  unprotected:  { label: 'غير محميّ',  color: 'text-amber-300 bg-amber-500/10 border-amber-500/30',      dot: 'bg-amber-400' },
};

const SERVICE_GROUPS = [
  { title: 'البنية التحتية', keys: ['firestore', 'firebaseAdmin', 'knowledgeGraph'] },
  { title: 'خدمات Python', keys: ['pdfWorker', 'egyptCalc', 'llmJudge', 'embeddingsWorker'] },
  { title: 'الذكاء الاصطناعي', keys: ['llmProviders', 'virtualOffice'] },
  { title: 'الدفع والتكامل', keys: ['stripe', 'fawry', 'email', 'whatsapp', 'telegram', 'cron'] },
];

function SystemHealthPanel({ health, lastFetch }: { health: HealthSnapshot; lastFetch: Date }) {
  return (
    <div className="md:col-span-3 p-6 rounded-2xl bg-neutral-900/60 border border-white/[0.05]">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold">صحة النظام</h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            آخر تحديث: {lastFetch.toLocaleTimeString('ar-EG')} — نسخة {health.version}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
          health.status === 'healthy'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-red-500/10 border-red-500/30 text-rose-300'
        }`}>
          {health.status === 'healthy' ? '✓ سليم' : '⚠ متدهور'}
        </span>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {SERVICE_GROUPS.map((group) => (
          <div key={group.title} className="space-y-2">
            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
              {group.title}
            </h3>
            {group.keys.map((key) => {
              const status = health.checks[key];
              if (!status) return null;
              const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.unconfigured;
              const label = CHECK_LABELS[key] ?? key;
              return (
                <div
                  key={key}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs ${cfg.color}`}
                >
                  <span className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    {label}
                  </span>
                  <span className="opacity-70">{cfg.label}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {health.meta?.llmProviders && Array.isArray(health.meta.llmProviders) && health.meta.llmProviders.length > 0 && (
        <div className="mt-4 text-xs text-neutral-500">
          مزوّدو الذكاء الاصطناعي المتاحون: {(health.meta.llmProviders as string[]).join(', ')}
        </div>
      )}
    </div>
  );
}

export default function MissionControlPage() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<Snapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [live, setLive] = useState(false);
  const [pulse, setPulse] = useState<string | null>(null);
  const pulseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [health, setHealth] = useState<HealthSnapshot | null>(null);
  const [healthFetchedAt, setHealthFetchedAt] = useState<Date | null>(null);

  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const json = await res.json() as HealthSnapshot;
        setHealth(json);
        setHealthFetchedAt(new Date());
      }
    } catch {/* best-effort */}
  }, []);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30_000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setError('يجب تسجيل الدخول بحساب Platform Admin.');
      return;
    }
    let es: EventSource | null = null;
    let cancelled = false;

    (async () => {
      try {
        const token = await user.getIdToken();
        if (cancelled) return;
        es = new EventSource(`/api/admin/mission-control/stream?token=${encodeURIComponent(token)}`);

        es.addEventListener('open', () => setLive(true));
        es.addEventListener('snapshot', (e: MessageEvent) => {
          try { setData(JSON.parse(e.data)); setError(null); } catch {}
        });
        es.addEventListener('invocation', (e: MessageEvent) => {
          try {
            const payload = JSON.parse(e.data);
            setPulse(payload.agentId);
            if (pulseTimer.current) clearTimeout(pulseTimer.current);
            pulseTimer.current = setTimeout(() => setPulse(null), 1500);
            setData(prev => {
              if (!prev) return prev;
              return {
                ...prev,
                agents: { ...prev.agents, [payload.agentId]: payload.snapshot },
                dailyCostUsd: payload.dailyCostUsd,
              };
            });
          } catch {}
        });
        es.addEventListener('alert', (e: MessageEvent) => {
          try {
            const a = JSON.parse(e.data);
            setData(prev => prev ? { ...prev, alertsRecent: [...prev.alertsRecent, a].slice(-50) } : prev);
          } catch {}
        });
        es.onerror = () => { setLive(false); setError('انقطع البث المباشر — قد تكون انتهت صلاحية الرمز، حدّث الصفحة.'); };
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'تعذّر الاتصال');
      }
    })();

    return () => {
      cancelled = true;
      if (es) es.close();
      if (pulseTimer.current) clearTimeout(pulseTimer.current);
    };
  }, [user, authLoading]);

  return (
    <AppShell>
      <div className="min-h-screen p-8 max-w-7xl mx-auto text-white" dir="rtl">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold mb-2">مركز القيادة</h1>
            <p className="text-neutral-400">مراقبة المساعدين والتكاليف والأمان والامتثال في الوقت الفعلي.</p>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold ${
            live ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-neutral-800 border-white/10 text-neutral-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${live ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-500'}`} />
            {live ? 'بث مباشر' : 'غير متصل'}
          </div>
        </header>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-rose-300">
            خطأ في التحميل: {error}
          </div>
        )}

        {/* System Health Panel — always visible, no auth needed */}
        {health && healthFetchedAt && (
          <div className="grid grid-cols-1 mb-6">
            <SystemHealthPanel health={health} lastFetch={healthFetchedAt} />
          </div>
        )}

        {!data && !error && <p className="text-neutral-500">جارٍ التحميل...</p>}

        {data && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 p-6 rounded-2xl bg-neutral-900/60 border border-white/[0.05]">
              <h2 className="text-xl font-bold mb-4">خريطة المساعدين النشطين</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {Object.entries(data.agents).map(([id, m]) => (
                  <div
                    key={id}
                    className={`flex items-center justify-between p-3 rounded-lg text-sm transition-all duration-500 ${
                      pulse === id
                        ? 'bg-emerald-500/20 ring-2 ring-emerald-400/60 scale-[1.01]'
                        : 'bg-black/30'
                    }`}
                  >
                    <span className="font-mono flex items-center gap-2">
                      {pulse === id && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />}
                      {id}
                    </span>
                    <div className="flex gap-4 text-neutral-400">
                      <span>طلبات: {m.invocations}</span>
                      <span>زمن: {m.avgLatencyMs}ms</span>
                      <span className={m.successRate < 95 ? 'text-amber-400' : 'text-emerald-400'}>
                        نجاح: {m.successRate}%
                      </span>
                    </div>
                  </div>
                ))}
                {Object.keys(data.agents).length === 0 && (
                  <p className="text-neutral-600 text-sm">لا توجد بيانات بعد. ابدأ محادثة لتفعيل المساعدين.</p>
                )}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-white/[0.05]">
              <h2 className="text-xl font-bold mb-4">لوحة التكاليف</h2>
              <div className="text-3xl font-extrabold mb-2">${data.dailyCostUsd.toFixed(2)}</div>
              <div className="text-sm text-neutral-500 mb-4">من ${data.dailyLimit} يوميًا</div>
              <div className="h-2 rounded-full bg-neutral-800 overflow-hidden">
                <div
                  className={`h-full ${data.dailyCostUsd / data.dailyLimit > 0.8 ? 'bg-red-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(100, (data.dailyCostUsd / data.dailyLimit) * 100)}%` }}
                />
              </div>
            </div>

            <div className="md:col-span-3 p-6 rounded-2xl bg-neutral-900/60 border border-white/[0.05]">
              <h2 className="text-xl font-bold mb-4">سجل التنبيهات والامتثال</h2>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {data.alertsRecent.length === 0 && (
                  <p className="text-neutral-600 text-sm">لا توجد تنبيهات.</p>
                )}
                {data.alertsRecent.map((a, i) => (
                  <div key={i} className={`p-3 rounded-lg text-sm border ${
                    a.severity === 'critical' ? 'bg-red-500/10 border-red-500/30 text-rose-300' :
                    a.severity === 'high' ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' :
                    'bg-neutral-800 border-white/[0.04] text-neutral-300'
                  }`}>
                    <div className="flex justify-between">
                      <span className="font-mono text-xs">{a.source}</span>
                      <span className="text-xs opacity-60">{new Date(a.timestamp).toLocaleTimeString('ar-EG')}</span>
                    </div>
                    <div className="mt-1">{a.message}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

"use client";
  import { useEffect, useRef, useState } from 'react';
  import { AppShell } from '@/components/layout/AppShell';

  interface Snapshot {
    agents: Record<string, any>;
    dailyCostUsd: number;
    dailyLimit: number;
    alertsRecent: any[];
  }

  export default function MissionControlPage() {
    const [data, setData] = useState<Snapshot | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [live, setLive] = useState(false);
    const [pulse, setPulse] = useState<string | null>(null);
    const pulseTimer = useRef<any>(null);

    useEffect(() => {
      const es = new EventSource('/api/admin/mission-control/stream');

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
      es.onerror = () => { setLive(false); setError('انقطع البث المباشر، يحاول إعادة الاتصال...'); };

      return () => { es.close(); if (pulseTimer.current) clearTimeout(pulseTimer.current); };
    }, []);

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
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300">
              خطأ في التحميل: {error}
            </div>
          )}

          {!data && !error && <p className="text-neutral-500">جارٍ التحميل...</p>}

          {data && (
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 p-6 rounded-2xl bg-neutral-900/60 border border-white/[0.05]">
                <h2 className="text-xl font-bold mb-4">خريطة المساعدين النشطين</h2>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {Object.entries(data.agents).map(([id, m]: any) => (
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
                      a.severity === 'critical' ? 'bg-red-500/10 border-red-500/30 text-red-300' :
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
  
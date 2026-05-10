'use client';

import { useEffect, useState, useCallback } from 'react';

interface ServiceInfo {
  status: 'up' | 'down' | 'degraded';
  latency_ms?: number;
  version?: string;
}

interface StatusData {
  status: 'operational' | 'degraded' | 'down';
  timestamp: string;
  uptime_check_ms: number;
  services: {
    nextjs: ServiceInfo;
    pdfWorker: ServiceInfo;
    egyptCalc: ServiceInfo;
    llmJudge: ServiceInfo;
    embeddingsWorker: ServiceInfo;
  };
}

const SERVICE_LABELS: Record<string, string> = {
  nextjs:           'Next.js (الواجهة)',
  pdfWorker:        'معالج PDF',
  egyptCalc:        'حاسبة مصر الضريبية',
  llmJudge:         'محكّم النماذج',
  embeddingsWorker: 'معالج التضمينات',
};

function statusColor(s: string) {
  if (s === 'up' || s === 'operational')  return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
  if (s === 'degraded')                   return 'bg-amber-500/15  text-amber-300  border-amber-500/30';
  return                                         'bg-rose-500/15   text-rose-300   border-rose-500/30';
}

function statusDot(s: string) {
  if (s === 'up' || s === 'operational') return 'bg-emerald-400';
  if (s === 'degraded')                  return 'bg-amber-400';
  return                                        'bg-rose-500';
}

function statusLabel(s: string) {
  if (s === 'up' || s === 'operational') return 'يعمل';
  if (s === 'degraded')                  return 'أداء منخفض';
  return                                        'متوقف';
}

export default function LiveWorkers() {
  const [data, setData]       = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  const fetch_ = useCallback(async () => {
    try {
      const res = await fetch('/api/status', { cache: 'no-store' });
      const json = await res.json() as StatusData;
      setData(json);
      setLastFetch(new Date());
    } catch {
      // silent — keep showing stale data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetch_();
    const timer = setInterval(() => { void fetch_(); }, 30_000);
    return () => clearInterval(timer);
  }, [fetch_]);

  if (loading) {
    return (
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-neutral-500 animate-pulse" />
          الحالة المباشرة للخدمات
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-white/10 p-4 animate-pulse bg-white/5 h-16" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const entries = Object.entries(data.services) as [string, ServiceInfo][];

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <span className={`inline-block w-2.5 h-2.5 rounded-full ${statusDot(data.status)} animate-pulse`} />
          الحالة المباشرة للخدمات
        </h2>
        {lastFetch && (
          <span className="text-xs text-neutral-500">
            تحدّث منذ {Math.round((Date.now() - lastFetch.getTime()) / 1000)} ث
          </span>
        )}
      </div>

      <div className={`rounded-xl border p-4 mb-4 flex items-center justify-between ${statusColor(data.status)}`}>
        <span className="font-semibold">
          {data.status === 'operational' ? 'جميع الخدمات تعمل' :
           data.status === 'degraded'    ? 'بعض الخدمات تعمل بأداء منخفض' :
                                           'يوجد عطل في الخدمة'}
        </span>
        <span className="text-xs opacity-70">فحص: {data.uptime_check_ms} ms</span>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {entries.map(([key, svc]) => (
          <div
            key={key}
            className={`rounded-xl border p-4 flex items-center justify-between gap-3 ${statusColor(svc.status)}`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className={`shrink-0 w-2 h-2 rounded-full ${statusDot(svc.status)}`} />
              <span className="font-medium text-sm truncate">{SERVICE_LABELS[key] ?? key}</span>
            </div>
            <div className="flex items-center gap-3 shrink-0 text-xs opacity-80">
              {svc.latency_ms !== undefined && svc.latency_ms > 0 && (
                <span>{svc.latency_ms} ms</span>
              )}
              {svc.version && <span className="hidden sm:inline">{svc.version}</span>}
              <span className="uppercase tracking-wide font-mono">{statusLabel(svc.status)}</span>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-3 text-xs text-neutral-600 text-left">
        يتجدد تلقائياً كل 30 ثانية · <a href="/api/status" target="_blank" className="underline hover:text-neutral-400">JSON</a>
      </p>
    </div>
  );
}

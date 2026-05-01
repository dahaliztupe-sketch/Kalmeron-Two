'use client';

/**
 * DelegationTracker
 * ─────────────────────────────────────────────────────────────────────────────
 * مكوّن React يعرض تقدم سلسلة التفويض في الوقت الفعلي عبر SSE.
 *
 * الاستخدام:
 *   <DelegationTracker traceId="dlg_xxx" idToken="Bearer..." />
 */

import { useDelegationStream } from '@/src/hooks/useDelegationStream';
import type { DelegationEvent } from '@/src/ai/organization/delegation/engine';
import { cn } from '@/src/lib/utils';

// ─── أيقونات الأحداث ──────────────────────────────────────────────────────────
const EVENT_META: Record<string, { icon: string; color: string; label: string }> = {
  delegation_started:   { icon: '🚀', color: 'text-indigo-400', label: 'بدأت سلسلة التفويض' },
  agent_selected:       { icon: '🎯', color: 'text-blue-400',   label: 'تم اختيار الوكيل' },
  hop_started:          { icon: '➡️', color: 'text-cyan-400',   label: 'قفزة جديدة' },
  hop_completed:        { icon: '✅', color: 'text-teal-400',   label: 'اكتملت القفزة' },
  agent_processing:     { icon: '⚙️', color: 'text-yellow-400', label: 'معالجة…' },
  delegation_completed: { icon: '🏁', color: 'text-green-400',  label: 'اكتمل التفويض!' },
  delegation_failed:    { icon: '❌', color: 'text-red-400',    label: 'فشل التفويض' },
  default:              { icon: '📡', color: 'text-gray-400',   label: 'حدث' },
};

// ─── بطاقة حدث واحد ──────────────────────────────────────────────────────────
function EventCard({ event }: { event: DelegationEvent }) {
  const meta = EVENT_META[event.type] ?? EVENT_META.default;
  const time = new Date(event.timestamp).toLocaleTimeString('ar-EG', { hour12: false });

  const message =
    typeof event.data.message === 'string' ? event.data.message
    : typeof event.data.error === 'string' ? `⚠️ ${event.data.error}`
    : meta.label;

  return (
    <div className={cn(
      'flex items-start gap-3 py-2 px-3 rounded-lg text-sm transition-all',
      'bg-white/5 hover:bg-white/10',
      event.type === 'delegation_completed' && 'bg-green-900/20 border border-green-700/30',
      event.type === 'delegation_failed' && 'bg-red-900/20 border border-red-700/30',
    )}>
      <span className="text-lg flex-shrink-0 mt-0.5">{meta.icon}</span>
      <div className="flex-1 min-w-0">
        <p className={cn('font-medium', meta.color)}>{meta.label}</p>
        <p className="text-gray-300 text-xs mt-0.5 leading-relaxed">{message}</p>
        {event.data.totalHops && (
          <p className="text-gray-500 text-xs mt-1">القفزات: {String(event.data.totalHops)}</p>
        )}
        {event.data.totalLatencyMs && (
          <p className="text-gray-500 text-xs">الوقت: {Number(event.data.totalLatencyMs)}ms</p>
        )}
      </div>
      <span className="text-gray-600 text-xs flex-shrink-0 font-mono">{time}</span>
    </div>
  );
}

// ─── نبضة الاتصال (dot) ──────────────────────────────────────────────────────
function ConnectionDot({ connected, completed }: { connected: boolean; completed: boolean }) {
  if (completed) return <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />;
  if (connected) return (
    <span className="relative w-2 h-2 flex-shrink-0">
      <span className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-75" />
      <span className="relative block w-2 h-2 rounded-full bg-blue-500" />
    </span>
  );
  return <span className="w-2 h-2 rounded-full bg-gray-600 flex-shrink-0" />;
}

// ─── شريط التقدم ──────────────────────────────────────────────────────────────
const STEPS: DelegationEvent['type'][] = [
  'delegation_started', 'agent_selected', 'agent_processing', 'delegation_completed',
];

function ProgressBar({ events }: { events: DelegationEvent[] }) {
  const reached = events.map(e => e.type);
  const currentStep = STEPS.findLastIndex(s => reached.includes(s));

  return (
    <div className="flex items-center gap-1 mb-3">
      {STEPS.map((step, i) => (
        <div key={step} className="flex items-center gap-1 flex-1">
          <div className={cn(
            'h-1.5 flex-1 rounded-full transition-all duration-500',
            i <= currentStep ? 'bg-indigo-500' : 'bg-gray-700',
          )} />
          {i < STEPS.length - 1 && (
            <div className={cn('w-2 h-2 rounded-full', i < currentStep ? 'bg-indigo-400' : 'bg-gray-700')} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── المكوّن الرئيسي ──────────────────────────────────────────────────────────

interface Props {
  traceId: string | null;
  idToken: string | null;
  className?: string;
  maxHeight?: string;
}

export function DelegationTracker({ traceId, idToken, className, maxHeight = '400px' }: Props) {
  const { events, status } = useDelegationStream(traceId, idToken);

  const isCompleted = status.completed;
  const lastEvent = events[events.length - 1];

  return (
    <div className={cn(
      'rounded-xl border bg-[#0d0d1a] text-white font-sans',
      'border-white/10',
      className,
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <ConnectionDot connected={status.connected} completed={isCompleted} />
          <span className="text-sm font-semibold">متتبع التفويض</span>
          {traceId && (
            <span className="text-xs text-gray-600 font-mono">{traceId.slice(0, 16)}…</span>
          )}
        </div>
        <div className="text-xs text-gray-500">
          {events.length} حدث
          {isCompleted && <span className="text-green-400 mr-2">• مكتمل</span>}
          {status.error && <span className="text-red-400 mr-2">• {status.error}</span>}
        </div>
      </div>

      {/* Progress bar */}
      {events.length > 0 && (
        <div className="px-4 pt-3">
          <ProgressBar events={events} />
        </div>
      )}

      {/* Events list */}
      <div
        className="overflow-y-auto px-3 py-2 flex flex-col gap-1"
        style={{ maxHeight }}
      >
        {events.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-gray-600">
            <span className="text-3xl mb-2">📡</span>
            <p className="text-sm">في انتظار أحداث التفويض…</p>
            {!traceId && <p className="text-xs mt-1 text-gray-700">لم يُحدَّد معرّف التتبع بعد</p>}
          </div>
        )}
        {events.map((ev, i) => (
          <EventCard key={`${ev.type}-${i}`} event={ev} />
        ))}
      </div>

      {/* Final output preview */}
      {isCompleted && lastEvent?.type === 'delegation_completed' && lastEvent.data.outputPreview && (
        <div className="px-4 py-3 border-t border-white/10 bg-green-900/10">
          <p className="text-xs text-green-400 font-semibold mb-1">✅ مخرجات التفويض:</p>
          <p className="text-xs text-gray-300 leading-relaxed line-clamp-4">
            {String(lastEvent.data.outputPreview)}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * useDelegationStream — React hook للاشتراك في SSE تتبع التفويض
 *
 * الاستخدام:
 *   const { events, status, connect, disconnect } = useDelegationStream(traceId, idToken);
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { DelegationEvent, DelegationEventType } from '@/src/ai/organization/delegation/engine';

export interface StreamStatus {
  connected: boolean;
  error: string | null;
  completed: boolean;
}

export function useDelegationStream(
  traceId: string | null,
  idToken: string | null,
  autoConnect = true,
) {
  const [events, setEvents] = useState<DelegationEvent[]>([]);
  const [status, setStatus] = useState<StreamStatus>({ connected: false, error: null, completed: false });
  const esRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    if (!traceId || !idToken) return;
    if (esRef.current) { esRef.current.close(); }

    const url = `/api/delegate/stream?traceId=${encodeURIComponent(traceId)}&token=${encodeURIComponent(idToken)}`;
    const es = new EventSource(url);
    esRef.current = es;

    es.addEventListener('stream_open', () => {
      setStatus({ connected: true, error: null, completed: false });
    });

    const TRACKED_EVENTS: DelegationEventType[] = [
      'delegation_started', 'agent_selected', 'hop_started',
      'hop_completed', 'agent_processing', 'delegation_completed', 'delegation_failed',
    ];

    TRACKED_EVENTS.forEach(type => {
      es.addEventListener(type, (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data as string) as DelegationEvent;
          setEvents(prev => [...prev, data]);

          if (type === 'delegation_completed' || type === 'delegation_failed') {
            setStatus(s => ({ ...s, completed: true }));
          }
        } catch { /* تجاهل أحداث غير صالحة */ }
      });
    });

    es.addEventListener('stream_end', () => {
      setStatus(s => ({ ...s, completed: true, connected: false }));
      es.close();
    });

    es.addEventListener('stream_timeout', () => {
      setStatus(s => ({ ...s, completed: true, connected: false, error: 'انتهت مهلة الاتصال' }));
      es.close();
    });

    es.onerror = () => {
      setStatus(s => ({ ...s, connected: false, error: 'خطأ في الاتصال' }));
    };
  }, [traceId, idToken]);

  const disconnect = useCallback(() => {
    esRef.current?.close();
    setStatus(s => ({ ...s, connected: false }));
  }, []);

  const reset = useCallback(() => {
    disconnect();
    setEvents([]);
    setStatus({ connected: false, error: null, completed: false });
  }, [disconnect]);

  useEffect(() => {
    if (autoConnect && traceId && idToken) connect();
    return () => { esRef.current?.close(); };
  }, [traceId, idToken, autoConnect, connect]);

  return { events, status, connect, disconnect, reset };
}

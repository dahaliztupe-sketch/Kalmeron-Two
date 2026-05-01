/**
 * GET /api/delegate/stream?traceId=dlg_xxx
 * ─────────────────────────────────────────────────────────────────────────────
 * نقطة نهاية SSE (Server-Sent Events) لتتبع حالة التفويض في الوقت الفعلي.
 *
 * الاستخدام:
 *   const es = new EventSource('/api/delegate/stream?traceId=dlg_xxx&token=...');
 *   es.onmessage = (e) => console.log(JSON.parse(e.data));
 *
 * أحداث SSE المُرسَلة:
 *   delegation_started   — بدأت سلسلة التفويض
 *   agent_selected       — تم اختيار الوكيل المُنفِّذ
 *   hop_started          — بدأت قفزة جديدة في السلسلة
 *   hop_completed        — اكتملت قفزة
 *   agent_processing     — الوكيل يعالج المهمة حالياً
 *   delegation_completed — اكتملت السلسلة (يُغلق الاتصال تلقائياً)
 *   delegation_failed    — فشلت السلسلة (يُغلق الاتصال تلقائياً)
 *   heartbeat            — نبضة قلب كل 15 ثانية لإبقاء الاتصال حياً
 *
 * SECURITY:
 *   - يقبل Firebase token عبر query param `token` (EventSource لا يدعم headers).
 *   - يمكن الاشتراك في traceId محدد أو في جميع الأحداث (traceId=all).
 *   - انتهاء المهلة التلقائية = 5 دقائق.
 */

import { NextRequest } from 'next/server';
import { adminAuth } from '@/src/lib/firebase-admin';
import { delegationBus, type DelegationEvent } from '@/src/ai/organization/delegation/engine';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** مهلة الاتصال الأقصى = 5 دقائق. */
const MAX_STREAM_MS = 5 * 60 * 1000;
/** فترة نبضة القلب = 15 ثانية. */
const HEARTBEAT_MS = 15_000;

/** يُنسّق حدثاً كرسالة SSE. */
function formatSSE(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const traceId = searchParams.get('traceId') ?? 'all';
  const token = searchParams.get('token');

  // Auth: Bearer token عبر query param (ضروري لـ EventSource)
  let userId = 'guest';
  if (token) {
    try {
      const decoded = await adminAuth.verifyIdToken(token);
      userId = decoded.uid;
    } catch {
      return new Response('Unauthorized', { status: 401 });
    }
  }

  // إنشاء ReadableStream لإرسال SSE
  let controllerRef: ReadableStreamDefaultController<Uint8Array> | null = null;
  let heartbeatTimer: NodeJS.Timeout | null = null;
  let timeoutTimer: NodeJS.Timeout | null = null;
  let closed = false;

  const encoder = new TextEncoder();

  function send(eventName: string, data: unknown) {
    if (closed || !controllerRef) return;
    try {
      controllerRef.enqueue(encoder.encode(formatSSE(eventName, data)));
    } catch {
      closed = true;
    }
  }

  function close() {
    if (closed) return;
    closed = true;
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    if (timeoutTimer) clearTimeout(timeoutTimer);
    // إزالة المستمع من الـ bus
    delegationBus.off(busChannel, eventHandler);
    try { controllerRef?.close(); } catch { /* تجاهل */ }
  }

  /** المستمع: يُعيد توجيه أحداث الـ bus إلى SSE stream. */
  const eventHandler = (event: DelegationEvent) => {
    send(event.type, event);
    // إغلاق الاتصال عند اكتمال/فشل التفويض
    if (event.type === 'delegation_completed' || event.type === 'delegation_failed') {
      send('stream_end', { traceId, userId, timestamp: Date.now() });
      setTimeout(close, 100);
    }
  };

  const busChannel = traceId === 'all' ? 'all' : `trace:${traceId}`;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controllerRef = controller;

      // 1. رسالة ترحيب أولية
      send('stream_open', {
        traceId,
        userId,
        subscribedTo: busChannel,
        timestamp: Date.now(),
        message: 'متصل بنظام تتبع التفويض',
      });

      // 2. الاشتراك في أحداث الـ bus
      delegationBus.on(busChannel, eventHandler);

      // 3. نبضة قلب كل 15 ثانية
      heartbeatTimer = setInterval(() => {
        send('heartbeat', { timestamp: Date.now(), traceId });
      }, HEARTBEAT_MS);

      // 4. إغلاق تلقائي بعد MAX_STREAM_MS
      timeoutTimer = setTimeout(() => {
        send('stream_timeout', { message: 'انتهت مهلة الاتصال (5 دقائق)', timestamp: Date.now() });
        close();
      }, MAX_STREAM_MS);
    },
    cancel() {
      close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

/**
 * /api/admin/mission-control/stream — SSE feed of live ops metrics.
 *
 * 🔒 Platform admin only. Because the browser EventSource API cannot send
 *    custom Authorization headers, this endpoint accepts the Firebase ID
 *    token via the `?token=...` query parameter. The token is short-lived
 *    (1 hour) so accidental logging has bounded blast radius. Closed
 *    2026-04-24 as part of the Boardroom audit.
 */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getMetricsSnapshot, monitorEvents } from '@/src/ai/organization/compliance/monitor';
import { adminAuth } from '@/src/lib/firebase-admin';
import { isPlatformAdmin } from '@/src/lib/security/rbac';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get('token');
  if (!token) {
    return NextResponse.json({ error: 'unauthorized', message: 'Missing ?token query parameter' }, { status: 401 });
  }
  let uid: string;
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    uid = decoded.uid;
  } catch {
    return NextResponse.json({ error: 'invalid_token' }, { status: 401 });
  }
  if (!isPlatformAdmin(uid)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      let closed = false;
      const send = (event: string, data: any) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        } catch { /* stream closed */ }
      };

      send('snapshot', getMetricsSnapshot());

      const onInvocation = (payload: any) => send('invocation', payload);
      const onAlert = (payload: any) => send('alert', payload);
      monitorEvents.on('invocation', onInvocation);
      monitorEvents.on('alert', onAlert);

      const heartbeat = setInterval(() => send('ping', { t: Date.now() }), 15000);
      const refresh = setInterval(() => send('snapshot', getMetricsSnapshot()), 10000);

      const close = () => {
        if (closed) return;
        closed = true;
        clearInterval(heartbeat);
        clearInterval(refresh);
        monitorEvents.off('invocation', onInvocation);
        monitorEvents.off('alert', onAlert);
        try { controller.close(); } catch { /* already closed */ }
      };

      req.signal.addEventListener('abort', close);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}

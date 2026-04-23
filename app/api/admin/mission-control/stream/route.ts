import { NextRequest } from 'next/server';
import { getMetricsSnapshot, monitorEvents } from '@/src/ai/organization/compliance/monitor';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
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

      _req.signal.addEventListener('abort', close);
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

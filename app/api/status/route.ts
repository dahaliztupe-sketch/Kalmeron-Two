import { NextResponse } from 'next/server';
import { checkAllWorkers } from '@/src/lib/workers/health';
import { validateStartup } from '@/src/lib/startup';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_STORE = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  Pragma: 'no-cache',
} as const;

type ServiceStatus = 'up' | 'down' | 'degraded';

interface ServiceInfo {
  status: ServiceStatus;
  latency_ms?: number;
  version?: string;
}

interface StatusResponse {
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

function workerStatusToService(
  workerStatus: string,
  latency_ms?: number,
  version?: string,
): ServiceInfo {
  const status: ServiceStatus =
    workerStatus === 'ok' ? 'up' :
    workerStatus === 'warming_up' ? 'degraded' :
    workerStatus === 'degraded' ? 'degraded' : 'down';
  return { status, latency_ms, version };
}

export async function GET() {
  validateStartup();
  const t0 = Date.now();

  const workersResult = await checkAllWorkers({ force: true });

  const find = (key: string) =>
    workersResult.workers.find((w) => w.key === key);

  const pdf   = find('pdfWorker');
  const calc  = find('egyptCalc');
  const judge = find('llmJudge');
  const emb   = find('embeddingsWorker');

  const services: StatusResponse['services'] = {
    nextjs: { status: 'up', latency_ms: 0 },
    pdfWorker:        workerStatusToService(pdf?.status   ?? 'unreachable', pdf?.latency_ms,   pdf?.version),
    egyptCalc:        workerStatusToService(calc?.status  ?? 'unreachable', calc?.latency_ms,  calc?.version),
    llmJudge:         workerStatusToService(judge?.status ?? 'unreachable', judge?.latency_ms, judge?.version),
    embeddingsWorker: workerStatusToService(emb?.status   ?? 'unreachable', emb?.latency_ms,   emb?.version),
  };

  const allUp      = Object.values(services).every((s) => s.status === 'up');
  const anyDown    = Object.values(services).some((s) => s.status === 'down');
  const overall: StatusResponse['status'] =
    allUp ? 'operational' : anyDown ? 'down' : 'degraded';

  const body: StatusResponse = {
    status: overall,
    timestamp: new Date().toISOString(),
    uptime_check_ms: Date.now() - t0,
    services,
  };

  return NextResponse.json(body, {
    status: overall === 'down' ? 503 : 200,
    headers: NO_STORE,
  });
}

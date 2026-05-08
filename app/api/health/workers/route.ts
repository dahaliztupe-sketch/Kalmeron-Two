import { NextRequest, NextResponse } from 'next/server';
import { checkAllWorkers, invalidateWorkerHealthCache } from '@/src/lib/workers/health';
import { validateStartup } from '@/src/lib/startup';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NO_STORE = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  Pragma: 'no-cache',
} as const;

export async function GET(req: NextRequest) {
  validateStartup();

  const { searchParams } = new URL(req.url);
  const force = searchParams.get('force') === '1';

  const result = await checkAllWorkers({ force });
  return NextResponse.json(result, { status: 200, headers: NO_STORE });
}

export async function POST() {
  invalidateWorkerHealthCache();
  const result = await checkAllWorkers({ force: true });
  return NextResponse.json(result, { status: 200, headers: NO_STORE });
}

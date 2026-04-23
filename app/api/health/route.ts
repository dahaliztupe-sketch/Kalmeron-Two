import { NextResponse } from 'next/server';
import { adminDb } from '@/src/lib/firebase-admin';
import { isKnowledgeGraphEnabled } from '@/src/lib/memory/knowledge-graph';

export const runtime = 'nodejs';

export async function GET() {
  const timestamp = new Date().toISOString();
  const checks: Record<string, string> = {};

  try {
    await adminDb.collection('_health').doc('ping').get();
    checks.firestore = 'connected';
  } catch {
    checks.firestore = 'unreachable';
  }

  try {
    checks.knowledgeGraph = (await isKnowledgeGraphEnabled()) ? 'connected' : 'disabled';
  } catch {
    checks.knowledgeGraph = 'unreachable';
  }

  checks.cron = process.env.CRON_SECRET ? 'protected' : 'unprotected';

  const status =
    checks.firestore === 'connected' && checks.knowledgeGraph !== 'unreachable'
      ? 'healthy'
      : 'degraded';

  return NextResponse.json(
    {
      status,
      timestamp,
      version: process.env.npm_package_version || '0.1.0',
      checks,
    },
    { status: 200 }
  );
}

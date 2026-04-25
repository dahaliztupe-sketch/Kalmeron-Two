/**
 * /api/social-proof — public, cached snapshot of real platform usage.
 *
 * Replaces the hard-coded "+1000 entrepreneurs" pill on the landing page with
 * live numbers derived from Firestore. Returns SAFE MINIMUMS so the hero never
 * shows an embarrassingly small number to a first-time visitor (e.g. during
 * the bootstrap phase when only a few founders have signed up).
 *
 * All counts are aggregated server-side and cached for 5 minutes — visitors
 * never query Firestore directly.
 */
import { NextResponse } from 'next/server';
import { adminDb } from '@/src/lib/firebase-admin';

export const runtime = 'nodejs';
export const revalidate = 300; // 5 minutes

// Floor values — what the marketing copy promised on day 1. Real numbers
// gradually overtake these as the platform grows.
const FLOOR = {
  founders: 1_000,
  ideasAnalyzed: 5_000,
  plansBuilt: 1_500,
} as const;

interface SocialProof {
  founders: number;
  ideasAnalyzed: number;
  plansBuilt: number;
  /** Whether the numbers are floored (true on day 1) or live (true once real
   * usage has overtaken the floor). The UI does not need to render this — it
   * exists for internal dashboards. */
  isLive: boolean;
  asOf: string;
}

async function safeCount(collection: string): Promise<number> {
  try {
    const snap = await adminDb.collection(collection).count().get();
    return snap.data().count ?? 0;
  } catch {
    return 0;
  }
}

async function safeCountByEvent(event: string): Promise<number> {
  try {
    const snap = await adminDb
      .collection('analytics_events')
      .where('event', '==', event)
      .count()
      .get();
    return snap.data().count ?? 0;
  } catch {
    return 0;
  }
}

export async function GET() {
  const [usersCount, ideasCount, plansCount] = await Promise.all([
    safeCount('users'),
    safeCountByEvent('idea_analyzed'),
    safeCountByEvent('plan_built'),
  ]);

  const founders = Math.max(usersCount, FLOOR.founders);
  const ideasAnalyzed = Math.max(ideasCount, FLOOR.ideasAnalyzed);
  const plansBuilt = Math.max(plansCount, FLOOR.plansBuilt);

  const payload: SocialProof = {
    founders,
    ideasAnalyzed,
    plansBuilt,
    isLive: usersCount > FLOOR.founders,
    asOf: new Date().toISOString(),
  };

  return NextResponse.json(payload, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}

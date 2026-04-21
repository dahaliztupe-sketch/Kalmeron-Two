import { NextResponse } from 'next/server';
import { adminDb } from '@/src/lib/firebase-admin';

export const runtime = 'nodejs';

export async function GET() {
  const timestamp = new Date().toISOString();
  try {
    await adminDb.collection('_health').doc('ping').get();
    return NextResponse.json(
      { status: 'healthy', timestamp, firestore: 'connected', version: process.env.npm_package_version || '0.1.0' },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { status: 'degraded', timestamp, firestore: 'unreachable' },
      { status: 200 }
    );
  }
}

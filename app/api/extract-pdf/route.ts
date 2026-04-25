import { NextRequest, NextResponse } from 'next/server';
import { extractPdf } from '@/src/lib/pdf/python-worker-client';
import { adminAuth } from '@/src/lib/firebase-admin';
import { rateLimit, rateLimitAgent, rateLimitResponse } from '@/src/lib/security/rate-limit';

const pdf = require('pdf-parse');

export const runtime = 'nodejs';

// 10 MB hard cap to prevent memory exhaustion via giant uploads.
const MAX_BYTES = 10 * 1024 * 1024;

/**
 * PDF extraction endpoint.
 * Tries the Arabic-aware Python worker first (services/pdf-worker), falls
 * back to the in-process `pdf-parse` path so the route never breaks if the
 * worker is unreachable.
 *
 * SECURITY: Requires a Firebase ID token (uploads consume CPU + memory).
 * Per-IP rate limit (10/min) and per-user rate limit (5/min) prevent abuse.
 */
export async function POST(req: NextRequest) {
  const { logger } = await import('@/src/lib/logger');

  // Per-IP rate limit
  const rl = rateLimit(req, { limit: 10, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();

  // Authenticate caller
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  let userId: string;
  try {
    const decoded = await adminAuth.verifyIdToken(authHeader.slice('Bearer '.length).trim());
    userId = decoded.uid;
  } catch {
    return NextResponse.json({ error: 'invalid_token' }, { status: 401 });
  }

  // Per-user rate limit (PDF extraction is expensive)
  const userRl = rateLimitAgent(userId, 'extract_pdf', { limit: 5, windowMs: 60_000 });
  if (!userRl.allowed) return rateLimitResponse();

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: `الملف يتجاوز الحد الأقصى المسموح به (${MAX_BYTES / 1024 / 1024} MB).` },
        { status: 413 },
      );
    }

    const bytes = await file.arrayBuffer();

    // 1. Preferred path — Python worker (Arabic-aware, paragraph-aware chunks).
    const worker = await extractPdf(bytes, { filename: file.name });
    if (worker.ok) {
      return NextResponse.json({
        text: worker.data.text,
        pageCount: worker.data.pageCount,
        language: worker.data.language,
        chunks: worker.data.chunks,
        source: 'python-worker',
      });
    }
    logger.warn({ reason: worker.reason, status: worker.status, userId }, 'PDF worker fallback');

    // 2. Fallback — in-process pdf-parse so the API never goes down.
    const buffer = Buffer.from(bytes);
    const data = await pdf(buffer);
    return NextResponse.json({ text: data.text, source: 'pdf-parse-fallback' });
  } catch (error) {
    logger.error({ err: error, userId }, 'PDF Extraction Error');
    return NextResponse.json({ error: 'Failed to extract PDF text' }, { status: 500 });
  }
}

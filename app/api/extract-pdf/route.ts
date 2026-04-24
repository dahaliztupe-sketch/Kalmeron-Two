import { NextResponse } from 'next/server';
import { extractPdf } from '@/src/lib/pdf/python-worker-client';

const pdf = require('pdf-parse');

/**
 * PDF extraction endpoint.
 * Tries the Arabic-aware Python worker first (services/pdf-worker), falls
 * back to the in-process `pdf-parse` path so the route never breaks if the
 * worker is unreachable.
 */
export async function POST(req: Request) {
  const { logger } = await import('@/src/lib/logger');
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
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
    logger.warn({ reason: worker.reason, status: worker.status }, 'PDF worker fallback');

    // 2. Fallback — in-process pdf-parse so the API never goes down.
    const buffer = Buffer.from(bytes);
    const data = await pdf(buffer);
    return NextResponse.json({ text: data.text, source: 'pdf-parse-fallback' });
  } catch (error) {
    logger.error({ err: error }, 'PDF Extraction Error');
    return NextResponse.json({ error: 'Failed to extract PDF text' }, { status: 500 });
  }
}

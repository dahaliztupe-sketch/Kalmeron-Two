import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/src/lib/firebase-admin';
import { ingestDocument } from '@/src/lib/rag/user-rag';
import { rateLimit } from '@/src/lib/security/rate-limit';
const pdf = require('pdf-parse');
import ExcelJS from 'exceljs';

export const runtime = 'nodejs';
export const maxDuration = 60;

async function authedUserId(req: NextRequest): Promise<string | null> {
  const auth = req.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  try {
    const decoded = await adminAuth.verifyIdToken(auth.split(' ')[1]!);
    return decoded.uid || null;
  } catch {
    return null;
  }
}

async function extractText(file: File): Promise<{ text: string; source: 'pdf' | 'csv' | 'xlsx' | 'text' }> {
  const name = file.name.toLowerCase();
  const buf = Buffer.from(await file.arrayBuffer()) as Buffer;
  if (name.endsWith('.pdf')) {
    const r = await pdf(buf);
    return { text: r.text || '', source: 'pdf' };
  }
  if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buf as unknown as Parameters<typeof wb.xlsx.load>[0]);
    const parts: string[] = [];
    wb.eachSheet((sheet) => {
      parts.push(`# ${sheet.name}`);
      const rows: string[] = [];
      sheet.eachRow({ includeEmpty: false }, (row) => {
        const values = (row.values as unknown[]).slice(1).map((v) => {
          if (v == null) return '';
          if (typeof v === 'object' && v !== null && 'text' in (v as Record<string, unknown>)) {
            return String((v as Record<string, unknown>).text ?? '');
          }
          return String(v);
        });
        rows.push(values.map((s) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s)).join(','));
      });
      parts.push(rows.join('\n'));
    });
    return { text: parts.join('\n\n'), source: 'xlsx' };
  }
  if (name.endsWith('.csv')) {
    return { text: buf.toString('utf8'), source: 'csv' };
  }
  return { text: buf.toString('utf8'), source: 'text' };
}

/**
 * Classify an error to return an appropriate HTTP status and user-facing message.
 * Network/embedding-service errors become 503 (not 500) so the client can distinguish
 * transient unavailability from a true server bug.
 */
function classifyIngestError(e: unknown): { status: number; error: string; fallback?: boolean } {
  if (e instanceof Error) {
    const msg = e.message.toLowerCase();
    if (
      e.name === 'AbortError' ||
      msg.includes('econnrefused') ||
      msg.includes('enotfound') ||
      msg.includes('etimedout') ||
      msg.includes('fetch failed') ||
      msg.includes('failed to fetch') ||
      msg.includes('network') ||
      msg.includes('socket hang up')
    ) {
      return { status: 503, error: 'embedding_service_unavailable', fallback: true };
    }
    if (msg.includes('429') || msg.includes('quota') || msg.includes('rate limit')) {
      return { status: 429, error: 'embedding_quota_exceeded' };
    }
    if (msg.includes('403') || msg.includes('unauthorized') || msg.includes('api key')) {
      return { status: 503, error: 'embedding_auth_error', fallback: true };
    }
  }
  return { status: 500, error: 'ingest_failed' };
}

export async function POST(req: NextRequest) {
  const userId = await authedUserId(req);
  if (!userId) return NextResponse.json({ error: 'auth_required' }, { status: 401 });

  const rl = rateLimit(req, { limit: 10, windowMs: 60_000, userId, scope: 'rag-ingest' });
  if (!rl.success) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

  let form: FormData;
  try { form = await req.formData(); }
  catch { return NextResponse.json({ error: 'invalid_form' }, { status: 400 }); }

  const file = form.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'file_required' }, { status: 400 });

  // MIME type / extension allowlist — only known document formats accepted.
  const allowedTypes = [
    'application/pdf',
    'text/csv',
    'text/plain',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];
  const allowedExtensions = ['.pdf', '.csv', '.txt', '.xls', '.xlsx'];
  const fileType = file.type || '';
  const fileName = file.name?.toLowerCase() || '';
  const extOk = allowedExtensions.some((ext) => fileName.endsWith(ext));
  if (!allowedTypes.includes(fileType) && !extOk) {
    return NextResponse.json(
      { error: 'unsupported_file_type', allowedTypes: allowedExtensions },
      { status: 415 },
    );
  }

  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: 'file_too_large_10mb' }, { status: 413 });

  try {
    const { text, source } = await extractText(file);
    if (!text.trim()) return NextResponse.json({ error: 'empty_document' }, { status: 422 });

    const documentId = `${Date.now().toString(36)}-${(typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID().replace(/-/g, '') : Math.random().toString(36).slice(2)).slice(0, 6)}`;
    const r = await ingestDocument({
      userId,
      documentId,
      documentName: file.name,
      source,
      text,
    });
    return NextResponse.json({ ok: true, ...r, documentName: file.name, source });
  } catch (e: unknown) {
    const { logger } = await import('@/src/lib/logger');
    logger.error({ err: e }, 'rag_ingest_failed');
    const { status, error, fallback } = classifyIngestError(e);
    return NextResponse.json(
      { error, fallback: fallback ?? false },
      { status },
    );
  }
}

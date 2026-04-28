// @ts-nocheck
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
  const buf = Buffer.from(await file.arrayBuffer());
  if (name.endsWith('.pdf')) {
    const r = await pdf(buf);
    return { text: r.text || '', source: 'pdf' };
  }
  if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buf);
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
  // Fallback: treat as text
  return { text: buf.toString('utf8'), source: 'text' };
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
    // Never echo the underlying error message to the client (CodeQL
    // js/stack-trace-exposure); the full error is captured server-side.
    return NextResponse.json({ error: 'ingest_failed' }, { status: 500 });
  }
}

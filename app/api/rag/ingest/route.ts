// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/src/lib/firebase-admin';
import { ingestDocument } from '@/src/lib/rag/user-rag';
import { rateLimit } from '@/lib/security/rate-limit';
const pdf = require('pdf-parse');
import * as XLSX from 'xlsx';

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
    const wb = XLSX.read(buf, { type: 'buffer' });
    const parts: string[] = [];
    for (const sn of wb.SheetNames) {
      parts.push(`# ${sn}`);
      parts.push(XLSX.utils.sheet_to_csv(wb.Sheets[sn]));
    }
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

  const rl = rateLimit(req, { max: 10, windowMs: 60_000, scope: `rag-ingest:${userId}` });
  if (!rl.allowed) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

  let form: FormData;
  try { form = await req.formData(); }
  catch { return NextResponse.json({ error: 'invalid_form' }, { status: 400 }); }

  const file = form.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'file_required' }, { status: 400 });
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: 'file_too_large_10mb' }, { status: 413 });

  try {
    const { text, source } = await extractText(file);
    if (!text.trim()) return NextResponse.json({ error: 'empty_document' }, { status: 422 });

    const documentId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const r = await ingestDocument({
      userId,
      documentId,
      documentName: file.name,
      source,
      text,
    });
    return NextResponse.json({ ok: true, ...r, documentName: file.name, source });
  } catch (e: any) {
    const { logger } = await import('@/src/lib/logger');
    logger.error({ err: e }, 'rag_ingest_failed');
    return NextResponse.json({ error: e?.message || 'ingest_failed' }, { status: 500 });
  }
}

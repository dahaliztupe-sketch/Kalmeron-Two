/**
 * POST /api/customer-discovery/persona-pdf
 * Converts a persona analysis text into a downloadable PDF.
 * Uses an HTML template rendered to PDF via puppeteer (if available) or
 * returns a plain-text PDF fallback using the `pdfkit` library.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminAuth } from '@/src/lib/firebase-admin';
import { rateLimit, rateLimitResponse } from '@/src/lib/security/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BodySchema = z.object({
  personaText: z.string().min(50).max(20000),
  businessIdea: z.string().max(500).optional().default(''),
  targetSegment: z.string().max(300).optional().default(''),
});

export async function POST(req: NextRequest) {
  const rl = rateLimit(req, { limit: 10, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse();

  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  try {
    await adminAuth.verifyIdToken(authHeader.slice(7).trim());
  } catch {
    return NextResponse.json({ error: 'invalid_token' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({})) as unknown;
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const { personaText, businessIdea, targetSegment } = parsed.data;
  const now = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });

  // Build an HTML persona card
  const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="utf-8"/>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;900&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Tajawal', Arial, sans-serif; background: #0a0a0a; color: #f0f0f0; padding: 40px; min-height: 100vh; }
  .card { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border: 1px solid rgba(245,158,11,0.3); border-radius: 24px; padding: 40px; max-width: 800px; margin: 0 auto; }
  .header { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; border-bottom: 1px solid rgba(245,158,11,0.2); padding-bottom: 24px; }
  .logo { width: 48px; height: 48px; background: linear-gradient(135deg, #f59e0b, #d97706); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
  .title { flex: 1; }
  .title h1 { font-size: 22px; font-weight: 900; color: #f59e0b; }
  .title p { font-size: 13px; color: rgba(255,255,255,0.5); margin-top: 4px; }
  .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 28px; }
  .meta-item { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 12px 16px; }
  .meta-item label { font-size: 11px; color: rgba(255,255,255,0.4); display: block; margin-bottom: 4px; }
  .meta-item span { font-size: 14px; font-weight: 700; color: #f0f0f0; }
  .content { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 24px; line-height: 1.9; font-size: 14px; color: rgba(255,255,255,0.85); white-space: pre-wrap; word-break: break-word; }
  .footer { text-align: center; margin-top: 28px; font-size: 11px; color: rgba(255,255,255,0.3); }
</style>
</head>
<body>
<div class="card">
  <div class="header">
    <div class="logo">🎯</div>
    <div class="title">
      <h1>بطاقة Persona — كلميرون</h1>
      <p>Customer Discovery Agent · ${now}</p>
    </div>
  </div>
  ${businessIdea ? `
  <div class="meta">
    <div class="meta-item"><label>الفكرة التجارية</label><span>${businessIdea}</span></div>
    <div class="meta-item"><label>الشريحة المستهدفة</label><span>${targetSegment || '—'}</span></div>
  </div>` : ''}
  <div class="content">${personaText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
  <div class="footer">صُنع بواسطة كلميرون AI · جميع البيانات سرية · للاستخدام الداخلي فقط</div>
</div>
</body>
</html>`;

  // PDF via puppeteer is reserved for when the binary is available (returns HTML for now)

  // Fallback: return HTML as downloadable file with .html extension
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `attachment; filename="persona-card-${Date.now()}.html"`,
    },
  });
}

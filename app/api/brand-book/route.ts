/**
 * POST /api/brand-book
 * Generates or exports a brand book PDF from structured brand data.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminAuth } from '@/src/lib/firebase-admin';
import { rateLimit, rateLimitResponse } from '@/src/lib/security/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BrandBookInputSchema = z.object({
  brandName: z.string().min(1).max(200),
  tagline: z.string().max(500).optional().default(''),
  brandStory: z.string().max(5000).optional().default(''),
  communicationRules: z.array(z.string()).max(10).optional().default([]),
  colorSuggestions: z.array(z.object({ name: z.string(), hex: z.string(), usage: z.string() })).optional().default([]),
  messagingPillars: z.array(z.string()).max(10).optional().default([]),
  targetAudience: z.string().max(1000).optional().default(''),
  brandVoice: z.object({
    tone: z.array(z.string()).optional().default([]),
    personality: z.string().optional().default(''),
    communicationStyle: z.string().optional().default(''),
  }).optional().default({ tone: [], personality: '', communicationStyle: '' }),
  rawText: z.string().max(20000).optional().default(''),
});

export type BrandBookInput = z.infer<typeof BrandBookInputSchema>;

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
  const parsed = BrandBookInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_body', details: parsed.error.issues }, { status: 400 });
  }

  const data = parsed.data;
  const now = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });

  const colorSwatches = data.colorSuggestions.length > 0
    ? data.colorSuggestions.map(c => `
      <div class="swatch">
        <div class="swatch-color" style="background:${c.hex};"></div>
        <div class="swatch-info">
          <strong>${c.name}</strong>
          <span>${c.hex}</span>
          <p>${c.usage}</p>
        </div>
      </div>`).join('')
    : '<p class="empty">لم تُحدَّد ألوان العلامة بعد</p>';

  const pillarsHtml = data.messagingPillars.length > 0
    ? data.messagingPillars.map((p, i) => `<div class="pillar"><span class="pillar-num">${i + 1}</span><p>${p}</p></div>`).join('')
    : '<p class="empty">—</p>';

  const rulesHtml = data.communicationRules.length > 0
    ? data.communicationRules.map(r => `<li>${r}</li>`).join('')
    : '<li>لم تُحدَّد قواعد بعد</li>';

  const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="utf-8"/>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;700;900&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Tajawal', Arial, sans-serif; background: #f8f8f6; color: #1a1a1a; }
  .page { max-width: 900px; margin: 0 auto; padding: 60px 40px; }
  .cover { background: linear-gradient(135deg, #1a1a2e 0%, #0f172a 100%); color: white; padding: 80px 60px; border-radius: 24px; margin-bottom: 48px; position: relative; overflow: hidden; }
  .cover::before { content: ''; position: absolute; top: -50px; right: -50px; width: 300px; height: 300px; background: radial-gradient(circle, rgba(245,158,11,0.15), transparent 70%); }
  .cover-brand { font-size: 48px; font-weight: 900; margin-bottom: 8px; }
  .cover-tag { font-size: 18px; color: #f59e0b; margin-bottom: 40px; }
  .cover-meta { font-size: 13px; color: rgba(255,255,255,0.4); }
  .cover-badge { display: inline-block; background: rgba(245,158,11,0.15); border: 1px solid rgba(245,158,11,0.3); color: #f59e0b; padding: 6px 16px; border-radius: 999px; font-size: 12px; font-weight: 700; margin-bottom: 24px; }
  section { margin-bottom: 48px; }
  h2 { font-size: 22px; font-weight: 900; color: #1a1a2e; border-bottom: 3px solid #f59e0b; padding-bottom: 8px; margin-bottom: 20px; }
  .story-box { background: white; border-right: 4px solid #f59e0b; padding: 24px; border-radius: 12px; line-height: 1.9; color: #374151; font-size: 15px; }
  .audience-box { background: #fef3c7; border: 1px solid #fde68a; padding: 20px 24px; border-radius: 12px; color: #78350f; font-size: 14px; line-height: 1.8; }
  .voice-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
  .voice-card { background: white; padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb; }
  .voice-card label { font-size: 11px; font-weight: 700; color: #9ca3af; display: block; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.08em; }
  .voice-card p { font-size: 14px; color: #374151; line-height: 1.6; }
  .tone-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
  .tone-tag { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; }
  .swatches { display: flex; flex-wrap: wrap; gap: 16px; }
  .swatch { display: flex; align-items: center; gap: 12px; background: white; padding: 12px 16px; border-radius: 12px; border: 1px solid #e5e7eb; min-width: 200px; }
  .swatch-color { width: 48px; height: 48px; border-radius: 10px; flex-shrink: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
  .swatch-info strong { display: block; font-size: 13px; color: #111; }
  .swatch-info span { display: block; font-size: 11px; color: #9ca3af; margin-bottom: 4px; }
  .swatch-info p { font-size: 12px; color: #6b7280; }
  .pillars { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
  .pillar { background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; display: flex; gap: 12px; align-items: flex-start; }
  .pillar-num { background: #f59e0b; color: white; width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 13px; flex-shrink: 0; }
  .pillar p { font-size: 13px; color: #374151; line-height: 1.6; }
  .rules-list { background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; }
  .rules-list li { font-size: 14px; color: #374151; line-height: 2; padding-right: 8px; border-bottom: 1px solid #f3f4f6; }
  .rules-list li:last-child { border-bottom: none; }
  .raw-content { background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; font-size: 13px; color: #4b5563; line-height: 1.9; white-space: pre-wrap; word-break: break-word; }
  .footer { text-align: center; margin-top: 60px; padding-top: 24px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; }
  .empty { color: #9ca3af; font-size: 14px; }
</style>
</head>
<body>
<div class="page">
  <div class="cover">
    <div class="cover-badge">دليل الهوية</div>
    <div class="cover-brand">${data.brandName}</div>
    <div class="cover-tag">${data.tagline || 'علامتك، صوتك، أثرك'}</div>
    <div class="cover-meta">صُدِّر من كلميرون AI · ${now}</div>
  </div>

  ${data.brandStory ? `
  <section>
    <h2>قصة العلامة</h2>
    <div class="story-box">${data.brandStory}</div>
  </section>` : ''}

  ${data.targetAudience ? `
  <section>
    <h2>الجمهور المستهدف</h2>
    <div class="audience-box">${data.targetAudience}</div>
  </section>` : ''}

  ${(data.brandVoice.personality || data.brandVoice.communicationStyle || (data.brandVoice.tone?.length ?? 0) > 0) ? `
  <section>
    <h2>صوت العلامة</h2>
    <div class="voice-grid">
      <div class="voice-card">
        <label>النبرة</label>
        <div class="tone-tags">
          ${(data.brandVoice.tone || []).map(t => `<span class="tone-tag">${t}</span>`).join('')}
        </div>
      </div>
      <div class="voice-card">
        <label>الشخصية</label>
        <p>${data.brandVoice.personality || '—'}</p>
      </div>
      <div class="voice-card">
        <label>أسلوب التواصل</label>
        <p>${data.brandVoice.communicationStyle || '—'}</p>
      </div>
    </div>
  </section>` : ''}

  <section>
    <h2>الألوان</h2>
    <div class="swatches">${colorSwatches}</div>
  </section>

  ${data.messagingPillars.length > 0 ? `
  <section>
    <h2>ركائز الرسالة</h2>
    <div class="pillars">${pillarsHtml}</div>
  </section>` : ''}

  ${data.communicationRules.length > 0 ? `
  <section>
    <h2>قواعد التواصل</h2>
    <ul class="rules-list">${rulesHtml}</ul>
  </section>` : ''}

  ${data.rawText ? `
  <section>
    <h2>التحليل الكامل</h2>
    <div class="raw-content">${data.rawText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
  </section>` : ''}

  <div class="footer">صُنع بواسطة كلميرون AI · جميع البيانات سرية · للاستخدام الداخلي فقط</div>
</div>
</body>
</html>`;

  // Puppeteer PDF generation reserved for future use when binary is available

  // Fallback: return HTML as downloadable file
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `attachment; filename="brand-book-${data.brandName}-${Date.now()}.html"`,
    },
  });
}

/**
 * POST /api/brand-book
 * Generates a brand book PDF from structured brand data using @react-pdf/renderer.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminAuth } from '@/src/lib/firebase-admin';
import { rateLimit, rateLimitResponse } from '@/src/lib/security/rate-limit';
import React from 'react';
import {
  renderToBuffer,
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';

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

let fontRegistered = false;
async function ensureFont() {
  if (fontRegistered) return;
  try {
    const res = await fetch('https://fonts.gstatic.com/s/tajawal/v9/Iura6YBj_oCad4k1nzSBC45I.ttf', { signal: AbortSignal.timeout(8000) });
    if (res.ok) {
      const buf = await res.arrayBuffer();
      Font.register({ family: 'Tajawal', src: buf as unknown as string });
      fontRegistered = true;
    }
  } catch {
    fontRegistered = false;
  }
}

const styles = StyleSheet.create({
  page: { padding: 40, backgroundColor: '#f8f7f4', fontFamily: 'Helvetica' },
  coverPage: { padding: 0, backgroundColor: '#0f172a' },
  coverInner: { padding: 60, flex: 1 },
  badge: { fontSize: 10, color: '#f59e0b', marginBottom: 20, textTransform: 'uppercase', letterSpacing: 2 },
  brandName: { fontSize: 40, fontWeight: 'bold', color: '#ffffff', marginBottom: 8 },
  tagline: { fontSize: 16, color: '#f59e0b', marginBottom: 40 },
  coverMeta: { fontSize: 11, color: 'rgba(255,255,255,0.4)' },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1a1a2e', borderBottomColor: '#f59e0b', borderBottomWidth: 2, paddingBottom: 6, marginBottom: 14 },
  storyBox: { backgroundColor: '#ffffff', borderLeftColor: '#f59e0b', borderLeftWidth: 3, padding: 16, borderRadius: 8 },
  bodyText: { fontSize: 12, color: '#374151', lineHeight: 1.8 },
  audienceBox: { backgroundColor: '#fef3c7', padding: 14, borderRadius: 8 },
  audienceText: { fontSize: 12, color: '#78350f', lineHeight: 1.8 },
  voiceRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  voiceCard: { flex: 1, backgroundColor: '#ffffff', padding: 14, borderRadius: 8, borderColor: '#e5e7eb', borderWidth: 1 },
  voiceLabel: { fontSize: 9, color: '#9ca3af', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 },
  voiceValue: { fontSize: 12, color: '#374151' },
  swatchRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  swatchCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#ffffff', padding: 10, borderRadius: 8, borderColor: '#e5e7eb', borderWidth: 1, minWidth: 160 },
  swatchDot: { width: 36, height: 36, borderRadius: 8 },
  swatchHex: { fontSize: 10, color: '#9ca3af', marginTop: 2 },
  swatchName: { fontSize: 12, fontWeight: 'bold', color: '#111111' },
  swatchUsage: { fontSize: 10, color: '#6b7280', marginTop: 2 },
  pillarsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  pillarCard: { backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderWidth: 1, borderRadius: 8, padding: 14, width: '30%' },
  pillarNum: { fontSize: 14, fontWeight: 'bold', color: '#f59e0b', marginBottom: 6 },
  pillarText: { fontSize: 11, color: '#374151', lineHeight: 1.6 },
  ruleItem: { fontSize: 12, color: '#374151', lineHeight: 1.8, paddingVertical: 4, borderBottomColor: '#f3f4f6', borderBottomWidth: 1 },
  ruleBox: { backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderWidth: 1, borderRadius: 8, padding: 16 },
  rawBox: { backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderWidth: 1, borderRadius: 8, padding: 16, maxHeight: 400 },
  rawText: { fontSize: 11, color: '#4b5563', lineHeight: 1.8 },
  footer: { textAlign: 'center', fontSize: 10, color: '#9ca3af', marginTop: 40 },
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
  const parsed = BrandBookInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_body', details: parsed.error.issues }, { status: 400 });
  }

  const data = parsed.data;
  const now = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });

  await ensureFont();
  const fontFamily = fontRegistered ? 'Tajawal' : 'Helvetica';

  const BrandBookDoc = () =>
    React.createElement(Document, { title: `Brand Book - ${data.brandName}`, language: 'ar' },
      React.createElement(Page, { size: 'A4', style: [styles.coverPage] },
        React.createElement(View, { style: styles.coverInner },
          React.createElement(Text, { style: [styles.badge, { fontFamily }] }, 'دليل الهوية · Brand Book'),
          React.createElement(Text, { style: [styles.brandName, { fontFamily }] }, data.brandName),
          React.createElement(Text, { style: [styles.tagline, { fontFamily }] }, data.tagline || 'علامتك، صوتك، أثرك'),
          React.createElement(Text, { style: [styles.coverMeta, { fontFamily }] }, `صُدِّر من كلميرون AI · ${now}`),
        )
      ),

      React.createElement(Page, { size: 'A4', style: styles.page },
        data.brandStory ? React.createElement(View, { style: styles.section },
          React.createElement(Text, { style: [styles.sectionTitle, { fontFamily }] }, 'قصة العلامة'),
          React.createElement(View, { style: styles.storyBox },
            React.createElement(Text, { style: [styles.bodyText, { fontFamily }] }, data.brandStory),
          )
        ) : null,

        data.targetAudience ? React.createElement(View, { style: styles.section },
          React.createElement(Text, { style: [styles.sectionTitle, { fontFamily }] }, 'الجمهور المستهدف'),
          React.createElement(View, { style: styles.audienceBox },
            React.createElement(Text, { style: [styles.audienceText, { fontFamily }] }, data.targetAudience),
          )
        ) : null,

        (data.brandVoice.personality || data.brandVoice.communicationStyle || (data.brandVoice.tone?.length ?? 0) > 0)
          ? React.createElement(View, { style: styles.section },
              React.createElement(Text, { style: [styles.sectionTitle, { fontFamily }] }, 'صوت العلامة'),
              React.createElement(View, { style: styles.voiceRow },
                React.createElement(View, { style: styles.voiceCard },
                  React.createElement(Text, { style: [styles.voiceLabel, { fontFamily }] }, 'النبرة'),
                  React.createElement(Text, { style: [styles.voiceValue, { fontFamily }] }, (data.brandVoice.tone || []).join('، ') || '—'),
                ),
                React.createElement(View, { style: styles.voiceCard },
                  React.createElement(Text, { style: [styles.voiceLabel, { fontFamily }] }, 'الشخصية'),
                  React.createElement(Text, { style: [styles.voiceValue, { fontFamily }] }, data.brandVoice.personality || '—'),
                ),
                React.createElement(View, { style: styles.voiceCard },
                  React.createElement(Text, { style: [styles.voiceLabel, { fontFamily }] }, 'أسلوب التواصل'),
                  React.createElement(Text, { style: [styles.voiceValue, { fontFamily }] }, data.brandVoice.communicationStyle || '—'),
                ),
              )
            )
          : null,

        data.colorSuggestions.length > 0 ? React.createElement(View, { style: styles.section },
          React.createElement(Text, { style: [styles.sectionTitle, { fontFamily }] }, 'ألوان العلامة'),
          React.createElement(View, { style: styles.swatchRow },
            ...data.colorSuggestions.map((c, i) =>
              React.createElement(View, { key: i, style: styles.swatchCard },
                React.createElement(View, { style: [styles.swatchDot, { backgroundColor: c.hex }] }),
                React.createElement(View, null,
                  React.createElement(Text, { style: [styles.swatchName, { fontFamily }] }, c.name),
                  React.createElement(Text, { style: [styles.swatchHex, { fontFamily }] }, c.hex),
                  React.createElement(Text, { style: [styles.swatchUsage, { fontFamily }] }, c.usage),
                )
              )
            )
          )
        ) : null,

        data.messagingPillars.length > 0 ? React.createElement(View, { style: styles.section },
          React.createElement(Text, { style: [styles.sectionTitle, { fontFamily }] }, 'ركائز الرسالة'),
          React.createElement(View, { style: styles.pillarsGrid },
            ...data.messagingPillars.map((p, i) =>
              React.createElement(View, { key: i, style: styles.pillarCard },
                React.createElement(Text, { style: [styles.pillarNum, { fontFamily }] }, String(i + 1)),
                React.createElement(Text, { style: [styles.pillarText, { fontFamily }] }, p),
              )
            )
          )
        ) : null,

        data.communicationRules.length > 0 ? React.createElement(View, { style: styles.section },
          React.createElement(Text, { style: [styles.sectionTitle, { fontFamily }] }, 'قواعد التواصل'),
          React.createElement(View, { style: styles.ruleBox },
            ...data.communicationRules.map((r, i) =>
              React.createElement(Text, { key: i, style: [styles.ruleItem, { fontFamily }] }, `• ${r}`)
            )
          )
        ) : null,

        data.rawText ? React.createElement(View, { style: styles.section },
          React.createElement(Text, { style: [styles.sectionTitle, { fontFamily }] }, 'التحليل الكامل'),
          React.createElement(View, { style: styles.rawBox },
            React.createElement(Text, { style: [styles.rawText, { fontFamily }] }, data.rawText.slice(0, 3000)),
          )
        ) : null,

        React.createElement(Text, { style: [styles.footer, { fontFamily }] }, 'صُنع بواسطة كلميرون AI · جميع البيانات سرية · للاستخدام الداخلي فقط'),
      )
    );

  try {
    const pdfBuffer = await renderToBuffer(React.createElement(BrandBookDoc));
    const safeName = data.brandName.replace(/[^\w\u0600-\u06FF\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 50);
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="brand-book-${safeName}-${Date.now()}.pdf"`,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'pdf_generation_failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

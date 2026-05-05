/**
 * POST /api/customer-discovery/persona-pdf
 * Converts a persona analysis text into a downloadable PDF using @react-pdf/renderer.
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

const BodySchema = z.object({
  personaText: z.string().min(50).max(20000),
  businessIdea: z.string().max(500).optional().default(''),
  targetSegment: z.string().max(300).optional().default(''),
});

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
  page: { padding: 0, backgroundColor: '#0a0a0a' },
  inner: { padding: 40, flex: 1 },
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 36,
    borderColor: 'rgba(245,158,11,0.3)',
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    borderBottomColor: 'rgba(245,158,11,0.2)',
    borderBottomWidth: 1,
    paddingBottom: 20,
    gap: 14,
  },
  logoBox: {
    width: 44,
    height: 44,
    backgroundColor: '#f59e0b',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { fontSize: 20, color: '#ffffff' },
  titleBox: { flex: 1 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#f59e0b' },
  subtitle: { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 4 },
  metaGrid: { flexDirection: 'row', gap: 14, marginBottom: 24 },
  metaItem: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  metaLabel: { fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 4 },
  metaValue: { fontSize: 13, fontWeight: 'bold', color: '#f0f0f0' },
  contentBox: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
  },
  content: { fontSize: 12, color: 'rgba(255,255,255,0.85)', lineHeight: 1.9 },
  footer: { textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 24 },
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

  await ensureFont();
  const f = fontRegistered ? 'Tajawal' : 'Helvetica';

  const PersonaDoc = () =>
    React.createElement(Document, { title: 'Persona Card - Kalmeron', language: 'ar' },
      React.createElement(Page, { size: 'A4', style: styles.page },
        React.createElement(View, { style: styles.inner },
          React.createElement(View, { style: styles.card },
            React.createElement(View, { style: styles.headerRow },
              React.createElement(View, { style: styles.logoBox },
                React.createElement(Text, { style: [styles.logoText, { fontFamily: f }] }, '*'),
              ),
              React.createElement(View, { style: styles.titleBox },
                React.createElement(Text, { style: [styles.title, { fontFamily: f }] }, 'بطاقة Persona — كلميرون'),
                React.createElement(Text, { style: [styles.subtitle, { fontFamily: f }] }, `Customer Discovery Agent · ${now}`),
              ),
            ),

            (businessIdea || targetSegment) ? React.createElement(View, { style: styles.metaGrid },
              React.createElement(View, { style: styles.metaItem },
                React.createElement(Text, { style: [styles.metaLabel, { fontFamily: f }] }, 'الفكرة التجارية'),
                React.createElement(Text, { style: [styles.metaValue, { fontFamily: f }] }, businessIdea || '—'),
              ),
              React.createElement(View, { style: styles.metaItem },
                React.createElement(Text, { style: [styles.metaLabel, { fontFamily: f }] }, 'الشريحة المستهدفة'),
                React.createElement(Text, { style: [styles.metaValue, { fontFamily: f }] }, targetSegment || '—'),
              ),
            ) : null,

            React.createElement(View, { style: styles.contentBox },
              React.createElement(Text, { style: [styles.content, { fontFamily: f }] }, personaText),
            ),

            React.createElement(Text, { style: [styles.footer, { fontFamily: f }] },
              'صُنع بواسطة كلميرون AI · جميع البيانات سرية · للاستخدام الداخلي فقط'
            ),
          )
        )
      )
    );

  try {
    const pdfBuffer = await renderToBuffer(React.createElement(PersonaDoc));
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="persona-card-${Date.now()}.pdf"`,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'pdf_generation_failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

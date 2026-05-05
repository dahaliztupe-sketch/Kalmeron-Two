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

const PersonaCardSchema = z.object({
  name: z.string().optional(),
  age: z.string().optional(),
  occupation: z.string().optional(),
  location: z.string().optional(),
  mainPain: z.string().optional(),
  goals: z.array(z.string()).optional(),
  behaviors: z.array(z.string()).optional(),
  payingWillingness: z.string().optional(),
  quote: z.string().optional(),
  interviewSignals: z.array(z.string()).optional(),
});

const BodySchema = z.object({
  personaText: z.string().min(10).max(20000),
  businessIdea: z.string().max(500).optional().default(''),
  targetSegment: z.string().max(300).optional().default(''),
  persona: PersonaCardSchema.nullable().optional(),
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

  const { personaText, businessIdea, targetSegment, persona } = parsed.data;
  const now = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });

  await ensureFont();
  const f = fontRegistered ? 'Tajawal' : 'Helvetica';

  const listStyle = { fontSize: 11, color: 'rgba(255,255,255,0.8)', lineHeight: 1.8, marginBottom: 2, fontFamily: f };
  const sectionLabelStyle = { fontSize: 10, color: '#f59e0b', fontWeight: 'bold' as const, marginBottom: 6, marginTop: 12, fontFamily: f };

  function renderStructuredPersona() {
    if (!persona) return null;
    const rows: ReturnType<typeof React.createElement>[] = [];
    if (persona.quote) {
      rows.push(React.createElement(View, { key: 'quote', style: { backgroundColor: 'rgba(245,158,11,0.08)', borderRadius: 8, padding: 12, marginBottom: 8, borderColor: 'rgba(245,158,11,0.25)', borderWidth: 1 } },
        React.createElement(Text, { style: { fontSize: 13, fontStyle: 'italic' as const, color: '#f59e0b', fontFamily: f } }, `"${persona.quote}"`),
      ));
    }
    if (persona.mainPain) {
      rows.push(React.createElement(Text, { key: 'painLabel', style: sectionLabelStyle }, 'الألم الرئيسي'));
      rows.push(React.createElement(Text, { key: 'pain', style: listStyle }, persona.mainPain as string));
    }
    if (persona.goals?.length) {
      rows.push(React.createElement(Text, { key: 'goalsLabel', style: sectionLabelStyle }, 'الأهداف'));
      (persona.goals as string[]).forEach((g, i) => rows.push(React.createElement(Text, { key: `g${i}`, style: listStyle }, `• ${g}`)));
    }
    if (persona.behaviors?.length) {
      rows.push(React.createElement(Text, { key: 'behLabel', style: sectionLabelStyle }, 'السلوكيات'));
      (persona.behaviors as string[]).forEach((b, i) => rows.push(React.createElement(Text, { key: `b${i}`, style: listStyle }, `• ${b}`)));
    }
    if (persona.payingWillingness) {
      rows.push(React.createElement(Text, { key: 'payLabel', style: sectionLabelStyle }, 'الاستعداد للدفع'));
      rows.push(React.createElement(Text, { key: 'pay', style: listStyle }, persona.payingWillingness as string));
    }
    if (persona.interviewSignals?.length) {
      rows.push(React.createElement(Text, { key: 'sigLabel', style: sectionLabelStyle }, 'إشارات المقابلة'));
      (persona.interviewSignals as string[]).forEach((s, i) => rows.push(React.createElement(Text, { key: `s${i}`, style: listStyle }, `◆ ${s}`)));
    }
    return rows.length ? React.createElement(View, { style: styles.contentBox }, ...rows) : null;
  }

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
                React.createElement(Text, { style: [styles.title, { fontFamily: f }] }, persona ? `Persona: ${String(persona.name || 'بطاقة العميل')} — كلميرون` : 'بطاقة Persona — كلميرون'),
                React.createElement(Text, { style: [styles.subtitle, { fontFamily: f }] }, `Customer Discovery Agent · ${now}`),
              ),
            ),

            React.createElement(View, { style: styles.metaGrid },
              persona?.age ? React.createElement(View, { style: styles.metaItem },
                React.createElement(Text, { style: [styles.metaLabel, { fontFamily: f }] }, 'العمر'),
                React.createElement(Text, { style: [styles.metaValue, { fontFamily: f }] }, String(persona.age)),
              ) : React.createElement(View, { style: styles.metaItem },
                React.createElement(Text, { style: [styles.metaLabel, { fontFamily: f }] }, 'الفكرة التجارية'),
                React.createElement(Text, { style: [styles.metaValue, { fontFamily: f }] }, businessIdea || '—'),
              ),
              persona?.occupation ? React.createElement(View, { style: styles.metaItem },
                React.createElement(Text, { style: [styles.metaLabel, { fontFamily: f }] }, 'المهنة'),
                React.createElement(Text, { style: [styles.metaValue, { fontFamily: f }] }, String(persona.occupation)),
              ) : React.createElement(View, { style: styles.metaItem },
                React.createElement(Text, { style: [styles.metaLabel, { fontFamily: f }] }, 'الشريحة المستهدفة'),
                React.createElement(Text, { style: [styles.metaValue, { fontFamily: f }] }, targetSegment || '—'),
              ),
              persona?.location ? React.createElement(View, { style: styles.metaItem },
                React.createElement(Text, { style: [styles.metaLabel, { fontFamily: f }] }, 'الموقع'),
                React.createElement(Text, { style: [styles.metaValue, { fontFamily: f }] }, String(persona.location)),
              ) : null,
            ),

            persona ? renderStructuredPersona() :
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

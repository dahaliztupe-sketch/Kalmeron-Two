import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

let cachedFont: ArrayBuffer | null = null;
const FONT_URLS = [
  'https://cdn.jsdelivr.net/gh/google/fonts/ofl/cairo/static/Cairo-Bold.ttf',
  'https://cdn.jsdelivr.net/gh/google/fonts/ofl/tajawal/Tajawal-Bold.ttf',
];

async function loadArabicFont(): Promise<ArrayBuffer | null> {
  if (cachedFont) return cachedFont;
  for (const url of FONT_URLS) {
    try {
      const res = await fetch(url, { cache: 'force-cache' });
      if (!res.ok) continue;
      cachedFont = await res.arrayBuffer();
      return cachedFont;
    } catch {
      // try next
    }
  }
  return null;
}

function stripArabicFallback(s: string): string {
  const cleaned = s.replace(/[\u0600-\u06FF\u0750-\u077F]+/g, '').trim();
  return cleaned || 'Kalmeron AI';
}

const TYPE_LABELS: Record<string, string> = {
  'use-case': 'حالة استخدام',
  'compare': 'مقارنة',
  'industry': 'صناعة',
  'blog': 'مقال',
  'default': 'كلميرون',
};

function buildOg(title: string, subtitle: string, label: string) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #080C14 0%, #0D1321 50%, #0A0F1B 100%)',
        padding: '80px',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          right: '-10%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(56,189,248,0.18) 0%, transparent 70%)',
          display: 'flex',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-15%',
          left: '-5%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)',
          display: 'flex',
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '60px' }}>
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #06B6D4 0%, #6366F1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            color: 'white',
          }}
        >
          K
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ color: 'white', fontSize: '32px', fontWeight: 700, lineHeight: 1 }}>Kalmeron</span>
          <span style={{ color: '#94A3B8', fontSize: '18px', marginTop: '4px' }}>AI Studio</span>
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          alignSelf: 'flex-start',
          padding: '8px 20px',
          borderRadius: '999px',
          background: 'rgba(56,189,248,0.12)',
          border: '1px solid rgba(56,189,248,0.3)',
          color: '#67E8F9',
          fontSize: '20px',
          marginBottom: '32px',
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: 'flex',
          color: 'white',
          fontSize: title.length > 50 ? '52px' : '64px',
          fontWeight: 800,
          lineHeight: 1.15,
          maxWidth: '1000px',
          letterSpacing: '-0.02em',
        }}
      >
        {title}
      </div>
      <div
        style={{
          display: 'flex',
          color: '#CBD5E1',
          fontSize: '28px',
          marginTop: '24px',
          maxWidth: '900px',
        }}
      >
        {subtitle}
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: '60px',
          left: '80px',
          right: '80px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#64748B',
          fontSize: '20px',
        }}
      >
        <span>kalmeron.app</span>
        <span>{label === 'كلميرون' || label === 'DEFAULT' ? '' : ''}</span>
      </div>
    </div>
  );
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawTitle = (searchParams.get('title') || 'Kalmeron AI').slice(0, 100);
  const type = searchParams.get('type') || 'default';
  const rawSubtitle = searchParams.get('subtitle') || 'AI Studio for Entrepreneurs';
  const rawLabel = TYPE_LABELS[type] || TYPE_LABELS.default;

  const arabicFont = await loadArabicFont();
  const title = arabicFont ? rawTitle : stripArabicFallback(rawTitle);
  const subtitle = arabicFont ? rawSubtitle : 'AI Studio for Entrepreneurs';
  const label = arabicFont ? rawLabel : type.toUpperCase();

  try {
    return new ImageResponse(buildOg(title, subtitle, label), {
      width: 1200,
      height: 630,
      fonts: arabicFont
        ? [{ name: 'Cairo', data: arabicFont, style: 'normal', weight: 700 as const }]
        : undefined,
    });
  } catch {
    // Final safety net — never let this route 500.
    return new ImageResponse(
      buildOg(stripArabicFallback(title), 'AI Studio for Entrepreneurs', type.toUpperCase()),
      { width: 1200, height: 630 }
    );
  }
}

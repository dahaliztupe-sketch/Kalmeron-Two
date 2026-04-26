/**
 * /api/affiliate/track — log an affiliate click.
 *
 * P1-5 from Virtual Boardroom 201 (Hormozi seat).
 *
 * Called by edge middleware when ?ref=CODE is detected on any page.
 * Writes to `affiliate_clicks` for partner analytics. Schema:
 *   { ref, utmSource, utmCampaign, utmMedium, path, referer, ip, ua, ts }
 *
 * Conversion is recorded at signup (`affiliate_conversions`) and at
 * payment (`affiliate_commissions`) — see Stripe webhook.
 */
import { NextRequest } from 'next/server';
import { adminDb } from '@/src/lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let body: { code?: string; event?: string; meta?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: 'bad-json' }, { status: 400 });
  }

  const ref = typeof body.ref === 'string' ? body.ref.slice(0, 64) : '';
  if (!ref) return Response.json({ ok: false, error: 'missing-ref' }, { status: 400 });

  // Hash IP for privacy (no raw IPs in DB).
  const xff = req.headers.get('x-forwarded-for') ?? '';
  const ipRaw = xff.split(',')[0]?.trim() || 'unknown';
  const ipHash = await sha256(ipRaw);

  try {
    await adminDb.collection('affiliate_clicks').add({
      ref,
      utmSource: body.utmSource ?? null,
      utmCampaign: body.utmCampaign ?? null,
      utmMedium: body.utmMedium ?? null,
      path: typeof body.path === 'string' ? body.path.slice(0, 256) : null,
      referer: typeof body.referer === 'string' ? body.referer.slice(0, 512) : null,
      ipHash,
      ua: req.headers.get('user-agent')?.slice(0, 256) ?? null,
      ts: Date.now(),
    });
  } catch (e: unknown) {
    return Response.json({ ok: false, error: e?.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

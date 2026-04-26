import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/src/lib/security/rate-limit';

export const runtime = 'edge';
export const preferredRegion = ['dub1', 'bom1', 'iad1', 'fra1']; // Dubai, Mumbai, Washington, Frankfurt

export function GET(req: NextRequest) {
  // Per-IP rate limit — diagnostic endpoint, 30/min is plenty.
  const rl = rateLimit(req, { limit: 30, windowMs: 60_000 });
  if (!rl.success) return new NextResponse('Too Many Requests', { status: 429 });

  // Access geolocation data provided by Vercel deployment infrastructure
  const country = req.headers.get('x-vercel-ip-country') || 'Unknown';
  const city = req.headers.get('x-vercel-ip-city') || 'Unknown';
  const region = req.headers.get('x-vercel-ip-country-region') || 'Unknown';
  
  return NextResponse.json({
    success: true,
    message: 'Kalmeron Two Global Edge Node Access',
    location: { country, city, region },
    timestamp: new Date().toISOString()
  });
}

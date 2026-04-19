import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const preferredRegion = ['dub1', 'bom1', 'iad1', 'fra1']; // Dubai, Mumbai, Washington, Frankfurt

export function GET(req: Request) {
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

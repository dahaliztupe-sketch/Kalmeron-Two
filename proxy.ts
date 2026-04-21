import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Proxy handles global routing logic and GeoIP-based currency detection.
 * Removed firebase-admin to ensure compatibility with Next.js Edge Runtime.
 */
export async function proxy(request: NextRequest) {
  const url = request.nextUrl;
  
  // 1. Global Edge Routing / Location-Aware Adaptation
  // request.geo is Vercel-specific; on Replit we fall back to headers only
  const country = request.headers.get('x-vercel-ip-country') || request.headers.get('cf-ipcountry') || 'Unknown';
  
  const response = NextResponse.next();
  response.headers.set('x-kalmeron-country', country);

  // Localization logic (Currency headers based on GeoIP)
  if (country === 'SA') response.headers.set('x-kalmeron-currency', 'SAR');
  else if (country === 'AE') response.headers.set('x-kalmeron-currency', 'AED');
  else response.headers.set('x-kalmeron-currency', 'EGP');

  // 2. Admin Authentication Guard (Simplified due to Edge Runtime constraints)
  // For production, consider using firebase-auth-edge or verifying via JWT/Jose.
  if (url.pathname.startsWith('/admin')) {
    const session = request.cookies.get('session');
    if (!session) {
      return NextResponse.redirect(new URL('/chat', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'], // Match all paths for Geo IP
};

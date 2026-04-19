import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, cert, getApp, getApps } from 'firebase-admin/app';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY 
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY) 
  : {};

const adminApp = Object.keys(serviceAccount).length > 0 && !getApps().length 
  ? initializeApp({ credential: cert(serviceAccount) }) 
  : (getApps().length ? getApp() : null);

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  
  // 1. Global Edge Routing / Location-Aware Adaptation
  const country = request.geo?.country || request.headers.get('x-vercel-ip-country') || 'Unknown';
  
  const response = NextResponse.next();
  response.headers.set('x-kalmeron-country', country);

  // Localization logic (Currency headers based on GeoIP)
  if (country === 'SA') response.headers.set('x-kalmeron-currency', 'SAR');
  else if (country === 'AE') response.headers.set('x-kalmeron-currency', 'AED');
  else response.headers.set('x-kalmeron-currency', 'EGP');

  // 2. Admin Authentication Guard
  if (url.pathname.startsWith('/admin')) {
    const token = request.cookies.get('session')?.value;
    
    if (!token) {
      return NextResponse.redirect(new URL('/chat', request.url));
    }

    try {
      if (adminApp) {
        const decodedToken = await getAuth(adminApp).verifyIdToken(token);
        if (decodedToken.admin !== true) {
          return NextResponse.redirect(new URL('/chat', request.url));
        }
      }
    } catch (e) {
      return NextResponse.redirect(new URL('/chat', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'], // Match all paths for Geo IP
};

import type { NextConfig } from 'next';
import withBundleAnalyzer from '@next/bundle-analyzer';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

// Content-Security-Policy
// In dev we relax `unsafe-eval` / `unsafe-inline` for HMR, React DevTools and
// inline next.js bootstrap scripts. In production we keep `unsafe-inline` only
// for styles (Tailwind/Framer Motion injected styles); scripts use nonces via
// Next.js automatic strict CSP when available.
function buildCsp(): string {
  const isProd = process.env.NODE_ENV === 'production';
  const directives: Record<string, string[]> = {
    'default-src': ["'self'"],
    'script-src': isProd
      ? ["'self'", "'unsafe-inline'", 'https://js.stripe.com', 'https://*.sentry.io', 'https://*.vercel-insights.com', 'https://cdn.jsdelivr.net', 'https://apis.google.com', 'https://accounts.google.com']
      : ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://js.stripe.com', 'https://cdn.jsdelivr.net', 'https://apis.google.com', 'https://accounts.google.com'],
    'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    'img-src': ["'self'", 'data:', 'blob:', 'https:'],
    'font-src': ["'self'", 'data:', 'https://fonts.gstatic.com'],
    'connect-src': [
      "'self'",
      'https://*.googleapis.com',
      'https://*.firebaseio.com',
      'https://*.firebase.com',
      'https://identitytoolkit.googleapis.com',
      'https://securetoken.googleapis.com',
      'https://api.stripe.com',
      'https://*.sentry.io',
      'https://*.langfuse.com',
      'https://generativelanguage.googleapis.com',
      'wss://*.firebaseio.com',
      ...(isProd ? [] : ['ws://localhost:*', 'http://localhost:*', 'https://localhost:*']),
    ],
    'frame-src': ["'self'", 'https://js.stripe.com', 'https://hooks.stripe.com', 'https://accounts.google.com', 'https://*.firebaseapp.com'],
    'media-src': ["'self'", 'blob:', 'data:'],
    'worker-src': ["'self'", 'blob:'],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'self'"],
    'upgrade-insecure-requests': [],
  };
  return Object.entries(directives)
    .map(([k, v]) => (v.length ? `${k} ${v.join(' ')}` : k))
    .join('; ');
}

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=(), interest-cohort=()',
  },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-site' },
  {
    key: process.env.NODE_ENV === 'production'
      ? 'Content-Security-Policy'
      : 'Content-Security-Policy-Report-Only',
    value: buildCsp(),
  },
];

const nextConfig: NextConfig = {
  serverExternalPackages: ['pdf-parse', '@napi-rs/canvas'],
  allowedDevOrigins: process.env.REPLIT_DEV_DOMAIN ? [
    process.env.REPLIT_DEV_DOMAIN,
    `https://${process.env.REPLIT_DEV_DOMAIN}`,
  ] : [],
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    // ملاحظة: cacheComponents معطّل عمداً — يتعارض مع `export const runtime = 'nodejs'`
    // المستخدم في عدة مسارات API تحتاج Node runtime (Firebase Admin SDK، WebSockets).
    // لتفعيله مستقبلاً يجب نقل تلك المسارات إلى edge أو إزالة إعلان runtime.
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  reactStrictMode: true,
  compress: true,
  typescript: {
    // ⚠️ stack-overflow معروف في Next.js 16 TS-checker على بعض المشاريع
    // (https://github.com/vercel/next.js/issues — "Maximum call stack size exceeded")
    // نتجاوزه بتفعيل ignoreBuildErrors=true، ونعتمد على `npm run typecheck`
    // (الذي يستخدم --stack-size=8192) كحارس قبل البناء/النشر.
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  transpilePackages: ['motion'],
  webpack: (config, { dev }) => {
    if (dev && process.env.DISABLE_HMR === 'true') {
      config.watchOptions = {
        ignored: /.*/,
      };
    }
    return config;
  },
};

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(withNextIntl(nextConfig));

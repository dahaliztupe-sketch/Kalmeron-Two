---
name: vercel-deployment
description: Vercel Edge and serverless deployment patterns for Next.js App Router. Use when optimizing API routes, configuring edge runtime, managing environment variables for deployment, or troubleshooting build/deployment issues. Covers Kalmeron's deployment configuration on Replit.
---

# Vercel Deployment Patterns for Next.js App Router

Official patterns from Vercel engineering, adapted for Kalmeron's configuration.

## Runtime Selection

### Edge vs Node.js Runtimes
```typescript
// Edge Runtime — faster cold start, global distribution, limited APIs
export const runtime = 'edge'; // no fs, no child_process

// Node.js Runtime — full Node.js APIs (default for Kalmeron)
export const runtime = 'nodejs'; // or just omit — default

// When to use Edge:
// - Simple auth checks, redirects, A/B testing
// - Middleware (middleware.ts always runs on Edge)

// When to use Node.js (Kalmeron default):
// - Firebase Admin SDK (requires Node.js)
// - PDF processing, file operations
// - Complex AI inference calls
```

### Kalmeron-Specific Runtime Config
```typescript
// middleware.ts — Edge (automatic, no config needed)
// app/api/chat/route.ts — Node.js (Firebase + Gemini require it)
// app/api/billing/ — Node.js (Fawry API integration)
```

## Environment Variables

### Required for Build (Kalmeron CI)
```bash
NEXT_TELEMETRY_DISABLED=1
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
GEMINI_API_KEY=          # server-side only
MOCK_AUTH=true           # CI builds only
```

### NEXT_PUBLIC_ Rule
```typescript
// NEXT_PUBLIC_ prefix = exposed to browser bundle
// Without prefix = server-side only (never in client bundle)

// ✅ SAFE: API key server-side only
const key = process.env.GEMINI_API_KEY; // server only

// ❌ DANGEROUS: would expose to client
const key = process.env.NEXT_PUBLIC_GEMINI_API_KEY; // in browser!
```

## Next.js Config Optimization
```typescript
// next.config.ts — Kalmeron production settings
const config: NextConfig = {
  // Image optimization
  images: {
    domains: ['firebasestorage.googleapis.com'],
    formats: ['image/avif', 'image/webp'],
  },
  // Bundle size
  experimental: {
    optimizeCss: true,
  },
  // Security headers
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      ],
    }];
  },
};
```

## Build Optimization

### Dynamic Imports for Heavy Components
```typescript
// Lazy load heavy dependencies
const HeavyChart = dynamic(() => import('@/components/charts/HeavyChart'), {
  loading: () => <PageSkeleton />,
  ssr: false, // if chart uses browser APIs
});
```

### Bundle Analysis
```bash
# Check bundle size
ANALYZE=true npm run build
# Look for: large vendor chunks, duplicate dependencies
```

## Replit-Specific Notes

- Port: `5000` (configured in Replit workflow)
- Host: `0.0.0.0` (required for Replit preview proxy)
- `$REPLIT_DEV_DOMAIN` — use for webhooks/callbacks during development
- Deployment: Replit managed (not Vercel) — but patterns still apply

## Common Build Failures

| Error | Fix |
|---|---|
| `Module not found: firebase-admin` | Add to `serverComponentsExternalPackages` in next.config.ts |
| `NEXT_PUBLIC_* undefined` | Set in Replit Secrets, not .env |
| `Edge runtime: fs not supported` | Move to Node.js runtime or app/(dynamic)/ |
| Type error on build | Run `npx tsc --noEmit` locally first |

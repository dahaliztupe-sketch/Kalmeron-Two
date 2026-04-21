# Kalmeron AI (ai-studio-applet)

Arabic-language AI studio platform for Egyptian entrepreneurs.

## Architecture

- **Framework**: Next.js 16.2.3 (App Router + Turbopack)
- **Language**: TypeScript 6.0.2 (strict, zero type errors)
- **Styling**: Tailwind CSS v4, RTL layout, dark theme
- **Auth**: Firebase Auth (Google sign-in)
- **Database**: Firebase Firestore + PostgreSQL (via DATABASE_URL)
- **AI**: Google Gemini via `@ai-sdk/google` and `@google/genai`
- **Orchestration**: LangGraph (StateGraph) — fully wired to real agents
- **i18n**: next-intl (Arabic/English)
- **Payments**: Stripe
- **Port**: 5000 (workflow: `npm run dev`)

## Project Structure

- `app/` — Next.js App Router pages, layouts, API routes
- `app/(dashboard)/` — Protected dashboard routes
- `app/(marketing)/` — Public landing page
- `app/api/` — Server-only API routes (chat, ideas/analyze, orchestrator, etc.)
- `components/` — Shared UI components (AppShell, Sidebar, shadcn/ui)
- `contexts/` — React context providers (Auth, Language)
- `lib/` — Client utilities (firebase, gemini, utils)
- `lib/security/rate-limit.ts` — In-memory rate limiting for API routes
- `src/` — AI agents, orchestrator, RAG, memory, lib utilities
- `proxy.ts` — Edge routing (Next.js 16.2 proxy convention, replaces middleware.ts)

## AI Agent Architecture

The `intelligentOrchestrator` (LangGraph StateGraph) routes to 10 specialized nodes:

| Intent | Agent Node | Real Function |
|--------|-----------|---------------|
| IDEA_VALIDATOR | `idea_validator_node` | `validateIdea()` |
| PLAN_BUILDER | `plan_builder_node` | `buildBusinessPlanStream()` |
| MISTAKE_SHIELD | `mistake_shield_node` | `getProactiveWarnings()` |
| SUCCESS_MUSEUM | `success_museum_node` | `analyzeCompany()` |
| OPPORTUNITY_RADAR | `opportunity_radar_node` | `getPersonalizedOpportunities()` |
| CFO_AGENT | `cfo_agent_node` | `cfoAgentAction()` |
| LEGAL_GUIDE | `legal_guide_node` | `legalGuideAction()` |
| REAL_ESTATE | `real_estate_node` | Gemini PRO (specialized) |
| ADMIN | `admin_node` | Admin redirect |
| GENERAL_CHAT | `general_chat_node` | Gemini FLASH |

## Security

- HTTP Security Headers via `next.config.ts` (HSTS, X-Frame-Options, CSP-prep, Referrer-Policy, Permissions-Policy, X-Content-Type-Options)
- Rate limiting on all sensitive API routes (20 req/min for chat, 10 req/min for ideas/analyze)
- No admin email or secrets exposed in client-side code
- `GEMINI_API_KEY` is server-side only (never NEXT_PUBLIC_)
- `.env` excluded from Git via `.gitignore` (`\.env*` pattern)

## SEO

- `app/robots.ts` — uses `NEXT_PUBLIC_APP_URL` env var, blocks /admin, /api
- `app/sitemap.ts` — 10 public pages with proper priorities
- `app/layout.tsx` — Full OG tags, Twitter cards, JSON-LD (SoftwareApplication schema)
- `maximumScale: 5` in viewport (was 1, which blocked user zoom — accessibility fix)

## Context Providers (Layout Order)

```
NextIntlClientProvider
  └── ThemeProvider
        └── LanguageProvider
              └── AuthProvider
                    └── {children}
```

## Required Environment Variables

| Variable | Status | Description |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Set | Firebase public config |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Set | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Set | Firebase project |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Set | Firebase storage |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Set | Firebase messaging |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Set | Firebase app ID |
| `NEXT_PUBLIC_APP_URL` | Recommended | Canonical site URL for SEO/sitemap |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | **Missing** | Server-side Firebase Admin |
| `GEMINI_API_KEY` | **Missing** | Server-side Gemini API |
| `STRIPE_SECRET_KEY` | **Missing** | Stripe payments |
| `STRIPE_WEBHOOK_SECRET` | **Missing** | Stripe webhooks |
| `OPENMETER_API_KEY` | **Missing** | Usage metering |

## New Pages & Routes (April 2026 Hardening)

- `app/auth/signup/page.tsx` — صفحة التسجيل بـ Google Auth
- `app/onboarding/page.tsx` — تدفق إكمال الملف الشخصي (محمي)
- `components/auth/AuthGuard.tsx` — حارس المصادقة للداشبورد

## Error Handling
- `app/(dashboard)/error.tsx` — خطأ الداشبورد مع زر إعادة المحاولة
- `app/(dashboard)/chat/error.tsx` — خطأ المحادثة
- `app/global-error.tsx` — خطأ جذري
- `app/(dashboard)/loading.tsx` — تحميل الداشبورد
- `app/(dashboard)/chat/loading.tsx` — تحميل المحادثة
- `app/(dashboard)/ideas/loading.tsx` — تحميل الأفكار

## Logging & Monitoring
- `src/lib/logger.ts` — Pino structured logger with X-Request-ID
- `app/api/health/route.ts` — نقطة فحص الصحة (محدّثة لاستخدام Admin SDK)

## Testing
- `e2e/onboarding.spec.ts` — اختبارات E2E بـ Playwright
- `playwright.config.ts` — تهيئة Playwright (يستهدف port 5000)
- `package.json` — أضيف سكريبت `test:e2e` و `test:e2e:ui`

## Security Hardening
- `firestore.rules` — قواعد أمان موسّعة لتشمل: ideas, business_plans, chat_history, user_memory, saved_companies, mistakes_viewed, personas, market_experiments, opportunities, success_stories
- `proxy.ts` — حدّ معدل على مستوى IP (100 طلب/دقيقة) + X-Request-ID header
- `next.config.ts` — allowedDevOrigins لبيئة Replit

## Compliance (PDPL Law 151/2020)
- `app/privacy/page.tsx` — محدّثة بالتفاصيل الكاملة لقانون 151 + آلية طلب الحذف
- `app/profile/page.tsx` — تحتوي على زر "حذف حسابي (الحق في النسيان)" 

## Bug Fixes (April 2026)

1. **LanguageContext** — default language changed from `'en'` to `'ar'` so all AppShell pages show Arabic UI by default.
2. **AppShell splash CTA** — "بدء الرحلة" / "Enter the Future" button now links to `/auth/signup` instead of calling `signInWithGoogle()` directly.
3. **Logo Image warnings** — All `<Image>` tags for `logo.jpg` across AppShell, Footer, auth/signup, and marketing page now use `style={{ height: '...', width: 'auto' }}` instead of mismatched `className` + `prop` dimensions.
4. **CFO page** (`/cfo`) — wrapped in `<AppShell>` so it shows proper navigation header and sidebar.
5. **Admin pages** (`/admin`, `/admin/agents-health`, `/admin/ai-logs`, `/admin/compliance`) — all wrapped in `<AppShell>` for consistent navigation.
6. **Dashboard page** (`/dashboard`) — migrated from direct `<Sidebar>` import with hardcoded `mr-64` to `<AppShell>` for full consistency.
7. **Auth flow fully restored (April 21, 2026)** — `src/lib/firebase.ts` now falls back to real config from `firebase-applet-config.json` when `NEXT_PUBLIC_FIREBASE_*` env vars are missing (was using dummy keys → silent Google popup failure). Created `app/auth/login/page.tsx`. Fixed root navbar in `app/page.tsx` (`/login` → `/auth/login`, `/register` → `/auth/signup`). `AuthContext.signInWithGoogle` now surfaces toast errors. `AuthGuard` redirects unauthenticated users to `/auth/login` instead of signup. Added `prompt: 'select_account'` on `GoogleAuthProvider` so users can switch accounts.

## Build Status

✅ Runtime: Next.js dev server running on port 5000  
✅ Proxy: `proxy.ts` (Next.js 16.2 convention) + IP Rate Limiting  
✅ Auth Guard: Client-side via `AuthGuard` component  
✅ Firestore Rules: Hardened for all collections  
✅ Pino Logger: Structured logging with request IDs  
✅ E2E Tests: Playwright configured  
✅ TypeScript: 0 errors (`tsc --noEmit`)  
✅ Default Language: Arabic (`'ar'`)

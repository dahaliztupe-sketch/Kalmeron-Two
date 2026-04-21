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

## Build Status

✅ TypeScript: zero errors (`npx tsc --noEmit`)  
✅ Runtime: Next.js dev server running on port 5000  
✅ Proxy: `proxy.ts` (Next.js 16.2 convention, `middleware.ts` deleted)

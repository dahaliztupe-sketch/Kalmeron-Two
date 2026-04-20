# AI Studio Applet (Kalmeron)

A Next.js 16 AI-powered studio application migrated from Vercel to Replit.

## Architecture

- **Framework**: Next.js 16.2.3 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Auth**: Firebase Auth
- **Database**: Firebase Firestore + PostgreSQL (via DATABASE_URL)
- **AI**: Google Gemini via `@ai-sdk/google` and `@google/genai`
- **i18n**: next-intl
- **Payments**: Stripe

## Project Structure

- `app/` — Next.js App Router pages, layouts, API routes
- `components/` — Shared UI components (shadcn/ui based)
- `contexts/` — React context providers
- `hooks/` — Custom React hooks
- `lib/` — Utility libraries
- `src/` — Additional source (mobile app, workers, etc.)
- `middleware.ts` — Edge middleware (GeoIP, admin auth guard)
- `i18n/` — Internationalization configuration

## Replit Configuration

- **Port**: 5000 (both dev and start scripts bind to `0.0.0.0:5000`)
- **Workflow**: "Start application" runs `npm run dev`
- **`output: standalone`** disabled for Replit compatibility
- **`reactCompiler`** disabled (requires `babel-plugin-react-compiler`)
- **`eslint` top-level config** removed (moved to CLI in Next.js 16)

## Required Secrets

| Secret | Purpose |
|---|---|
| `GEMINI_API_KEY` | Google Gemini AI API |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Firebase Admin SDK (server-side) |
| `STRIPE_SECRET_KEY` | Stripe payments |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook verification |
| `OPENMETER_API_KEY` | Usage metering |

## Public Environment Variables (already set)

- `NEXT_PUBLIC_FIREBASE_*` — Firebase client-side config
- `APP_URL` — Set to your Replit dev domain

## Running

```bash
npm run dev    # development on port 5000
npm run build  # production build
npm run start  # production server on port 5000
```

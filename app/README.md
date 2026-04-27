# `app/` — Next.js App Router

This folder contains all routes, pages, layouts, and server actions for the
Kalmeron AI application using the Next.js 16 App Router.

## Conventions
- Each route segment is a folder; the page lives in `page.tsx`.
- `layout.tsx` wraps child segments and persists across navigations.
- `loading.tsx` provides a Suspense fallback (inherited by descendants).
- `error.tsx` provides an Error Boundary (inherited by descendants).
- `(group)/` parentheses denote route groups (no URL segment).
- `_internal/` underscore folders are private and not routable.

## Top-level layout
- `(dashboard)/` — authenticated dashboard area (chat, agents, settings).
- `api/` — Route Handlers (REST + streaming endpoints).
- `actions/` — Server Actions (form mutations).
- `auth/` — sign-in / sign-up flows.
- `en/` — English locale variants (default is Arabic / RTL).
- `admin/` — admin-only routes guarded by middleware.

## Cross-cutting files
- `globals.css` — Tailwind base + custom CSS variables.
- `error.tsx` / `loading.tsx` — app-wide fallbacks.
- `global-error.tsx` — root-layout error boundary (last resort).
- `apple-icon.svg` / `firebase-messaging-sw.js` — PWA assets.

See [`replit.md`](../replit.md) for architecture decisions and recent sessions.

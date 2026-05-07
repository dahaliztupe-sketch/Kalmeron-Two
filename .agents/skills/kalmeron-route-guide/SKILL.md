---
name: kalmeron-route-guide
description: Definitive guide for placing pages correctly in the Kalmeron Next.js App Router structure. Use when creating any new page, route, or API endpoint to avoid auth guard breakage and sidebar layout failures.
---

# Kalmeron Route Guide

## When to Use
- Before creating any new page, route, or layout file.
- When an agent asks "where does this page go?" or "why is the sidebar missing?".
- When debugging auth failures or missing layout on a newly added page.

---

## The Two Zones — Visual Tree

```
app/
├── layout.tsx                    ← Root layout (fonts, providers, JSON-LD, NextIntl)
│
├── (dashboard)/                  ← ZONE A: Protected dashboard pages
│   ├── layout.tsx                ← Wraps every child in <AuthGuard>
│   │                               Each page renders <AppShell> in its own JSX
│   │                               (<Sidebar> + <TopBar> live inside <AppShell>)
│   ├── dashboard/page.tsx
│   ├── chat/page.tsx
│   ├── cash-runway/page.tsx
│   └── … (60 pages total)
│
├── auth/                         ← Public auth pages (login, signup)
├── (landing)/                    ← Marketing pages with their own layout
├── operations/page.tsx           ← Standalone page (AppShell + useAuth inside)
├── market-lab/page.tsx           ← Standalone page (AppShell + useAuth inside)
├── investor-deck/page.tsx        ← Standalone page (AppShell inside)
├── api/                          ← API route handlers (no layout applies)
└── admin/                        ← Admin panel (own auth check inside page)
```

### Zone A — `app/(dashboard)/`
- **Auth**: `app/(dashboard)/layout.tsx` wraps every child in `<AuthGuard>`. Unauthenticated users are redirected to `/auth/login` by the guard.
- **Layout**: The layout file itself renders only `<main className="flex-1 w-full relative z-0">{children}</main>`. Each page is responsible for rendering `<AppShell>` (which contains the sidebar and top bar) **inside its own JSX** — the layout does not do this automatically.
- **60 pages** live here — this is the default location for any new authenticated dashboard feature.

### Zone B — Standalone pages in `app/` (outside `(dashboard)`)

A small set of pages live directly under `app/` and are not wrapped by the dashboard layout. They handle their own rendering using `<AppShell>` in the client component and rely on `useAuth` from `@/contexts/AuthContext` to check authentication state at the component level.

| Route | File | Pattern |
|---|---|---|
| `/operations` | `app/operations/page.tsx` → `_page-client.tsx` | `<AppShell>` + `useAuth` inside client component |
| `/market-lab` | `app/market-lab/page.tsx` → `_page-client.tsx` | `<AppShell>` + `useAuth` inside client component |
| `/investor-deck` | `app/investor-deck/page.tsx` | `<AppShell>` inside |
| `/market-lab/results/[id]` | `app/market-lab/results/[experimentId]/` | Sub-route of market-lab |

These pages are **not** missing auth — they gate access via `useAuth()` (checking `user` or `loading` state) in the client component rather than through `<AuthGuard>`. Do not add a new standalone page unless there is a specific reason to opt out of the shared layout; the standard approach is Zone A.

### API Routes — `app/api/`

API route handlers (`route.ts` files) are not affected by any page layout. They do not inherit `<AuthGuard>` or any other layout wrapper regardless of where they are placed in the directory tree. Authentication in API routes is performed explicitly inside the handler by verifying the Firebase ID token from the request headers.

---

## Decision Tree — Where Does My New Page Go?

```
Is the page for authenticated users only?
│
├── YES ─ Does it need the standard sidebar + top-bar layout?
│         │
│         ├── YES ─ → Place it in app/(dashboard)/<page-name>/page.tsx   ✅ MOST CASES
│         │           (AuthGuard is provided by the layout; add <AppShell> in JSX)
│         │
│         └── NO  ─ (full-screen canvas, presentation mode, or own sub-router)
│                   → Place it directly in app/<page-name>/page.tsx
│                     Use <AppShell> and check auth via useAuth() in the client component
│
└── NO  ─ Is it a marketing / public page?
          │
          ├── YES ─ → Place it in app/(landing)/ or directly in app/
          │
          └── Is it an API endpoint?
                    → Place it in app/api/<route>/route.ts
                      (authenticate by verifying the ID token in the handler body)
```

---

## How to Add a New Dashboard Page — Step-by-Step

### Step 1: Create the page file
```
app/(dashboard)/<feature-name>/page.tsx
```
- Mark client components with `"use client"` at the top.
- Server Components (RSC) need no directive.
- Wrap page content in `<AppShell>` — do not skip this.

### Step 2: Register the route in the sidebar nav

**File: `src/lib/navigation.ts`**

Add a `NavItem` entry to the correct `NAV_SECTIONS` section:
```typescript
{
  href: "/<feature-name>",
  label: "اسم الصفحة",       // Arabic label
  icon: SomeIcon,             // import from lucide-react
  badge: "جديد",              // optional — "جديد" | "AI" | "قريباً" | etc.
  badgeColor: "violet",       // optional — "cyan"|"amber"|"emerald"|"violet"|"rose"
}
```

The six `NAV_SECTIONS` headings — choose the right one:

| Heading | Purpose |
|---|---|
| `"الرئيسي"` | Core daily tools (dashboard, chat, brief) |
| `"شركتي"` | Company-building tools (plan, cap-table, runway) |
| `"الأدوات"` | Specialist tools (market lab, legal, finance) |
| `"الفريق"` | People & HR (org chart, wellbeing, co-founder) |
| `"الحساب"` | User account (profile, settings, notifications) |
| `"النظام"` | System/admin (system health) |

### Step 3: Render `<AppShell>` in the page

The dashboard layout (`app/(dashboard)/layout.tsx`) provides `<AuthGuard>` but does **not** render `<AppShell>`. Your page must call it:

```tsx
// app/(dashboard)/my-feature/page.tsx
"use client";
import { AppShell } from "@/components/layout/AppShell";

export default function MyFeaturePage() {
  return (
    <AppShell>
      {/* page content */}
    </AppShell>
  );
}
```

If you omit `<AppShell>`, the page will render without the sidebar or top bar.

---

## Common Mistakes (and Their Symptoms)

| Mistake | Symptom | Fix |
|---|---|---|
| Placing a dashboard page directly in `app/` (not in `(dashboard)/`) | Page has no `<AuthGuard>` — unauthenticated users can load it | Move the file to `app/(dashboard)/` |
| Forgetting `<AppShell>` in the page JSX | Sidebar and top bar are completely absent | Wrap page content in `<AppShell>` |
| Creating a duplicate route in both `app/` and `app/(dashboard)/` | Next.js build error: route conflict | Remove one — verify if the standalone version is intentional |
| Not adding the route to `src/lib/navigation.ts` | Page exists but has no sidebar entry to reach it | Add a `NavItem` entry to `NAV_SECTIONS` |
| Forgetting `"use client"` on a component that uses hooks | Next.js RSC error: hooks cannot be called in Server Components | Add `"use client"` at the top of the file |
| Assuming API routes inside `(dashboard)/` inherit auth from the layout | API route handlers are never wrapped by page layouts — they always need explicit token verification | Put API routes in `app/api/` and verify the token in the handler |

---

## Layout Inheritance Chain

```
app/layout.tsx                    (Root — fonts, ThemeProvider, AuthProvider, NextIntlClientProvider)
  └── app/(dashboard)/layout.tsx  (AuthGuard only — does NOT render AppShell)
        └── Each page's JSX
              └── <AppShell>      (rendered by the page itself)
                    ├── <Sidebar> (reads NAV_SECTIONS from src/lib/navigation.ts)
                    ├── <TopBar>
                    └── {children}
```

**Key facts:**
- `app/(dashboard)/layout.tsx` contains `<AuthGuard>` only. It does NOT render `<AppShell>`.
- Each page renders `<AppShell>` itself, which is why the sidebar can be customized per-page.
- Standalone pages in `app/` use `useAuth()` from `@/contexts/AuthContext` to check auth state — they do not use `<AuthGuard>` directly.
- API route handlers in `app/api/` are never wrapped by any layout — auth must be done inside the handler.

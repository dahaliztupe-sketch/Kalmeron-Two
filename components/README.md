# `components/` — Shared React Components

Reusable UI building blocks used across `app/` routes. Anything domain-agnostic
(buttons, cards, inputs, layout primitives) lives here. Domain-specific
components live next to their route segment under `app/`.

## Conventions
- Components are functional and TypeScript-first.
- Default to Server Components; mark Client Components with `'use client'`.
- Styling uses Tailwind utility classes + `class-variance-authority` for variants.
- Re-export grouped components from an `index.ts` when natural.
- Prefer composition over deep prop trees — expose `children` slots.
- RTL/Arabic first: avoid hard-coded `left`/`right`; use `start`/`end` utilities.

## What belongs here
- Generic UI: buttons, dialogs, tooltips, skeletons, badges.
- Layout: page shells, sidebars, headers, footers.
- Form primitives wired to React Hook Form / Zod.
- Brand visuals: logo, brand mark, illustrations.

## What does **not** belong here
- Route-specific UI → keep next to the page.
- Server Actions → live in `app/actions/`.
- Hooks → live in `hooks/`.
- Contexts → live in `contexts/`.

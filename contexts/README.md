# `contexts/` — React Contexts

Cross-cutting client-side state shared between many components. Each context
is a single file exporting a `Provider`, a `useXxx()` hook, and any selectors.

## Conventions
- Always pair a context with a custom hook (`useFoo()`) that throws if used
  outside its `Provider`. Never let consumers call `useContext` directly.
- Mark the file `'use client'` — contexts are client-only.
- Keep state minimal; prefer URL state, React Query cache, or server state
  when possible.
- For frequently-read / rarely-written state, expose memoized selectors to
  avoid re-rendering the whole tree.

## What belongs here
- Auth/session context, theme, locale, feature flags.
- App-wide UI state (modals open, sidebar collapsed).
- Cross-route ephemeral state that does not belong in the URL.

## What does **not** belong here
- Server data → React Query / Server Components.
- Form state → React Hook Form.
- Single-component state → `useState` locally.

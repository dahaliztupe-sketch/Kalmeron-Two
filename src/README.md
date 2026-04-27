# `src/` — Shared Library Code

Pure TypeScript modules used across the app: types, utilities, business
logic, validators, and pure functions. Nothing in here should depend on
React, Next.js runtime, or the browser DOM.

## Conventions
- Pure functions and small modules; no side effects at import time.
- Strict TypeScript — no `any`, prefer `unknown` + Zod for boundaries.
- Co-locate unit tests as `<name>.test.ts`.
- Keep folders flat; group by domain (e.g. `src/agents/`, `src/billing/`).

## What belongs here
- Domain types and Zod schemas.
- Business logic (calculations, formatters, parsers).
- Helpers shared by both client (`components/`, `app/`) and server (`services/`).
- Constants and enums.

## What does **not** belong here
- React components → `components/`.
- React hooks → `hooks/`.
- Server-only IO (DB, fetch with secrets) → `services/` or Server Actions.
- Route logic → `app/`.

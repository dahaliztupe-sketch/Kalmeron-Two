# `services/` — Polyglot sidecars

This directory holds **independent** Python services that complement the main
Next.js app. The Next.js app on Vercel stays pure TypeScript; these services
ship and scale separately (Replit dev, Cloud Run, Railway, Fly.io — anywhere).

## Why polyglot?

We keep TypeScript everywhere it's the right tool — UI, API routes,
agent orchestration, business logic. We add Python only where its ecosystem
is meaningfully better:

| Need                          | TypeScript today          | Python here                    |
|-------------------------------|---------------------------|--------------------------------|
| Eval analytics & reporting    | bespoke loops             | `pandas` + `plotly` in 30 LOC  |
| Arabic PDF extraction & chunking | weak (`pdf-parse`)     | `pypdf` + custom normalization |

We do **not** rewrite TypeScript code in Python. We do **not** add a service
"to look polyglot." Each new service must clear the same bar: a clear, current
pain point that is easier to solve in another language.

## Current services

| Service          | Path                       | Default port | Purpose                                |
|------------------|----------------------------|--------------|----------------------------------------|
| eval-analyzer    | `services/eval-analyzer/`  | n/a (CLI)    | Statistical reports from eval JSON     |
| pdf-worker       | `services/pdf-worker/`     | 8000         | Arabic-aware PDF extraction + chunking |

## Conventions

1. **One language per service.** No mixing.
2. **Pinned `requirements.txt`** at the root of each service.
3. **HTTP boundary** — the Next.js app talks to services over plain HTTP, not
   shared memory or subprocess. This makes deployment trivial and lets
   services be hot-swapped or scaled independently.
4. **Failure is local.** The Next.js app should fall back gracefully when a
   sidecar is down (see `src/lib/pdf/python-worker-client.ts` for the
   pattern).
5. **Environment** — each service reads its own env vars (prefixed with the
   service name where possible, e.g. `PDF_WORKER_URL`). Never reach into the
   Next.js app's secrets.

## Deployment

Production targets that work today:

- **Replit** — workflows can launch each sidecar on its own port.
- **Cloud Run / Fly / Railway** — each service has a `requirements.txt`; add
  a `Dockerfile` if needed.
- **Vercel** — does **not** run these (Vercel is JS-only). Deploy the Next.js
  app to Vercel, point `PDF_WORKER_URL` to wherever the worker lives.

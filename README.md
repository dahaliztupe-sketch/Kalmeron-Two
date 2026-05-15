<div align="center">

<img src="public/brand/kalmeron-mark.svg" alt="Kalmeron AI" width="80" height="80" />

# كلميرون · Kalmeron

### نظام تشغيل المؤسّس العربي بالذكاء الاصطناعي
**The AI Operating System for Arabic-Speaking Founders**

<br/>

[![CI](https://github.com/dahaliztupe-sketch/Kalmeron-Two/actions/workflows/ci.yml/badge.svg)](https://github.com/dahaliztupe-sketch/Kalmeron-Two/actions/workflows/ci.yml)
[![CodeQL](https://github.com/dahaliztupe-sketch/Kalmeron-Two/actions/workflows/codeql.yml/badge.svg)](https://github.com/dahaliztupe-sketch/Kalmeron-Two/actions/workflows/codeql.yml)
[![Security](https://github.com/dahaliztupe-sketch/Kalmeron-Two/actions/workflows/security.yml/badge.svg)](https://github.com/dahaliztupe-sketch/Kalmeron-Two/actions/workflows/security.yml)
[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/dahaliztupe-sketch/Kalmeron-Two/badge)](https://securityscorecards.dev/viewer/?uri=github.com/dahaliztupe-sketch/Kalmeron-Two)

[![Next.js 16](https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript 5.9](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind-4.x-38B2AC?logo=tailwind-css)](https://tailwindcss.com)
[![Gemini 2.5](https://img.shields.io/badge/Google-Gemini_2.5-4285F4?logo=google)](https://ai.google.dev)
[![Firebase](https://img.shields.io/badge/Firebase-12-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

<br/>

[🇪🇬 بالعربية](#-بالعربية) · [🌍 English](#-english) · [🚀 Quick Start](#-quick-start) · [📐 Architecture](#-architecture) · [🤝 Contributing](#-contributing)

</div>

---

## 🇪🇬 بالعربية

**كلميرون** هو مقرّ عمليات ذكي مصمم خصيصاً للمؤسّسين العرب. بدلاً من إنفاق آلاف الجنيهات شهرياً على مستشار مالي، محامٍ، ومحلّل سوق — يعمل لديك **٥٧ مساعداً ذكياً** كفريق مؤسّس متكامل، بالعربية الأصيلة، على مدار الساعة.

### ما الذي يميّز كلميرون؟

| الميزة | التفاصيل |
|--------|----------|
| 🤖 **٥٧ مساعداً ذكياً** | مالي، قانوني، تسويق، منتج، عمليات، سوق، استراتيجية |
| 🇪🇬 **عربية أصيلة + لهجة مصرية** | دعم كامل RTL، خطوط IBM Plex Arabic + Cairo |
| ⚖️ **محرك قانوني مصري** | قاعدة بيانات للتشريعات والأحكام والنماذج القانونية |
| 🧮 **حاسبة Egypt Calc** | ضريبة دخل، قيمة مضافة، تأمينات اجتماعية مصرية |
| 📄 **معالجة PDF عربي** | استخراج، تلخيص، توقيع رقمي، تقارير بالعربية |
| 🔍 **بحث دلالي متعدد اللغات** | embeddings محلية سريعة بدون اتصال خارجي |
| 💳 **مدفوعات مدمجة** | Fawry للسوق المصري + Stripe للسوق العالمي |
| 🛡️ **أمان من الدرجة الأولى** | CodeQL، Semgrep، Trivy، OSV، Scorecard، Gitleaks |
| 📊 **رصد إنتاجي كامل** | Sentry + Langfuse + OpenTelemetry |

---

## 🌍 English

**Kalmeron** is a production-grade AI operations hub purpose-built for Arabic-speaking founders. Instead of paying thousands per month for separate advisors, you get **57 specialized AI agents** working as one cohesive founding team — in fluent Modern Standard Arabic and Egyptian dialect, 24/7.

### Core Features

- **57 specialized AI agents** — finance, legal, marketing, product, ops, market research, and strategy
- **Arabic-first design** — full RTL, IBM Plex Sans Arabic, optical refinements for Arabic typography
- **Egyptian legal corpus** — searchable database of laws, rulings, and contract templates
- **Egypt Calc** — income tax, VAT, and social insurance calculator tuned for Egyptian law
- **Arabic PDF pipeline** — extract, summarize, sign, and generate reports natively in Arabic
- **Multilingual semantic search** — local embeddings with no external round-trips
- **Integrated payments** — Fawry (Egypt) + Stripe (global), ready out of the box
- **Production security** — CodeQL, Semgrep, Trivy, OSV-Scanner, Gitleaks, OpenSSF Scorecard
- **Full observability** — Sentry error tracking, Langfuse LLM tracing, OpenTelemetry metrics

---

## 📐 Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│         Next.js 16 (App Router) · React 19 · Tailwind CSS 4        │
│  ─────────────────────────────────────────────────────────────────  │
│  next-intl (ar/en) · Framer Motion · Shadcn UI · Radix Primitives  │
│  LangGraph · Mastra · Vercel AI SDK 6 · Google Gemini 2.5 Flash    │
│  Firebase Auth + Firestore + Storage · TanStack Query · Sentry      │
└──────────────┬──────────────────────────────────────┬──────────────┘
               │  Internal HTTP (localhost)            │
       ┌───────┴────────┐                    ┌────────┴───────┐
       │  PDF Worker    │                    │  Embeddings    │
       │  FastAPI :8000 │                    │  Worker :8099  │
       └───────┬────────┘                    └────────┬───────┘
               │                                      │
       ┌───────┴────────┐                    ┌────────┴───────┐
       │  Egypt Calc    │                    │  LLM Judge     │
       │  FastAPI :8008 │                    │  FastAPI :8080 │
       └────────────────┘                    └────────────────┘
```

### Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | Next.js 16, React 19, TypeScript 5.9, Tailwind CSS 4, Shadcn UI |
| **AI / Agents** | Google Gemini 2.5, Vercel AI SDK 6, LangGraph, Mastra, Mem0 |
| **Backend** | Next.js API Routes, FastAPI microservices (Python 3.12), Temporal |
| **Database** | Firebase Firestore, Neo4j, DuckDB, pgvector |
| **Payments** | Fawry (Egypt), Stripe (international) |
| **Observability** | Sentry, Langfuse, OpenTelemetry, Traceloop, Lighthouse CI |
| **Security** | CodeQL, Semgrep, Trivy, OSV-Scanner, Gitleaks, OpenSSF Scorecard |
| **Testing** | Vitest, Playwright, promptfoo, Kitab Bench (Arabic LLM eval) |

---

## 🚀 Quick Start

### Prerequisites

- Node.js ≥ 20
- Python 3.12 (for microservices)
- npm ≥ 10

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/dahaliztupe-sketch/Kalmeron-Two.git
cd Kalmeron-Two

# 2. Install Node.js dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# Fill in: GEMINI_API_KEY, Firebase config, Fawry/Stripe keys, etc.

# 4. Start the application
npm run dev                   # Next.js on http://localhost:5000
```

### Running the Full Stack (optional microservices)

```bash
npm run pdf-worker:dev        # PDF processing service  → :8000
npm run egypt-calc:dev        # Egyptian tax calculator  → :8008
npm run llm-judge:dev         # LLM quality judge        → :8080
npm run embeddings-worker:dev # Embeddings service        → :8099
```

> **On Replit:** all five services start automatically via the Project workflow.

### Required Environment Variables

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Google AI Studio API key |
| `NEXT_PUBLIC_FIREBASE_*` | Firebase project config (6 vars) |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Firebase Admin SDK JSON (base64) |
| `OPENROUTER_API_KEY` | OpenRouter fallback models |
| `STRIPE_SECRET_KEY` | Stripe payments (optional) |
| `FAWRY_MERCHANT_CODE` | Fawry Egypt payments (optional) |

---

## 🧪 Quality Gates

All checks run automatically on every push via GitHub Actions.

```bash
npm run typecheck    # TypeScript strict mode
npm run lint         # ESLint (Next.js + security rules)
npm test             # Unit tests (Vitest)
npm run test:e2e     # End-to-end tests (Playwright)
npm run eval         # LLM evaluation suite (promptfoo)
npm run qa:smoke     # Smoke QA harness
node scripts/check-audit.mjs audit-report.json  # npm audit gate
```

### CI Pipeline

| Check | Tool | Trigger |
|-------|------|---------|
| TypeScript | `tsc --noEmit` | push, PR |
| Lint | ESLint | push, PR |
| Unit tests | Vitest | push, PR |
| E2E tests | Playwright | push, PR |
| SAST | Semgrep + CodeQL | push, PR |
| Dependency audit | npm audit + custom gate | push |
| Container scan | Trivy | push |
| Secret scan | Gitleaks | push |
| Scorecard | OpenSSF | weekly |

---

## 📁 Project Structure

```
.
├── app/                    # Next.js App Router pages & API routes
│   ├── (dashboard)/        # Authenticated app shell
│   ├── api/                # API routes (AI, billing, cron, auth)
│   └── auth/               # Login, signup, passkeys
├── components/             # Shared React components (Shadcn-based)
│   ├── brand/              # Logo, brand mark, animated mark
│   ├── landing/            # Marketing page sections
│   ├── layout/             # AppShell, Sidebar, Footer, MobileNav
│   └── ui/                 # Primitive components (buttons, cards…)
├── contexts/               # React contexts (auth, theme, locale)
├── hooks/                  # Reusable React hooks
├── i18n/                   # next-intl configuration
├── messages/               # Locale bundles (ar.json, en.json)
├── services/               # Python FastAPI microservices
│   ├── pdf-worker/         # Arabic PDF extraction & generation
│   ├── egypt-calc/         # Egyptian tax & financial calculator
│   ├── llm-judge/          # LLM output quality evaluation
│   └── embeddings-worker/  # Multilingual embedding service
├── src/
│   ├── ai/agents/          # 57 specialized AI agent definitions
│   ├── lib/                # Core domain logic & utilities
│   └── components/         # Domain-specific components
├── public/brand/           # Logo SVGs, favicons, OG images
├── test/                   # Vitest unit tests + LLM eval harness
├── e2e/                    # Playwright end-to-end tests
├── qa/                     # Manual QA smoke harness
├── scripts/                # CI utilities (audit gate, codegen…)
└── docs/                   # Architecture decisions & runbooks
```

---

## 🔐 Security

Security is a first-class concern. If you discover a vulnerability, please follow our [Security Policy](SECURITY.md) and report it **privately** — do not open a public issue.

Our automated security pipeline runs on every push:

- **CodeQL** — semantic analysis for JavaScript/TypeScript
- **Semgrep** — custom SAST rules for Next.js & API security
- **Trivy** — container and dependency CVE scanning
- **OSV-Scanner** — open-source vulnerability database
- **Gitleaks** — secret scanning (API keys, credentials)
- **OpenSSF Scorecard** — supply-chain security posture

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting a pull request.

### Development Workflow

```bash
# Create a feature branch
git checkout -b feat/your-feature

# Make changes, then verify everything passes
npm run typecheck && npm run lint && npm test

# Submit a pull request
# All CI checks must pass before merge
```

### Areas for Contribution

- 🌐 **Translations** — improve Arabic/English translations in `messages/`
- 🤖 **AI Agents** — add or improve agents in `src/ai/agents/`
- 🧪 **Tests** — expand Playwright e2e coverage or Vitest unit tests
- 📚 **Docs** — improve runbooks in `docs/`
- 🐛 **Bug fixes** — see [open issues](https://github.com/dahaliztupe-sketch/Kalmeron-Two/issues)

---

## 📜 License

Licensed under the **Apache License 2.0** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

صُنع بـ ♥ في مصر 🇪🇬 · Built with love for Arabic-speaking founders

</div>

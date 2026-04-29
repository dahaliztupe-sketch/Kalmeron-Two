<div align="center">
<img width="1200" height="475" alt="Kalmeron AI Studio Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# 🧠 Kalmeron — AI Studio for Arabic-First Founders
### كلميرون — مقرّ عمليات شركتك الذكي

**16 specialized AI agents working 24/7 for your startup, fluent in authentic Arabic.**
**١٦ مساعداً ذكياً يعملون لصالحك ٢٤/٧، بالعربية الأصيلة.**

[![CI](https://github.com/dahaliztupe-sketch/Kalmeron-Two/actions/workflows/ci.yml/badge.svg)](https://github.com/dahaliztupe-sketch/Kalmeron-Two/actions/workflows/ci.yml)
[![CodeQL](https://github.com/dahaliztupe-sketch/Kalmeron-Two/actions/workflows/codeql.yml/badge.svg)](https://github.com/dahaliztupe-sketch/Kalmeron-Two/actions/workflows/codeql.yml)
[![Playwright E2E](https://github.com/dahaliztupe-sketch/Kalmeron-Two/actions/workflows/playwright.yml/badge.svg)](https://github.com/dahaliztupe-sketch/Kalmeron-Two/actions/workflows/playwright.yml)
[![Lighthouse CI](https://github.com/dahaliztupe-sketch/Kalmeron-Two/actions/workflows/lighthouse.yml/badge.svg)](https://github.com/dahaliztupe-sketch/Kalmeron-Two/actions/workflows/lighthouse.yml)
[![Semgrep](https://github.com/dahaliztupe-sketch/Kalmeron-Two/actions/workflows/semgrep.yml/badge.svg)](https://github.com/dahaliztupe-sketch/Kalmeron-Two/actions/workflows/semgrep.yml)
[![Trivy](https://github.com/dahaliztupe-sketch/Kalmeron-Two/actions/workflows/trivy.yml/badge.svg)](https://github.com/dahaliztupe-sketch/Kalmeron-Two/actions/workflows/trivy.yml)
[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/dahaliztupe-sketch/Kalmeron-Two/badge)](https://securityscorecards.dev/viewer/?uri=github.com/dahaliztupe-sketch/Kalmeron-Two)

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Firebase](https://img.shields.io/badge/Firebase-12-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com)
[![Gemini](https://img.shields.io/badge/Google-Gemini_2.5-4285F4?logo=google&logoColor=white)](https://ai.google.dev)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[العربية](#-بالعربية) · [English](#-english) · [Live Demo](https://kalmeron.ai) · [Docs](docs/) · [Changelog](CHANGELOG.md) · [Security](SECURITY.md)

</div>

---

## 🇪🇬 بالعربية

**كلميرون** هو مقرّ عمليات ذكي للشركات الناشئة العربية. بدلاً من إنفاق آلاف الجنيهات على مستشار مالي ومحامٍ ومحلّل سوق، يعمل لديك **١٦ مساعداً ذكياً** كفريق متكامل، بالعربية الفصيحة وباللهجة المصرية، على مدار الساعة.

### ✨ المزايا الأساسية

- 🤖 **١٦ وكيل ذكي متخصص** — مالي، قانوني، تسويق، منتج، تحليل سوق، عمليات...
- 🇪🇬 **عربية أصيلة + لهجة مصرية** — مع دعم كامل لـ RTL والخطوط العربية (Cairo)
- ⚖️ **محرك قانوني مصري** — قاعدة بيانات للتشريعات والأحكام (Egypt Legal Corpus)
- 🧮 **حاسبة ضريبية ومالية** (Egypt Calc) — ضريبة دخل، قيمة مضافة، تأمينات
- 📄 **معالجة PDF عربية** — استخراج، تلخيص، توقيع، توليد تقارير بالعربية
- 🔍 **بحث دلالي متعدد اللغات** عبر embeddings محلية
- 💳 **مدفوعات مدمجة** — Fawry + Stripe جاهزة للسوق المصري والعالمي
- 🛡️ **أمان من الدرجة الأولى** — CodeQL, Semgrep, Trivy, OSV, Scorecard, Gitleaks
- 📊 **رصد إنتاجي كامل** — Sentry + Langfuse + OpenTelemetry

### 🚀 التشغيل المحلي

```bash
# 1. تثبيت الحزم
npm install

# 2. ضبط متغيرات البيئة
cp .env.example .env.local
# ثم عدّل القيم: GEMINI_API_KEY، Firebase keys، إلخ

# 3. تشغيل التطبيق
npm run dev          # http://localhost:5000
```

### 🧪 الاختبارات والجودة

```bash
npm run typecheck    # فحص أنواع TypeScript
npm run lint         # ESLint
npm test             # وحدة (Vitest)
npm run test:e2e     # شامل (Playwright)
npm run qa:smoke     # اختبار سريع
```

---

## 🌍 English

**Kalmeron** is an AI-native operations hub for Arabic-speaking founders. Instead of paying thousands for a CFO, lawyer, and market analyst, you get **16 specialized AI agents** working as one team — in fluent Modern Standard Arabic and Egyptian dialect, 24/7.

### ✨ Core Features

- 🤖 **16 specialized AI agents** — finance, legal, marketing, product, market research, ops…
- 🇪🇬 **Authentic Arabic + Egyptian dialect** — full RTL with Cairo font support
- ⚖️ **Egyptian legal engine** — searchable corpus of laws and rulings
- 🧮 **Tax & finance calculator** (Egypt Calc) — income tax, VAT, social insurance
- 📄 **Arabic PDF pipeline** — extract, summarize, sign, and generate Arabic reports
- 🔍 **Multilingual semantic search** via local embeddings
- 💳 **Built-in payments** — Fawry + Stripe ready for MENA and global
- 🛡️ **First-class security** — CodeQL, Semgrep, Trivy, OSV, Scorecard, Gitleaks
- 📊 **Production observability** — Sentry + Langfuse + OpenTelemetry

### 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  Next.js 16 (App Router) + React 19 + Tailwind 4 + Shadcn   │
│  ──────────────────────────────────────────────────────────  │
│  • i18n (next-intl) · RTL · Sentry · TanStack Query          │
│  • LangGraph · Mastra · Vercel AI SDK · Gemini 2.5           │
└─────────────────────────┬────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
  ┌───────────┐    ┌──────────────┐   ┌──────────────┐
  │ PDF       │    │ Embeddings   │   │ Egypt Calc   │
  │ Worker    │    │ Worker       │   │ (FastAPI)    │
  │ :8000     │    │ :8099        │   │ :8008        │
  └───────────┘    └──────────────┘   └──────────────┘
        │                 │                 │
        └─────────────────┼─────────────────┘
                          ▼
                  ┌──────────────┐
                  │ LLM Judge    │
                  │ :8080        │
                  └──────────────┘
```

### 📦 Tech Stack

| Layer        | Tech                                                                  |
|--------------|-----------------------------------------------------------------------|
| Frontend     | Next.js 16, React 19, TypeScript 5.9, Tailwind 4, Shadcn, Radix UI    |
| AI / Agents  | Google Gemini 2.5, Vercel AI SDK 6, LangGraph, Mastra, Mem0           |
| Backend      | Next.js API Routes, FastAPI microservices (Python 3.12), Temporal     |
| Data         | Firebase (Firestore + Auth + Storage), Neo4j, DuckDB, Vector store    |
| Payments     | Fawry (Egypt), Stripe (international)                                 |
| Observability| Sentry, Langfuse, OpenTelemetry, Traceloop, Lighthouse CI             |
| Security     | CodeQL, Semgrep, Trivy, OSV-Scanner, Gitleaks, OpenSSF Scorecard      |
| Testing      | Vitest, Playwright, promptfoo, Kitab Bench (Arabic eval)              |

### 🚀 Quick Start

**Prerequisites:** Node.js 20+, Python 3.12, npm

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# Set GEMINI_API_KEY, Firebase keys, Fawry/Stripe keys, etc.

# 3. Run the full stack
npm run dev                  # Next.js on :5000
npm run pdf-worker:dev       # PDF service on :8000
npm run egypt-calc:dev       # Calculator on :8008
npm run llm-judge:dev        # LLM judge on :8080
npm run embeddings-worker:dev # Embeddings on :8099
```

On Replit, all five services boot together via the **Project** workflow.

### 🧪 Quality Gates

```bash
npm run typecheck    # TypeScript
npm run lint         # ESLint
npm test             # Unit tests (Vitest)
npm run test:e2e     # End-to-end (Playwright)
npm run eval         # LLM eval suite
npm run qa:smoke     # Smoke QA
```

### 📁 Project Structure

```
.
├── app/               # Next.js App Router pages & API routes
├── components/        # Shared React components (Shadcn-based)
├── contexts/          # React contexts (auth, theme, locale)
├── hooks/             # Reusable hooks
├── i18n/              # Translations (ar, en) + next-intl config
├── messages/          # Locale message bundles
├── services/          # Python microservices (FastAPI)
│   ├── pdf-worker/
│   ├── egypt-calc/
│   ├── llm-judge/
│   └── embeddings-worker/
├── src/               # Core domain logic
├── public/            # Static assets
├── test/              # Unit tests + LLM eval harness
├── e2e/               # Playwright tests
├── qa/                # Manual QA harness
└── docs/              # Architecture & runbooks
```

### 🤝 Contributing

Pull requests are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) and our [Security Policy](SECURITY.md) before submitting.

### 📜 License

This project is licensed under the **Apache License 2.0** — see the [LICENSE](LICENSE) file for details.

### 💛 Acknowledgements

Built with love for Arabic-speaking founders. Powered by Google Gemini, Firebase, and the open-source community.

---

<div align="center">

**[⬆ back to top](#-kalmeron--ai-studio-for-arabic-first-founders)**

Made with ❤️ in Egypt 🇪🇬

</div>

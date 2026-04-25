---
description: هيكل المستودع وأين توضع الملفّات الجديدة
alwaysApply: true
---

# Repository Structure — Kalmeron AI

```
.
├── AGENTS.md                  ← دستور الوكلاء (اقرأه أوّلاً)
├── SKILL.md                   ← كيف تضيف وكيلاً جديداً
├── replit.md                  ← الذاكرة الطويلة للمشروع
├── README.md                  ← مختصر تشغيل
├── CHANGELOG.md               ← التغييرات بين الإصدارات
│
├── app/                       ← Next.js 16 App Router
│   ├── (dashboard)/           ← صفحات بعد الدخول (protected)
│   ├── api/                   ← REST endpoints + webhooks
│   ├── auth/                  ← login + signup
│   ├── globals.css            ← Tailwind v4 + theme variables
│   ├── layout.tsx             ← root layout (fonts, providers)
│   └── page.tsx               ← landing
│
├── components/
│   ├── ui/                    ← shadcn primitives (Button, Card, ...)
│   ├── auth/                  ← AuthForm, ReferralCapture, ...
│   ├── dashboard/             ← Sidebar, TopBar, ...
│   ├── landing/               ← HomeBelowFold, Hero, ...
│   ├── chat/                  ← ChatThread, MessageBubble, ...
│   └── <domain>/              ← مكوّنات domain-specific
│
├── contexts/                  ← React Context (Auth, Theme, Workspace)
├── hooks/                     ← React hooks (useAuth, useWorkspace, ...)
├── i18n/                      ← next-intl config
├── messages/                  ← ترجمات JSON (ar.json, en.json)
│
├── src/
│   ├── ai/
│   │   ├── agents/            ← 16 وكيلاً (prompt.ts + agent.ts + tools.ts)
│   │   ├── experts/           ← Expert factory (custom agents)
│   │   ├── orchestrator/      ← virtual-meeting، multi-agent flows
│   │   ├── safety/            ← plan-guard، sanitize-context، ClawGuard
│   │   ├── actions/           ← actions registry (للـ agentic UI)
│   │   ├── memory/            ← knowledge-graph، mem0 integration
│   │   └── models.ts          ← Gemini model definitions
│   │
│   └── lib/
│       ├── firebase.ts        ← client SDK init
│       ├── firebase-admin.ts  ← Admin SDK (server only)
│       ├── auth.ts            ← API auth helper
│       ├── logger.ts          ← pino logger
│       ├── rate-limit.ts      ← rate limiting
│       ├── security/          ← api-keys، RBAC
│       ├── compliance/        ← GDPR، right-to-be-forgotten
│       ├── referrals/         ← referral system
│       └── workspaces/        ← workspace ops
│
├── services/                  ← Python sidecars (FastAPI)
│   ├── pdf-worker/
│   ├── egypt-calc/
│   ├── llm-judge/
│   ├── embeddings-worker/
│   └── eval-analyzer/
│
├── docs/
│   ├── agents/                ← System Cards (16 + _TEMPLATE.md)
│   ├── decisions/             ← ADRs (Architectural Decision Records)
│   ├── dpia/                  ← Data Protection Impact Assessments
│   ├── api/                   ← API docs
│   ├── THREAT_MODEL.md
│   ├── AGENT_GOVERNANCE.md    ← OWASP Agent + Microsoft Toolkit
│   ├── PROMPT_QUALITY.md      ← SCOPE pattern + autonomous agent
│   ├── RUNBOOK.md             ← Production runbook
│   └── SECRETS_ROTATION.md
│
├── test/
│   ├── eval/                  ← golden-dataset.json + run-eval.ts
│   ├── firestore-rules.test.ts
│   └── unit/                  ← unit tests
│
├── e2e/                       ← Playwright tests
├── scripts/                   ← CLI scripts (lexicon-lint، verify-backup، ...)
│
├── firestore.rules            ← Firestore security rules
├── firestore.indexes.json     ← composite indexes
├── next.config.ts             ← Next config + CSP
├── tsconfig.json              ← TS strict
├── eslint.config.mjs          ← ESLint 9 flat config
├── tailwind.config (none)     ← Tailwind v4 = CSS-first
├── postcss.config.mjs
├── vitest.config.ts
├── playwright.config.ts
├── .env.example               ← مرجع المتغيّرات (لا قيم حقيقيّة)
├── .replit                    ← Replit workflows
└── vercel.json                ← Vercel deployment config
```

## أين تضع الملفّ الجديد؟

| الملفّ | المسار |
|---|---|
| API endpoint جديد | `app/api/<resource>/route.ts` |
| صفحة جديدة (public) | `app/<route>/page.tsx` |
| صفحة جديدة (محميّة) | `app/(dashboard)/<route>/page.tsx` |
| مكوّن UI primitive | `components/ui/<name>.tsx` |
| مكوّن domain-specific | `components/<domain>/<name>.tsx` |
| React hook | `hooks/use-<name>.ts` |
| Server-only utility | `src/lib/<area>/<name>.ts` |
| وكيل جديد | `src/ai/agents/<agent-name>/{prompt,agent,tools}.ts` + `docs/agents/<agent-name>.md` |
| Sidecar جديد | `services/<service>/main.py` + cloudbuild entry |
| ADR | `docs/decisions/NNNN-<title-kebab>.md` (NNNN = next number) |
| اختبار unit | `test/unit/<area>/<name>.test.ts` |
| اختبار E2E | `e2e/<flow>.spec.ts` |
| Migration script | `scripts/<name>.ts` (TypeScript مع `tsx`) |

## القاعدة الذهبيّة
> **لو الملفّ يفعل أكثر من شيء واحد → قسّمه.**
> **لو الملفّ يتجاوز 400 سطر → قسّمه.**
> **لو نسخت كود من مكان لمكان آخر → استخرجه إلى `src/lib/` أو `hooks/`.**

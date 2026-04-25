---
description: المرجع التقني الكامل (الحزم، الإصدارات، الأنماط)
alwaysApply: true
---

# Tech Stack — Kalmeron AI

> **القاعدة الذهبيّة:** قبل اقتراح أيّ مكتبة جديدة، تحقّق أنّها ليست موجودة. لو موجودة، استخدمها. لو مش موجودة، اكتب ADR في `docs/decisions/`.

## 1. Runtime + Framework
- **Node.js:** 20.x (LTS)
- **Next.js:** 16.2.4 — App Router، RSC، PPR (Partial Prerendering متاح)
- **React:** 19.2.5 (مع React Compiler hints عبر `react-hooks/set-state-in-effect`)
- **TypeScript:** 5.7.x — `strict: true`، `noImplicitAny: true`

## 2. UI
- **Tailwind:** v4 (`@tailwindcss/postcss`) — لا config file (CSS-first)
- **shadcn/ui:** v4 — مكوّنات في `components/ui/`
- **Base UI:** `@base-ui/react` — لـ headless primitives
- **Lucide React:** أيقونات
- **Geist + Cairo + IBM Plex Arabic + Plus Jakarta:** خطوط (`app/layout.tsx`)
- **Framer Motion (motion):** للأنيميشن (محدود الاستخدام)
- **next-themes:** dark/light
- **next-intl:** i18n (ar افتراضي، en)

## 3. Data + State
- **Firestore (firebase 12 + firebase-admin 13)** — قاعدة البيانات الأساسيّة
- **TanStack Query 5** + `@tanstack/query-sync-storage-persister` — server state
- **React Context** — UI state (Auth, Theme, Workspace)
- **Vercel Edge Config** — feature flags
- **Neo4j** — knowledge graph (اختياري، عبر `NEO4J_URI`)
- **DuckDB** — data warehouse محلّي (`services/data-warehouse/`)

## 4. AI Stack
- **`@ai-sdk/google` (3.0.64)** + **`@google/genai` (1.50)** — Gemini 2.5 Flash/Pro
- **`@ai-sdk/react` (3.0.170)** + **`ai` (6.0.168)** — streaming + tool calling
- **`@langchain/langgraph` (1.2.9)** — orchestration للـ multi-agent
- **`@mastra/core` (1.28)** — agent framework
- **`mem0ai`** — long-term memory
- **Langfuse** — tracing + evaluation
- **`@mlc-ai/web-llm`** — on-device fallback (نموذج صغير)
- **AG-UI Client** — UI for agent runs

نماذج Gemini مُعرَّفة في `src/ai/models.ts` (`MODELS.FLASH`, `MODELS.PRO`).

## 5. Auth + Payments
- **Firebase Auth:** Google + Email/Pass + Phone OTP
- **Stripe v22:** subscription + one-time
- **Fawry:** بدائل دفع مصريّة (`app/api/billing/fawry/`)
- **OpenMeter:** usage metering (`@openmeter/sdk`)

## 6. Sidecars (Python)
ملفّ `services/cloudbuild.yaml` يبني الـ 4 services على Cloud Run/Railway:

| Service | Port | Tech |
|---|---|---|
| pdf-worker | 8000 | FastAPI + pypdf + pdfkit |
| egypt-calc | 8008 | FastAPI + pydantic + hypothesis |
| llm-judge | 8080 | FastAPI + google-generativeai |
| embeddings-worker | 8099 | FastAPI + fastembed + numpy |

## 7. Observability
- **Sentry:** `@sentry/nextjs` — errors (client + server + edge)
- **Langfuse:** AI traces (كل استدعاء LLM)
- **OpenTelemetry:** `@opentelemetry/api` + `sdk-trace-base`
- **Pino:** structured logs (`src/lib/logger.ts`)
- **Web Vitals:** `web-vitals` 5

## 8. Validation + Security
- **Zod 4:** كل input من شبكة/مستخدم
- **Jose:** JWT verification
- **xss:** sanitization للـ HTML من المستخدم
- **arabic-reshaper:** للـ PDF generation

## 9. Tests
- **Vitest 4:** unit + integration
- **Playwright:** E2E
- **`@firebase/rules-unit-testing`:** اختبار قواعد Firestore (في `test/firestore-rules.test.ts`)
- **Hypothesis (Python):** property-based في sidecars

## 10. أنماط عامّة في الكود

### استخدام Firestore Admin
```ts
import { adminDb } from '@/src/lib/firebase-admin';

const snap = await adminDb
  .collection('users')
  .doc(uid)
  .collection('tasks')
  .where('status', '==', 'pending')
  .limit(50)               // ← إلزامي
  .get();
```

### استدعاء وكيل
```ts
import { generateText } from 'ai';
import { MODELS } from '@/src/ai/models';
import { sanitizeContext } from '@/src/ai/safety/sanitize-context';

const safeRagContext = sanitizeContext(rawRagDocs);
const { text } = await generateText({
  model: MODELS.FLASH,
  system: SYSTEM_PROMPT,           // ثابت، لا user input
  prompt: `[CONTEXT]\n${safeRagContext}\n\n[QUESTION]\n${userQuestion}`,
});
```

### Server Action
```ts
'use server';
import { z } from 'zod';

const Schema = z.object({ name: z.string().min(1).max(256) });

export async function createWorkspace(input: unknown) {
  const data = Schema.parse(input);
  // ...
}
```

### React component (client)
```tsx
'use client';
import { useQuery } from '@tanstack/react-query';

export function TasksList() {
  const { data, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => fetch('/api/tasks').then(r => r.json()),
  });
  // ...
}
```

## 11. أين تجد ماذا
- `src/ai/agents/*` — كل وكيل (prompt + agent + tools)
- `src/ai/safety/` — plan-guard، sanitize-context، governance
- `src/lib/` — utilities (firebase, logger, rate-limit، إلخ)
- `app/api/*` — REST endpoints
- `app/(dashboard)/*` — صفحات بعد الدخول
- `components/ui/*` — primitives
- `components/<domain>/*` — مكوّنات domain-specific
- `hooks/*` — React hooks
- `i18n/*` + `messages/*` — ترجمات
- `test/eval/golden-dataset.json` — golden set للـ evals

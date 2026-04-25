# Agent Governance — Kalmeron AI

**Last reviewed:** 2026-04-25 · **Owner:** Principal Platform Architect

## 1. لماذا حوكمة الوكلاء؟

كلميرون يشغّل **16 وكيلاً مختلفاً** في إنتاج، كل واحد له نظام prompt مختلف، أدوات مختلفة، مستخدمين مختلفين. بدون نظام حوكمة موحَّد:

- وكيل قد يستخدم أداة تنفّذ شيئاً ماليّاً بدون موافقة بشريّة.
- prompt injection على وكيل واحد قد يسرّب بيانات وكيل آخر.
- صعوبة إثبات الامتثال لـ EU AI Act عند audit.

هذا الملفّ يطبّق **Microsoft Agent Governance Toolkit (أبريل 2026)** و **OWASP Top 10 for LLM Agents (2026)** على وكلائنا.

## 2. المكوّنات الفعليّة في المستودع

| المكوّن | الموقع | الدور |
|---|---|---|
| **Plan Guard** | `src/ai/safety/plan-guard.ts` | يفحص خطّة الوكيل قبل التنفيذ — يرفض tools خارج الـ allow-list per intent |
| **Sanitize Context** | `src/ai/safety/sanitize-context.ts` | ينظّف RAG documents من instruction-like patterns (ClawGuard-style) |
| **Agent Governance** | `src/ai/safety/agent-governance.ts` | يطبّق `requireHumanApproval()` للأدوات عالية المخاطر |
| **System Cards** | `docs/agents/*.md` | تعريف رسمي لكل وكيل (capabilities + limits + risk class) |
| **Eval Suite** | `test/eval/golden-dataset.json` + `services/llm-judge/` | تقييم دوري لكل وكيل |
| **Langfuse** | `LANGFUSE_*` env | tracing لكل LLM call (إجباري) |
| **Plan files** | `actions` collection في Firestore | كل tool execution مُسجَّل + قابل للمراجعة |

## 3. OWASP Top 10 for LLM Agents (2026) — Mapping

| ID | المخاطر | تخفيفنا |
|---|---|---|
| **AA01** | Memory Poisoning | كل entry في `mem0`/`user_memory` لها `userId` + isolation. لا cross-tenant reads. |
| **AA02** | Tool Misuse | كل tool في `plan-guard.ts` له allow-list per intent. كل استدعاء يُسجَّل في `actions` collection. |
| **AA03** | Privilege Compromise | Tools `risk: critical|high` تستدعي `requireHumanApproval()`. الـ workspace membership server-only. |
| **AA04** | Resource Overload | Rate limiting في `src/lib/rate-limit.ts` + token budget per user عبر OpenMeter. |
| **AA05** | Cascading Hallucinations | كل output من وكيل يُمرَّر بـ `llm-judge` قبل حفظه كـ "source of truth". |
| **AA06** | Intent Breaking | System prompts ثابتة — لا تُدمَج user input فيها مباشرةً. كل context يمرّ بـ `sanitizeContext()`. |
| **AA07** | Misaligned & Deceptive Behaviors | Disclosures إجباريّة في كل رد ("هذه إجابة مولَّدة..."). citations عند RAG. |
| **AA08** | Repudiation & Untraceability | Langfuse tracing + `actions` collection + Sentry logs = trail كامل. |
| **AA09** | Identity Spoofing & Impersonation | Firebase Auth + `request.auth.uid` في كل query. لا API endpoint يقبل `userId` من body. |
| **AA10** | Overwhelming HITL | لو HITL queue > 50 → email + Slack alert. priority queue (`critical` قبل `high`). |

## 4. Microsoft Agent Governance Toolkit — تطبيقنا

الـ Toolkit (المُصدَر أبريل 2026) يقترح **6 أعمدة**. هذا مطابقتنا:

### 4.1 Identity & Access (لكل وكيل)
- ✅ كل وكيل له **agent ID** (kebab-case، مُعرَّف في `src/ai/agents/<name>/`).
- ✅ كل استدعاء وكيل يُسجَّل بـ `userId + workspaceId + agentId + traceId`.
- ✅ لا وكيل يستطيع قراءة بيانات وكيل آخر مباشرةً (memory isolation).

### 4.2 Inventory & Discovery
- ✅ Inventory رسمي في `docs/agents/README.md`.
- ✅ كل وكيل له System Card بالـ template الموحَّد.
- ✅ Risk class مُسجَّل (Minimal/Limited/High).

### 4.3 Risk Management
- ✅ Risk register في `docs/THREAT_MODEL.md` + System Cards.
- ✅ DPIA لكل وكيل High في `docs/dpia/` (مثلاً Legal Guide).
- ✅ Quarterly review في `replit.md`.

### 4.4 Policy & Controls
- ✅ Plan Guard يفرض allow-list per intent.
- ✅ Human approval queue للـ critical tools.
- ✅ CSP + rate limit + zod validation لكل API.

### 4.5 Monitoring & Auditing
- ✅ Langfuse traces (إجباري — لا agent يعمل بدونه).
- ✅ Sentry لـ errors.
- ✅ pino structured logs.
- ✅ Eval reports أسبوعيّاً عبر `npm run eval:report`.

### 4.6 Lifecycle Management
- ✅ كل وكيل له versioning في System Card.
- ✅ Deprecation: change log في System Card + `replit.md`.
- ✅ Sunset: لو وكيل مش مستخدم لـ 90 يوم → تنبيه في القاعدة + decision في ADR.

## 5. Risk Classification (EU AI Act + Internal)

### Minimal Risk
- General Chat، Success Museum
- **Controls:** Rate limit + Langfuse فقط.

### Limited Risk (الأكثر شيوعاً)
- Idea Validator, Plan Builder, CFO, Marketing, Sales, HR, Operations, Product, Investor, Customer Voice, Mistake Shield, Real Estate, Opportunity Radar
- **Controls:** Plan Guard + Sanitize Context + Disclosures + Citations + Eval ≥ 0.80.

### High Risk
- **Legal Guide** (يعطي توصيات قانونيّة)
- **Controls:** كل ما سبق + DPIA + Mandatory disclaimer "هذه ليست استشارة قانونيّة" + Citations لقوانين رسميّة + Human approval لأيّ tool يكتب لمحامٍ خارجي.

### Unacceptable (مرفوضة في كلميرون)
- وكلاء يقرّرون توظيف/فصل دون بشري.
- وكلاء يصنعون قرارات ائتمانيّة دون بشري.
- Social scoring.

## 6. Human-in-the-Loop (HITL)

### متى تُستدعى الموافقة البشريّة؟
- أيّ tool ينفّذ شيئاً ماليّاً (دفع، اشتراك، إلغاء).
- أيّ tool يُرسل بريد/رسالة لجهة خارجيّة (عدا notifications للمستخدم نفسه).
- أيّ tool يحذف بيانات.
- أيّ tool يغيّر صلاحيّات (workspace roles).
- أيّ tool يُعدّل بيانات تنظيميّة (compliance, GDPR).

### آليّة الموافقة
1. الـ tool يستدعي `requireHumanApproval({ userId, action, payload })`.
2. الـ helper يكتب entry في `tasks/{userId}/{taskId}` بـ status `awaiting_human` + `priority` (low/medium/high/critical).
3. المستخدم يرى الـ inbox في `/inbox`.
4. الموافقة → الـ tool يُنفَّذ. الرفض → audit log.

## 7. Disclosure Standards

كل رد من وكيل يحوي **disclosure إجباري**:

```
هذه إجابة مولّدة آلياً وقد تحتوي على أخطاء. تحقّق دائماً من الأرقام مع متخصّص قبل اتّخاذ قرار.
```

للوكلاء High Risk (Legal Guide):

```
⚠️ هذه ليست استشارة قانونيّة رسميّة. للحصول على رأي ملزِم، تواصل مع محامٍ معتمد في بلدك.
المصادر: [قانون المعاملات المدنية، المادة ...] [رابط رسمي].
```

## 8. Audit Trail

لكل استدعاء tool:
- `actions/{actionId}` document في Firestore يحوي:
  - `userId`, `workspaceId`, `agentId`, `traceId`
  - `tool`, `input`, `result`, `error`
  - `status`: `pending`/`executed`/`executed_noop`/`failed`/`awaiting_human`
  - `decidedAt`, `executedAt`
- Langfuse trace مرتبط بـ `traceId`.

عند audit (داخلي أو من عميل):
1. ابحث في Firestore بـ `userId` → كل الـ actions.
2. كلّ action له trace في Langfuse → كل الـ LLM calls + tokens + cost.
3. تاريخ كامل قابل للاستعراض في الـ admin dashboard (`/admin`).

## 9. مهام مستقبليّة (روابط مع ADRs)

- [ ] تطبيق Microsoft "Agent Posture Score" — حساب 0-100 لكل وكيل.
- [ ] إضافة **shadow mode** لكل وكيل جديد (يُسجَّل بدون تنفيذ tools لأسبوع).
- [ ] **Red-team** ربع سنوي على كل وكيل High Risk.
- [ ] **Differential privacy** على exports البيانات.
- [ ] استبدال `pino redact` بـ Cloud DLP لـ PII detection.

## 10. مرجع سريع (للمطوّرين)

```ts
// عند كتابة tool جديد:
import { tool } from 'ai';
import { z } from 'zod';
import { requireHumanApproval } from '@/src/ai/safety/agent-governance';

export const dangerousTool = tool({
  description: '...',
  inputSchema: z.object({ ... }),
  execute: async (input, ctx) => {
    // إجباري لكل tool عالي المخاطر:
    await requireHumanApproval({
      userId: ctx.userId,
      workspaceId: ctx.workspaceId,
      action: 'unique_action_id',
      payload: input,
      priority: 'high',
    });
    // ... التنفيذ بعد الموافقة
  },
});
```

```ts
// عند كتابة prompt يحوي RAG:
import { sanitizeContext } from '@/src/ai/safety/sanitize-context';

const safeContext = sanitizeContext(rawDocs);
// لا تُدمج userInput مباشرةً في system prompt
const result = await generateText({
  model,
  system: STATIC_SYSTEM_PROMPT,
  prompt: `[CONTEXT]\n${safeContext}\n\n[QUESTION]\n${userInput}`,
});
```

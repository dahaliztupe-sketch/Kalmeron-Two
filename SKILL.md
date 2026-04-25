---
name: add-new-agent
description: خطوات تفصيليّة لإضافة وكيل ذكاء اصطناعي جديد إلى منصّة Kalmeron من الفكرة إلى الإنتاج
---

# Skill: إضافة وكيل جديد إلى Kalmeron

> **متى تستخدم هذه المهارة؟** حين تطلب إضافة قسم/دور جديد (مثلاً «وكيل المخزون»، «وكيل الشحن»، «وكيل الأمان السيبراني»).

> **متى لا تستخدمها؟** لتعديل سلوك وكيل قائم — هذا تغيير في `prompt.ts` فقط، ليس وكيلاً جديداً.

---

## المرحلة 1 — التخطيط (قبل أيّ كود)

### 1.1 صنّف الوكيل
أجب على هذه الأسئلة وضعها في System Card:
- **الاسم:** بالعربية + الإنجليزية (kebab-case للملفّ).
- **القسم:** Strategy / Finance / Legal / Marketing / Sales / HR / Operations / Product / Investor / Customer / Vertical.
- **المهمّة الأساسيّة:** جملة واحدة.
- **الـ EU AI Act risk class:** Minimal / Limited / High / Unacceptable.
  - **High** = تعطي توصيات قانونيّة/طبّيّة/توظيف. يحتاج DPIA في `docs/dpia/`.
  - **Limited** = استشاري بدون أثر مباشر.
  - **Minimal** = ترفيهي/معلوماتي.

### 1.2 حدّد الأدوات (Tools)
ارجع إلى `src/ai/safety/plan-guard.ts` لقائمة الأدوات المتاحة. لكل أداة حدّد:
- اسمها (مثلاً `rag.search`, `web.fetch`, `firestore.create`).
- مستوى المخاطر (`low`/`medium`/`high`/`critical`).
- هل تحتاج موافقة بشريّة؟

### 1.3 حدّد البيانات
- ما البيانات اللي يقرأها؟ (RAG corpus، collections في Firestore، web).
- ما البيانات اللي يكتبها؟
- مدّة الاحتفاظ.
- هل تحوي PII؟

---

## المرحلة 2 — السكافولد

### 2.1 أنشئ مجلّد الوكيل
```bash
AGENT_KEBAB="my-new-agent"
AGENT_PASCAL="MyNewAgent"

mkdir -p src/ai/agents/$AGENT_KEBAB
touch src/ai/agents/$AGENT_KEBAB/{prompt.ts,agent.ts,tools.ts}
```

### 2.2 املأ `prompt.ts` (طبّق هيكل SCOPE)
انظر `docs/PROMPT_QUALITY.md` لتفاصيل SCOPE.

```ts
// src/ai/agents/my-new-agent/prompt.ts
export const MY_NEW_AGENT_SYSTEM_PROMPT = `أنت [الدور] في منصّة كلميرون.

[S — Situation]
السياق: تخدم مؤسّسي شركات ناشئة عربية في مرحلة Pre-seed → Seed.
الجمهور: مستخدم واحد، عربي، يكتب بالعامّيّة المصريّة.

[C — Constraints]
- تردّ بالعربيّة الفصحى المبسّطة دائماً.
- تستخدم أرقاماً واقعيّة من السوق المصري.
- لا تعطي وعوداً بـ "النجاح المضمون".
- إذا كان السؤال خارج تخصّصك، حوّله للوكيل المناسب.

[O — Outcome]
المخرج المثالي: [اوصف الشكل النهائي للرد — قائمة، تقرير، JSON، إلخ].

[P — Patterns]
استخدم هذه القوالب:
- لو السؤال "كيف...": ابدأ بـ "في 3 خطوات: ..."
- لو السؤال "ما...": ابدأ بتعريف ثمّ مثال.

[E — Exceptions]
- لو السؤال يحوي بيانات شخصيّة لشخص ثالث: ارفض بأدب.
- لو السؤال يطلب تنفيذ شيء يستلزم موافقة بشريّة: قل ذلك صراحةً.

أنهِ كلّ رد بـ:
"هذه إجابة مولّدة آلياً وقد تحتوي على أخطاء — تحقّق من الأرقام مع متخصّص قبل اتّخاذ قرار."`;
```

### 2.3 املأ `agent.ts`
انسخ من `src/ai/agents/cfo-agent/agent.ts` كقالب — يحوي pattern الـ learned-skills addon.

```ts
// src/ai/agents/my-new-agent/agent.ts
import { generateText } from 'ai';
import { MODELS } from '@/src/ai/models';
import { sanitizeContext } from '@/src/ai/safety/sanitize-context';
import { applyLearnedSkills } from '@/src/ai/agents/_shared/learned-skills';
import { MY_NEW_AGENT_SYSTEM_PROMPT } from './prompt';
import { tools } from './tools';

export async function runMyNewAgent(input: { userId: string; workspaceId?: string; question: string; context?: string }) {
  const safeContext = input.context ? sanitizeContext(input.context) : '';
  const learnedAddon = await applyLearnedSkills('my-new-agent', input.workspaceId);
  const systemPrompt = learnedAddon
    ? `${MY_NEW_AGENT_SYSTEM_PROMPT}\n\n${learnedAddon}`
    : MY_NEW_AGENT_SYSTEM_PROMPT;

  return generateText({
    model: MODELS.FLASH,
    system: systemPrompt,
    prompt: safeContext
      ? `[CONTEXT]\n${safeContext}\n\n[QUESTION]\n${input.question}`
      : input.question,
    tools,
  });
}
```

### 2.4 املأ `tools.ts`
كل أداة لازم لها `risk` level — يفرضه `plan-guard`.

```ts
// src/ai/agents/my-new-agent/tools.ts
import { z } from 'zod';
import { tool } from 'ai';
import { requireHumanApproval } from '@/src/ai/safety/agent-governance';

export const tools = {
  searchKnowledgeBase: tool({
    description: 'يبحث في قاعدة المعرفة عن مستندات ذات صلة',
    inputSchema: z.object({ query: z.string().min(3).max(500) }),
    execute: async ({ query }) => {
      // risk: 'low' — read-only RAG
      // ... استدعاء embeddings-worker
      return { results: [] };
    },
  }),

  scheduleMeeting: tool({
    description: 'يحجز اجتماعاً في تقويم المستخدم',
    inputSchema: z.object({ when: z.string(), with: z.string().email() }),
    execute: async (input, ctx) => {
      // risk: 'high' — يكتب في تقويم خارجي
      await requireHumanApproval({
        userId: ctx.userId,
        action: 'schedule_meeting',
        payload: input,
      });
      // ... استدعاء Calendar API
      return { ok: true };
    },
  }),
};
```

---

## المرحلة 3 — System Card

أنشئ `docs/agents/my-new-agent.md` بناءً على `docs/agents/_TEMPLATE.md`. **إجباري قبل الـ merge.**

ثمّ أضف الوكيل إلى الـ index في `docs/agents/README.md`.

---

## المرحلة 4 — التكامل في الواجهة

### 4.1 سجّل الوكيل في الراوتر
```ts
// src/ai/agents/_router.ts (أو ما يقابله)
import { runMyNewAgent } from './my-new-agent/agent';

export const AGENT_REGISTRY = {
  // ...
  'my-new-agent': runMyNewAgent,
};
```

### 4.2 أضف صفحة (لو الوكيل له واجهة مخصّصة)
```bash
mkdir -p app/\(dashboard\)/my-new-agent
touch app/\(dashboard\)/my-new-agent/page.tsx
```

### 4.3 أضف الترجمات
```json
// messages/ar.json
"my-new-agent": {
  "title": "عنوان الوكيل",
  "description": "وصف قصير",
  "cta": "ابدأ الحوار"
}
```

---

## المرحلة 5 — التقييم (Evals)

### 5.1 أضف 50 سؤال إلى `test/eval/golden-dataset.json` تحت قسم `my-new-agent`.
### 5.2 شغّل `npm run eval` وتأكّد من:
- `recall@3 ≥ 0.75`
- `LLM-judge score ≥ 0.80`

### 5.3 أضف اختبار unit لكل tool في `test/unit/agents/my-new-agent.test.ts`.

---

## المرحلة 6 — الأمان والحوكمة

### Checklist إلزاميّة قبل الـ merge:
- [ ] System prompt **ثابت** — لا يدمج user input مباشرةً.
- [ ] كل user input يمرّ بـ `sanitizeContext()` قبل LLM.
- [ ] كل tool له `risk` level.
- [ ] Tools `high|critical` تستدعي `requireHumanApproval()`.
- [ ] System Card في `docs/agents/`.
- [ ] لو risk class = `High` → DPIA في `docs/dpia/`.
- [ ] Disclosures في الرد ("هذه إجابة مولّدة...").
- [ ] Citations عند استخدام RAG.
- [ ] Output يمرّ بـ `xss()` لو سيُعرض كـ HTML.
- [ ] Rate limit في الـ API endpoint اللي يستدعي الوكيل.

---

## المرحلة 7 — التحقّق النهائي

```bash
npm run typecheck   # 0 errors
npm run lint        # 0 errors
npm run test        # كل الاختبارات تمرّ
npm run eval        # ≥ thresholds
npm run test:rules  # لو غيّرت rules
```

ثمّ حدّث `replit.md` بقسم Recent Major Updates يصف الوكيل الجديد.

---

## أنماط مشهورة (Templates)

- **وكيل استشاري بسيط:** انسخ `cfo-agent` (read-heavy, كتابة قليلة).
- **وكيل tools-heavy:** انسخ `opportunity-radar` (web fetch + scoring).
- **وكيل Vertical:** انسخ `real-estate` (RAG على corpus متخصّص).
- **وكيل routing:** انسخ `general-chat` (يحوّل للوكلاء الآخرين).

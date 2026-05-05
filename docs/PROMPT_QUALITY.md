# معايير جودة Prompts — كلميرون

**Last reviewed:** 2026-05-05 · **Audience:** كل من يكتب أو يعدّل system prompt لوكيل في كلميرون.

## 0. إطار SCOPE (مطلوب لكل وكيل)

إطار موحّد لكتابة system prompts محكمة وقابلة للقياس. كل حرف بُعد لا غنى عنه:

| الحرف | المعنى | السؤال المحوري |
|---|---|---|
| **S** | Situation | ما السياق الكامل الذي يعمل فيه الوكيل؟ |
| **C** | Context | ما المعرفة والبيانات المرجعية التي يحتاجها؟ |
| **O** | Output | كيف تبدو الإجابة الجيدة؟ ما هيكلها؟ |
| **P** | Persona | من هو الوكيل؟ ما خبرته وأسلوبه؟ |
| **E** | Enforcement | ما الحدود؟ ما الذي يجب دائماً / لا يجب أبداً؟ |

### حساب SCOPE Score
```
SCOPE Score = (S + C + O + P + E) / 100   → يجب أن يكون ≥ 0.80 للإنتاج
```

### جدول تقييم الوكلاء الحاليين

| الوكيل | S | C | O | P | E | المجموع |
|---|---|---|---|---|---|---|
| CFO Agent | 18 | 19 | 16 | 18 | 17 | 88/100 ✅ |
| Contract Reviewer | 18 | 18 | 17 | 17 | 18 | 88/100 ✅ |
| Brand Builder | 17 | 18 | 15 | 18 | 16 | 84/100 ✅ |
| Cash Runway | 18 | 18 | 16 | 17 | 17 | 86/100 ✅ |
| Customer Discovery | 17 | 17 | 16 | 17 | 16 | 83/100 ✅ |
| CEO | 18 | 17 | 16 | 18 | 16 | 85/100 ✅ |
| CHRO | 17 | 16 | 15 | 17 | 15 | 80/100 ✅ |
| CSO | 17 | 16 | 15 | 17 | 15 | 80/100 ✅ |
| COO | 17 | 16 | 15 | 17 | 15 | 80/100 ✅ |
| Legal Guide | 17 | 17 | 15 | 17 | 16 | 82/100 ✅ |
| Marketing Strategist | 17 | 16 | 15 | 17 | 15 | 80/100 ✅ |
| Sales Coach | 17 | 17 | 17 | 17 | 16 | 84/100 ✅ |
| Wellbeing Coach | 17 | 15 | 15 | 17 | 16 | 80/100 ✅ |

---

## 1. لماذا هذا الملفّ؟

في 2026، الفرق بين وكيل ممتاز وآخر متوسّط هو **هيكل الـ prompt**، ليس قوّة الموديل. هذا الملفّ يلخّص أفضل ممارسات السنة (مأخوذة من المستودع الشهير `system-prompts-and-models-of-ai-tools` ومن أبحاث Anthropic + DeepMind 2026).

## 2. هيكل SCOPE (مطلوب لكل وكيل جديد)

كل system prompt جديد لازم يطبّق **SCOPE**:

### S — Situation (السياق)
> من نحن؟ من المستخدم؟ ما البيئة؟

```text
[S — Situation]
أنت "وكيل CFO" في منصّة كلميرون.
السياق: تخدم مؤسّسي شركات ناشئة عربية في مرحلة Pre-seed → Seed.
الجمهور: مستخدم واحد، عربي مصري، مستوى ماليّ متوسّط (يفهم runway, burn rate, margin).
```

### C — Constraints (القيود)
> ما القواعد التي يجب عدم كسرها؟

```text
[C — Constraints]
- اردد بالعربيّة الفصحى المبسّطة، أرقام عربيّة (1, 2, 3) وليس هندية (١, ٢, ٣).
- استخدم العملة الجنيه المصري (ج.م) افتراضياً.
- لا تعطِ توصيات استثمار مضاربيّة.
- لا تعطِ أرقاماً مخترعة — استخدم أرقام السوق المُتاحة في RAG context.
- إذا كان السؤال خارج المالية، حوِّل للوكيل المناسب.
```

### O — Outcome (المخرج)
> ما الشكل النهائي للرد؟

```text
[O — Outcome]
المخرج المثالي:
1. ملخّص في سطر واحد.
2. تحليل في 3-5 نقاط.
3. أرقام (لو ذُكرت أرقام في السؤال).
4. توصية واحدة قابلة للتنفيذ.
5. سؤال متابعة لتعميق التحليل.
```

### P — Patterns (القوالب)
> أمثلة لردود نموذجيّة.

```text
[P — Patterns]
نموذج 1 (سؤال "كم runway عندي؟"):
"بناءً على رصيدك الحالي [X] ومعدّل الإنفاق [Y/شهر]، الـ runway = X/Y = Z شهراً.
- إذا حافظت على نفس الإنفاق: تكفي حتى [تاريخ].
- إذا قلّلت 20%: تكفي حتى [تاريخ + 2 شهر].
توصية: [...]
سؤال متابعة: ما خططك للنموّ خلال هذه الفترة؟"
```

### E — Exceptions (الاستثناءات)
> ماذا تفعل في الحالات الشاذّة؟

```text
[E — Exceptions]
- لو السؤال يحوي بيانات شخصيّة لطرف ثالث: ارفض بأدب.
- لو السؤال يطلب إنشاء/تحويل أموال: اطلب موافقة بشريّة عبر `requireHumanApproval`.
- لو السؤال غامض (لا أرقام كافية): اطرح سؤالاً واحداً للتوضيح بدل الإجابة.
- لو الموديل غير متأكّد (confidence < 0.6): قل "لست متأكّداً، أحتاج مزيداً من السياق".
```

## 3. الدروس من `system-prompts-and-models-of-ai-tools` (131k stars)

دراسة المستودع كشفت أنماطاً تتكرّر في system prompts النجاحات (Cursor, Claude, GPT-4, Devin):

### 3.1 Identity-first
ابدأ بتعريف هويّة قويّة في الجملة الأولى. لا تبدأ بـ "أنت AI assistant". ابدأ بـ "أنت CFO خبير لشركات ناشئة عربية".

### 3.2 Negative Constraints بقوّة الـ Positive
بدل "كن دقيقاً في الأرقام"، اكتب "ممنوع منعاً باتّاً اختراع أرقام لا توجد في السياق".
الموديلات تستجيب لـ "ممنوع" أقوى من "افعل".

### 3.3 Few-shot examples
أضف 1-3 أمثلة قصيرة في الـ prompt (في قسم Patterns). يخفّض الـ hallucination بـ ~30%.

### 3.4 Output format صريح
قل "ردّ JSON بالشكل: `{...}`" أو "ردّ markdown بهيكل H2 → H3 → bullets".
الموديل يحترم الـ format لو كُتِب صراحةً.

### 3.5 Tool description واضحة
كل tool في الـ schema يحتاج description مكتوب من منظور الموديل، ليس المستخدم:
- ❌ "Search the database"
- ✅ "ابحث في قاعدة 13,000 startup فاشلة. استخدمها فقط لو السؤال عن خطأ شائع. ترجع 5 نتائج كحدّ أقصى."

### 3.6 Citation injection
في system prompt، اطلب صراحةً: "بعد كل ادّعاء، أضف `[المصدر: file_id]`."
يخفّض الـ hallucination + يساعد المستخدم يتحقّق.

### 3.7 Disclosures في النهاية
آخر سطر في كل رد لازم يحوي disclosure (انظر `docs/AGENT_GOVERNANCE.md` §7).

## 4. Anti-Patterns (تجنّبها)

### ❌ Prompt يحوي user input بدون sanitization
```ts
// خطأ:
const prompt = `أجب على السؤال التالي: ${userInput}`;
// الـ userInput قد يحوي "ignore previous instructions and..."
```

### ✅ بدلاً من ذلك:
```ts
const safeContext = sanitizeContext(userInput);
const result = await generateText({
  system: STATIC_SYSTEM_PROMPT,  // ثابت، لا متغيّرات
  prompt: `[USER_QUESTION_BEGIN]\n${safeContext}\n[USER_QUESTION_END]`,
});
```

### ❌ Prompt طويل جداً (> 4000 token)
يضعف الـ instruction following. قسّم إلى:
- Core system prompt (< 1500 token)
- Learned skills addon (< 500 token، dynamic)
- RAG context (< 4000 token)

### ❌ Mixed languages في system prompt
الموديل يضطرب لو الـ system بالإنجليزية والـ user بالعربية. **اكتب كل شيء بنفس اللغة الأم للمستخدم.**

### ❌ "You are helpful, harmless, honest"
generic جداً. بدلها بـ constraints محدّدة لمهمّة الوكيل.

## 5. نمط "التنفيذ الذاتي" (Autonomous Agent Pattern)

للوكلاء اللي تشتغل دوريّاً (مثلاً Mistake Shield الأسبوعي، Opportunity Radar اليومي)، طبّق هذا النمط:

### 5.1 الهيكل
```ts
// src/ai/agents/<agent>/autonomous.ts
export async function runAutonomousCycle(workspaceId: string) {
  // 1. Goal injection — من إعدادات الـ workspace
  const goal = await loadWorkspaceGoal(workspaceId, '<agent>');

  // 2. Planning — الوكيل يكتب خطّته في 3-5 خطوات
  const plan = await planAgent({ goal, agent: '<agent>' });
  await savePlan({ workspaceId, agent: '<agent>', plan });

  // 3. Execution — كل خطوة tool call
  for (const step of plan.steps) {
    const result = await executeStep(step, { workspaceId });
    await saveStepResult({ workspaceId, step, result });

    // 4. Critique — الوكيل يقيّم نتيجته
    const critique = await critiqueResult({ step, result });
    if (critique.needsRetry) {
      // 5. Replan
      step = await replanStep(step, critique);
    }
  }

  // 6. Summary للمستخدم — يُرسَل في daily-brief
  const summary = await summarizeCycle({ workspaceId, agent: '<agent>' });
  await sendDailyBrief({ workspaceId, summary });
}
```

### 5.2 الـ scheduling
- استخدم `node-cron` (موجود سلفاً في الـ deps) أو Vercel Cron.
- كل cycle مُسجَّل في `agent_runs` collection مع `traceId`.

### 5.3 Safety
- كل autonomous cycle يبدأ بـ `requireHumanApproval` على الأهداف الكبرى (لو change > threshold).
- Daily brief يحوي "ما فعلته" + "ما لم أستطع فعله، يحتاج موافقتك".

## 6. Templates جاهزة

### 6.1 وكيل استشاري (Read-only)
انظر `src/ai/agents/cfo-agent/prompt.ts` — يطبّق SCOPE + few-shot + citations.

### 6.2 وكيل tools-heavy
انظر `src/ai/agents/opportunity-radar/prompt.ts` — يطبّق tool selection + risk gates.

### 6.3 وكيل routing
انظر `src/ai/agents/general-chat/prompt.ts` — يطبّق intent detection + handoff.

## 7. تقييم جودة الـ prompt

استخدم `npm run eval` لتشغيل الـ golden set. المعايير:

- **Recall@3 ≥ 0.75** — الوكيل يلتقط الـ context الصحيح.
- **LLM-judge score ≥ 0.80** — الجودة وفق llm-judge sidecar.
- **Latency p95 < 4s** — الوكيل يردّ في وقت معقول.
- **Token cost per response < $0.005** (Flash) أو **< $0.05** (Pro).

أيّ وكيل يفشل في > 1 من المعايير = منع الـ deploy حتّى يُعالَج.

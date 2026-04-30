# تقرير مهمّة Agent Skills — كلميرون تو

**التاريخ:** 2026-04-30
**المنفّذ:** Replit Agent
**الأداة:** [`skills` CLI v1.5.3](https://www.npmjs.com/package/skills) (Vercel Labs)

---

## 0. خلاصة تنفيذيّة (TL;DR)

ثبّتنا **13 مهارة** عالية الجودة من **4 مستودعات رسميّة** (Google، Vercel-Labs، Microsoft، Anthropic)، مستهدفة وكيل `replit` في هذه البيئة، ومسجّلة في `skills-lock.json` و `AGENTS.md §10.1`. لم نُثبّت "كلّ المتاح" قصداً — وهذا اختيار معماريّ موضّح في §4.

---

## 1. توضيح مفهوميّ مهمّ (قبل القائمة)

> **Agent Skills ≠ Runtime Agents**

معيار Agent Skills (Anthropic, Q4 2025) يقدّم مهارات على شكل ملفّات `SKILL.md` (Frontmatter + Markdown + ملفّات مساعدة). الوكيل يقرأ `name + description` فقط، ويُحمّل المحتوى الكامل عند الحاجة — هذا هو **progressive disclosure**.

**لكن:** هذه المهارات تُستهلك من **الوكلاء البرمجيّين** (Claude Code، Cursor، Replit Agent، Gemini CLI…) أثناء **كتابة وصيانة كودك**. هي **لا تدخل** في graph الـ16 وكيلاً وقت التشغيل (`src/ai/agents/registry.ts`). دمجها في الوكلاء الجاريين يتطلّب نظام loader مخصّص (إذا أردت ذلك لاحقاً، نناقشه كـ ADR منفصل).

عليه، اخترنا مهارات ترفع جودة **المنصّة نفسها** (DX، أمان، تكلفة، موثوقيّة، واجهة) — وهذا حيث القيمة الحقيقيّة الفوريّة.

---

## 2. ما تمّ تثبيته (13 مهارة)

### 2.1 منصّة جوجل والبنية التحتيّة (6 مهارات — `google/skills`)

| المهارة | لماذا اخترناها لكلميرون |
|---|---|
| `firebase-basics` | Firestore هو DB الإنتاج (`AGENTS.md §1`). هذه المهارة توجّه أيّ وكيل برمجي عند تعديل rules، indexes، أو Admin SDK. |
| `gemini-api` | كلميرون يستخدم `@google/genai` و `@ai-sdk/google` (Gemini 2.5 Pro/Flash/Lite). توجيه دقيق لأنماط `generateContent`, caching, batch, tool use. |
| `cloud-run-basics` | الـ4 sidecars Python (PDF, Egypt-Calc, LLM-Judge, Embeddings) مرشّحون للنشر على Cloud Run. هذه المهارة تحدّد golden path. |
| `google-cloud-waf-security` | ركن الأمن من Well-Architected Framework — IAM، VPC، حماية البيانات. مكمّل مباشر لـ `SECURITY_FIX_PLAN.md`. |
| `google-cloud-waf-reliability` | تحديد SLO/SLI، تحمّل الأعطال — حاسم لـ "Production-ready" (راجع AGENTS.md §0). |
| `google-cloud-waf-cost-optimization` | فاتورة Gemini + Firestore تتزايد. المهارة تقدّم heuristics ملموسة (caching، model selection، batch). |

### 2.2 الواجهة والـ Frontend (3 مهارات — `vercel-labs/agent-skills`)

| المهارة | لماذا |
|---|---|
| `vercel-react-best-practices` | Next.js 16 + React 19 — هذه المهارة من فريق Vercel نفسه يدرّس RSC، data fetching، bundle optimization. |
| `vercel-composition-patterns` | لتجنّب `boolean prop proliferation` في `components/` (لاحظنا مكوّنات كبيرة مثل `app/_page-client.tsx` 14KB). |
| `web-design-guidelines` | تدقيق UX/a11y تلقائي — يعزّز `npm run audit:a11y` و `audit:frontend`. |

### 2.3 Microsoft (2 مهارات — `microsoft/agent-skills`)

| المهارة | لماذا |
|---|---|
| `frontend-design-review` | معايير ثلاثيّة (frictionless insight-to-action، quality craft، trustworthy) — مفيد لمراجعات PR للواجهة العربيّة RTL. |
| `continual-learning` | يدرّس hooks وذاكرة قابلة للنطق للوكلاء — ذو صلة عند تطوير `src/lib/memory/compress-context.ts`. |

### 2.4 Anthropic (2 مهارة — `anthropics/skills`)

| المهارة | لماذا |
|---|---|
| `mcp-builder` | كلميرون لديه `app/mcp-server/` — هذه المهارة (من مبتكري المعيار) تعطي معايير ذهبيّة لبناء MCP في Python/TypeScript. |
| `skill-creator` | لإنشاء مهارات داخليّة لاحقاً (مثلاً: `kalmeron-egypt-legal`, `kalmeron-fawry-payments`). |

---

## 3. كيف ثُبّتت

```bash
# مثبّتة عبر Vercel skills CLI (الموثّقة في AGENTS.md §10.1)
npx skills add google/skills --agent replit \
  --skill firebase-basics gemini-api cloud-run-basics \
          google-cloud-waf-security google-cloud-waf-reliability \
          google-cloud-waf-cost-optimization -y

npx skills add vercel-labs/agent-skills --agent replit \
  --skill vercel-react-best-practices vercel-composition-patterns \
          web-design-guidelines -y

npx skills add microsoft/agent-skills --agent replit \
  --skill frontend-design-review continual-learning -y

npx skills add anthropics/skills --agent replit \
  --skill mcp-builder skill-creator -y
```

**الملفّات الناتجة:**
- `.agents/skills/<skill-name>/SKILL.md` — محتوى المهارات (نسخ، ليس symlinks).
- `skills-lock.json` (في الجذر) — قفل الإصدار + hash لكلّ مهارة.
- `AGENTS.md §10.1` — جدول مرجعيّ + أوامر إدارة.

---

## 4. ما رفضناه ولماذا (شفافيّة كاملة)

| ما طُلب | الحكم | السبب |
|---|---|---|
| `Antigravity/skills` | ❌ غير موجود | المستودع 404 على GitHub. |
| `okskills/skills` | ❌ غير موجود | المستودع 404 على GitHub. |
| 425,000+ مهارة من `skillsmp.com` | ❌ مرفوض | ادّعاء غير قابل للتحقّق؛ الـ`skills` CLI لا يدعم هذا المصدر. |
| 169,739 مهارة من `lobehub.com/skills` | ❌ مرفوض | LobeHub منصّة plugins لـ LobeChat، مفهوم مختلف عن Agent Skills. |
| 110,000+ مهارة من `agentskill.sh` | ❌ مرفوض | لم نتحقّق من وجود الموقع كمستودع موثّق. |
| `business-growth-skills`, `marketing-skills` (alirezarezvani) | ⏸️ مؤجّل | حزم ضخمة (40+ مهارة لكلّ منها) موجّهة لكتابة كود business intelligence — **ليست** للوكلاء وقت التشغيل. تحتاج تقييماً يدوياً قبل التبنّي. |
| `claude-api` (anthropics) | ⏸️ غير ضروري الآن | كلميرون لا يستخدم Anthropic SDK (Gemini فقط). نُضيفها يوم نُدخل Claude. |
| `vercel-react-native-skills` | ❌ مرفوض | كلميرون ويب فقط (لا React Native). |
| `kql`, `entra-agent-id` (microsoft) | ❌ مرفوض | منصّة Azure — كلميرون على Firebase/GCP. |
| `c-level-advisor`, `pm-skills`, `ra-qm-skills` (alirezarezvani) | ⏸️ مؤجّل | مهارات قطاعيّة (طبّيّة/ISO 13485) — خارج نطاق MVP المصري الحالي. |

**القاعدة:** كلّ مهارة مُثبّتة لها **مبرّر ملموس** (إمّا تستهدف ملفّاً موجوداً، أو ركيزة من ركائز AGENTS.md، أو خطّة خارطة الطريق). لا "noise" في الـ context window.

---

## 5. اختبار التحقّق

```bash
✓ npx skills list                       # 13 مهارة ظاهرة في scope project
✓ ls .agents/skills/                    # 13 مجلّد، كلّ منها يحوي SKILL.md
✓ cat skills-lock.json                  # 13 مدخل مع computedHash
✓ Start application workflow            # لم يتأثّر (المهارات ملفّات .md فقط)
✓ AGENTS.md §10.1                       # موثّقة + أوامر الإدارة
```

**ما لم نختبره ولماذا:** لا توجد طريقة آليّة لقياس "هل تحسّن أداء الوكلاء؟" — هذه مهارات guidance، نتائجها تظهر في:
1. مراجعة كود الـ PR التالي.
2. صحّة الاقتراحات حين تطلب من Replit Agent مثلاً "أضف Firestore index".
3. خفض عدد جولات السؤال-الجواب لإنجاز مهمّة.

---

## 6. الخطوات التالية المقترحة

### قصير المدى (هذا الأسبوع)
1. **اختبر** بطلب مهمّة تستدعي مهارة (مثلاً: "أضف rate limiting لـ `app/api/agents/route.ts` متوافقاً مع Firebase Functions" — يجب أن يقرأ Replit Agent `firebase-basics` و `google-cloud-waf-security`).
2. **شغّل** `npx skills update -p -y` كلّ أسبوعين لجلب التحديثات.

### متوسّط المدى (الشهر القادم)
3. **أنشئ مهارة محلّيّة** `kalmeron-egypt-legal` تحت `.agents/skills/` تلخّص قواعد القوانين 159/2018، 151/2020، إلخ، حتّى يستهلكها أيّ وكيل برمجيّ بدل البحث في `data/egypt-legal/`.
4. **أنشئ مهارة محلّيّة** `kalmeron-fawry-integration` تشرح API الـFawry/Stripe webhook patterns.
5. **استخدم** `mcp-builder` لتنظيف وتقوية `app/mcp-server/`.

### طويل المدى (Q3 2026)
6. **ADR منفصل** لتقرير: هل ندمج Agent Skills في runtime عبر loader مخصّص داخل LangGraph؟ هذا قرار معماريّ كبير له تبعات على cost/latency.

---

## 7. روابط مرجعيّة

- معيار Agent Skills (Anthropic): https://www.anthropic.com/news/agent-skills
- `skills` CLI: https://www.npmjs.com/package/skills · https://github.com/vercel-labs/skills
- Anthropic skills repo: https://github.com/anthropics/skills
- Vercel-Labs skills repo: https://github.com/vercel-labs/agent-skills
- Google skills repo: https://github.com/google/skills
- Microsoft skills repo: https://github.com/microsoft/agent-skills

---

**ملاحظة أخيرة:** الادّعاء بـ "425,000 مهارة" يبدو تسويقاً مبالغاً فيه. الواقع المُتحقّق منه: ~110 مهارة عالية الجودة موزّعة على 5-6 مستودعات رسميّة + مجتمعيّة. الجودة > الكمّيّة.

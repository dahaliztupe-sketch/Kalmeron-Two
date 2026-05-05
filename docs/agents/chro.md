# Agent System Card — CHRO (Chief Human Resources Officer)

**Version:** 1.0 · **Last reviewed:** 2026-05-05 · **Owner:** فريق المنتج / كلميرون

## 1. Purpose

يُقدم مستشاراً في الموارد البشرية مُتخصصاً في السوق المصري: هياكل الرواتب، استقطاب المواهب، بناء الثقافة المؤسسية، إدارة الأداء، وتقليل معدلات الدوران الوظيفي.

## 2. Capabilities

- بناء هيكل رواتب تنافسي (benchmarked للسوق المصري 2025)
- تصميم خطط Hiring بميزانيات محدودة
- بناء ثقافة مؤسسية وقيم قابلة للتطبيق
- إدارة حالات الأداء المنخفض وإنهاء الخدمة
- تصميم Onboarding فعّال لـ 30-60-90 يوماً

## 3. Out-of-scope

- صياغة عقود العمل القانونية (راجع Legal Guide)
- معالجة الرواتب أو الدفع للموظفين
- التوصية بأفراد محددين للتوظيف

## 4. Risk class (EU AI Act)

**Limited** — يؤثر على قرارات التوظيف والفصل. يُشترط الشفافية الكاملة.

## 5. Data touched

| Data | Source | Stored? | Retention |
|---|---|---|---|
| معلومات الفريق (input) | المستخدم | `agent_memory/{uid}/chro` | 10 محادثات |
| التوصيات (output) | AI generated | لا يُخزَّن | لا |

## 6. Tools available

- `chro.hiring` — استراتيجية التوظيف
- `chro.compensation` — هياكل الرواتب
- `chro.culture` — بناء الثقافة
- `chro.performance` — إدارة الأداء

## 7. Known failure modes

- بيانات الرواتب قد لا تعكس أحدث مستجدات السوق (تُحدَّث ربع سنوياً)
- توصيات الثقافة قد تحتاج تكييفاً للقطاعات المحافظة

## 8. Evaluation

- Golden-set: `test/eval/golden-dataset.json` — مجموعة `hr-*`
- Acceptance threshold: 0.80

## 9. Human-in-the-loop

- قرارات التوظيف والفصل تعود للإدارة البشرية الفعلية

## 10. Disclosures shown to user

- "التوصيات عامة — تأكد من الامتثال لقانون العمل المصري رقم 12 لسنة 2003."

## 11. Change log

| Date | Change | Reviewer |
|---|---|---|
| 2026-05-05 | أول system card رسمي | فريق AI |

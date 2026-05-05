# Agent System Card — COO (Chief Operating Officer)

**Version:** 1.0 · **Last reviewed:** 2026-05-05 · **Owner:** فريق المنتج / كلميرون

## 1. Purpose

يُقدم مستشار تشغيل متخصصاً في تصميم الأنظمة والعمليات للشركات الناشئة المصرية: OKRs، دورات المراجعة، مؤشرات الأداء، وأدوات إدارة العمليات المناسبة لكل مرحلة نمو.

## 2. Capabilities

- بناء نظام OKRs مُدرَّج (شركة → فريق → فرد)
- تصميم دورات العمليات (اجتماعات، تقارير، checkpoints)
- اختيار أدوات إدارة المشاريع المناسبة
- قياس DORA metrics وتحسين سرعة التسليم
- تشخيص اختناقات العمليات وحلول التحسين

## 3. Out-of-scope

- تنفيذ تغييرات في الأنظمة مباشرة
- إدارة الموارد البشرية التفصيلية (راجع CHRO)
- التحليل المالي (راجع CFO Agent)

## 4. Risk class (EU AI Act)

**Minimal** — توصيات تشغيلية، لا تأثير مباشر على بيانات حساسة.

## 5. Data touched

| Data | Source | Stored? | Retention |
|---|---|---|---|
| سياق العمليات (input) | المستخدم | `agent_memory/{uid}/coo` | 10 محادثات |
| التوصيات التشغيلية (output) | AI generated | لا يُخزَّن | لا |

## 6. Tools available

- `coo.operations` — تحليل العمليات
- `coo.okr` — بناء OKRs
- `coo.tools` — توصيات الأدوات

## 7. Known failure modes

- OKRs مقترحة قد تكون طموحة جداً لمرحلة الشركة
- توصيات الأدوات قد لا تأخذ الميزانية بعين الاعتبار

## 8. Evaluation

- Golden-set: `test/eval/golden-dataset.json` — مجموعة `coo-*`
- Acceptance threshold: 0.80

## 9. Human-in-the-loop

- جميع التوصيات تُراجَع من الفريق قبل التطبيق

## 10. Disclosures shown to user

- "توصيات العمليات عامة — خصّصها وفق ثقافة فريقك وقطاعك."

## 11. Change log

| Date | Change | Reviewer |
|---|---|---|
| 2026-05-05 | أول system card رسمي | فريق AI |

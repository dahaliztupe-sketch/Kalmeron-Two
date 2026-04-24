# Agent System Card — Operations Agent (مساعد العمليات)

**Version:** 1.0 · **Last reviewed:** 2026-04-24 · **Owner:** Ops Pod

## 1. Purpose
يُساعد المؤسس على بناء العمليات الداخلية: SOPs، أدوات سير العمل، أتمتة المهام المتكرّرة، وتحسين الكفاءة التشغيلية.

## 2. Capabilities
- تصميم Standard Operating Procedures (SOPs) لعمليات شائعة.
- اقتراح أدوات SaaS مناسبة للميزانية والمرحلة.
- توليد قوائم فحص (Checklists) للعمليات الحرجة.
- تحليل bottlenecks في عمليات موصوفة.

## 3. Out-of-scope
- لا يُنفّذ العمليات فعلياً ولا يربط أدوات خارجية بدون إذن صريح.
- لا يُقدّم نصيحة هندسية مفصّلة لعمليات صناعية متخصّصة.

## 4. Risk class — Minimal.

## 5. Data touched
| Data | Source | Stored? | Retention |
|---|---|---|---|
| وصف العملية | إدخال | في `processes/{id}` | حتى الحذف |

## 6. Tools available
`rag.search`, `template.fill` (intent: `ops_design`).

## 7. Known failure modes
- اقتراح أدوات SaaS لا تعمل في السوق المصري (مشاكل دفع/تكامل).
- تجاهل التكلفة الحقيقية بالعملة المحلية.
- إفراط في البيروقراطية لشركة في مرحلة Seed.

## 8. Evaluation
- 20 سيناريو يقيّم: واقعية الأدوات، مناسبة المرحلة، شمولية الـ SOP.

## 9. Human-in-the-loop
لا — اقتراحات تشغيلية فقط.

## 10. Disclosures
- "هذه استرشادات تنظيمية. اختبر أي SOP أو أداة جديدة على نطاق صغير قبل التعميم."

## 11. Change log
| Date | Change | Reviewer |
|---|---|---|
| 2026-04-24 | First public card | Ops Eng |

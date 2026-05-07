# Agent System Card — SEO Manager (مدير تحسين محركات البحث)

**Version:** 1.0 · **Last reviewed:** 2026-05-07 · **Owner:** Marketing Pod

## 1. Purpose
يُرشد الشركات الناشئة المصرية على تصدّر نتائج Google في مصر والسعودية والإمارات: On-Page SEO للمحتوى العربي، Technical SEO، Keyword Research العربي، Link Building، وقياس الأداء.

## 2. Capabilities
- تحليل SEO للمواقع العربية وتحديد الفرص والفجوات.
- Keyword Research بالعربية (بما يشمل العامية المصرية).
- تحسين On-Page SEO (Title, Meta, H-Tags, Schema).
- توجيه Technical SEO (Core Web Vitals, Crawlability, Mobile).
- استراتيجية Link Building للمواقع العربية.
- قياس الأداء عبر Google Search Console.

## 3. Out-of-scope
- لا يُنفّذ تعديلات تقنية مباشرة على المواقع.
- لا يضمن ترتيباً محدداً في نتائج Google.
- نتائج SEO تتأخر 3-6 أشهر بطبيعتها.

## 4. Risk class — **Limited**
إرشادات SEO استرشادية؛ النتائج تتوقف على التنفيذ والمنافسة.

## 5. Data touched
| Data | Source | Stored? | Retention |
|---|---|---|---|
| بيانات الموقع والكلمات المفتاحية | إدخال | في `business_plans/{id}` | حتى الحذف |

## 6. Tools available
`rag.search` (intent: `seo_strategy`).

## 7. Known failure modes
- توصيات كلمات مفتاحية بفصحى لا تعكس لغة البحث الفعلية بالعامية.
- Core Web Vitals benchmarks مبنية على شبكات إنترنت سريعة لا الواقع المصري.
- توقعات نمو SEO أسرع مما تسمح به طبيعة الخوارزمية.

## 8. Evaluation
- Golden set: 25 تحليل SEO مع مراجعة خبراء.
- عتبة قبول: 0.80.

## 9. Human-in-the-loop
لا — إرشادات تقنية استرشادية.

## 10. Disclosures
- "SEO استثمار طويل المدى. توقّع نتائج واضحة بعد 3-6 أشهر من التنفيذ المنتظم."

## 11. Change log
| Date | Change | Reviewer |
|---|---|---|
| 2026-05-07 | First public card (Wave 6) | Marketing Pod |

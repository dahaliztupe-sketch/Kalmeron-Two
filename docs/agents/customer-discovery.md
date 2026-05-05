# Agent System Card — Customer Discovery

**Version:** 1.1 · **Last reviewed:** 2026-05-05 · **Owner:** فريق المنتج / كلميرون

## 1. Purpose

يساعد مؤسسي الشركات الناشئة في التحقق من فرضياتهم التجارية عبر: بناء بروفايل العميل المستهدف (Persona)، واقتراح منهجيات اكتشاف العميل (Mom Test, Jobs-to-be-Done)، وسكريبت مقابلات جاهز للتنفيذ، مع تصدير Persona كـ PDF.

## 2. Capabilities

- بناء Persona Card كاملة: الديموغرافيا، الألم، الدوافع، ممارسات الشراء
- اختبار فرضيات العمل (hypothesis validation framework)
- توليد سكريبت مقابلة Mom Test جاهز بالعربية
- تصدير Persona PDF (`/api/customer-discovery/persona-pdf`)
- تحليل نتائج المقابلات وتصنيف الألم (حقيقي vs مصطنع)

## 3. Out-of-scope

- إجراء مقابلات حقيقية مع عملاء (وكيل استشاري فقط)
- تجميع بيانات من الإنترنت عن عملاء حقيقيين
- ضمان Product-Market Fit — هذا قرار بشري

## 4. Risk class (EU AI Act)

**Minimal** — الوكيل يقدم أدوات تحليلية. لا يعالج بيانات شخصية لأطراف ثالثة.

## 5. Data touched

| Data | Source | Stored? | Retention |
|---|---|---|---|
| الفكرة التجارية + الشريحة (input) | المستخدم | لا يُخزَّن | لا |
| Persona text (output) | AI generated | لا يُخزَّن | لا |
| PDF المُصدَّر | generated | لا يُخزَّن | لا |

## 6. Tools available

- `discovery.persona` — بناء Persona Card
- `discovery.hypothesis` — اختبار الفرضيات
- `discovery.interview` — توليد سكريبت المقابلة

## 7. Known failure modes

- Persona قد تعكس تحيزات في وصف المستخدم لشريحته
- سكريبت المقابلة قد يحتاج تخصيصاً ثقافياً إضافياً لمناطق خارج مصر
- PDF export يعود لـ HTML إذا لم يتوفر puppeteer

## 8. Evaluation

- Golden-set: `test/eval/golden-dataset.json` — مجموعة `discovery-*`
- Acceptance threshold: 0.80
- تُقيَّم على: دقة Persona، جودة الأسئلة، قابلية التنفيذ

## 9. Human-in-the-loop

- لا يتخذ الوكيل قرارات — كل مخرجاته قابلة للمراجعة والتعديل
- المستخدم يجري المقابلات الحقيقية ويعود للتحليل

## 10. Disclosures shown to user

- "هذه Persona نموذجية — تحقق منها مع عملاء حقيقيين."
- "المقابلات الأفضل تستخدم هذا السكريبت كنقطة بداية لا نص جامد."

## 11. Change log

| Date | Change | Reviewer |
|---|---|---|
| 2026-05-05 | إضافة تصدير Persona PDF | فريق AI |
| 2026-04-10 | إطلاق الوكيل (v1.0) | فريق المنتج |

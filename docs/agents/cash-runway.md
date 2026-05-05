# Agent System Card — Cash Runway

**Version:** 1.1 · **Last reviewed:** 2026-05-05 · **Owner:** فريق المنتج / كلميرون

## 1. Purpose

يحسب مدة البقاء النقدي (runway) للشركات الناشئة المصرية، ويرسل تنبيهات استباقية (بريد إلكتروني + إشعار داخل التطبيق) حين يقترب النقد من عتبة الخطر، مع توصيات أولوية مُخصَّصة.

## 2. Capabilities

- حساب runway بالشهور بناءً على: الرصيد، الدخل الشهري، الإنفاق
- تنبيهات تلقائية يومية (cron) حين runway < threshold
- إشعارات داخل التطبيق (`users/{uid}/notifications`)
- إرسال بريد إلكتروني عربي مع 3 توصيات مُرتَّبة بالأولوية
- تحليل سيناريوهات متعددة (تخفيض الإنفاق، زيادة الدخل، إلخ)

## 3. Out-of-scope

- تنفيذ تحويلات مالية أو طلبات بنكية
- توقعات الإيرادات المستقبلية (تحليل مستشاري فقط، لا ضمانات)
- مقارنة مع بنوك أو منتجات مالية

## 4. Risk class (EU AI Act)

**Limited** — يؤثر على قرارات مالية، لكنه تنبيهي بحت. لا يُنفّذ أي إجراء مالي تلقائياً.

## 5. Data touched

| Data | Source | Stored? | Retention |
|---|---|---|---|
| الرصيد + الإنفاق (input) | المستخدم | Firestore: `runway_snapshots/{uid}` | حتى الحذف |
| الإشعارات (output) | AI + cron | Firestore: `users/{uid}/notifications` | 90 يوماً |
| البريد الإلكتروني | `users/{uid}.email` | لا يُخزَّن | لا |

## 6. Tools available

- `runway.calc` — حساب runway و belowThreshold
- `runway.recommendations` — توليد 3 توصيات أولوية
- `notifications.write` — كتابة إشعار Firestore

## 7. Known failure modes

- حساب runway يفترض إنفاقاً ثابتاً — في الواقع قد يتغير
- إذا لم يُحدَّث المستخدم أرقامه شهرياً، التنبيهات قد تكون غير دقيقة
- فشل إرسال البريد لا يمنع كتابة إشعار Firestore (independent paths)

## 8. Evaluation

- Golden-set: `test/eval/golden-dataset.json`
- Acceptance threshold: 0.80
- تُقيَّم على: دقة الحساب، جودة التوصيات، استجابة التنبيه

## 9. Human-in-the-loop

- لا يتخذ الوكيل قرارات مالية تلقائياً
- المستخدم يمكنه "إسكات" التنبيه (`dismissedUntil`) لمدة محددة

## 10. Disclosures shown to user

- "حسابات runway تقديرية بناءً على بياناتك — استشر محاسباً للقرارات الكبرى."
- "التوصيات مولّدة آلياً ولا تمثّل نصيحة استثمارية."

## 11. Change log

| Date | Change | Reviewer |
|---|---|---|
| 2026-05-05 | إضافة إشعارات Firestore داخل التطبيق | فريق AI |
| 2026-04-15 | إطلاق الوكيل (v1.0) + تنبيهات البريد | فريق المنتج |

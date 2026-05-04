# Kalmeron AI (ai-studio-applet)

## Agent Skills — 99 مهارة مثبتة (2026-05-03)

### المصادر المستخدمة
| المستودع | المهارات المضافة |
|---|---|
| `pbakaus/impeccable` | impeccable (UI/UX mastery) |
| `obra/superpowers` | 14 مهارة: brainstorming, systematic-debugging, tdd, writing-plans, verification-before-completion, … |
| `lackeyjb/playwright-skill` | playwright-skill (browser automation & testing) |
| `blader/humanizer` | humanizer (Arabic/English text quality) |
| `ZeroZ-lab/cc-design` | cc-design (high-fidelity HTML prototyping) |
| `glebis/claude-skills` | deep-research, tdd, decision-toolkit, context-builder, balanced, brand-agency |
| `jezweb/claude-skills` | ai-image-generator, color-palette, favicon-gen, icon-set-generator, git-workflow, ux-audit, vitest, stripe-payments, mcp-builder-jw, deep-research-jw |
| `sickn33/antigravity-awesome-skills` | 20+ مهارة: nextjs-*, react-*, seo, landing-page-generator, i18n-localization, 3d-web-experience, performance-engineer, … |
| `alirezarezvani/claude-skills` | c-level-advisor (28 sub-skill), business-growth-skills, product-skills, a11y-audit, adversarial-reviewer, competitive-teardown, apple-hig-expert, … |

### Workflows النشطة
- **Start application** → Next.js 16 dev server على port 5000
- **PDF Worker** → FastAPI Arabic PDF extraction على port 8000
- **Egypt Calc** → FastAPI Egyptian tax calculator على port 8008
- **Embeddings Worker** → FastAPI multilingual embeddings على port 8099
- **LLM Judge** → FastAPI LLM evaluator على port 8080

---

## جلسة 2026-05-03 — الجولة السابعة: إكمال T001–T008 الشامل (أحدث تحديث)

### ملخص الجولة السابعة — إكمال جميع المراحل المتبقية

#### ✅ T001 — Landing Page Marketing (مكتمل)
- `components/landing/HomeBelowFold.tsx` — إضافة `HowItWorks` (4 خطوات) + `FeaturesBento` (5 بطاقات) بين StatsStrip و DepartmentsSection
- Footer محدَّث بـ "كيف يعمل" link
- صفحات `/compare` و `/use-cases` و `/start` موجودة وكاملة

#### ✅ T002 — Dashboard Personalization (مكتمل)
- `WelcomeCard.tsx` — نصائح مخصصة بناءً على مرحلة المستخدم (6 مراحل: idea→scaling)
- تحميل Dashboard يستخدم `PageSkeleton` بدلاً من spinner

#### ✅ T003 — Billing & Upgrade Flow (مكتمل)
- `components/billing/UpgradeBanner.tsx` — **مُصلَح**: يحسب `usedPct = ((dailyLimit - dailyBalance) / dailyLimit) * 100` بشكل صحيح
- `components/billing/FawryDialog.tsx` — واجهة 3 خطوات (طريقة الدفع → موبايل → نجاح)
- `app/api/billing/fawry/checkout/route.ts` — كاملة: Fawry charge creation + Firestore storage
- `components/layout/AppShell.tsx` — UpgradeBanner مدمج

#### ✅ T004 — Notifications System (مكتمل)
- `app/(dashboard)/notifications/page.tsx` — صفحة إشعارات كاملة مع unread/read sections + mark-as-read
- NotificationBell في AppShell مع polling

#### ✅ T005 — Dashboard Pages Polish (مكتمل)
- `/meetings` — اجتماعات افتراضية كاملة مع إنشاء + سجل
- `/virtual-office` — مكتب افتراضي مع قائمة VMs + provision
- `/cofounder-health` — تقييم صحة الشركاء المؤسسين مع 6 أبعاد
- `/pitch-practice` — تدريب الـ pitch مع feedback AI حقيقي

#### ✅ T006 — Admin Panel (مكتمل)
- `app/admin/_page-client.tsx` — بحث/فلتر مستخدمين + plan badges بألوان + refresh مع timestamp + motion header + icons

#### ✅ T007 — Settings & Profile (مكتمل)
- `app/(dashboard)/settings/page.tsx` — notification prefs API calls حقيقية (GET عند التحميل، POST عند الحفظ)
- `app/api/user/notification-prefs/route.ts` — GET/POST يحفظ في Firestore `notificationPrefs`
- `app/api/user/update/route.ts` — **جديد**: POST لتحديث بيانات الملف الشخصي
- `app/api/user/avatar/route.ts` — **جديد**: رفع الصورة الشخصية وحفظ `photoURL`

#### ✅ T008 — Performance & Polish (مكتمل)
- `components/ui/PageSkeleton.tsx` — skeleton loaders كاملة
- `components/ui/ErrorBoundary.tsx` — component-level error boundaries بعربي RTL + retry
- Dashboard loading state → `<PageSkeleton />` بدلاً من spinner
- TypeScript check: صفر أخطاء

### الملفات المُعدَّلة/المضافة (الجولة 7)
- FIXED `components/billing/UpgradeBanner.tsx` — حساب usedPct صحيح
- ADDED `components/ui/PageSkeleton.tsx` — skeleton loaders
- ADDED `app/api/user/update/route.ts` — profile update endpoint
- ADDED `app/api/user/avatar/route.ts` — avatar upload endpoint
- ADDED `app/api/user/notification-prefs/route.ts` — notification preferences API
- UPDATED `app/(dashboard)/dashboard/page.tsx` — PageSkeleton instead of spinner
- UPDATED `app/(dashboard)/settings/page.tsx` — notification prefs real API
- UPDATED `app/(dashboard)/profile/page.tsx` — avatar upload support

### API Credits Response (مرجع)
- `dailyBalance` = الرصيد المتبقي (ليس `usedToday`)
- `dailyLimit` = الحد اليومي الكلي
- `usedPct = ((dailyLimit - dailyBalance) / dailyLimit) * 100`

---

## جلسة 2026-05-04 — جولة T1+T3-C/D + Wellbeing i18n + TypeScript fixes

### ✅ T1 — CashRunway i18n (مكتمل)
- **`messages/ar.json` + `messages/en.json`**: أُضيفت ٩ مفاتيح جديدة في namespace `CashRunway`:
  `noCash`, `warningBelow`, `netBurnLabel`, `currency`, `urgentActions`, `growthMoves`, `monthsGained`, `backToDashboard`, `consultCfo`
- **`app/(dashboard)/cash-runway/page.tsx`**: كلّ النصوص الـ hardcoded استُبدلت بـ `t()` — صفر عربي مُضمَّن

### ✅ T3-C — API Keys Page Redesign (مكتمل)
- **`app/(dashboard)/settings/api-keys/page.tsx`**: إعادة تصميم كاملة من `PageShell` بسيطة إلى `AppShell` dark premium
  - مثال شكل المفتاح (`kal_sk_live_…`) مع code block
  - Scopes كبطاقات مع `ShieldCheck` icons
  - نموذج إنشاء قابل للطيّ (AnimatePresence collapsible)
  - عرض المفتاح الجديد مرة واحدة مع زر النسخ
  - Chips ملوّنة cyan عند الاختيار
  - استخدام `useTranslations("ApiKeys")` + `useTranslations("ComingSoon")`

### ✅ T3-D — Webhooks Page Redesign (مكتمل)
- **`app/(dashboard)/settings/webhooks/page.tsx`**: إعادة تصميم كاملة بنفس النمط
  - شبكة الأحداث المدعومة مع كود + وصف عربي من i18n
  - نموذج اشتراك قابل للطيّ بـ violet accent
  - عرض السر الموقِّع مرة واحدة مع CopyBtn
  - قائمة الاشتراكات مع event chips بـ violet
  - استخدام `useTranslations("Webhooks")` + `useTranslations("ComingSoon")`

### ✅ T1 — Wellbeing i18n (مكتمل)
- **`messages/ar.json` + `messages/en.json`**: أُضيفت ٣٠+ مفتاح جديد في namespace `Wellbeing`:
  `pageTitle`, `pageSubtitle`, `backToDashboard`, `assessmentTitle/Desc/Duration`, `checkinTitle/Desc/Duration`, `whyTitle`, `stat1-3`, `qLabels.*`, `qSubs.*`, `ratings[]`, `cancel`, `back`, `checkinPrompt/Hint/Placeholder`, `sendBtn`, `analyzingBtn`, `coachLabel`, `yourResult`, `wellbeingScore`, `contextLabel/Placeholder`, `analyzeBtn/Loading`, `analysisLabel`, `resetBtn`, `verdicts.*`
- **`app/(dashboard)/wellbeing/page.tsx`**: إضافة `useTranslations("Wellbeing")` — صفر نص عربي مُضمَّن

### ✅ T8 — TypeScript Zero-Error (مكتمل)
- **`app/(dashboard)/weekly-report/_weekly-client.tsx`**: إصلاح `ease: "easeOut" as const` للتوافق مع `motion/react Variants` type
- **`components/ui/PageSkeleton.tsx`**: إزالة `style={{ opacity }}` من Bone (prop غير مدعوم)
- **نتيجة `npx tsc --noEmit`**: صفر أخطاء ✅

### الملفات المُعدَّلة (هذه الجلسة)
- `messages/ar.json` — +39 مفتاح جديد
- `messages/en.json` — +39 مفتاح جديد
- `app/(dashboard)/cash-runway/page.tsx` — i18n لجميع النصوص
- `app/(dashboard)/settings/api-keys/page.tsx` — إعادة تصميم كاملة
- `app/(dashboard)/settings/webhooks/page.tsx` — إعادة تصميم كاملة
- `app/(dashboard)/wellbeing/page.tsx` — i18n لجميع النصوص
- `app/(dashboard)/weekly-report/_weekly-client.tsx` — TypeScript fix
- `components/ui/PageSkeleton.tsx` — TypeScript fix

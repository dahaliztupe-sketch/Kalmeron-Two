---
description: قواعد التصميم البصري والـ UX (RTL، عربي، Tailwind 4)
alwaysApply: true
---

# Design Rules — Kalmeron AI

## 1. الفلسفة
- **عربي أوّلاً، RTL أوّلاً.** كل صفحة تُختبَر RTL قبل LTR.
- **هادئ، احترافي، موثوق.** المستخدم مؤسّس شركة — لا نلعب.
- **سرعة قبل كل شيء.** First Contentful Paint < 1.8s، Largest Contentful Paint < 2.5s.
- **مكوَّنات صغيرة قابلة للتركيب.** كل ملف < 400 سطر؛ لو أكبر قسّم.

## 2. النظام البصري

### الخطوط
- **العناوين:** IBM Plex Arabic (وزن 700) — عربي
- **النصّ:** IBM Plex Arabic (وزن 400/500) — عربي
- **الأرقام/المقتطفات الإنجليزيّة:** Geist Sans
- **CTA الكبيرة:** Plus Jakarta (وزن 500/700)
- **Code:** لا monospace (لا تحميل JetBrains)

### الألوان (متغيّرات Tailwind في `app/globals.css`)
استخدم متغيّرات الـ theme فقط — لا hex مباشر. الـ palette موجود في `globals.css` تحت `@theme`.

### المساحات
- **Hero:** `py-12 sm:py-16 md:py-20`
- **Section:** `py-10 sm:py-14`
- **Card padding:** `p-4 sm:p-6 md:p-8`
- **Gap:** `gap-3` (compact)، `gap-6` (default)، `gap-10` (sections)

### الـ Radius
- **Buttons + inputs:** `rounded-2xl`
- **Cards:** `rounded-3xl`
- **Hero panels:** `rounded-[2.5rem]` (sm and up) / `rounded-3xl` (mobile)

## 3. RTL — قواعد ملزِمة
- استخدم `start`/`end` بدل `left`/`right` (Tailwind v4):
  - `ms-4` بدل `ml-4`
  - `pe-2` بدل `pr-2`
  - `text-start` بدل `text-left`
  - `border-s` بدل `border-l`
- الأيقونات الاتّجاهيّة (Arrow) لازم `rtl:rotate-180` أو استخدم `ChevronLeft`/`ChevronRight` بشكل صحيح.
- الـ flex direction لا يتغيّر مع `dir="rtl"` تلقائيّاً — استخدم `flex-row-reverse` لو احتجت.

## 4. الـ Mobile-First
- ابدأ بـ mobile design ثمّ أضف breakpoints:
  - `sm:` 640px+
  - `md:` 768px+
  - `lg:` 1024px+
  - `xl:` 1280px+
- اختبر على iPhone SE (375px) — أصغر شاشة شائعة.
- لا تستخدم `hover:` فقط بدون state بديل للموبايل (focus/active).
- Touch targets ≥ 44×44px.

## 5. الأداء
- **Hero أعلى الفولد:** server component إن أمكن، أو dynamic بـ `ssr: true`.
- **كل ما تحت الفولد:** `next/dynamic({ ssr: false })` — انظر `app/page.tsx` → `HomeBelowFold`.
- **الصور:** `next/image` دائماً، مع `sizes` صريحة.
- **الأنيميشن:** Framer Motion فقط لو ضروري؛ استخدم `transition-colors` بدل `transition-all`.
- **`Math.random()` في render:** ممنوع. احسب مرّة في `useMemo` أو constants خارج المكوّن.

## 6. الـ Accessibility
- كل image لازم `alt`.
- كل button لازم نص واضح أو `aria-label`.
- Color contrast ≥ AA (4.5:1 للنصّ العادي).
- Skip-to-content link في كل layout.
- `lang="ar"` + `dir="rtl"` في `<html>` (مُعرَّف في `app/layout.tsx`).
- Focus rings مرئيّة (لا `outline: none` بدون بديل).

## 7. الـ Components
- استخدم `components/ui/*` (shadcn) قبل ما تكتب primitive جديد.
- لو احتجت primitive مش موجود: راجع `@base-ui/react` أوّلاً.
- كل مكوّن جديد:
  - `components/<domain>/<name>.tsx`
  - `'use client'` فقط لو يحتاج state/effects/browser API
  - Props مع `interface` (ليس `type`) عشان تقبل extension
  - Default export ❌ — named export فقط

## 8. الكتابة (Copy)
- **العنوان الرئيسي:** ≤ 8 كلمات، فعل قويّ في البداية.
- **الـ CTA:** فعل أمر مباشر ("ابدأ مجاناً"، "احجز عرض").
- **الـ subtext:** ≤ 14 كلمة.
- **النبرة:** واثقة بدون مبالغة. استخدم "نحن" حين تتحدّث عن الفريق، "أنت" حين تخاطب المستخدم.
- **علامات الاقتباس العربيّة:** «...» (guillemets)، ليس "..." (يكسر JSX).

## 9. Dark Mode
- الـ system theme: `next-themes` (`ThemeProvider` في `app/layout.tsx`).
- لا تكتب `dark:bg-black` مباشرةً — استخدم متغيّرات `--background`/`--foreground`.
- Test كلا الوضعين قبل ما تسلّم.

## 10. ما يجب اختباره قبل التسليم
- [ ] iPhone SE (375px) RTL ✅
- [ ] iPad (768px) RTL ✅
- [ ] Desktop (1280px) RTL ✅
- [ ] Dark + Light mode ✅
- [ ] لا horizontal scroll على الموبايل ✅
- [ ] Lighthouse Performance ≥ 90 (`.lighthouserc.json`) ✅

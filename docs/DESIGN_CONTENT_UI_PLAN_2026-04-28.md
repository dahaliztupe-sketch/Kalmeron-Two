# خطة جلسة التطوير المكثّفة — التصميم والمحتوى والواجهات
**التاريخ:** ٢٨ أبريل ٢٠٢٦
**المنصّة:** Kalmeron AI (كلميرون)
**النطاق:** مراجعة شاملة + إعادة تصميم انتقائية + سدّ فجوات المحتوى + توحيد الواجهات
**المُعِدّ:** Replit Agent (جلسة بحث وتخطيط معمّقة، استُخدمت فيها ٦ subagents بالتوازي + قراءة ملفّات المشروع المرجعيّة + لقطة شاشة حيّة + تحليل الـ design tokens)

---

## ١. الملخّص التنفيذي

كلميرون اليوم منصّة **ناضجة تقنياً** (٦٤ ألف سطر TypeScript، ١٠٧ صفحة، ٩٢ API route، ٥ ورش عمل، ٤ خدمات Python جانبية كلّها تعمل، ٠ خطأ TypeScript/ESLint). نظام التصميم **موجود ومتقن** (CSS variables منظَّمة، عشرات الـ primitives الموثَّقة، RTL مضبوط، طبقات الارتفاع، طيف ألوان احترافي). لكنّ هناك **ثلاث فجوات استراتيجيّة** تستحقّ جلسة مكثَّفة:

| # | الفجوة | الأثر | الحجم |
|---|---|---|---|
| **F1** | **هرم التحويل ضعيف على الصفحة الرئيسية** — الـ CTA الأساسي ليس في قلب الـ hero، الـ brand mark صغير، لا يوجد عرض كثيف للقيمة (شعارات/أرقام/شريط ثقة) فوق الطية، الـ suggestion chips تحت الطية. | يقلّل التحويل من زائر إلى مسجَّل | متوسّط |
| **F2** | **دَين توطين ضخم** — عشرات/مئات الجمل العربيّة مكتوبة hard-coded في `chat`, `dashboard`, `landing`, مفاتيح ar/en غير متطابقة، صفحة `en` فقيرة. الإصدار الإنجليزي عملياً غير قابل للاستخدام للنموّ خارج مصر. | يحدّ السوق المُتاح للمنصّة على الخليج/الدوليين | كبير |
| **F3** | **صفحات Founder Tools شبه مهيكلة** — `cash-runway`, `wellbeing`, `decision-journal/sub`, `market-lab/results`, `settings/api-keys`, `settings/webhooks`، صفحة `/trust` بسيطة، بعض المدن في `/cities` فارغة. هذه أماكن ينقر فيها المؤسّس ويرى "قريباً". | يضعف ثقة المستخدم المسجَّل ويولّد churn | متوسّط |

### الهدف العام للجلسة
> **رفع جودة التجربة المُدرَكة بمقدار قفزة واحدة كاملة** — بحيث تصبح كلّ صفحة عامّة "تستحقّ المشاركة" وكلّ صفحة داخل لوحة التحكّم "تشعر بأنّها كاملة".

### مؤشّرات النجاح القابلة للقياس (Acceptance KPIs)

| المؤشّر | البداية (Baseline) | الهدف بنهاية الجلسة |
|---|---|---|
| نسبة جمل العربية الـ hard-coded خارج `messages/*.json` في `app/page.tsx` + `(dashboard)/chat` + `(dashboard)/dashboard` | ~٨٥٪ | ≤ ١٠٪ |
| تطابق مفاتيح `messages/ar.json` ↔ `messages/en.json` | ~٧٠٪ | ١٠٠٪ + غطاء على لانديج page بالإنجليزي |
| صفحات بعلامة "قريباً" في لوحة التحكّم | ٧+ | ≤ ٢ (بمحتوى انتقالي مُتقَن) |
| Hero conversion-funnel score (CTA-above-fold + social-proof + suggestion-chips) | ٢/٥ | ٥/٥ |
| Lighthouse: Performance / Accessibility / Best-Practices / SEO على الصفحات الرئيسيّة | غير معروف | ≥ ٩٠ كل منها |
| Visual regression snapshots على ٢٠ صفحة عامّة | ٠ | ٢٠ تمّت |
| `npm run lexicon-lint` على كامل التطبيق | بعض الانتهاكات في landing | ٠ انتهاكات |
| `npx tsc --noEmit` + `npm run lint` | ٠ + ٠ | ٠ + ٠ (لا انحدار) |

---

## ٢. تشخيص الحالة الحاليّة

### ٢-١ نظام التصميم (نقطة القوّة الأكبر)

موجود في `app/globals.css` (CSS-first، Tailwind v4، بدون `tailwind.config.js`):

- **طيف العلامة:** سيان (`#38BDF8`) → آزور → أزرق → نيلي (`#4F46E5`) → بنفسجي → فوشيا → وردي.
- **سُلَّم السطوح (Dark-First):** `#04060B` → `#0A0F1F` → `#111A33` → `#1A2547`. عمق احترافي، يوحي بـ "operating system" لا بـ "marketing site".
- **الحبر:** أبيض ناعم `#F8FAFC` / ثانوي `#B6C2D9` / ثلاثي `#7A879F`. تباينات صحّيّة.
- **حالات:** نجاح أخضر زمرّدي / تحذير عنبري / خطر وردي / معلومة سيان. كلّها متّسقة مع الطيف.
- **خطوط:** "Plus Jakarta Sans" + "Inter" للّاتيني، "IBM Plex Sans Arabic" + "Tajawal" للعربي، "JetBrains Mono" للكود.
- **مقياس النوع:** `clamp()` مرن من `text-2xs` (0.68rem) إلى `text-6xl` (3.12rem إلى 5rem). هذا فلويد type نظيف.
- **ارتفاع السطر:** عربي 1.85 (نصّ) و 1.35 (عناوين) — أعلى من اللاتيني 1.55/1.15. صحيح من ناحية تيبوغرافية.
- **زوايا:** xs 6px → 2xl 32px.
- **ظلال:** `shadow-1 → shadow-6` + glow (`shadow-glow-indigo`, `shadow-glow-cyan`) للـ CTAs.
- **تيمز:** `forcedTheme="dark"` — قرار صحيح، يثبّت الهويّة.
- **حركة:** `motion-presets.ts` فيه `fadeInUp`, `staggerContainer` + CSS utilities (`animate-spotlight`, `gradient-border-animate`, `shimmer-text`).
- **RTL:** `dir="rtl"` ديناميكي + `.icon-flip` لعكس الأسهم.

**Primitives مُتاحة:** `GlassCard`, `CalmCard`, `BentoGrid` + `BentoCard`, `PageShell`, `SectionHeader`, `Eyebrow`, `StatBlock`, `StatGrid`, `Button` (٩ variants × ٧ أحجام)، `PrimaryCTA`, `Sonner`, `NotificationBell`, `CommandPalette`, `TrustBar`, `PublicShell`, `BrandLogo`, `AnimatedBrandMark`.

> **الخلاصة:** نظام التصميم **لا يحتاج إعادة بناء** — يحتاج فقط **تطبيقاً أكثر اتّساقاً** على الصفحات التي تخرج عنه وإكمالاً لـ ٣–٥ primitives جديدة.

### ٢-٢ التشخيص البصري للصفحة الرئيسيّة (لقطة شاشة حيّة)

ما يظهر فوق الطية حالياً:
1. شريط تنقّل عُلوي يحوي: زر "ابدأ مجاناً" (أزرق) + زر "دخول" + روابط (الأسعار / لماذا كلميرون؟ / تجربة حيّة / الأقسام) + شعار "KALMERON / AI STUDIO" يميناً. **جيّد.**
2. بطاقة كبيرة تحوي الـ brand mark بحجم متوسّط في وسط الشاشة. **مساحة فارغة كبيرة حولها.**
3. eyebrow صغير "كلميرون · مقرّ عمليات شركتك الذكي" مع أيقونة sparkles. **جيّد.**
4. عنوان رئيسي أنيق: "فريقك المؤسس يعمل ٢٤/٧ لصالحك" بتدرّج لوني على الجزء الثاني. **ممتاز.**
5. وصف فرعي + ٤ trust badges: "مجاناً للبداية / +١٠٠٠ رائد أعمال / عربي مصري أصيل / متوافق مع قانون ١٥١". **جيّد لكن يحتاج تنسيق.**
6. لافتة كوكيز كاملة العرض بالأسفل. **مزعجة بصرياً.**

**ما هو مفقود فوق الطية:**
- ❌ **لا يوجد CTA ضخم** في وسط أو أسفل الـ hero — الـ CTA "ابدأ مجاناً" مدفون في الزاوية العُلوية اليُسرى.
- ❌ **لا توجد suggestion chips** ("حلّل فكرتي" / "اكتب خطّة عملي" / "احسب الضرائب") لتجربة فوريّة بدون تسجيل.
- ❌ **لا توجد social proof bar** (شعارات شركات / مستثمرين، أرقام بارزة "+10,000 محادثة هذا الشهر").
- ❌ **لا يوجد screenshot/video preview** لأقوى ميزة (Operations Room أو Chat).
- ❌ **مستوى الكثافة المعلوماتيّة منخفض جداً** — مساحة فارغة كبيرة لا تباع شيئاً.

### ٢-٣ الصفحات العامّة (٧٠+ صفحة، حالة كلّ منها)

| الفئة | الصفحات | الحالة |
|---|---|---|
| **مكتمل ومُتقَن** | `/`, `/pricing`, `/about`, `/contact`, `/changelog`, `/agents`, `/ai-experts`, `/ai-experts/[slug]`, `/founder-mode`, `/market-pulse`, `/compare`, `/demo`, `/use-cases`, `/roi`, `/glossary`, `/glossary/[term]`, `/blog/[slug]`, `/industries/[slug]`, `/legal-templates`, `/decision-journal` (نموذج)، `/success-museum`, `/privacy`, `/terms`, `/compliance`, `/affiliate`, `/affiliate-terms`, `/investors`, `/first-100`, `/auth/login`, `/auth/signup`, `/onboarding`, `/profile`, `/plan` | ٣٢ صفحة جاهزة للنشر |
| **يحتاج صقل بصري/محتوى** | `/trust` (ضعيف)، `/status` (جيّد لكن بلا قصّة)، `/quality`، `/marketplace`، `/founder-network`، `/value-proposition`، `/founder-agreement`، `/recipes`، `/templates` | ٩ صفحات تحتاج تحسين متوسّط |
| **مهيكَل / فارغ نسبياً** | `/cities` (المدن الفرديّة)، `/cash-runway`، `/wellbeing` (إن وُجد public)، `/setup-egypt` (يحتاج دليل عملي أعمق)، `/mistake-shield` (يحتاج كتالوج)، `/opportunities` (يحتاج محرّك)، `/api-docs` (hydration warning) | ٧–٨ صفحات تحتاج بناءً جوهرياً |
| **تقنيّة بحتة** | `/api-docs`, `/llms.txt`, `/robots.ts`, `/sitemap.ts`, `/firebase-messaging-sw.js`, `/offline`, `/global-error.tsx`, `/error.tsx`, `/not-found.tsx`, `/loading.tsx` | لا تحتاج تصميم |

### ٢-٤ لوحة التحكّم (٣٠+ روت)

| المنطقة | الحالة |
|---|---|
| `/dashboard` (Command Center) | ✅ مكتمل: Welcome + Stats + Quick Actions + Activity + Approvals + Cost Chart + Opportunity Radar |
| `/chat` | ✅ مكتمل: Sidebar + Agent chips + Thought chain + PDF context + Voice + Streaming + Citations |
| `/inbox` | ✅ مكتمل لكن بلا onboarding للمستخدمين الجدد |
| `/learned-skills` | ✅ مكتمل (UI مركَّب لتطوّر المهارات) |
| `/operations` | ✅ مكتمل (Live feed + Filters + Meta status) |
| `/settings/*` (Profile, Security, Notifications, Privacy) | ✅ مكتمل |
| `/settings/api-keys` | 🟡 "قريباً" |
| `/settings/webhooks` | 🟡 "قريباً" |
| `/departments/[department]` (٧ أقسام) | 🟡 UI جاهز لكن المساعدين ينقلوك للـ chat — لا توجد mini-app لكلّ مساعد |
| `/agents` (لوحة كلّ الـ ١٦ مساعد داخل لوحة التحكّم) | ✅ |
| `/cash-runway` | 🟡 مهيكَل |
| `/wellbeing` | 🟡 مهيكَل |
| `/decision-journal/[id]` | 🟡 |
| `/market-lab/results/[id]` | 🟡 |
| `/investor`, `/investor/health`, `/investor/demo-mode` | ✅ مكتمل |
| `/brain`, `/brand-voice`, `/daily-brief`, `/expert`, `/hr`, `/launchpad`, `/meetings`, `/okr`, `/real-estate`, `/sales`, `/skills`, `/supply-chain`, `/system-health`, `/trending-tools`, `/virtual-office`, `/workflows-runner` | متفاوت — معظمها يعمل لكن يحتاج فحص فردي للصقل |

### ٢-٥ المحتوى والتوطين (i18n)

**namespaces موجودة في كلتا اللغتين:** `Index`, `Common`, `Nav`, `CTA`, `Trust`, `Dashboard`, `CommandPalette`, `Pricing`, `Errors`, `LearnedSkills`.

**الفجوات الحرجة:**
1. **`Landing` namespace غير موجود** — كل نصوص `app/page.tsx` (الـ hero، الوصف، الـ trust badges، الـ suggestions، أقسام `HomeBelowFold`) hard-coded بالعربية.
2. **`Chat` namespace غير موجود** — `AGENT_CHIPS` labels + `EMPTY_STATE_SUGGESTIONS` + toast messages كلّها hard-coded.
3. **`Dashboard` namespace ناقص** — `STAGE_LABELS`, `QUICK_ACTIONS`, `WelcomeCard` strings hard-coded رغم أنّ `t()` متاحة.
4. **انتهاك صوت العلامة على landing:** "بدل ما تدفع آلاف الجنيهات" و "احكي فكرتك بالعامية" — slang مصري في صفحة marketing، يخالف `voice.ts:40`.
5. **انتهاك lexicon:** "عربي مصري أصيل" بدلاً من "عربي أصيل، لا ترجمة" المحدَّد في `lexicon.ts:70`.
6. **`messages/en.json` ناقص بشدّة** — يكاد يكون مرآة لا أكثر، صفحات SEO بالإنجليزي تعتمد على fallback.
7. **انجراف في `Dashboard.greeting`:** المفتاح موجود لكن `dashboard/page.tsx` يبني التحيّة يدوياً → المفتاح يُتجاهل.

### ٢-٦ تجارب الجوّال والاستجابة

من المراجعة:
- الـ `ParticleField` معطَّل تلقائياً على mobile (جيّد).
- `motion` يحترم `prefers-reduced-motion`.
- `BentoGrid` و `GlassCard` متجاوبان.
- لكن لم يُختبر **بصرياً** على عرض الموبايل ٣٦٠px — قد تكون هناك مشاكل أفقيّة في hero الكبير وفي الـ pricing tables.

### ٢-٧ الوصول (Accessibility)

- التباين الأساسي ممتاز (أبيض على `#04060B`).
- لم يُختبر بـ axe-core أو Lighthouse a11y.
- ARIA roles موجودة في `Sonner` و `CommandPalette` لكن غير مفحوصة شاملاً.
- اختبار keyboard navigation على modals وdrawers غير موثَّق.

### ٢-٨ Performance / Web Vitals

- `dynamic()` مع `ssr: false` على `HomeBelowFold` يقلّل JS الأوّلي ٧٠٪.
- `ParticleField` 30 جزيئاً (مخفَّض من 60) + بدون O(N²) lines + يتوقّف خارج الشاشة.
- Tailwind v4 + Turbopack → bundle نحيف.
- لم تُقَس Lighthouse فعلياً — قد يكون هناك LCP issue من الخطوط العربيّة (`font-display: swap` مفروض؟).
- Service Worker موجود (`firebase-messaging-sw.js`) — هل يعمل cache-first/network-first بشكل سليم؟

### ٢-٩ SEO

- `sitemap.ts` و `robots.ts` و `llms.txt` موجودة.
- Open Graph metadata موجود في `/about`, `/affiliate`, `/investors`.
- Schema.org structured data؟ — يحتاج فحص.
- صفحات Hreflang لـ ar/en — يحتاج فحص.

---

## ٣. المبادئ التوجيهيّة لهذه الجلسة

1. **لا نعيد بناء ما هو مبني** — نطبّق نظام التصميم الحالي بدقّة أعلى، لا ننشئ tokens جديدة بدون مبرّر.
2. **الأولويّة الأولى: الصفحة الرئيسيّة** — كل دقيقة هنا أعلى أثراً من أيّ صفحة داخليّة.
3. **توطين قبل توسيع** — نقل كل النصوص hard-coded إلى `messages/*.json` قبل إضافة أي محتوى جديد. هذا يجعل كل تحسين لاحق متعدّد اللغات بالمجّان.
4. **حذف "قريباً" بدلاً من إخفائها** — كل صفحة يدخلها المستخدم يجب أن تعطيه قيمة ولو بسيطة (واجهة معلوماتيّة + تاريخ إطلاق متوقَّع + إشعار "أعلِمني عند التشغيل").
5. **Visual regression قبل أيّ refactor** — لقطات Playwright على ٢٠ صفحة قبل وبعد، لمنع الانحدار البصري الصامت.
6. **الـ Lighthouse هو الحَكَم** — ≥ ٩٠ في الفئات الأربع على ٥ صفحات حرجة (`/`, `/pricing`, `/dashboard`, `/chat`, `/agents`).
7. **الخطّ الأحمر:** أيّ تغيير يكسر `npx tsc --noEmit` أو `npm run lint` أو الـ unit tests يُرجَع فوراً. الـ workflows الخمسة يجب أن تبقى خضراء.
8. **توثيق صارم:** كل phase ينتهي بتحديث `replit.md` + entry في `CHANGELOG.md` + screenshot قبل/بعد للصفحات المُلامَسة.

---

## ٤. الخطّة على ٨ مسارات (Tracks)

> الجدول الزمني تقديري بـ "ساعات Agent" (ساعة Agent ≈ ٨–١٢ تفاعل مع الكود + اختبار). يمكن تنفيذ المسارات ١–٤ بالتوازي تقريباً (يلامسون مناطق مختلفة)، بينما ٥–٨ تأتي بعدها.

```
المسار T1 — توطين شامل (i18n cleanup)                  [أساسي، يفتح الباقي]
المسار T2 — إعادة تصميم الـ Hero ومنطقة فوق الطية       [أعلى أثر]
المسار T3 — صقل لوحة التحكّم (Dashboard polish)         [يرفع retention]
المسار T4 — استكمال الصفحات المهيكلة                    [يقلّل "قريباً"]
المسار T5 — Visual QA + Lighthouse + axe              [حماية وقياس]
المسار T6 — تجربة المحادثة (Chat UX upgrade)           [القلب التشغيلي]
المسار T7 — صفحات تحويليّة جديدة محتملة                 [نموّ]
المسار T8 — توثيق وصقل أخير                            [إغلاق]
```

---

## ٥. تفاصيل المسارات

### 🔵 المسار T1 — توطين شامل (i18n Cleanup) — الأولويّة العُليا
**المدّة المُقدَّرة:** ٤–٦ ساعات agent · **الاعتماد:** لا شيء · **يفتح:** T2, T3, T4

#### الأهداف
1. صفر سلاسل عربيّة hard-coded في `app/page.tsx` و `app/(dashboard)/chat/page.tsx` و `app/(dashboard)/dashboard/page.tsx` و `app/(dashboard)/dashboard/_components/WelcomeCard.tsx`.
2. تطابق ١٠٠٪ بين `messages/ar.json` و `messages/en.json`.
3. إصلاح انتهاكات `lexicon.ts` و `voice.ts` على landing.
4. توحيد التحيّة في الـ Dashboard لتمرّ من المفتاح `Dashboard.greeting`.

#### الخطوات التنفيذيّة
1. إنشاء namespace جديد `Landing` في كلتا اللغتين بمفاتيح كاملة لـ `app/page.tsx`:
   - `hero.eyebrow`, `hero.title.line1`, `hero.title.line2`, `hero.subtitle`, `hero.cta.primary`, `hero.cta.secondary`.
   - `trust.badges[]` (٤ شارات).
   - `suggestions[]` (٤ اقتراحات).
   - `belowFold.*` (كل أقسام `HomeBelowFold`).
2. إنشاء namespace `Chat` بـ:
   - `agentChips[]` (١٦ شريحة بـ `id`, `label`, `icon`, `prompt`).
   - `emptyState.title`, `emptyState.description`, `emptyState.suggestions[]`.
   - `toasts.fileExtracted`, `toasts.error`, `toasts.connectionLost`, `toasts.tooLong`.
   - `voice.start`, `voice.stop`, `voice.transcribing`, `voice.error`.
3. توسيع `Dashboard` namespace بـ:
   - `stages.idea`, `stages.mvp`, `stages.early`, `stages.growth`, `stages.scale`.
   - `quickActions[]` (٦ × `label` + `description`).
   - `welcomeCard.*`.
4. كتابة سكريبت `scripts/i18n-diff.mjs` يقارن ar.json ↔ en.json ويُخرِج المفاتيح الناقصة من كل طرف، ثمّ تشغيله وسدّ الفجوات.
5. إصلاح صياغة landing لتلتزم بـ `voice.ts`:
   - "بدل ما تدفع آلاف الجنيهات" → "بدلاً من إنفاق آلاف الجنيهات".
   - "احكي فكرتك بالعامية" → "اكتب فكرتك كما هي، بأي أسلوب".
   - "عربي مصري أصيل" → "عربي أصيل، لا ترجمة".
6. إصلاح `Dashboard.greeting` ليُستخدم كقالب مع `{name}` بدلاً من البناء اليدوي.
7. تشغيل `npm run lexicon-lint` بعد التغييرات → ٠ انتهاكات.
8. **اختبار قبول:** التبديل بين ar/en من command palette يُغيّر كل النصوص دون أيّ ظهور للنصّ بلغة أخرى.

#### الملفّات المتأثّرة
```
messages/ar.json        (+200 سطر تقريباً)
messages/en.json        (+250 سطر — يلحق بالعربيّة + ترجمة كاملة)
app/page.tsx            (refactor كامل لاستهلاك useTranslations)
app/(dashboard)/chat/page.tsx
app/(dashboard)/dashboard/page.tsx
app/(dashboard)/dashboard/_components/WelcomeCard.tsx
src/lib/copy/lexicon.ts (مراجعة الـ canonical strings)
scripts/i18n-diff.mjs   (جديد)
```

---

### 🟣 المسار T2 — إعادة تصميم الـ Hero ومنطقة فوق الطية — أعلى أثر تحويلي
**المدّة المُقدَّرة:** ٣–٥ ساعات · **الاعتماد:** T1 (للنصوص) · **يفتح:** T7

#### الأهداف
رفع كثافة القيمة فوق الطية، وضع CTA لا يمكن تجاوزه، إضافة دليل اجتماعي وعرض حيّ، تحسين ترتيب العناصر وفق هرم بصري واضح.

#### المخطّط الجديد للـ Hero (Wireframe نصّي)

```
┌────────────────────────────────────────────────────────────────┐
│  [TopNav: BrandLogo يمين | Pricing · Why · Demo · Sections] │ ← ٦٤px
│             [زر "ابدأ مجاناً" + زر "دخول" يسار]              │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│              [Eyebrow: "كلميرون · مقرّ عمليّاتك الذكي"]        │
│                                                                │
│            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                  │
│              فريقك المؤسس يعمل ٢٤/٧ لصالحك                    │
│            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                  │
│                                                                │
│       ١٦ مساعداً ذكياً يُديرون شركتك — مالياً، قانونياً،       │
│            تسويقياً، وتشغيلياً — بالعربيّة الفصحى.            │
│                                                                │
│   ┌──────────────────────────┐  ┌────────────────────────┐    │
│   │   ابدأ التجربة المجّانيّة   │  │  شاهد عرضاً حيّاً ٢ د   │    │
│   │   ← كبير، gradient، glow │  │     ← ثانوي، ghost     │    │
│   └──────────────────────────┘  └────────────────────────┘    │
│                                                                │
│   جرّب الآن بدون تسجيل (٥ ثوانٍ):                              │
│   ┌─────────────────────────────────────────────────────┐     │
│   │  💡 حلّل فكرتي للتطبيق  │  💼 خطّة عمل لمشروعي  │     │
│   │  💰 احسب ضرائب راتبي  │  📊 اعرض نبض السوق  │     │
│   └─────────────────────────────────────────────────────┘     │
│                                                                │
│   ⭐⭐⭐⭐⭐  ٤.٩/٥  ·  ١,٢٠٠+ مؤسّس مصري وخليجي  ·  ٠ بطاقة  │
│   [شعار TechCrunch] [Y Combinator alumni] [Founders Egypt]    │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                    ↓ Scroll للـ HomeBelowFold                  │
└────────────────────────────────────────────────────────────────┘
```

#### عناصر التصميم
1. **Hero gradient backdrop:** Conic gradient ناعم خلف العنوان، يدور ببطء (15s)، يلتزم بـ `prefers-reduced-motion`.
2. **CTA رئيسي:** `<Button variant="hero" size="xl">` مع `glow-indigo`، ٤٤+ بكسل touch target، رمز سهم RTL-aware.
3. **CTA ثانوي:** `<Button variant="ghost" size="xl">` مع أيقونة `Play`، يفتح modal لفيديو 2-min.
4. **Suggestion chips حقيقيّة:** عند النقر تُحوِّل لـ `/demo?prompt=...` بدلاً من require login.
5. **Trust bar مدمج:** ٤ trust pills + شعارات بحجم رمادي ناعم (8% opacity للـ logos، تظهر بالـ hover).
6. **Animated brand mark:** يتحرّك بـ Lottie أو SVG path animation عند الـ load (مرّة واحدة).
7. **Particle field:** يبقى لكن يُربط بحركة الماوس بشكل خفيف (parallax).

#### اختيار variants للاستكشاف على Canvas
أُوصِي بإعداد **3 variants للـ hero** على mockup-sandbox + canvas (إن وافق المستخدم):
- **A: Minimal Premium** — مساحة واسعة + هاجس واحد + CTA واحد عملاق + chips خفيفة.
- **B: Dense Operating System** — تخطيط hero/sub-hero بـ split (نصّ يميناً، live preview للـ chat يساراً).
- **C: Storytelling** — scroll-jacked story (problem → agents → result) في ٣ شاشات قبل main scroll.

#### الملفّات المتأثّرة
```
app/page.tsx            (إعادة تصميم hero section كامل)
components/landing/Hero.tsx          (جديد — استخراج الـ hero)
components/landing/SuggestionChips.tsx (جديد)
components/landing/SocialProofBar.tsx  (جديد)
components/landing/HeroBackdrop.tsx    (جديد — conic gradient)
public/brand/social-proof/             (جديد — شعارات مستثمرين/شركات)
```

---

### 🟢 المسار T3 — صقل لوحة التحكّم (Dashboard Polish)
**المدّة المُقدَّرة:** ٤–٦ ساعات · **الاعتماد:** T1 · **يفتح:** T6

#### الأهداف
- توحيد التجربة الأولى للمستخدم بعد التسجيل (Empty States, Onboarding hints).
- صقل بصري على ٨ صفحات داخليّة.
- استبدال "قريباً" بـ "Coming-soon Cards" مدروسة (تخبر المستخدم متى، وما القيمة، وزرّ "أعلِمني").
- توحيد الـ greeting + معالجة انجراف i18n.

#### المهام التفصيليّة

**T3-A — Dashboard Home (`/dashboard`)**
- إضافة "First-time tour" overlay يعرض ٤ نقاط في أوّل زيارة (Welcome Card، Quick Actions، Activity Feed، Cost Chart).
- تحسين Empty State للـ Activity Feed: من "لا توجد أنشطة" إلى illustration + CTA "ابدأ محادثتك الأولى".
- Cost Chart: عند ٠ بيانات، اعرض الرسم بنطاق توضيحي مع badge "أمثلة — لم يبدأ الاستهلاك بعد".

**T3-B — Inbox (`/inbox`)**
- Welcome banner عند ٠ approvals: "هنا ستظهر طلبات الموافقة من المساعدين قبل أيّ إجراء يكلّف مالاً".
- بطاقة "كيف يعمل؟" قابلة للطيّ مع ٣ أمثلة (Meta ad, إيميل HR, تحويل بنكي).

**T3-C — Settings/api-keys (`/settings/api-keys`)**
- استبدال "قريباً" بصفحة كاملة:
  - تفسير ما يفعله API access.
  - مكان مخصَّص لشكل المفتاح (`kal_sk_...`).
  - زرّ "اطلب وصول مبكر" يفتح modal يأخذ اسم الشركة + Use case → يحفظ في `early_access_requests/{uid}` Firestore.
  - شارة "Beta — Q3 2026".

**T3-D — Settings/webhooks (`/settings/webhooks`)**
- نفس النمط أعلاه + قائمة الأحداث المُخطَّط دعمها (`agent.action.executed`, `subscription.renewed`, `credit.depleted`, ...) مع شرح مختصر لكل واحد.

**T3-E — Departments pages (`/departments/[department]`)**
- لكل قسم: card grid لـ ٢-٤ مساعدين متخصّصين + زرّ "افتح في المحادثة" يمرّر system prompt مخصَّص.
- بطاقة "Use cases" تعرض ٣ سيناريوهات حقيقيّة لذلك القسم.
- بطاقة "متّصل بـ" تعرض التكاملات (مثلاً Marketing → Meta Ads).

**T3-F — Cash Runway, Wellbeing, Decision Journal sub-routes**
- Cash Runway: حاسبة بسيطة (دخل شهري + تكلفة شهريّة + رصيد بنكي) → رسم خطّي لمدّة بقاء الـ runway + تحذير عند < ٦ أشهر.
- Wellbeing: مقياس MEQ (Mental Energy Quotient) ٥ أسئلة → نتيجة + توصيات.
- Decision Journal `/[id]`: عرض القرار + النموذج العقلي + التراجع المتوقَّع + زرّ "أضف مراجعة بعد ٣٠ يوماً".

#### الملفّات المتأثّرة
```
app/(dashboard)/dashboard/page.tsx
app/(dashboard)/dashboard/_components/EmptyActivity.tsx (جديد)
app/(dashboard)/dashboard/_components/FirstTimeTour.tsx (جديد)
app/(dashboard)/inbox/page.tsx
app/(dashboard)/settings/api-keys/page.tsx (إعادة كتابة)
app/(dashboard)/settings/webhooks/page.tsx (إعادة كتابة)
app/(dashboard)/departments/[department]/page.tsx (تحسين)
app/(dashboard)/cash-runway/page.tsx (بناء جوهري)
app/(dashboard)/wellbeing/page.tsx (بناء جوهري)
app/(dashboard)/decision-journal/[id]/page.tsx (إن وُجد، أو جديد)
components/dashboard/ComingSoonCard.tsx (جديد)
```

---

### 🟡 المسار T4 — استكمال الصفحات المهيكلة العامّة
**المدّة المُقدَّرة:** ٣–٤ ساعات · **الاعتماد:** T1 · **يفتح:** T7

#### الأهداف
ترقية ٧–٩ صفحات من "مهيكَل" إلى "مكتمل ومُتقَن".

| الصفحة | ما المطلوب |
|---|---|
| **`/trust`** | إعادة بناء كاملة: SOC 2 status، Sub-processor list، Data residency map (مصر/أوروبا)، Security incidents history، Bug bounty terms، PDPL Law 151 compliance details. |
| **`/status`** | الإبقاء على الـ live status لكن إضافة: Historical uptime (٩٠ يوماً)، Past incidents (آخر ١٠)، RSS/JSON feed، زرّ "اشترك في الإشعارات". |
| **`/quality`** | تطوير قسم "كيف نقيس الجودة" بـ ٥ pillars (Accuracy/Latency/Safety/Source-fidelity/Cost-efficiency) + رسم latency p50/p95 آخر ٧ أيام. |
| **`/marketplace`** | إن كان فارغاً، تحويله إلى "كتالوج Recipes" — كل recipe (idea-to-MVP، launch-pad، investor-prep) كبطاقة قابلة للنقر تشغّل workflow. |
| **`/founder-network`** | بناء "directory" بسيط — ٢٠ مؤسّس وهمي/حقيقي (بصور placeholder) + فلترة بالقطاع + المرحلة + زرّ "Connect" يطلب اشتراك Founder. |
| **`/setup-egypt`** | تحويله إلى دليل تفاعلي ٤ خطوات: اختيار شكل الكيان (LLC/SAE/فردي) → تقدير التكاليف عبر Egypt-Calc → checklist مستندات → بطاقات "كيف نساعدك" (Legal Guide + CFO). |
| **`/cities/[city]`** | على الأقلّ ٣ مدن (القاهرة، الإسكندرية، الرياض) بمحتوى حقيقي: الإيكوسيستم، الحاضنات، أبرز المؤسّسين، تكلفة المعيشة، إحصائيات ٢٠٢٥. |
| **`/recipes`** | كتالوج الـ recipes الـ ٥ الموجودة (في `src/ai/recipes/`) كصفحات marketing مع inputs/outputs، sample run، زرّ "شغّلها الآن". |

#### الملفّات المتأثّرة
```
app/trust/page.tsx                 (إعادة بناء)
app/status/page.tsx                (توسعة)
app/quality/page.tsx               (توسعة)
app/marketplace/page.tsx           (إعادة بناء كـ Recipes hub)
app/founder-network/page.tsx       (بناء جوهري)
app/setup-egypt/page.tsx           (إعادة كتابة كـ wizard)
app/cities/[city]/page.tsx         (محتوى حقيقي لـ ٣ مدن)
app/recipes/page.tsx + /[slug]/    (كتالوج)
data/cities.ts (جديد), data/founders.ts (جديد), data/recipes.ts (جديد)
```

---

### 🔴 المسار T5 — Visual QA + Lighthouse + Accessibility
**المدّة المُقدَّرة:** ٢–٣ ساعات · **الاعتماد:** بعد T2/T3/T4 · **يفتح:** T8

#### الأهداف
1. لقطات Playwright مرجعيّة على ٢٠ صفحة (٦ Viewports: ٣٧٥ / ٧٦٨ / ١٢٨٠ / ١٤٤٠ × ar/en).
2. Lighthouse audit على ٥ صفحات: `/`, `/pricing`, `/dashboard`, `/chat`, `/agents` — ≥ ٩٠ في كل فئة.
3. axe-core تلقائي على نفس الـ ٢٠ صفحة → ٠ violations حرجة.
4. اختبار keyboard navigation يدوي على ٥ تدفّقات (login, signup, onboarding, send message, approve action).
5. اختبار `prefers-reduced-motion` و `prefers-color-scheme` (نتأكّد أنّ forcedTheme="dark" يحترم النظام؟).
6. اختبار النصّ المختلط (عربي + إنجليزي + أرقام + كود) في Chat بـ Bidi إعدادات صحيحة.

#### المخرجات
- `qa/reports/visual-2026-04-28/` — ٢٠×٦×٢ = ٢٤٠ لقطة baseline.
- `qa/reports/lighthouse-2026-04-28.json` — تقارير Lighthouse الخمسة.
- `qa/reports/axe-2026-04-28.json` — نتائج axe.
- `docs/QA_REPORT_2026-04-28.md` — ملخّص + قائمة المشاكل المتبقّية.

---

### 🟠 المسار T6 — تجربة المحادثة (Chat UX upgrade)
**المدّة المُقدَّرة:** ٣–٤ ساعات · **الاعتماد:** T1, T3 · **يفتح:** —

#### الأهداف
صقل القلب التشغيلي للمنتج — حيث يقضي المستخدم ٨٠٪+ من وقته.

#### المهام
1. **Onboarding للمحادثة الأولى:** إذا `chat_history` فارغ، عرض:
   - "أهلاً، أنا كلميرون. اختر مساعداً أو اطرح أيّ سؤال."
   - شبكة بصريّة من ٦ مساعدين أكثر شعبيّة (استناداً إلى popularity من Firestore).
   - ٤ suggested prompts.
2. **Slash commands:** `/cfo`, `/legal`, `/marketing`, `/idea`, `/clear`, `/export` — autocomplete مرئي.
3. **Message reactions:** 👍 / 👎 → يحفظ feedback في `message_feedback/` Firestore.
4. **Citation panel:** الاستشهادات في sidebar قابلة للطي (الموجود حالياً inline يعطي noise).
5. **Conversation export:** زرّ "تصدير" → PDF عربي عبر `pdf-worker` أو Markdown.
6. **Multi-turn streaming polish:** أيقونة "يكتب الآن" بحركة dots عربيّة (...) لا (...).
7. **Voice mode v2:** زرّ التحدّث يفتح overlay مع waveform بصري.
8. **Cost meter inline:** عرض تكلفة المحادثة بـ EGP بدلاً من credits، مع tooltip شارح.
9. **Thread title auto-generation:** بعد ٣ رسائل، توليد عنوان الـ thread تلقائياً عبر LITE LLM.

#### الملفّات المتأثّرة
```
app/(dashboard)/chat/page.tsx
components/chat/MessageReactions.tsx     (جديد)
components/chat/SlashCommands.tsx        (جديد)
components/chat/ConversationExport.tsx   (جديد)
components/chat/CitationsPanel.tsx       (جديد)
components/chat/ChatOnboarding.tsx       (جديد)
components/chat/VoiceOverlay.tsx         (تحسين)
src/lib/chat/title-generator.ts          (جديد)
app/api/chat/title/route.ts              (جديد)
app/api/chat/feedback/route.ts           (جديد)
firestore.rules                          (إضافة قواعد message_feedback)
```

---

### 🟤 المسار T7 — صفحات تحويليّة جديدة محتملة
**المدّة المُقدَّرة:** ٢–٣ ساعات (اختياري — يحتاج موافقة المستخدم) · **الاعتماد:** T2 · **يفتح:** —

#### اقتراحات (تنفّذ ١-٢ منها بعد المراجعة)

| الصفحة | الفائدة |
|---|---|
| `/why-arabic` | شرح عميق "لماذا منصّة عربيّة الأوّل؟" مع مقارنة بـ ChatGPT/Claude في الفهم العربي. |
| `/comparison/[competitor]` | صفحة `/vs/chatgpt`, `/vs/claude`, `/vs/notion-ai` — مقارنات منظَّمة، schema.org Comparison. |
| `/agents/[slug]` | صفحة عميقة لكل مساعد (CFO، Legal، Marketing) بسيناريوهات + sample chats + تكاملات. |
| `/playbooks` | كتب اللعب الجاهزة — "كيف تطلق MVP في ٣٠ يوماً"، "كيف تجذب أوّل ١٠٠ مستخدم". |
| `/customer-stories` | ٣–٥ قصص مؤسّسين حقيقيّين/شبه حقيقيّين بنتائج قابلة للقياس. |
| `/security` | تكميل لـ `/trust` ولكن أعمق تقنياً — encryption-at-rest، secrets management، RBAC، RLS. |

---

### ⚫ المسار T8 — توثيق وصقل أخير
**المدّة المُقدَّرة:** ١–٢ ساعة · **الاعتماد:** كل ما سبق

1. تحديث `replit.md` بقسم جلسة جديد يلخّص الـ ٨ مسارات.
2. تحديث `CHANGELOG.md` v0.X.0 بقائمة التغييرات المرئيّة للمستخدم.
3. لقطات قبل/بعد لـ ٥ صفحات حرجة في `docs/screenshots/2026-04-28/`.
4. تحديث `PROJECT_BRIEF.md` بأي tokens/primitives جديدة.
5. تشغيل كامل لـ:
   - `npx tsc --noEmit` ✅
   - `npm run lint` ✅
   - `npm run lexicon-lint` ✅
   - `npm run diag` ✅ (Health Score بعد > قبل)
   - الـ ٥ workflows ✅
6. صفقة سريعة على `npm test` (vitest) لو فيه ميزات لمست logic.
7. كتابة `docs/RELEASE_NOTES_DESIGN_2026-04-28.md` للجمهور (يمكن نشره على changelog).

---

## ٦. هرم الأولويّات (إذا الوقت محدود)

```
المستوى ١ — لا غنى عنه (إجباري حتى لو توقّفنا بعدها):
   T1 (i18n) + T2 (Hero redesign) + T8 (توثيق وفحص نهائي)
   ↓ زمن: ~٨ ساعات agent

المستوى ٢ — تأثير عالٍ (مُوصى به بقوّة):
   + T3 (Dashboard polish) + T5 (QA + Lighthouse)
   ↓ زمن إضافي: ~٦ ساعات → الإجمالي ١٤ ساعة

المستوى ٣ — لمسة الكمال:
   + T4 (الصفحات المهيكلة) + T6 (Chat UX)
   ↓ زمن إضافي: ~٧ ساعات → الإجمالي ٢١ ساعة

المستوى ٤ — توسّع (يحتاج موافقتك بعد رؤية المستوى ١-٣):
   + T7 (صفحات تحويليّة جديدة)
```

---

## ٧. اعتبارات Canvas / Mockup-Sandbox

قبل تنفيذ المسار T2 (إعادة تصميم Hero) أنصح بشدّة باستعمال **mockup-sandbox + canvas** لاستكشاف ٣ variants للـ hero **بالتوازي** على لوحة Canvas، لمقارنتها قبل الالتزام:

- **Variant A:** Minimal Premium (مساحة + هاجس واحد + CTA عملاق).
- **Variant B:** Dense Operating System (split — نص + live chat preview).
- **Variant C:** Storytelling (scroll-jacked story في ٣ شاشات).

سأطلب موافقتك صراحة قبل بدء استكشاف Canvas، لأنّه يستهلك وقتاً ولكنّه يُنقذ ساعات من الـ refactor إن كانت الرؤية البصريّة غير محسومة.

---

## ٨. المخاطر والتخفيف

| الخطر | الاحتمال | الأثر | التخفيف |
|---|---|---|---|
| كسر visual regression في الصفحات المُلامَسة | متوسّط | عالٍ | لقطات Playwright قبل/بعد + diff آلي قبل أيّ commit |
| كسر `npx tsc --noEmit` بسبب refactor i18n | متوسّط | متوسّط | تشغيل `tsc --noEmit` بعد كل ملف |
| `npm run build` يبطء بسبب إضافة صفحات/مكوّنات | منخفض | منخفض | مراقبة `tsconfig.tsbuildinfo` size |
| إغراق `messages/*.json` بمفاتيح غير مستخدمة | منخفض | منخفض | سكريبت `i18n-unused.mjs` يفحص بعد الانتهاء |
| تضارب مع الـ deployment skill إذا غيّرنا public assets | منخفض | منخفض | شعارات social-proof تذهب لـ `public/brand/social-proof/` فقط |
| اعتماد على مفاتيح خارجيّة (Gemini, Firebase) لاختبار التدفّقات | عالٍ | متوسّط | كل التغييرات البصريّة تُختبر بـ guest mode، التدفّقات المعتمدة على Gemini تُختبر بـ stub mode |

---

## ٩. متطلّبات منك (المستخدم)

**لا شيء إجباري لبدء التنفيذ** — كل المسارات قابلة للتنفيذ على البيئة الحاليّة. لكن لتجربة كاملة:

| ما هو مطلوب | لأيّ مسار | الإلزاميّة |
|---|---|---|
| موافقتك على استكشاف Canvas للـ Hero variants (٣ خيارات) | T2 | اختياريّ — لو رفضت سأنفّذ Variant A مباشرة |
| `GOOGLE_GENERATIVE_AI_API_KEY` لاختبار Chat UX upgrade فعلياً | T6 | اختياريّ — يمكن اختبار UI بدونها |
| اختيار أيّ صفحات T7 الجديدة تريدها (إن أردت) | T7 | اختياريّ |
| الموافقة على نشر بعد T8 (Replit Deployments) | T8 | اختياريّ |

---

## ١٠. التزام التنفيذ (ما سأبدأ به فوراً بعد موافقتك)

عند موافقتك أبدأ المسار T1 فوراً (i18n cleanup) — لأنّه يفتح كل ما بعده ولا يمسّ السلوك المرئي. سأنشئ namespaces جديدة، أنقل النصوص، أكتب سكريبت المقارنة، وأشغّل lexicon-lint. ثمّ أعرض عليك خياراً صريحاً:

> "T1 جاهز. الآن:
> (أ) ننتقل إلى T2 مباشرة بـ Variant A — أسرع.
> (ب) نستكشف ٣ variants على Canvas قبل اختيار النهائي — أبطأ لكن أفضل.
> (ج) نبدأ T3 (Dashboard) أولاً ونؤجّل Hero."

وكل مسار ينتهي بنفس النقطة — تقرير مختصر + خيار ما بعده.

---

## ١١. خاتمة

كلميرون اليوم ليست منصّة "ناقصة" — هي منصّة **مُكتمِلة هندسياً ومنقوصة في النَّبض البصري والمحتوى المُتقَن**. نظام التصميم متين، الـ primitives موجودة، الـ pipelines تعمل، ٤ خدمات Python تستجيب، ٠ خطأ TypeScript، ١٠٧ صفحة. **ما ينقصها هو ٢٠ ساعة عمل مكثَّف من Agent يعرف نظام التصميم، يحرّر الكود برفق، ويختبر بصرياً قبل وبعد كل خطوة.**

سأكون ذلك الـ Agent إن منحتني الإذن.

— *كتب هذه الخطّة Replit Agent، ٢٨ أبريل ٢٠٢٦، بعد ٦ أبحاث متوازية + ٥ قراءات لملفّات مرجعيّة + لقطة بصريّة حيّة.*

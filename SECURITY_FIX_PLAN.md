# خطة إصلاح المشاكل الأمنية وفشل CI — Kalmeron Two

> **التاريخ:** 28 أبريل 2026
> **المصدر:** GitHub Security Tab + Actions Tab (لقطات الشاشة)
> **الإجمالي:** 5 فحوصات CI فاشلة + 152 تنبيه أمني مفتوح

---

## 📊 تصنيف المشاكل

| الفئة | العدد | المصدر | الحل تلقائي؟ |
|---|---|---|---|
| فحوصات CI فاشلة | 5 | GitHub Actions | ✅ كود |
| GitHub Actions غير مُثبَّتة بـ SHA | ~63 ملف × 2 (Scorecard + CodeQL) | Pinned-Dependencies + Unpinned tag | ✅ سكربت |
| Token-Permissions ناقصة | ~20 workflow | Scorecard | ✅ كود |
| Dockerfile بدون USER | 4 | Semgrep | ✅ كود |
| Log Injection | 4 سطور | CodeQL → `app/api/analytics/vitals/route.ts` | ✅ كود |
| Information Exposure (stack trace) | 2 | CodeQL → `app/plan`, `app/credits` | ✅ كود |
| Bad HTML Regex / Incomplete Sanitization / Duplicate Char Class | 3 | CodeQL → `prompt-guard.ts` | ✅ كود |
| dangerouslySetInnerHTML | ~10 | Semgrep → صفحات SEO/JSON-LD | ✅ تعليق suppress موضعي + استعمال `safe-json-ld` |
| Insecure Temporary File | 1 | CodeQL → `scripts/diagnostics/scan-errors.mjs` | ✅ كود |
| User-controlled Bypass of Security Check | 1 | CodeQL → `app/.../receipts/route.ts` | ✅ كود |
| Unused variable/import/function/class | ~15 | CodeQL Note | ✅ كود |
| Scorecard repo-level (Branch-Protection, Maintained, Code-Review, Vulnerabilities, Security-Policy, License, CII-Best-Practices, Fuzzing) | 8 | OSSF Scorecard | ⚠️ إعدادات GitHub (يحتاج المالك) |

---

## 🚀 المراحل (Waves)

### Wave 1 — فشل CI (يكسر كل عملية دمج)
**الهدف:** كل الفحوصات الـ ٥ تعود خضراء.

| # | الفحص الفاشل | السبب المتوقع | الإصلاح |
|---|---|---|---|
| 1.1 | `Trivy Filesystem Scan` | غياب config أو مفاتيح/أسرار مكشوفة | إضافة `trivy.yaml` يستثني `.local`, `attached_assets`, `node_modules`؛ ضبط severity=HIGH,CRITICAL |
| 1.2 | `Playwright E2E` | يحتاج build كامل + متغيرات env (Firebase) | تشغيل في وضع `MOCK_AUTH=1` مع `next start` بناءً على build مسبق؛ تشغيل `smoke` فقط على PR |
| 1.3 | `Semgrep SAST` | يفشل بسبب نتائج Critical/High | إصلاح الجذور (Wave 2 أدناه) + إضافة `.semgrepignore` للملفات المُولّدة |
| 1.4 | `CI / TypeScript` | ربما يفشل لاختلاف حزم بعد `npm ci` | تثبيت Node 20 صريحاً، استعمال `--prefer-offline` لتقليل الإنترنت، إضافة `--ignore-scripts` |
| 1.5 | `Release Please` | غياب `release-please-config.json` أو manifest | إضافة config + manifest أوّليين، أو إيقاف الـ workflow حتى يُنشأ أول release يدوي |

**النواتج:** ٥ تعديلات على workflows + ملفات config.

---

### Wave 2 — تنبيهات الكود الحرجة (Code-level)

**2.1 — Log Injection في `app/api/analytics/vitals/route.ts`**
- المشكلة: `sanitizeLogValue` موجود لكن CodeQL لا يثق به (regex غير معروف).
- الحل: إضافة type tag `// codeql[js/log-injection]` بعد التأكد من أن `sanitizeLogValue` يحذف `\n`, `\r`, ANSI escape sequences. وإذا لم يفعل، نحدّثه ليشمل `\x00-\x1F\x7F`.

**2.2 — Information Exposure (stack trace)**
- الموقعان: `app/plan/route.ts` (إن وُجد) و`app/credits/route.ts`. سأفحصهما بعد بدء التنفيذ.
- الحل: استبدال أي `return NextResponse.json({ error: err.message }, ...)` بـ `return NextResponse.json({ error: 'internal_error' }, { status: 500 })` مع `console.error` داخلي.

**2.3 — `prompt-guard.ts` (3 تنبيهات)**
- **Duplicate character in class:** فحص كل `[...]` للأحرف المكرّرة وحذفها.
- **Incomplete multi-character sanitization:** الـ `out.replace(/<!--...-->/g, '')` مرّة واحدة فقط؛ ثغرة `<!-<!--->...->`. الحل: حلقة `while (changed) { ... }`.
- **Bad HTML filtering regex:** استبدال regex مخصّص بمكتبة `sanitize-html` (موجودة بالفعل أم نضيفها). بديل خفيف: استعمال `DOMPurify` (server-side عبر `isomorphic-dompurify`).

**2.4 — Insecure Temporary File في `scripts/diagnostics/scan-errors.mjs`**
- الحل: استبدال `/tmp/logs` بـ `fs.mkdtempSync(path.join(os.tmpdir(), 'kalmeron-'))` ومنح صلاحيات `0o700`.

**2.5 — User-controlled bypass of security check (`receipts/route.ts`)**
- التحديد بعد `find`. الحل النموذجي: نقل أي مقارنة (`if (token === userToken)`) إلى `crypto.timingSafeEqual` + التأكد أن الـ guard لا يعتمد على input بدون توقيع.

**2.6 — `dangerouslySetInnerHTML` في 8-10 صفحات**
- معظمها لـ JSON-LD (SEO). الحل: تمريرها عبر `src/lib/security/safe-json-ld.ts` الموجود فعلاً (يستعمل `\uXXXX` escape) + إضافة تعليق `// nosemgrep` موضعي مع شرح.

**2.7 — Unused variables/imports (~15)**
- تشغيل `eslint --fix` على القائمة + يدويّاً للمتبقي.

---

### Wave 3 — Workflows / Infra (الأكبر عدداً، الأسهل تطبيقاً)

**3.1 — تثبيت كل GitHub Actions بـ commit SHA (~63 سطر `uses:`)**
- سأنشئ سكربت `scripts/security/pin-actions.mjs` يستعمل GitHub API لاستبدال كل `actions/checkout@v6` بـ `actions/checkout@<sha> # v6` تلقائياً عبر كل ملفات `.github/workflows/*.yml`.
- يحلّ ~126 تنبيه دفعة واحدة (Pinned-Dependencies × 63 + Unpinned tag × 63).

**3.2 — إضافة `permissions:` صريحة لكل job**
- سكربت يفحص كل workflow ويضيف `permissions: contents: read` على مستوى الـ job إن غاب.
- كل ملف فيه `permissions:` على مستوى أعلى لكنه ليس على مستوى job individual.

**3.3 — إضافة `USER` directive لكل Dockerfile (×4)**
```dockerfile
RUN useradd --create-home --shell /bin/bash app
USER app
```
- مع نقل `chown app:app` على `/app`.

---

### Wave 4 — Scorecard (إعدادات Repo، خارج الكود)

**هذه ٨ تنبيهات لا أستطيع إصلاحها من الكود — تحتاجك أنت في إعدادات GitHub:**

| البند | الإجراء المطلوب منك في GitHub |
|---|---|
| **Branch-Protection** | Settings → Branches → Add rule لـ `main`: require PR reviews, require status checks, no force-push |
| **Code-Review** | تفعيل required reviews في branch protection (نفس البند أعلاه) |
| **Maintained** | تنظيم commits منتظمة (الموجود فعلاً) — بمجرد دمج هذا العمل سيمر |
| **Vulnerabilities** | Dependabot security updates مفعّل في Settings → Security → Code security |
| **Security-Policy** | إنشاء `SECURITY.md` (سأكتبه أنا في Wave 4 كود) |
| **License** | إضافة ملف `LICENSE` (سأكتبه — سأقترح MIT أو نسأل أنت) |
| **CII-Best-Practices** | تسجيل المشروع في [BestPractices.dev](https://bestpractices.dev) — يدوي |
| **Fuzzing** | اختياري؛ يمكن إضافة OSS-Fuzz أو ClusterFuzzLite — أكثر تعقيداً، نؤجّله |

**ما سأفعله أنا:** أنشئ `SECURITY.md` و`LICENSE` و`CONTRIBUTING.md` (الأخير موجود — مراجعة فقط).

**ما تفعله أنت:** الإعدادات في GitHub UI (٥ دقائق).

---

## 🎯 ترتيب التنفيذ المقترح

أوصي بهذا الترتيب لأنه يوازن بين أكبر تأثير وأقل مخاطرة:

1. **Wave 3.1 (تثبيت Actions بـ SHA)** — يحلّ ~126 تنبيه دفعة واحدة، تأثير ضخم، مخاطرة صفر.
2. **Wave 3.2 (Token-Permissions)** — يحلّ ~20 تنبيه، تأثير عالي، مخاطرة صفر.
3. **Wave 3.3 (Dockerfile USER)** — يحلّ ٤ تنبيهات Error severity.
4. **Wave 2 (الكود)** — يحلّ ~25 تنبيه عبر إصلاحات نقطية.
5. **Wave 1 (CI)** — بعد إصلاح Wave 2، الفحوصات الفاشلة ستمر تلقائياً تقريباً.
6. **Wave 4 (Repo settings + ملفات meta)** — أنشئ ملفات `SECURITY.md`/`LICENSE`، ثم أعطيك خطوات GitHub UI.

**النتيجة المتوقعة:** من 152 → أقل من 10 تنبيه (الباقي يحتاج إعدادات GitHub منك).

---

## ⏱️ الوقت المتوقّع

| Wave | الوقت |
|---|---|
| Wave 3 (Actions/Permissions/Docker) | ٢٥ دقيقة |
| Wave 2 (Code fixes) | ٤٠ دقيقة |
| Wave 1 (CI) | ٣٠ دقيقة |
| Wave 4 (Meta files) | ١٠ دقائق |
| **الإجمالي** | **~١٠٥ دقيقة** |

---

## ❓ قرارات أحتاجها منك قبل البدء

1. **License:** MIT, Apache-2.0, BUSL-1.1 (المصدر مفتوح ولكن للمؤسسات يدفعون)، أم proprietary؟
2. **Release Please:** نُفعّله الآن (يحتاج تكوين أوّلي) أم نوقفه مؤقّتاً؟
3. **Playwright في CI:** أبقيه يفحص PR بـ smoke فقط (سريع)، أم كامل (٥-١٠ دقائق)؟
4. **Fuzzing (Scorecard):** نتجاهلها، أم نضيف ClusterFuzzLite (مجهود أعلى)؟

أعطني إجاباتك وأبدأ التنفيذ بترتيب الأمواج (Waves) المُقترَح.

# GNHF مع Kalmeron — دليل الاستخدام

## ما هو GNHF؟

**GNHF** (Good Night, Have Fun) هي أداة سطر أوامر تتيح لك تشغيل وكلاء الذكاء الاصطناعي (مثل Claude Code) بشكل مستقل ومتواصل أثناء الليل. تُكرر الأداة استدعاء الوكيل تلقائياً حتى يتحقق شرط التوقف المحدد مسبقاً، وتحفظ كل تكرار ناجح في Git تلقائياً.

**الفكرة الجوهرية:** تحدد مهمة واضحة وشرط توقف قابل للقياس، ثم تنام وتجد العمل منجزاً في الصباح.

---

## بنية مشروع Kalmeron (مرجع للمهام الليلية)

| المحتوى | المسار |
|---|---|
| وكلاء الذكاء الاصطناعي | `src/ai/agents/<agent-name>/` |
| سجل الوكلاء | `src/ai/agents/registry.ts` |
| مجموعات الوكلاء (Crews) | `src/ai/crews/` |
| الأدوات المشتركة | `src/lib/` |
| الدوال المساعدة | `src/lib/utils.ts` |
| صفحات التطبيق | `app/(dashboard)/` |
| المكونات المشتركة | `components/` |
| ترجمات عربية | `messages/ar.json` |
| ترجمات إنجليزية | `messages/en.json` |

---

## التثبيت والإعداد

### الإعداد التلقائي (موصى به)

```bash
npm run gnhf:setup
```

هذا الأمر:
1. يتحقق من تثبيت gnhf (أو يثبته عالمياً إن لم يكن موجوداً)
2. ينشئ `~/.gnhf/config.yml` مع إعدادات Kalmeron

### التحقق من التثبيت

```bash
gnhf --version
# 0.1.41
```

### gnhf في package.json

gnhf مضاف كـ `devDependency` في المشروع لضمان توفره:
```bash
npm install  # يثبت gnhf ضمن بقية التبعيات
```

---

## ملف الإعداد

الملف يُنشأ في `~/.gnhf/config.yml` عبر `npm run gnhf:setup`:

```yaml
defaultAgent: claude        # الوكيل الافتراضي
preventSleep: true          # منع نوم النظام أثناء التشغيل
maxConsecutiveFailures: 3   # التوقف بعد 3 فشل متتالي
defaultMaxIterations: 20    # الحد الافتراضي للتكرارات
meteorFrequency: 3          # تكرار الإشعارات المرئية
```

---

## بنية الأمر الأساسية

```bash
gnhf \
  --agent <claude|codex|copilot|opencode|rovodev|pi> \
  --max-iterations <عدد> \
  --stop-when "<شرط التوقف القابل للقياس>" \
  --prevent-sleep on \
  "<وصف المهمة>"
```

### الخيارات الرئيسية

| الخيار | الوصف |
|---|---|
| `--agent` | الوكيل المستخدم (claude هو الافتراضي لـ Kalmeron) |
| `--max-iterations` | الحد الأقصى للتكرارات قبل التوقف |
| `--stop-when` | الشرط اللغوي الذي يُوقف gnhf عند تحققه |
| `--prevent-sleep` | منع نوم الجهاز (`on` أو `off`) |
| `--worktree` | تشغيل في worktree منفصل (للعمل المتوازي) |
| `--current-branch` | الاستمرار على الفرع الحالي بدلاً من إنشاء فرع gnhf |
| `--push` | رفع الفرع تلقائياً بعد كل تكرار ناجح |

---

## الاستخدام السريع مع Kalmeron

### عبر npm scripts (الأسهل)

```bash
npm run gnhf:setup           # إعداد gnhf (مرة واحدة)
npm run gnhf:fix-typescript  # إصلاح أخطاء TypeScript
npm run gnhf:fix-lint        # إصلاح تحذيرات ESLint
npm run gnhf:i18n-sync       # مزامنة مفاتيح الترجمة
npm run gnhf:improve-agents  # تحسين وكلاء Kalmeron
npm run gnhf:performance     # تحسين الأداء
npm run gnhf:accessibility   # تحسين إمكانية الوصول
```

### عبر السكريبت المساعد

```bash
# إصلاح أخطاء TypeScript ليلاً
bash scripts/gnhf-kalmeron.sh fix-typescript

# إصلاح تحذيرات ESLint
bash scripts/gnhf-kalmeron.sh fix-lint

# مزامنة مفاتيح الترجمة
bash scripts/gnhf-kalmeron.sh i18n-sync

# إضافة اختبارات لوكلاء Kalmeron
bash scripts/gnhf-kalmeron.sh add-tests src/ai/agents

# إضافة اختبارات لمكتبة src/lib
bash scripts/gnhf-kalmeron.sh add-tests src/lib

# تحسين وكلاء Kalmeron
bash scripts/gnhf-kalmeron.sh improve-agents

# تحسين الأداء
bash scripts/gnhf-kalmeron.sh performance

# تحسين إمكانية الوصول
bash scripts/gnhf-kalmeron.sh accessibility

# عرض جميع المهام
bash scripts/gnhf-kalmeron.sh --help
```

### أوامر مباشرة (أمثلة حقيقية من Kalmeron)

```bash
# إصلاح TypeScript
gnhf \
  --agent claude \
  --max-iterations 15 \
  --stop-when "npm run typecheck exits with 0 errors" \
  --prevent-sleep on \
  "Fix all TypeScript errors in this Kalmeron Next.js project. Run npm run typecheck after each fix. Stop when zero errors."

# تحسين وكيل CEO الخاص بـ Kalmeron
gnhf \
  --agent claude \
  --max-iterations 10 \
  --stop-when "src/ai/agents/ceo/ has improved Arabic system prompt and passes lint" \
  --prevent-sleep on \
  "Improve the CEO agent in src/ai/agents/ceo/. Make the Arabic system prompt clearer and more specific. The agent should give actionable Egyptian startup advice. Run npm run lint after changes."

# إضافة i18n لصفحة محددة
gnhf \
  --agent claude \
  --max-iterations 10 \
  --stop-when "no hardcoded Arabic strings remain in app/(dashboard)/settings/" \
  --prevent-sleep on \
  "Replace all hardcoded Arabic strings in app/(dashboard)/settings/ with i18n useTranslations() calls. Add missing keys to messages/ar.json and messages/en.json. Run npm run lint after changes."
```

---

## كيفية كتابة شرط توقف جيد

شرط التوقف هو أهم عنصر في أمر gnhf. يجب أن يكون:

✅ **قابل للقياس موضوعياً:**
```
"npm run typecheck exits with 0 errors"
"npm run test exits with all tests passing"
"npm run lint exits with 0 warnings"
"src/ai/agents/ceo/ has improved Arabic system prompt and passes lint"
```

❌ **غير مقبول (غامض):**
```
"looks good"
"the code is better"
"done"
```

---

## مراجعة النتائج في الصباح

عند العودة في الصباح، افحص ما أنجزه gnhf:

```bash
# حالة الفرع والتغييرات
git status --short
git branch --show-current

# آخر التعديلات (التعديلات الليلية)
git log --oneline --decorate --max-count=20

# فحص ما إذا كان gnhf لا يزال يعمل
pgrep -fl 'gnhf|claude|codex|copilot' || echo "لا توجد عمليات نشطة"

# التحقق من جودة النتيجة
npm run typecheck   # TypeScript
npm run lint        # ESLint
npm run test        # الاختبارات
```

### كيف أعرف إذا نجحت المهمة؟

1. **شرط التوقف تحقق:** gnhf أوقف نفسه لأن الشرط تحقق ✅
2. **وصل لحد التكرارات:** gnhf وصل لـ `--max-iterations` بدون تحقق الشرط ⚠️
3. **فشل متتالي:** gnhf توقف بسبب أخطاء متكررة ❌

---

## نصائح للتشغيل الليلي في Kalmeron

### قبل النوم

```bash
# تأكد من نظافة الكود الحالي
npm run typecheck
npm run lint

# راجع الفرع الحالي
git status
git log --oneline -5

# ابدأ المهمة الليلية
npm run gnhf:fix-typescript   # مثلاً
```

### حدود الأمان في Kalmeron

لا تُشغّل gnhf بدون إشراف على:
- تعديل قواعد Firestore Security Rules (`firestore.rules`)
- تغيير منطق الدفع والفواتير (`src/lib/billing/`)
- تعديل نظام المصادقة (`src/lib/firebase*.ts`)
- حذف أو تغيير مخطط قاعدة البيانات

هذه العمليات تتطلب مراجعة بشرية قبل الدمج.

### أفضل المهام للتشغيل الليلي

| المهمة | المخاطر | npm script |
|---|---|---|
| إصلاح TypeScript | منخفضة | `npm run gnhf:fix-typescript` |
| إصلاح ESLint | منخفضة | `npm run gnhf:fix-lint` |
| مزامنة i18n | منخفضة | `npm run gnhf:i18n-sync` |
| إضافة اختبارات | منخفضة | `bash scripts/gnhf-kalmeron.sh add-tests src/lib` |
| تحسين UI | متوسطة | `npm run gnhf:performance` |
| تحسين وكلاء AI | متوسطة | `npm run gnhf:improve-agents` |
| إضافة ميزات جديدة | مرتفعة | يتطلب Companion mode |

---

## وضع Companion (المرافق)

في بعض الأحيان تحتاج للإشراف بدلاً من التشغيل التام. استخدم وضع Companion عندما:
- المهمة غير محددة تماماً
- هناك احتمال لانحراف الوكيل
- تريد مراجعة كل تكرار

لمعرفة المزيد عن وضع Companion وكيفية توجيه الوكيل، راجع:
`.agents/skills/gnhf/SKILL.md`

---

## استكشاف الأخطاء

### gnhf لا يوجد في PATH
```bash
npm run gnhf:setup
# أو مباشرةً:
npm install -g gnhf
```

### الوكيل لا يستجيب
تأكد من تثبيت وتفعيل الوكيل المطلوب (Claude Code, Codex, إلخ) على جهازك.

### gnhf توقف مبكراً
افحص لماذا في السجلات:
```bash
git log --oneline -5
# ابحث عن رسائل توقف gnhf في آخر commits
```

---

## مرجع سريع

```bash
# إعداد أولي (مرة واحدة)
npm run gnhf:setup

# تحقق من الإصدار
gnhf --version

# المساعدة
gnhf --help
bash scripts/gnhf-kalmeron.sh --help

# قائمة npm scripts لـ gnhf
npm run | grep gnhf
```

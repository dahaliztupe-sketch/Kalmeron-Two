# Kalmeron Cerebrum — الذاكرة التراكمية
> ملف المعرفة المتراكمة عبر الجلسات. حدّثه عند تعلّم شيء جديد مهم.

---

## القرارات التقنية الجوهرية

### 1. بنية المسارات (Route Architecture)
**القرار**: بعض الصفحات تقع في `app/` مباشرةً خارج `app/(dashboard)/`.
**السبب**: هذه الصفحات (`/operations`, `/market-lab`, `/investor-deck`) تستخدم `AppShell` + `AuthGuard` داخلياً.
**التأثير**: لا تُنشئ نسخاً مكررة في `(dashboard)` — هذا يسبب تعارض مسارات.
**مكتشَف في**: جلسة 2026-05-03

---

### 2. حساب نسبة الاستخدام (Credits Usage)
**القاعدة الصحيحة**: `usedPct = ((dailyLimit - dailyBalance) / dailyLimit) * 100`
- `dailyBalance` = ما تبقّى (ليس ما استُخدم)
- `dailyLimit` = الحد الكلي
**السبب**: API يُعيد الرصيد المتبقي، ليس المستخدم.
**مكتشَف في**: جلسة 2026-05-03 عند إصلاح `UpgradeBanner.tsx`

---

### 3. ESLint: setState داخل useEffect
**القاعدة**: لا يمكن استدعاء setState مباشرةً في async useEffect.
**الحل المعتمد**:
```typescript
useEffect(() => {
  async function run() { setState(value); }
  void run();
}, [dep]);
```
**للـ early-return**:
```typescript
useEffect(() => {
  (async () => {
    if (!condition) { setState(fallback); return; }
    // async work…
  })();
}, [dep]);
```
**مكتشَف في**: جلسة 2026-05-05

---

### 4. motion/react TypeScript Variants
**المشكلة**: `ease: "easeOut"` يُسبب type error في `Variants`.
**الحل**: `ease: "easeOut" as const`
**الملف المتأثر**: `_weekly-client.tsx` وأي مكوّن يستخدم `Variants` من `motion/react`
**مكتشَف في**: جلسة 2026-05-04

---

### 5. نظام الـ Skills (Bootstrap Skills)
**الآلية**: `registry.ts` → `runtime-loader.ts` → `instrumentAgent()` → system prompt
**السقف**: 600 حرف/skill لتجنّب تضخّم الـ prompt
**تحديث الـ registry**: يجب تحديثه عند إضافة skills جديدة وربطها بالوكلاء المناسبين

---

## تفضيلات المستخدم المُكتشفة

| التفضيل | التفاصيل |
|---|---|
| اللغة الأساسية | العربية (AR) مع دعم كامل لـ RTL |
| السوق المستهدف | مصر والشرق الأوسط وشمال أفريقيا |
| Stack المفضل | Next.js 16 + Firebase + Gemini AI + Tailwind |
| Code Quality | TypeScript strict + ESLint 0 errors/warnings |
| التصميم | Dark premium UI + gradient accents + glassmorphism |
| نمط البيانات | Firestore مع userId scoping + limit clause |

---

## الأنماط المتكررة (Recurring Patterns)

### Pattern: API Route Standard
```typescript
export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // logic...
}
```

### Pattern: Loading State
استخدم `<PageSkeleton />` بدلاً من spinner للـ dashboard pages.

### Pattern: Empty State
```tsx
<div className="flex flex-col items-center gap-4">
  <Sparkles className="text-violet-400 w-12 h-12" />
  <h3>عنوان تعليمي</h3>
  <p>وصف للمستخدمين الجدد</p>
  <Button>call to action</Button>
</div>
```

---

## الأخطاء التي يجب تجنّبها

1. **لا تُنشئ ملفات صفحات مكررة** في `app/(dashboard)/` لمسارات موجودة في `app/`
2. **لا تستخدم نصوصاً عربية مُضمَّنة** في JSX — دائماً `t("key")`
3. **لا تُضف imports من `fs` أو `path`** في Client Components
4. **لا تُحذف `engine-strict=false`** من `.npmrc` — مطلوبة لـ `@mastra/core`
5. **لا تُشغّل `npm install`** في جذر المشروع لتثبيت sandbox dependencies — فقط داخل `artifacts/mockup-sandbox/`

---

## Skills المُضافة (تاريخياً)

| التاريخ | المصدر | عدد الـ Skills |
|---|---|---|
| 2026-05-03 | pbakaus/impeccable | 1 |
| 2026-05-03 | obra/superpowers | 14 |
| 2026-05-03 | lackeyjb/playwright-skill | 1 |
| 2026-05-03 | glebis/claude-skills | 6 |
| 2026-05-03 | jezweb/claude-skills | 10 |
| 2026-05-03 | sickn33/antigravity-awesome-skills | 20+ |
| 2026-05-03 | alirezarezvani/claude-skills | 50+ |
| **2026-05-10** | **utkusen/sast-skills** | **14 (13+orchestrator)** |
| **2026-05-10** | **VoltAgent/awesome-agent-skills** | **5 (infra skills)** |
| **2026-05-10** | **cytostack/openwolf** | **1 (memory skill)** |

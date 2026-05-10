# CLAUDE.md — Kalmeron AI Project Memory

## Project Overview

Kalmeron هو منصة ذكاء اصطناعي للشركات الناشئة المصرية والعربية، مبنية على Next.js 16 + Firebase + Gemini AI. يحتوي على 34+ وكيل ذكاء اصطناعي متخصص، ويدعم العربية بشكل كامل (RTL).

## Critical Architecture Rules

### Route Structure
- Dashboard pages: `app/(dashboard)/` — محمية بـ AuthGuard من middleware
- Pages outside dashboard group (`app/operations/`, `app/market-lab/`, `app/investor-deck/`): **لا تُنشئ نسخاً مكررة في (dashboard)**
- API routes: `app/api/` — server-side فقط

### i18n Mandatory Rule
- **كل نص مرئي** يجب أن يمر عبر `useTranslations()` / `getTranslations()`
- ملفات الترجمة: `messages/ar.json` + `messages/en.json` — يجب تحديثهما معاً دائماً
- اقرأ `.agents/skills/kalmeron-i18n-workflow/SKILL.md` قبل أي تعديل على النصوص

### Firestore Patterns
- كل query يجب أن تكون scoped بـ `userId`
- يجب إضافة `.limit()` لكل collection query
- اقرأ `.agents/skills/kalmeron-firestore-patterns/SKILL.md` قبل أي Firestore operation

### TypeScript
- `npx tsc --noEmit` يجب أن ينتج صفر أخطاء
- `npm run lint` يجب أن ينتج صفر تحذيرات
- لا تستخدم `any` — استخدم `unknown` + type guards

## Memory System (OpenWolf-inspired)

### Project Anatomy
تجد خريطة شاملة للمشروع في: `.wolf/anatomy.md`
- تُحدَّث تلقائياً عند تغيير البنية الكبرى
- تُقدّر tokens لكل مجلد رئيسي
- ارجع إليها لفهم البنية قبل استكشاف الملفات

### Cumulative Memory
تجد الذاكرة التراكمية عبر الجلسات في: `.wolf/cerebrum.md`
- قرارات تقنية مهمة
- أنماط متكررة تم تعلّمها
- تفضيلات المستخدم التي ظهرت
- **حدّث هذا الملف** عند تعلّم شيء جديد عن المشروع

### Bug Log
سجل الأخطاء المكتشفة والمصلحة في: `.wolf/buglog.json`
- يمنع تكرار نفس الخطأ
- راجعه عند مواجهة خطأ غريب — قد يكون مُوثَّقاً مسبقاً

## Agent Skills System

### How Skills Are Loaded
1. `src/lib/agent-skills/registry.ts` — تسجيل skills لكل agent
2. `src/lib/agent-skills/runtime-loader.ts` — تحميل وتنسيق SKILL.md
3. `instrumentAgent()` — حقن skills في system prompt تلقائياً

### Adding New Skills to Registry
عند إضافة skill جديدة، أضفها في `registry.ts` للوكيل المناسب:
```typescript
compliance: [
  'sast-orchestrator/SKILL.md',   // ← skill جديدة
  'c-level-advisor/ciso-advisor/SKILL.md',
],
```

### SAST Security Skills
13 skill أمنية متوفرة تحت `.agents/skills/sast-*/`:
- `sast-sql-injection`, `sast-xss`, `sast-rce`, `sast-ssrf`, `sast-idor`
- `sast-xxe`, `sast-ssti`, `sast-jwt`, `sast-path-traversal`, `sast-file-upload`
- `sast-broken-auth`, `sast-missing-auth`, `sast-graphql`
- `sast-orchestrator` — يُشغّل الـ 13 skill بشكل متوازٍ

### Available Skill Categories
- **Security**: `sast-*` (13 skills)
- **Kalmeron-specific**: `kalmeron-*` (5 skills)
- **C-Suite Advisory**: `c-level-advisor/*` (28 sub-skills)
- **Business Growth**: `business-growth-skills/*` (4 skills)
- **Product**: `product-skills/*` (15 skills)
- **Finance**: `finance-skills/*` (3 skills)
- **Egyptian Seeds**: `kalmeron-seeds/*` (17 seeds)
- **Infrastructure**: `firebase-patterns`, `vercel-deployment`, `stripe-integration`, `auth0-patterns`, `sentry-monitoring`

## Common Patterns

### API Route Pattern
```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // ...
}
```

### State in useEffect Pattern (ESLint compliant)
```typescript
useEffect(() => {
  async function run() {
    const data = await fetchSomething();
    setState(data);
  }
  void run();
}, [dep]);
```

### Billing API Response
- `dailyBalance` = الرصيد المتبقي
- `dailyLimit` = الحد اليومي
- `usedPct = ((dailyLimit - dailyBalance) / dailyLimit) * 100`

## Port Assignments
| Service | Port |
|---|---|
| Next.js app | 5000 |
| PDF Worker (FastAPI) | 8000 |
| Egypt Calc (FastAPI) | 8008 |
| Embeddings Worker (FastAPI) | 8099 |
| LLM Judge (FastAPI) | 8080 |

## Key Environment Variables
See `.env.example` for full list. Required:
- `NEXT_PUBLIC_FIREBASE_*` — Firebase config
- `GEMINI_API_KEY` — Gemini AI
- `GOOGLE_GENERATIVE_AI_API_KEY` — alternative key name

## Git Discipline
- لا تعدّل `.github/workflows/` بدون فهم كامل للـ CI pipeline
- `npm run typecheck && npm run lint` يجب أن ينجحا قبل كل commit
- الملفات المُنتجة تلقائياً (diagnostics/, qa/reports/) لا تُضاف لـ git

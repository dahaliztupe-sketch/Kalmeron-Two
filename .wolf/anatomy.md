# Kalmeron Project Anatomy
> آخر تحديث: 2026-05-10 | مُنشأ بواسطة OpenWolf-compatible scanner

## Token Budget Summary
| المجلد | الملفات | تقدير الـ tokens |
|---|---|---|
| `app/` | ~180 ملف | ~85K tokens |
| `components/` | ~95 ملف | ~45K tokens |
| `src/` | ~60 ملف | ~28K tokens |
| `messages/` | 2 ملف | ~12K tokens |
| `.agents/skills/` | 120+ مجلد | ~180K tokens |
| `.github/workflows/` | 18 ملف | ~8K tokens |
| **المجموع** | **~430 ملف** | **~358K tokens** |

---

## App Router Structure (`app/`)

### صفحات Dashboard (محمية بـ AuthGuard)
```
app/(dashboard)/
├── dashboard/          ← الرئيسية — WelcomeCard + ActivityFeed + FirstTimeTour
├── chat/               ← محادثة AI مع الـ 34 وكيل
├── departments/[dept]/ ← 7 أقسام: Marketing/Sales/Ops/Finance/HR/Support/Legal
├── profile/            ← الملف الشخصي + avatar upload
├── settings/
│   ├── page.tsx        ← إعدادات عامة + notification prefs
│   ├── api-keys/       ← API keys management
│   └── webhooks/       ← Webhooks management
├── notifications/      ← مركز الإشعارات
├── billing/            ← الفواتير + Fawry payment
├── meetings/           ← اجتماعات افتراضية
├── virtual-office/     ← مكتب افتراضي
├── cofounder-health/   ← تقييم صحة الشركاء
├── pitch-practice/     ← تدريب pitch
├── cash-runway/        ← تقرير التدفق النقدي
├── wellbeing/          ← صحة نفسية للمؤسسين
└── weekly-report/      ← التقرير الأسبوعي
```

### صفحات خارج Dashboard (لها مسار مستقل)
```
app/
├── operations/         ← عمليات الشركة (_page-client.tsx)
├── market-lab/         ← مختبر السوق + results/[id]/
├── investor-deck/      ← عروض المستثمرين
└── admin/              ← لوحة الإدارة (admin only)
```

### API Routes
```
app/api/
├── chat/route.ts           ← نقطة الدخول الرئيسية للـ AI
├── agents/[name]/route.ts  ← استدعاء وكيل محدد
├── billing/
│   └── fawry/checkout/     ← Fawry payment integration
├── user/
│   ├── update/             ← تحديث بيانات المستخدم
│   ├── avatar/             ← رفع الصورة الشخصية
│   └── notification-prefs/ ← تفضيلات الإشعارات
└── notifications/          ← قراءة/تعديل الإشعارات
```

---

## Components Structure (`components/`)

### Layout
```
components/layout/
├── AppShell.tsx        ← الغلاف الرئيسي (sidebar + header + UpgradeBanner)
├── Sidebar.tsx         ← القائمة الجانبية
└── Header.tsx          ← الرأس + NotificationBell
```

### Dashboard
```
components/dashboard/
├── WelcomeCard.tsx     ← بطاقة الترحيب مع نصائح مخصصة (6 مراحل)
├── FirstTimeTour.tsx   ← جولة المستخدم الجديد (5 خطوات)
└── ActivityFeed.tsx    ← تغذية نشاط الفريق
```

### UI Kit
```
components/ui/
├── PageSkeleton.tsx    ← skeleton loaders
├── ErrorBoundary.tsx   ← component-level error boundaries (عربي RTL)
├── CopyBtn.tsx         ← زر النسخ مع feedback
└── [shadcn components] ← Button, Card, Dialog, Badge...
```

### Billing
```
components/billing/
├── UpgradeBanner.tsx   ← شريط الترقية (usedPct = ((limit-balance)/limit)*100)
└── FawryDialog.tsx     ← نافذة دفع Fawry (3 خطوات)
```

### Landing
```
components/landing/
├── HomeBelowFold.tsx   ← HowItWorks + FeaturesBento
└── [other sections]
```

---

## Source Library (`src/`)

### AI Agents
```
src/ai/agents/
├── instrumentAgent.ts  ← حقن skills في system prompt
├── orchestrator/       ← تنسيق multi-agent
└── [34 agent files]
```

### Agent Skills System
```
src/lib/agent-skills/
├── registry.ts         ← تسجيل skills لكل وكيل
└── runtime-loader.ts   ← تحميل وتنسيق SKILL.md
```

### Security
```
src/lib/security/
├── auth.ts             ← Firebase Auth helpers
└── middleware.ts        ← route protection
```

---

## Configuration Files

| الملف | الغرض |
|---|---|
| `next.config.ts` | Next.js config (i18n, images) |
| `tailwind.config.ts` | Tailwind + RTL support |
| `tsconfig.json` | TypeScript strict mode |
| `.eslintrc.json` | ESLint + react-hooks rules |
| `firebase.json` | Firebase deployment config |
| `messages/ar.json` | Arabic translations (primary) |
| `messages/en.json` | English translations |

---

## Skills Inventory (`.agents/skills/`)

### Security Skills (جديد — 2026-05-10)
- `sast-sql-injection` — SQL Injection detection
- `sast-xss` — Cross-Site Scripting detection
- `sast-rce` — Remote Code Execution detection
- `sast-ssrf` — SSRF detection
- `sast-idor` — Insecure Direct Object Reference
- `sast-xxe` — XML External Entity
- `sast-ssti` — Server-Side Template Injection
- `sast-jwt` — JWT vulnerabilities
- `sast-path-traversal` — Path Traversal
- `sast-file-upload` — Insecure File Upload
- `sast-broken-auth` — Broken Authentication
- `sast-missing-auth` — Missing Authorization
- `sast-graphql` — GraphQL injection
- `sast-orchestrator` — SAST orchestrator (runs all 13 in parallel)

### Infrastructure Skills (جديد — 2026-05-10)
- `firebase-patterns` — Firestore/Auth/Storage best practices
- `vercel-deployment` — Vercel Edge/serverless deployment
- `stripe-integration` — Stripe payments integration
- `auth0-patterns` — Auth0 authentication patterns
- `sentry-monitoring` — Sentry error monitoring

### Memory Skills
- `openwolf-memory` — Project anatomy + token optimization

---

## Known Issues & Solutions
> راجع `.wolf/buglog.json` للتاريخ الكامل

| المشكلة | الحل |
|---|---|
| `usedPct` calculation wrong | `((dailyLimit - dailyBalance) / dailyLimit) * 100` |
| setState in useEffect ESLint error | wrap in `async function run()` + `void run()` |
| Duplicate routes conflict | Pages in `app/` (not `app/(dashboard)/`) are independent |
| `motion/react Variants` type error | Use `ease: "easeOut" as const` |

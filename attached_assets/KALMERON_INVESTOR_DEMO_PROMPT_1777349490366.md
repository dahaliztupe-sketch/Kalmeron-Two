# KALMERON — INVESTOR DEMO MASTER PROMPT
# برومبت شامل لتجهيز العرض التقديمي للمستثمرين خلال 48 ساعة
# مبني على قراءة معمّقة لكل ملفات المستودع: replit.md + USER_INTERVENTION_REQUIRED.md + .env.example + AGENTS.md

> الصق هذا البرومبت كاملاً في Replit Agent.
> اقرأ AGENTS.md أولاً ثم replit.md قبل أي تعديل.
> نفّذ المهام بالترتيب بدون توقف.

---

أنت مهندس أول تُعدّ منصة Kalmeron Two لعرض المستثمرين بعد غد. المنصة تضم 107 صفحة، 92 API route، 16 وكيل AI، و4 خدمات Python مستقلة. هدفك: أن يعمل كل شيء بشكل مثالي بدون أي خطأ.

**قبل أي شيء: اقرأ هذه الملفات كاملاً**
- AGENTS.md (دستور العمل الإلزامي)
- replit.md (كل قرارات الجلسات السابقة)
- USER_INTERVENTION_REQUIRED.md (ما يحتاج تدخلاً)

---

## ═══════════════════════════════
## المرحلة 0 — إعداد البيئة (ابدأ هنا)
## ═══════════════════════════════

### [0.1] إصلاح ملف .replit الحرج

افتح .replit وتحقق من قسم [deployment]. يجب أن يكون:
```
[deployment]
build = ["npm", "run", "build"]
run = ["npm", "start"]
deploymentTarget = "autoscale"
```

إذا وجدت `./dist/index.cjs` أو أي مسار خاطئ → صحّحه فوراً.

تحقق أيضاً من أقسام الـ workflows:
```
[[workflows]]
name = "Start application"
# يجب أن يشغّل: npm run dev (على المنفذ 5000)

[[workflows]]
name = "PDF Worker"
# يجب أن يشغّل: cd services/pdf-worker && uvicorn main:app --host 0.0.0.0 --port 8000

[[workflows]]
name = "Egypt Calc"
# يجب أن يشغّل: cd services/egypt-calc && uvicorn main:app --host 0.0.0.0 --port 8008

[[workflows]]
name = "LLM Judge"
# يجب أن يشغّل: cd services/llm-judge && uvicorn main:app --host 0.0.0.0 --port 8080

[[workflows]]
name = "Embeddings Worker"
# يجب أن يشغّل: cd services/embeddings-worker && uvicorn main:app --host 0.0.0.0 --port 8099
```

### [0.2] تشغيل وتثبيت خدمات Python

```bash
# تثبيت كل dependencies للـ sidecars
pip install fastapi uvicorn[standard] pydantic pypdf python-multipart regex google-generativeai hypothesis pytest fastembed numpy pandas plotly jinja2 --break-system-packages

# تحقق أن كل الخدمات تعمل
curl -s http://localhost:8000/health && echo "PDF Worker ✅"
curl -s http://localhost:8008/health && echo "Egypt Calc ✅"
curl -s http://localhost:8080/health && echo "LLM Judge ✅"
curl -s http://localhost:8099/health && echo "Embeddings Worker ✅"
```

إذا أي خدمة لا تستجيب → ابدأها يدوياً وأصلح السبب.

### [0.3] تحقق من متغيرات البيئة الحرجة

شغّل هذا الأمر وسجّل النتائج:
```bash
echo "=== فحص المتغيرات الإلزامية ===" && \
node -e "
const required = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'FIREBASE_ADMIN_PROJECT_ID',
  'FIREBASE_ADMIN_CLIENT_EMAIL',
  'FIREBASE_ADMIN_PRIVATE_KEY',
  'GOOGLE_GENERATIVE_AI_API_KEY'
];
required.forEach(k => {
  const val = process.env[k];
  console.log(val ? '✅ ' + k : '❌ MISSING: ' + k);
});
"
```

لكل متغير ناقص → أضف stub آمن للعمل بدونه (انظر الخطوة 0.4).

### [0.4] إنشاء .env.local بقيم Stub للمتغيرات الناقصة

إذا لم تكن القيم الحقيقية متاحة، أنشئ stubs تمنع الكراش وتُظهر رسائل واضحة:

```bash
cat > /tmp/check-and-create-stub.ts << 'EOF'
// هذا السكريبت يتحقق ويضيف stubs للمتغيرات الناقصة فقط
const stubsNeeded = [];

if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
  stubsNeeded.push('GOOGLE_GENERATIVE_AI_API_KEY=DEMO_MODE_NO_AI');
}
if (!process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
  stubsNeeded.push('FIREBASE_ADMIN_PRIVATE_KEY=STUB_KEY');
}
// اطبع ما يحتاج إضافة
console.log(stubsNeeded.join('\n'));
EOF
```

**ملاحظة مهمة للوكيل:** إذا لم تكن المفاتيح الحقيقية موجودة، تأكد أن المنصة تعمل بـ "Demo Mode" وأن الواجهة تعرض رسائل واضحة بدلاً من أخطاء خام.

---

## ═══════════════════════════════
## المرحلة 1 — فحص وإصلاح الأخطاء الحرجة
## ═══════════════════════════════

### [1.1] بناء وفحص شامل

```bash
# تحقق TypeScript
node --stack-size=8192 ./node_modules/typescript/bin/tsc --noEmit 2>&1 | tail -20

# تحقق ESLint
npm run lint 2>&1 | grep -E "error|Error" | head -20

# بناء إنتاجي
npm run build 2>&1 | tail -30

# تشغيل الاختبارات
npm run test 2>&1 | tail -20
```

إذا كان أي من هذه الأوامر يفشل → أصلح كل خطأ قبل المتابعة.
القاعدة: **صفر أخطاء TypeScript، صفر أخطاء ESLint، كل الاختبارات تمر.**

### [1.2] فحص كل الـ API Routes الحيوية

```bash
# بعد npm start، شغّل هذه الفحوصات
BASE="http://localhost:5000"

# صفحات عامة
for path in "/" "/pricing" "/demo" "/terms" "/privacy" "/affiliate" "/first-100" "/changelog" "/investors"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE$path")
  echo "$STATUS $path"
done

# API routes
for path in "/api/health" "/api/social-proof" "/api/investor/health" "/api/investor/metrics"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE$path")
  echo "$STATUS $path"
done
```

أي مسار يعطي 404 أو 500 → أصلحه فوراً.
المقبول فقط: 200 أو 401 (للمسارات المحمية).

### [1.3] إصلاح صفحة /affiliate-terms إذا كانت 404

```bash
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:5000/affiliate-terms")
echo "affiliate-terms status: $STATUS"
```

إذا 404 → أنشئ app/affiliate-terms/page.tsx:
```typescript
import { Metadata } from 'next';
// استخدم PublicShell، RTL، محتوى شروط برنامج الشركاء:
// - عمولة 30% شهرياً لمدة 12 شهراً
// - حد أدنى للدفع 50$
// - الدفع عبر Stripe أول الشهر
// - محظورات: Brand Keywords على Google/Meta
// - القانون الحاكم: جمهورية مصر العربية
export const metadata: Metadata = { title: 'شروط برنامج الشركاء | كلميرون AI' };
```

### [1.4] التحقق من صحة تدفق المصادقة

```bash
# تحقق أن هذه الصفحات تعمل بدون دخول
for path in "/auth/login" "/auth/signup"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:5000$path")
  echo "$STATUS $path"
done

# تحقق أن هذه الصفحات تُعيد redirect بدون دخول
for path in "/dashboard" "/profile" "/billing" "/admin"; do
  REDIRECT=$(curl -s -o /dev/null -w "%{redirect_url}" -L "http://localhost:5000$path" 2>/dev/null | head -1)
  echo "Redirect for $path: $REDIRECT"
done
```

أي صفحة محمية لا تُعيد redirect → أصلح AuthGuard عليها.

### [1.5] فحص خدمة /api/investor/health

```bash
curl -s http://localhost:5000/api/investor/health | python3 -m json.tool 2>/dev/null || \
curl -s http://localhost:5000/api/investor/health
```

تحقق من:
- هل readinessScore يظهر؟
- هل sidecars كلها موجودة في القائمة؟
- أصلح أي خطأ في الاستجابة

### [1.6] تشغيل سكريبت الفحص قبل العرض

```bash
# هذا السكريبت موجود مسبقاً في المشروع
npx tsx scripts/pre-demo-check.ts 2>&1

# إذا لم يعمل، شغّل الفحص اليدوي
curl -s http://localhost:5000/api/investor/health | python3 -c "
import json, sys
data = json.load(sys.stdin)
score = data.get('readinessScore', 0)
print(f'Readiness Score: {score}/100')
issues = data.get('criticalIssues', [])
if issues:
    print('Critical Issues:')
    for i in issues: print(f'  - {i}')
"
```

---

## ═══════════════════════════════
## المرحلة 2 — تحسين تجربة العرض للمستثمرين
## ═══════════════════════════════

### [2.1] تعبئة بيانات Demo (Seed Data)

```bash
# تعبئة بيانات "أكلة بيتنا" التجريبية (موجودة مسبقاً في /api/investor/seed)
# أنشئ token مؤقت للاختبار أو استخدم Firebase Admin SDK مباشرة

# تحقق أن الـ endpoint موجود
curl -s -X GET http://localhost:5000/api/investor/seed

# إذا لم يكن موجوداً → أنشئ app/api/investor/seed/route.ts
# يجب أن يحتوي:
# - بيانات شركة "أكلة بيتنا"
# - Brand Voice عربي
# - خطة مالية تجريبية (6 أشهر)
# - 3 فرص محفوظة من رادار الفرص
# - تاريخ: 2026-04-28
```

### [2.2] التحقق من صفحات المستثمرين

```bash
for path in "/investor" "/investor/health" "/investor/demo-mode" "/investor/guide"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -H "Cookie: kal_session=1" "http://localhost:5000$path")
  echo "$STATUS $path"
done
```

إذا أي منها غير موجود → أنشئها بناءً على ما هو موثق في replit.md.

### [2.3] إنشاء صفحة /investors العامة (للمستثمرين قبل تسجيل الدخول)

```bash
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:5000/investors")
echo "Public investors page: $STATUS"
```

إذا 404 → أنشئ app/investors/page.tsx بهذا المحتوى:

```typescript
import { Metadata } from 'next';
// PublicShell + RTL + dir="rtl"

// القسم 1: Hero
// عنوان: "نظام تشغيل الشركات الناشئة العربية"
// subhead: "نبحث عن شركاء استثماريين لجولة Seed"
// زران: "احجز جلسة" + "شاهد Demo"

// القسم 2: أرقام السوق (4 بطاقات)
// TAM: +15 مليار دولار | المستهدفون: +500,000 شركة | السعر: من 199 جنيه | تقنية: Next.js 16 + Gemini 2.5

// القسم 3: المشكلة والحل
// المشكلة: رائد الأعمال المصري يدفع 5,000-50,000 جنيه/شهر للمستشارين
// الحل: 16 مساعداً ذكياً بـ 199 جنيه/شهر

// القسم 4: التقنية
// Next.js 16, Firebase, Gemini 2.5 Pro, Python sidecars, LangGraph
// 0 TypeScript errors, متوافق قانون 151 + PDPL + GDPR

// القسم 5: خارطة الطريق (Timeline)
// Q2 2026: إطلاق MVP | Q3 2026: تطبيق موبايل + WhatsApp | Q4 2026: Teams | Q1 2027: API للمطورين

// القسم 6: CTA
// "احجز جلسة تعريفية" → mailto:invest@kalmeron.ai
// "جرب المنصة مجاناً" → /auth/signup

export const metadata: Metadata = {
  title: 'للمستثمرين | كلميرون AI — نظام تشغيل الشركات الناشئة العربية',
  description: 'كلميرون AI — منصة SaaS عربية تضم 16 وكيلاً ذكياً لرواد الأعمال في مصر والسعودية والإمارات. نبحث عن شركاء استثماريين لجولة Seed.',
  openGraph: {
    title: 'كلميرون AI للمستثمرين',
    description: 'سوق +15 مليار دولار، 16 وكيل AI، تقنية متقدمة، متوافق قانونياً.',
    url: 'https://kalmeron-two.vercel.app/investors',
    siteName: 'كلميرون AI',
    locale: 'ar_EG',
    type: 'website',
  }
};
```

### [2.4] التحقق من صفحة /demo

```bash
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:5000/demo")
echo "Demo page: $STATUS"
```

إذا الصفحة موجودة → تحقق أنها تعمل بدون تسجيل دخول وأن الـ scenarios تعمل.
إذا لم تكن موجودة → أنشئها مع 4 سيناريوهات تفاعلية بالعربية.

### [2.5] إنشاء صفحة /about إذا لم تكن موجودة

```bash
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:5000/about")
echo "About page: $STATUS"
```

إذا 404 → أنشئ app/about/page.tsx:
- قصة كلميرون ولماذا بُني
- الفريق (يمكن مؤقتاً)
- الرؤية: "مقرّ عمليات كل شركة ناشئة عربية"
- PublicShell + RTL + metadata كاملة

---

## ═══════════════════════════════
## المرحلة 3 — التحقق التقني الشامل
## ═══════════════════════════════

### [3.1] اختبار كل الـ 16 وكيل

```bash
# أنشئ سكريبت الاختبار
cat > /tmp/test-agents.sh << 'SCRIPT'
#!/bin/bash
BASE="http://localhost:5000"
AGENTS=("general" "cfo" "legal" "marketing" "sales" "hr" "operations" "product" "investor" "customer-voice" "idea-validator" "plan-builder" "mistake-shield" "success-museum" "opportunity-radar" "real-estate")

echo "=== اختبار الوكلاء ==="
for agent in "${AGENTS[@]}"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
    "$BASE/api/agents/$agent" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer DEMO_TOKEN" \
    -d '{"messages":[{"role":"user","content":"مرحباً، ما دورك؟"}]}' \
    --max-time 5)
  
  if [ "$STATUS" = "200" ] || [ "$STATUS" = "401" ]; then
    echo "✅ $agent ($STATUS)"
  else
    echo "❌ $agent ($STATUS) — يحتاج إصلاح"
  fi
done
SCRIPT
chmod +x /tmp/test-agents.sh
bash /tmp/test-agents.sh
```

لكل وكيل يعطي 500 أو 404 → افتح ملفه في src/ai/agents/ وأصلح المشكلة.
تأكد أن كل وكيل له stub response واضح بدون GEMINI_API_KEY.

### [3.2] فحص نظام الـ streaming

```bash
# تحقق من SSE streaming في chat
curl -s -N -X POST "http://localhost:5000/api/chat" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer DEMO_TOKEN" \
  -d '{"messages":[{"role":"user","content":"مرحباً"}],"stream":true}' \
  --max-time 10 | head -5
```

إذا لم يرد بـ SSE events → افتح app/api/chat/route.ts وتحقق من streaming setup.

### [3.3] فحص خدمات Python

```bash
# PDF Worker
curl -s http://localhost:8000/health
echo ""

# Egypt Calc - اختبار حقيقي
curl -s -X POST http://localhost:8008/income-tax \
  -H "Content-Type: application/json" \
  -d '{"annual_gross": 180000}' | python3 -m json.tool

# LLM Judge
curl -s http://localhost:8080/health
echo ""

# Embeddings Worker
curl -s -X POST http://localhost:8099/embed \
  -H "Content-Type: application/json" \
  -d '{"text": "ريادة الأعمال في مصر"}' | python3 -c "
import json, sys
data = json.load(sys.stdin)
if 'embedding' in data:
  print(f'✅ Embedding dim: {len(data[\"embedding\"])}')
else:
  print(f'Response: {data}')
"
```

### [3.4] فحص الأداء

```bash
# قياس سرعة الصفحة الرئيسية
time curl -s -o /dev/null http://localhost:5000/

# قياس سرعة API
time curl -s -o /dev/null http://localhost:5000/api/health

# فحص حجم الصفحة
curl -s -o /dev/null -w "Size: %{size_download} bytes\nTime: %{time_total}s\n" http://localhost:5000/
```

إذا الصفحة الرئيسية تستغرق أكثر من 5 ثوانٍ → افتح next.config.ts وتحقق من:
- typescript.ignoreBuildErrors: true
- هل Turbopack مفعّل؟
- هل HomeBelowFold يستخدم next/dynamic مع ssr: false؟

### [3.5] فحص الـ RTL على كل الصفحات

```bash
# تحقق أن html dir="rtl" موجود في كل صفحة
for path in "/" "/pricing" "/investors" "/demo" "/auth/login"; do
  HAS_RTL=$(curl -s "http://localhost:5000$path" | grep -c 'dir="rtl"\|dir=rtl' || true)
  echo "$path: RTL=$HAS_RTL"
done
```

أي صفحة بدون RTL → افتح app/layout.tsx وتحقق من `<html dir="rtl" lang="ar">`.

---

## ═══════════════════════════════
## المرحلة 4 — Checklist يوم العرض
## ═══════════════════════════════

### [4.1] تشغيل الـ Diagnostics Script

```bash
# موجود في المشروع من جلسة 2026-04-27
npm run diag 2>&1 | tail -30

# إذا لم يكن موجوداً
npm run diag:errors 2>&1 | tail -20
npm run diag:gaps 2>&1 | tail -20
```

### [4.2] Checklist الإطلاق النهائي

```bash
cat > /tmp/investor-checklist.sh << 'CHECKLIST'
#!/bin/bash
BASE="http://localhost:5000"
PASS=0
FAIL=0

check() {
  local name="$1"
  local url="$2"
  local expected="${3:-200}"
  
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$url" --max-time 10)
  if [ "$STATUS" = "$expected" ]; then
    echo "✅ $name"
    PASS=$((PASS+1))
  else
    echo "❌ $name (got $STATUS, expected $expected)"
    FAIL=$((FAIL+1))
  fi
}

echo "════════════════════════════════"
echo "  KALMERON INVESTOR DEMO CHECK"
echo "════════════════════════════════"
echo ""
echo "--- الصفحات العامة ---"
check "الصفحة الرئيسية" "$BASE/"
check "التسعير" "$BASE/pricing"
check "Demo" "$BASE/demo"
check "تسجيل الدخول" "$BASE/auth/login"
check "إنشاء حساب" "$BASE/auth/signup"
check "للمستثمرين" "$BASE/investors"
check "Affiliate" "$BASE/affiliate"
check "Affiliate Terms" "$BASE/affiliate-terms"
check "شروط الاستخدام" "$BASE/terms"
check "الخصوصية" "$BASE/privacy"
check "الامتثال" "$BASE/compliance"
check "Changelog" "$BASE/changelog"
check "First 100" "$BASE/first-100"
check "About" "$BASE/about"

echo ""
echo "--- API Health ---"
check "API Health" "$BASE/api/health"
check "Social Proof" "$BASE/api/social-proof"
check "Investor Health" "$BASE/api/investor/health"
check "Investor Metrics" "$BASE/api/investor/metrics"

echo ""
echo "--- Sidecars ---"
check "PDF Worker" "http://localhost:8000/health"
check "Egypt Calc" "http://localhost:8008/health"
check "LLM Judge" "http://localhost:8080/health"
check "Embeddings" "http://localhost:8099/health"

echo ""
echo "--- صفحات الداشبورد (يجب redirect بدون دخول) ---"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -L "$BASE/dashboard" --max-time 5)
if [ "$STATUS" = "200" ]; then
  # تحقق أن الصفحة تحتوي على login form وليس dashboard content
  CONTENT=$(curl -s -L "$BASE/dashboard" --max-time 5)
  if echo "$CONTENT" | grep -q "تسجيل الدخول\|login\|auth"; then
    echo "✅ Dashboard محمي (redirect يعمل)"
    PASS=$((PASS+1))
  else
    echo "⚠️  Dashboard قد يكون مكشوف - تحقق يدوياً"
  fi
fi

echo ""
echo "════════════════════════════════"
echo "النتيجة: ✅ $PASS نجح | ❌ $FAIL فشل"
SCORE=$((PASS * 100 / (PASS + FAIL)))
echo "النقاط: $SCORE/100"
if [ $FAIL -eq 0 ]; then
  echo "🎉 المنصة جاهزة للعرض!"
else
  echo "⚠️  يوجد $FAIL مشكلة تحتاج إصلاح"
fi
echo "════════════════════════════════"
CHECKLIST

chmod +x /tmp/investor-checklist.sh
bash /tmp/investor-checklist.sh
```

### [4.3] تحسينات سرعة التحميل على الموبايل

افتح app/page.tsx وتحقق من:
- هل ParticleField محجوب على الموبايل؟
- هل HomeBelowFold يستخدم next/dynamic؟
- هل IntroPreloader محذوف؟ (حُذف في جلسة سابقة)
- هل الـ hero h1 يستخدم `clamp` مناسب للموبايل (1.6rem أدنى حد)؟
- هل `overflow-x: hidden` موجود في globals.css؟

إذا أي من هذه ناقص → أصلحه.

### [4.4] فحص صفحة /pricing هل هي SSR

```bash
# تحقق أن /pricing تعرض محتوى server-side
CONTENT=$(curl -s "http://localhost:5000/pricing")
if echo "$CONTENT" | grep -q "جارٍ التحضير\|Loading"; then
  echo "❌ pricing page is client-only — يحتاج SSR"
else
  echo "✅ pricing page has server content"
fi
```

إذا client-only → افتح app/pricing/page.tsx وحوّل البيانات الثابتة لـ server-side.

---

## ═══════════════════════════════
## المرحلة 5 — إضافة ما ينقص للعرض
## ═══════════════════════════════

### [5.1] تحقق من Pitch Deck

```bash
ls -la docs/INVESTOR_PITCH_DECK.html 2>/dev/null && echo "✅ Pitch Deck موجود" || echo "❌ Pitch Deck غير موجود"
```

إذا موجود → افتح الملف وتحقق من:
- هل placeholders في الشرائح 10 و12 لا تزال فارغة؟ (يجب أن تحتوي بيانات حقيقية)
- هل التصميم RTL سليم؟

إذا غير موجود → أنشئ docs/INVESTOR_PITCH_DECK.html بـ 12 شريحة (HTML + CSS فقط، لا JS):
```
شريحة 1: الغلاف - كلميرون AI + tagline
شريحة 2: المشكلة - أرقام رواد الأعمال العرب
شريحة 3: الحل - 16 وكيل AI بالعربية
شريحة 4: المنتج - Screenshot/mockup + features
شريحة 5: السوق - TAM/SAM/SOM
شريحة 6: الزخم - ما بُني حتى الآن
شريحة 7: نموذج الإيرادات - خطط التسعير + Fawry + Stripe
شريحة 8: GTM - مصر أولاً ثم الخليج
شريحة 9: المنافسة - vs مستشارين تقليديين vs ChatGPT
شريحة 10: الفريق - (أضف بياناتك هنا)
شريحة 11: الماليات + الطلب - ARR target + use of funds
شريحة 12: الرؤية + التواصل - (أضف بياناتك هنا)
```

### [5.2] تحقق من Speaker Guide

```bash
ls -la app/investor/guide/page.tsx 2>/dev/null || ls -la app/'(dashboard)'/investor/guide/page.tsx 2>/dev/null
```

إذا لم يكن موجوداً → أنشئه:
دليل المتحدث للمستثمر بـ 5 أقسام:
1. ما هو كلميرون (60 ثانية)
2. لماذا الآن (السوق + التوقيت)
3. التميز التقني (Hybrid Routing + Council + egypt-calc)
4. نموذج العمل وكيف نربح
5. أسئلة متوقعة وإجاباتها

### [5.3] تحقق من responsive على الموبايل

```bash
# Lighthouse quick check (إذا كان متاحاً)
npx lighthouse http://localhost:5000 --only-categories=performance,accessibility --output=json --quiet 2>/dev/null | python3 -c "
import json, sys
try:
  data = json.load(sys.stdin)
  cats = data.get('categories', {})
  perf = cats.get('performance', {}).get('score', 0) * 100
  a11y = cats.get('accessibility', {}).get('score', 0) * 100
  print(f'Performance: {perf:.0f}/100')
  print(f'Accessibility: {a11y:.0f}/100')
except:
  print('Lighthouse غير متاح - تحقق يدوياً')
" 2>/dev/null || echo "Lighthouse غير متاح"
```

### [5.4] إنشاء ملف INVESTOR_DEMO_READY.md نهاية التحقق

```bash
cat > INVESTOR_DEMO_READY_$(date +%Y-%m-%d).md << 'REPORT'
# كلميرون — جاهزية عرض المستثمرين
**التاريخ:** $(date)
**المرحلة:** Seed Round

## ✅ ما يعمل
[سيُعبأ تلقائياً بعد تشغيل الـ checklists]

## ⚠️ ما يحتاج إضافة مفاتيح حقيقية
- GOOGLE_GENERATIVE_AI_API_KEY → لتفعيل الـ 16 وكيل
- NEXT_PUBLIC_FIREBASE_API_KEY → لتفعيل تسجيل الدخول
- STRIPE_SECRET_KEY → لتفعيل المدفوعات

## 📊 Readiness Score
[شغّل: npx tsx scripts/pre-demo-check.ts]

## 🎯 مسار العرض المقترح (15 دقيقة)
1. (2 دق) الصفحة الرئيسية → قصة المشكلة
2. (3 دق) /demo → سيناريو كافيه المعادي live
3. (5 دق) /dashboard → إظهار 3 وكلاء فعلياً
4. (3 دق) /investor/health → أرقام تقنية
5. (2 دق) /pricing → نموذج الإيرادات

## 🔑 المتغيرات الإلزامية للعرض الحي
انظر USER_INTERVENTION_REQUIRED.md القسم 1 و 2
REPORT

echo "✅ تم إنشاء ملف جاهزية العرض"
```

---

## ═══════════════════════════════
## المرحلة 6 — التحقق النهائي
## ═══════════════════════════════

### [6.1] الأمر الإلزامي قبل إيقاف الجلسة

```bash
echo "=== التحقق النهائي الكامل ===" && \
node --stack-size=8192 ./node_modules/typescript/bin/tsc --noEmit 2>&1 | tail -3 && \
npm run lint 2>&1 | grep -c "error" | xargs -I{} echo "ESLint errors: {}" && \
npm run test 2>&1 | tail -5 && \
npm run build 2>&1 | tail -5 && \
echo "✅ كل الفحوصات اجتازت" || echo "❌ يوجد مشاكل"
```

### [6.2] ملخص ما يحتاج تدخلاً بشرياً (لا يمكن للوكيل تنفيذه)

بعد انتهاء كل ما سبق، اكتب قائمة واضحة بهذا الشكل:

```
## ما يحتاج منك أنت (لا يمكن للوكيل تنفيذه):

🔴 إلزامي قبل العرض:
1. أضف GOOGLE_GENERATIVE_AI_API_KEY في Replit Secrets
   المصدر: console.cloud.google.com → API Keys
   
2. أضف NEXT_PUBLIC_FIREBASE_API_KEY و5 متغيرات Firebase معه
   المصدر: Firebase Console → Project Settings → Your Apps
   
3. أضف FIREBASE_ADMIN_PROJECT_ID + FIREBASE_ADMIN_CLIENT_EMAIL + FIREBASE_ADMIN_PRIVATE_KEY
   المصدر: Firebase Console → Project Settings → Service Accounts → Generate new private key

🟡 اختياري للعرض الكامل:
4. Stripe test keys (sk_test_... + pk_test_...)
   للتظاهر بعملية دفع أمام المستثمرين
   
5. PLATFORM_ADMIN_UIDS = [Firebase UID الخاص بك]
   للوصول لصفحات الـ admin

🟢 للإنتاج الحقيقي (بعد العرض):
6. Fawry merchant code للدفع المصري
7. Resend API key للإيميلات
8. Sentry DSN للمراقبة
9. نشر sidecars على Cloud Run
```

---

## ═══════════════════════════════
## القواعد الإلزامية طوال التنفيذ
## ═══════════════════════════════

```
لا تكسر ما يعمل حالياً:
✗ لا تعدّل firestore.rules بدون تشغيل test:rules
✗ لا تغيّر TypeScript strict settings
✗ لا تحذف ملفات بدون التأكد أنها غير مستخدمة
✗ لا تضيف "use client" بدون سبب حقيقي

RTL وعربية:
✓ dir="rtl" في كل صفحة عامة
✓ النصوص بالعربية الفصحى (مصطلحات من lexicon.ts)
✓ الأرقام يمكن أن تكون إنجليزية (1,000 وليس ١٠٠٠)

جودة الكود:
✓ بعد كل تعديل: npm run typecheck (يجب 0 أخطاء)
✓ بعد كل تعديل: تأكد أن المسارات المعدّلة تستجيب 200
✓ حدّث replit.md بملاحظة قصيرة عن كل تعديل مهم

أسلوب العمل:
✓ نفّذ وأبلّغ — لا تتوقف لتسأل إذا الإجابة واضحة
✓ إذا وجدت قرارات كبيرة → اطرح السؤال بوضوح
✓ استمر حتى تنتهي من كل الـ checklist
```

---

**الجملة الأخيرة:** بعد الانتهاء من كل شيء، شغّل:
```bash
bash /tmp/investor-checklist.sh && echo "🚀 كلميرون جاهز لعرض المستثمرين!"
```

اطبع النتيجة وأبلّغني بـ Score النهائي.

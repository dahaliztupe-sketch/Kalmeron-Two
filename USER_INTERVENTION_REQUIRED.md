# 📋 المهام التي تحتاج تدخلك — Kalmeron Two

> آخر تحديث: 2026-04-26 — هذا الملف يلخّص كل ما يحتاج تدخلك أنت (لا يمكنني فعله نيابة عنك)
> لتشغيل المنصة بكامل قدراتها على بيئة الإنتاج.

---

## ✅ ما تم إنجازه بالفعل (لا تدخل مطلوب)

- جميع تحذيرات TypeScript مُعالَجة → `npm run typecheck` ينتهي بنجاح بدون رسائل.
- جميع تحذيرات ESLint مُعالَجة → `npm run lint` ينتهي بنجاح بدون رسائل (من **467** تحذير → **0**).
- تحذيرات React hooks (`exhaustive-deps`, `set-state-in-effect`) مُعالجة أو موثَّقة.
- التطبيق يستجيب بـ HTTP 200 على `/` و`/agents`.

---

## 🚨 ١. تدخل عاجل (يمنع النشر أو يكسر ميزات أساسية)

### 1.1 إصلاح ملف نشر Replit `.replit`
- **المشكلة:** ملف `.replit` يشير إلى `./dist/index.cjs` وهو غير موجود (المشروع Next.js وليس Node خام).
- **لا أستطيع إصلاحه:** لا يحقّ لي تعديل `.replit` أو `replit.nix`.
- **المطلوب منك:** افتح ملف `.replit` وعدّل قسم `[deployment]` ليصبح:
  ```toml
  [deployment]
  build = ["npm", "run", "build"]
  run = ["npm", "start"]
  ```
- **بديل:** استعمل النشر التلقائي من Replit Deployments (Autoscale أو Reserved VM).

### 1.2 ضبط مفاتيح Firebase (Client + Admin)
بدونها لن يعمل تسجيل الدخول، الجلسات، التخزين، أو أي شيء يقرأ Firestore.

| المتغير | من أين تحصل عليه | إلزامي؟ |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Console → Project Settings → Web App | ✅ |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | نفس المكان | ✅ |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | نفس المكان | ✅ |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | نفس المكان | ✅ |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | نفس المكان | ✅ |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | نفس المكان | ✅ |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | (Analytics) | ⚪ اختياري |
| `NEXT_PUBLIC_FIREBASE_FIRESTORE_DATABASE_ID` | إذا تستخدم Firestore Database غير الافتراضية | ⚪ اختياري |
| `NEXT_PUBLIC_FIREBASE_VAPID_KEY` | Cloud Messaging → Web Push certificates | ✅ للإشعارات |
| `FIREBASE_ADMIN_PROJECT_ID` | Service Account JSON → `project_id` | ✅ |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | Service Account JSON → `client_email` | ✅ |
| `FIREBASE_ADMIN_PRIVATE_KEY` | Service Account JSON → `private_key` (احتفظ بـ `\n`) | ✅ |
| `FIREBASE_PROJECT_ID` | نفس قيمة `FIREBASE_ADMIN_PROJECT_ID` | ✅ |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | الـ JSON كاملًا (بديل عن الثلاثة أعلاه) | ⚪ بديل |
| `FIRESTORE_BACKUP_GCS_BUCKET` | اسم Google Cloud Storage bucket للنسخ الاحتياطي | ⚪ اختياري |

### 1.3 مفاتيح الذكاء الاصطناعي
بدون واحد منها على الأقل، المساعدون الـ16 لن يستجيبوا.

| المتغير | الخدمة | إلزامي؟ |
|---|---|---|
| `GOOGLE_GENERATIVE_AI_API_KEY` | Gemini (الافتراضي) | ✅ على الأقل واحد |
| `GEMINI_API_KEY` | Gemini (نفس المفتاح أعلاه) | ⚪ |
| `GOOGLE_API_KEY` | Google AI generic | ⚪ |
| `OPENAI_API_KEY` | OpenAI (للنماذج البديلة) | ⚪ |
| `ANTHROPIC_API_KEY` | Claude (للنماذج البديلة) | ⚪ |
| `MODEL_PRO` | اسم نموذج "متقدم" (افتراضي: `gemini-2.0-pro`) | ⚪ |
| `MODEL_FLASH` | نموذج سريع (افتراضي: `gemini-2.0-flash`) | ⚪ |
| `MODEL_LITE` | نموذج خفيف (افتراضي: `gemini-1.5-flash-8b`) | ⚪ |
| `MODEL_EMBEDDING` | نموذج تضمينات (افتراضي محلي) | ⚪ |
| `KALMERON_PROVIDER_ORDER` | ترتيب المزودين، مثال: `gemini,openai,anthropic` | ⚪ |
| `KALMERON_DEFAULT_BUDGET_USD` | سقف يومي لكل مستخدم (افتراضي: 5) | ⚪ |
| `COST_DAILY_LIMIT_USD` | السقف اليومي الكلي للمنصة | ⚪ |

---

## 💳 ٢. الدفع والاشتراكات

### 2.1 Stripe (الدفع الدولي)
| المتغير | الوصف |
|---|---|
| `STRIPE_SECRET_KEY` | sk_live_... أو sk_test_... |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | pk_live_... أو pk_test_... |
| `STRIPE_WEBHOOK_SECRET` | whsec_... من Webhooks → Add endpoint → `https://YOUR_DOMAIN/api/webhooks/stripe` |
| `STRIPE_PRICE_STARTER_MONTHLY_EGP` | معرّف السعر من Stripe Dashboard |
| `STRIPE_PRICE_STARTER_ANNUAL_EGP` | |
| `STRIPE_PRICE_STARTER_MONTHLY_USD` | |
| `STRIPE_PRICE_STARTER_ANNUAL_USD` | |
| `STRIPE_PRICE_PRO_MONTHLY_EGP` | |
| `STRIPE_PRICE_PRO_ANNUAL_EGP` | |
| `STRIPE_PRICE_PRO_MONTHLY_USD` | |
| `STRIPE_PRICE_PRO_ANNUAL_USD` | |
| `STRIPE_PRICE_FOUNDER_MONTHLY_EGP` | |
| `STRIPE_PRICE_FOUNDER_ANNUAL_EGP` | |
| `STRIPE_PRICE_FOUNDER_MONTHLY_USD` | |
| `STRIPE_PRICE_FOUNDER_ANNUAL_USD` | |

> 🛠️ **خطوات Stripe Dashboard:**
> 1. أنشئ المنتجات الثلاثة (STARTER, PRO, FOUNDER) في Stripe Products.
> 2. لكل منتج، أضف سعرين (MONTHLY + ANNUAL) في عملتين (EGP + USD) = 12 سعر.
> 3. انسخ معرّفات الأسعار (`price_…`) إلى المتغيرات أعلاه.
> 4. أضف Webhook endpoint للأحداث: `customer.subscription.*`, `invoice.*`, `checkout.session.completed`.

### 2.2 Fawry Pay (الدفع المحلي المصري)
| المتغير | الوصف |
|---|---|
| `FAWRY_BASE_URL` | `https://atfawry.fawrystaging.com` (تجريبي) أو `https://www.atfawry.com` (إنتاج) |
| `FAWRY_MERCHANT_CODE` | من حساب التاجر في فوري |
| `FAWRY_SECURITY_KEY` | المفتاح الأمني السري |
| `FAWRY_PUBLIC_BASE_URL` | عنوان موقعك الفعلي (مثال: `https://kalmeron.com`) |

---

## 📧 ٣. الاتصالات الخارجية

### 3.1 البريد الإلكتروني (Resend)
| المتغير | الوصف |
|---|---|
| `RESEND_API_KEY` | re_... من resend.com → API Keys |
| `RESEND_FROM` / `EMAIL_FROM` | عنوان المُرسِل (مثال: `Kalmeron <noreply@kalmeron.com>`) — يجب التحقّق من النطاق في Resend |
| `SENDGRID_API_KEY` | بديل اختياري لـ Resend |

### 3.2 WhatsApp Business
| المتغير | الوصف |
|---|---|
| `WHATSAPP_ACCESS_TOKEN` | من Meta for Developers → WhatsApp → API Setup |
| `WHATSAPP_PHONE_ID` / `WHATSAPP_PHONE_NUMBER_ID` | معرّف رقم WhatsApp Business |
| `WHATSAPP_VERIFY_TOKEN` | سلسلة عشوائية تختارها للتحقّق من Webhook |
| `WHATSAPP_APP_SECRET` | App Secret من Meta App Dashboard |
| `WHATSAPP_TOKEN` | بديل قديم لـ ACCESS_TOKEN |

> 🛠️ **خطوات WhatsApp Webhook:**
> اربط Webhook عند `https://YOUR_DOMAIN/api/webhooks/whatsapp` بنفس قيمة `WHATSAPP_VERIFY_TOKEN`.

### 3.3 Telegram (اختياري)
| المتغير | الوصف |
|---|---|
| `TELEGRAM_BOT_TOKEN` | من BotFather |
| `TELEGRAM_WEBHOOK_SECRET` | سلسلة عشوائية للأمان |

---

## 📊 ٤. المراقبة والملاحظات (Observability)

### 4.1 Sentry (تتبّع الأخطاء)
| المتغير | الوصف |
|---|---|
| `SENTRY_DSN` | من Sentry Project Settings → Client Keys |
| `NEXT_PUBLIC_SENTRY_DSN` | نفس القيمة (للمتصفّح) |
| `SENTRY_ORG` | اسم المنظمة في Sentry |
| `SENTRY_PROJECT` | اسم المشروع |
| `SENTRY_AUTH_TOKEN` | لرفع source maps |

### 4.2 Langfuse / Phoenix (تتبّع نداءات LLM)
| المتغير | الوصف |
|---|---|
| `LANGFUSE_PUBLIC_KEY` | pk-lf-... |
| `LANGFUSE_SECRET_KEY` | sk-lf-... |
| `LANGFUSE_BASE_URL` | https://cloud.langfuse.com (افتراضي) |
| `PHOENIX_ENDPOINT` | عنوان Arize Phoenix الذاتي (اختياري) |

### 4.3 PostHog (تحليلات الاستخدام)
| المتغير | الوصف |
|---|---|
| `POSTHOG_KEY` | phc_... |
| `POSTHOG_HOST` | https://app.posthog.com |

### 4.4 إعدادات تنبيهات الأداء
| المتغير | الوصف | الافتراضي |
|---|---|---|
| `HIGH_LATENCY_MS` | عتبة زمن الاستجابة المرتفع | 5000 |
| `LOW_SUCCESS_PCT` | عتبة نسبة النجاح المنخفضة | 90 |
| `LLM_GATEWAY_TIMEOUT_MS` | مهلة بوابة LLM | 30000 |
| `LOG_LEVEL` | مستوى التسجيل | info |

---

## 🗄️ ٥. التخزين والذاكرة المؤقتة

### 5.1 Upstash Redis (Rate limiting + Sessions)
| المتغير | الوصف |
|---|---|
| `UPSTASH_REDIS_REST_URL` | من upstash.com → Console |
| `UPSTASH_REDIS_REST_TOKEN` | نفس المكان |
| `KV_REST_API_URL` | بديل لـ Vercel KV |
| `KV_REST_API_TOKEN` | بديل لـ Vercel KV |

### 5.2 Neo4j (Graph Memory للمساعدين)
| المتغير | الوصف |
|---|---|
| `NEO4J_URI` | bolt://... أو neo4j+s://... |
| `NEO4J_USER` / `NEO4J_USERNAME` | اسم المستخدم |
| `NEO4J_PASSWORD` | كلمة المرور |

### 5.3 Vercel Edge Config (اختياري)
| المتغير | الوصف |
|---|---|
| `EDGE_CONFIG` | عنوان Vercel Edge Config |
| `VERCEL_API_TOKEN` | للتحديث البرمجي |

---

## 🔐 ٦. الأمان والتشفير (Pepper Hashes)

> ولّد قيمًا عشوائية قوية (32+ بايت) لكل واحد. استعمل `openssl rand -hex 32`.

| المتغير | الغرض |
|---|---|
| `API_KEY_HASH_PEPPER` | تجزئة مفاتيح API الخاصة بالمستخدمين |
| `LLM_AUDIT_HASH_PEPPER` | تجزئة سجلات تدقيق LLM |
| `COMPLIANCE_HASH_PEPPER` | تجزئة بيانات الامتثال (RTBF) |
| `LIVE_SUPPORT_TOKEN_SECRET` | توقيع توكن الدعم الفوري |
| `CRON_SECRET` | حماية مسارات الـcron من الاستدعاء العام |

---

## 🐍 ٧. الخدمات الجانبية بـ Python (sidecars)

> هذه خدمات FastAPI مستقلة في `services/`. في التطوير تعمل محليًا، في الإنتاج تحتاج نشر منفصل (Cloud Run / Railway / Fly.io).

| الخدمة | المنفذ | متغير URL |
|---|---|---|
| `services/pdf-worker` | 8000 | `PDF_WORKER_URL` |
| `services/egypt-calc` | 8008 | `EGYPT_CALC_URL` |
| `services/llm-judge` | 8080 | `LLM_JUDGE_URL` |
| `services/embeddings-worker` | 8099 | `EMBEDDINGS_WORKER_URL` |

**خطوات النشر:**
1. لكل خدمة، أنشئ Dockerfile (موجود في كل مجلد) وانشرها على Cloud Run.
2. حدّث المتغير المقابل بـ URL الإنتاج.
3. اضبط `PDF_WORKER_CORS` ليحتوي نطاق منصّتك بدل `*`.

| متغير إضافي | الوصف |
|---|---|
| `PDF_WORKER_MAX_BYTES` | السقف الأعلى للرفع (افتراضي 20MB) |
| `PDF_WORKER_CORS` | نطاقات CORS مسموح بها |
| `EMBEDDINGS_MODEL` | نموذج التضمينات المستعمل |
| `EMBEDDINGS_CACHE_SIZE` | حجم الذاكرة المؤقتة |
| `JUDGE_MODEL` | نموذج LLM-as-judge (افتراضي gemini-2.5-flash-lite) |

---

## 🌐 ٨. متغيرات تشغيلية متفرّقة

| المتغير | الغرض |
|---|---|
| `NEXT_PUBLIC_APP_URL` | عنوان التطبيق العام (مثال: `https://kalmeron.com`) |
| `NEXT_PUBLIC_BASE_URL` | نفس القيمة |
| `PLATFORM_ADMIN_UIDS` | قائمة Firebase UIDs للمشرفين، مفصولة بفواصل |
| `ADMIN_EMAILS` | قائمة بريد إلكتروني للمشرفين |
| `KALMERON_COUNCIL` | اضبط على `off` لتعطيل ميزة "المجلس" في الاختبارات |
| `SEMANTIC_CACHE_DISABLE_L2` | اضبط على `1` لتعطيل الكاش L2 |
| `NODE_ENV` | `production` أو `development` (يُضبط تلقائيًا) |
| `PORT` | منفذ الخادم (Replit يضبطه) |

### للتطبيق المحمول (Expo) — اختياري
| المتغير | الوصف |
|---|---|
| `EXPO_PROJECT_ID` | معرف مشروع Expo |
| `EXPO_PUBLIC_API_BASE_URL` | عنوان API الذي يستهدفه التطبيق |
| `EXPO_PUBLIC_GEMINI_API_KEY` | مفتاح Gemini للتطبيق (إذا لزم) |
| `EXPO_PUBLIC_PINNED_SPKI_HASHES` | بصمات الشهادات المثبتة (Certificate Pinning) |

### تكاملات أخرى اختيارية
| المتغير | الوصف |
|---|---|
| `OPENMETER_API_KEY` + `OPENMETER_BASE_URL` | حساب الاستهلاك (metering) |
| `NIXTLA_API_KEY` | تنبؤات السلاسل الزمنية (TimeGPT) |
| `DAYTONA_API_KEY` + `DAYTONA_API_URL` | بيئات تطوير افتراضية |
| `E2B_API_KEY` | تنفيذ كود في صناديق آمنة |
| `LIVE_SUPPORT_GATEWAY_URL` | بوابة الدعم الفوري |
| `COMPOSIO_WORKDAY_MCP_URL` | تكامل Composio Workday |

---

## 🚀 ٩. خطوات نشر Vercel/Replit الموصى بها

1. **إعداد متغيرات البيئة** — انسخ كل المتغيرات الإلزامية (✅) من الأقسام السابقة إلى Replit Secrets أو Vercel Environment Variables.
2. **بناء التطبيق:** `npm run build` (يستغرق ~2-3 دقائق).
3. **اختبار البناء محليًا:** `npm start` ثم تحقّق من `http://localhost:5000`.
4. **نشر**: `vercel --prod` أو استخدم Replit Deployments.
5. **بعد النشر**:
   - شغّل `/api/cron/restore-drill` يدويًا للتأكد من نجاح النسخ الاحتياطي.
   - ادخل لـ Stripe Dashboard وفعّل Webhook endpoint.
   - اختبر تسجيل الدخول، إرسال رسالة لمساعد، عملية شراء تجريبية.

---

## 🧪 ١٠. ميزات تحتاج خطوات يدوية إضافية

### 10.1 إعدادات Firebase Console
- فعّل **Email/Password** و**Google Sign-In** من Authentication → Sign-in method.
- اضبط **Authorized Domains** لتشمل نطاق Vercel ونطاقك المخصص.
- أنشئ Firestore Database في وضع **Production**.
- ارفع قواعد الأمان من `firestore.rules` (إن وُجد) أو اطلب مني توليدها.
- في **Cloud Messaging**، فعّل Web Push وانسخ VAPID key.

### 10.2 إعدادات Stripe
- فعّل **Customer Portal** من Settings → Billing → Customer portal.
- أضف **Tax** إذا تتعامل مع ضرائب القيمة المضافة (VAT).
- لمدفوعات مصر بالجنيه (EGP)، فعّل العملة من Settings → Account.

### 10.3 سجلات DNS
- أضف سجل **TXT** للتحقّق من نطاق Resend.
- أضف سجلات **DKIM** و**SPF** للبريد.
- إن استعملت نطاقًا مخصصًا، أضف سجل **CNAME** يشير لـ Vercel/Replit.

---

## 📞 الدعم

إن واجهت أي مشكلة في إعداد أحد هذه المتغيرات، أعلمني واسم الخدمة بالتحديد وسأرشدك خطوة بخطوة.

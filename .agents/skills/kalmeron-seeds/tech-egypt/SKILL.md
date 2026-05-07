---
name: "tech-egypt"
description: "التقنية وبناء المنتج في السوق المصري — مواهب التقنية، الـ stack الشائع، تأثير تذبذب العملة على التكاليف السحابية، بدائل الاستضافة المصرية، وقالب pipeline التوظيف."
license: MIT
metadata:
  version: 1.1.0
  author: Kalmeron AI
  category: seed
  domain: tech-product-egypt
  updated: 2026-05-07
---

# بذرة المعرفة: التقنية وبناء المنتج في مصر
# Tech Egypt Knowledge Seed

## سوق المواهب التقنية في مصر

### الرواتب (2024-2025)
| الدور | Junior | Mid | Senior |
|-------|--------|-----|--------|
| Software Engineer (Backend) | 8,000-12,000 | 15,000-25,000 | 30,000-50,000 |
| Frontend Engineer | 7,000-10,000 | 12,000-22,000 | 25,000-45,000 |
| Full Stack | 8,000-12,000 | 15,000-28,000 | 30,000-55,000 |
| Product Manager | 10,000-15,000 | 18,000-30,000 | 35,000-60,000 |
| UX Designer | 8,000-12,000 | 15,000-22,000 | 25,000-40,000 |
| DevOps Engineer | 10,000-15,000 | 18,000-30,000 | 35,000-60,000 |

### مراكز المواهب التقنية
- **القاهرة/الجيزة**: الأكثر تركيزًا (Smart Village, Maadi, New Cairo)
- **الإسكندرية**: مواهب قوية وأرخص 20-30%
- **Remote**: يتنامى بقوة بعد 2020

## Stack الأكثر استخداماً في مصر
### Backend
- Python (FastAPI/Django) — الأشهر
- Node.js (Express/NestJS) — ينمو بسرعة
- Java/Spring — للشركات الكبيرة والبنوك
- PHP (Laravel) — للأنظمة القديمة والـ SMEs

### Frontend
- React/Next.js — الأسرع نمواً
- Vue.js — محبوب في المجتمع المحلي
- Flutter — للـ Mobile cross-platform

### Cloud
- AWS — الأشهر
- GCP — مفضل للـ AI/ML
- Azure — مطلوب حكومياً في بعض القطاعات

## تأثير تذبذب سعر الصرف على التكاليف السحابية

### المشكلة الهيكلية
التكاليف السحابية (AWS, GCP, Azure, Vercel, Supabase) **تُفوتَر بالدولار**، بينما إيرادات معظم الشركات المصرية المحلية **بالجنيه المصري**. هذا يخلق ضغطاً متصاعداً كلما ارتفع الدولار.

### حساب التأثير الفعلي
```
التكلفة السحابية الشهرية بالدولار × سعر الصرف = التكلفة الفعلية بالجنيه
مثال: $500/شهر × 50 جنيه = 25,000 جنيه/شهر
مثال بعد رفع الدولار: $500 × 65 جنيه = 32,500 جنيه/شهر (+30% بدون أي زيادة استخدام)
```

### استراتيجيات التحوط من مخاطر العملة للـ Tech Startups
| الاستراتيجية | التطبيق |
|-------------|---------|
| **الفوترة بالدولار** | إذا تكاليفك بالدولار، سعّر عملاءك بالدولار أو ما يعادله |
| **Reserved Instances** | احجز cloud resources سنوياً لتثبيت التكلفة وتوفير 30–40% |
| **Credit Programs** | استخدم برامج Credits مجانية لتأجيل التكلفة الحقيقية |
| **استخدام مرن** | استخدم Spot Instances أو Serverless للأحمال غير الثابتة |
| **مراجعة ربع سنوية** | راجع الـ billing مع كل تغيّر كبير في سعر الصرف |

### مراقبة التكلفة السحابية — أدوات مُوصى بها
- **AWS Cost Explorer**: تتبع وتحليل التكلفة يومياً
- **Infracost**: تقدير تكلفة Terraform قبل الـ deploy
- **OpenCost**: Kubernetes cost visibility (مجاني)
- **Budget Alerts**: حدد تنبيهاً عند تجاوز 80% من الميزانية المخططة

## بدائل الاستضافة المناسبة للشركات المصرية

### المقارنة الكاملة حسب المرحلة
| الحل | التكلفة/شهر (USD) | الدعم | Data Center قريب | يناسب |
|------|-------------------|-------|-----------------|-------|
| **Vercel** | مجاني – $20+ | ممتاز | Frankfurt (أقرب) | Frontend / Next.js |
| **Supabase** | مجاني – $25+ | ممتاز | — | BaaS / Postgres |
| **Railway** | $5–20 | جيد | — | Backend بسيط |
| **Render** | $7–25 | جيد | — | Full-stack Seed |
| **Fly.io** | $5–30 | جيد | Warsaw/Singapore | Low-latency |
| **DigitalOcean** | $12–50 | جيد | Frankfurt | Growth stage |
| **Hetzner** | $4–15 | متوسط | Germany | أرخص بديل EU |
| **AWS Lightsail** | $5–40 | ممتاز | Bahrain (أقرب) | AWS بسعر ثابت |
| **AWS (Full)** | متغير | ممتاز | Bahrain (me-south-1) | Scale |
| **GCP** | متغير | ممتاز | — | AI/ML heavy |
| **Azure** | متغير | ممتاز | UAE North | متطلبات حكومية |

### Data Centers إقليمية قريبة من مصر
- **AWS me-south-1 (Bahrain)**: الأقرب لمصر — latency ~80ms من القاهرة
- **AWS eu-west-1 (Ireland)** / **eu-central-1 (Frankfurt)**: بديل شائع
- **Azure UAE North**: خيار جيد للقطاع الحكومي والمالي
- **توصية**: لتطبيقات latency-sensitive (gaming, trading) → AWS Bahrain

### بدائل استضافة محلية مصرية
| المزود | ما يقدمه | الجمهور |
|--------|---------|---------|
| **TE Data (Telecom Egypt)** | VPS، Dedicated، Colocation | Enterprise، حكومي |
| **Vodafone Egypt (Cloud)** | Private Cloud لكبار العملاء | Enterprise |
| **Orange Egypt Business** | خدمات اتصالات وشبكات | B2B |
| **Egyptian Data Centers (ITIDA)** | Colocation مرخصة | شركات تحتاج سيادة بيانات |

**متى تستخدم الاستضافة المحلية؟**
- عندما تشترط جهة حكومية أن تكون البيانات داخل مصر
- للتطبيقات الحساسة (بنوك، صحة، حكومة)
- للحصول على latency < 10ms للمستخدم المحلي

## قالب Pipeline التوظيف للأدوار التقنية المصرية

### المراحل القياسية (مدة إجمالية مستهدفة: 3–4 أسابيع)
```
المرحلة 1: Sourcing (3–5 أيام)
  → LinkedIn, Wuzzuf, Forasna, GitHub, Referrals
  → هدف: 20–50 مرشح مؤهل في الأفق

المرحلة 2: CV Screen + GitHub Review (2 أيام)
  → تحقق: Projects حقيقية؟ Open source contributions؟
  → هدف: إبقاء 10–15 مرشح

المرحلة 3: Technical Screen / Take-Home (5 أيام للمرشح)
  → مشكلة تقنية واقعية، 2–3 ساعات كحد أقصى
  → هدف: 5–8 مرشحين يكملون

المرحلة 4: Technical Interview (مباشر، 60–90 دقيقة)
  → System Design + Live Coding أو مناقشة Take-Home
  → هدف: 2–3 مرشحين مؤهلين

المرحلة 5: Culture / Team Fit (30–45 دقيقة)
  → لقاء مع الفريق، أسئلة سلوكية
  → هدف: مرشح واحد نهائي

المرحلة 6: Offer + Reference Check (2–3 أيام)
  → عرض رسمي + التحقق من مرجعيتين
```

### معدلات الـ Funnel المرجعية للتوظيف التقني المصري
| المرحلة | نسبة المتقدمين المتقدمين |
|---------|----------------------|
| Applicants → CV Screen | 20–30% |
| CV Screen → Technical Screen | 30–50% |
| Technical Screen → Interview | 40–60% |
| Interview → Offer | 25–40% |
| Offer → Acceptance | 70–85% |

### مصادر التوظيف التقني المُوصى بها في مصر
| المصدر | الأفضل لـ | التكلفة |
|--------|---------|---------|
| **LinkedIn Recruiter** | Senior + Mid | عالية |
| **Wuzzuf.net** | جميع المستويات | متوسطة |
| **Forasna.com** | Entry + Junior | منخفضة |
| **GitHub / Portfolio** | Senior المميزين | مجاني |
| **Referrals (داخلي)** | أعلى جودة | مجاني + bonus |
| **Facebook Groups** (Cairo Tech) | Junior + Mid | مجاني |
| **مجتمعات Discord/Slack** | Full-stack / AI | مجاني |

### نقاط تفاوض الراتب مع المطورين المصريين
- **Remote work**: يعوض عن فارق راتب 20–30% (المطور يوفر وقت/مواصلات)
- **الأسهم (Equity)**: مفهومها ينمو، لكن لا يزال أقل جاذبية من الغرب — احرص على الشرح الواضح
- **التطوير المهني**: دورات + مؤتمرات تعويض قيّم للمطورين الطموحين
- **Flexible hours**: مطلوبة للمطورين ذوي الالتزامات الأسرية

## المنتج للجمهور المصري

### متطلبات UX حرجة
- **RTL Support**: إجباري، يؤثر على 100% من المستخدمين
- **Arabic Numerals**: دعم الأرقام الهندية (٠١٢٣) اختياري لكن محبوب
- **Mobile First**: 85-90% من الاستخدام عبر الموبايل
- **Performance على شبكة 4G ضعيفة**: تحسين حجم الصور والـ JS bundle
- **Offline/PWA**: مطلوب في التطبيقات الحيوية

### معايير الأداء المطلوبة
- **LCP**: < 2.5 ثانية على 4G
- **App Size**: < 30MB للتطبيقات الجديدة
- **TTI (Time to Interactive)**: < 5 ثواني

### الأجهزة الشائعة في مصر
- Samsung Galaxy A Series (A15, A25, A35)
- Infinix Hot/Note Series
- Xiaomi Redmi Note
- iPhone SE, 13, 14

## Infrastructure الاقتصادية للشركات الناشئة المصرية

### توصيات الـ Stack للشركات الناشئة
1. **MVP/Prototype**: Vercel + Supabase (مجاني تقريباً)
2. **Seed**: Railway + PlanetScale أو Supabase
3. **Series A**: AWS/GCP مع Terraform

## برامج التمويل التقني المتاحة في مصر
- **AWS Activate**: حتى $100K credits
- **Google for Startups**: حتى $350K GCP credits + mentorship
- **Microsoft for Startups**: حتى $150K Azure credits
- **Stripe Atlas**: تأسيس Delaware corporation سهل

## DevOps Best Practices للبيئة المصرية
- **Monitoring**: Sentry (مجاني حتى حد معين) + Grafana
- **Uptime**: UptimeRobot (مجاني) أو Betterstack
- **Error Tracking**: Sentry + Slack alerts
- **Deploy Frequency**: هدف أسبوعي على الأقل
- **Database Backups**: يومية لازم، وباستمرارية

# نشر الـ 4 Sidecars في الإنتاج

> **خلفيّة:** Vercel يدعم JS فقط. الـ 4 خدمات Python (`services/`) لا تشتغل عليه. هذه الوثيقة تشرح 3 خيارات لنشرها بعد إعداد المشروع.

## 📊 المقارنة السريعة

| المنصّة | السعر الشهري التقديري | السهولة | التوصية |
|---|---|---|---|
| **Google Cloud Run** | $5-15 (مع free tier) | ★★★★ | ✅ **مُوصى به للإنتاج** — scale-to-zero، عملاق |
| **Railway** | $20-40 (Hobby) | ★★★★★ | ✅ للبداية السريعة، ثمن ثابت |
| **Fly.io** | $5-20 | ★★★ | لو تحبّ control أكثر |

---

## الخيار 1 — Google Cloud Run (الموصى به)

**لماذا:** scale-to-zero (لا تدفع عند 0 traffic)، مدمج مع Secret Manager، latency منخفض من europe-west1 (للسوق المصري والخليجي).

### إعداد لمرّة واحدة
```bash
# 1. أنشئ مشروع GCP أو استخدم القائم
gcloud config set project YOUR_PROJECT_ID

# 2. فعّل APIs
gcloud services enable cloudbuild.googleapis.com run.googleapis.com artifactregistry.googleapis.com secretmanager.googleapis.com

# 3. أنشئ artifact registry للـ Docker images
gcloud artifacts repositories create sidecars --repository-format=docker --location=europe-west1

# 4. ضع GEMINI_API_KEY في Secret Manager (يقرأه LLM Judge)
echo -n "YOUR_GEMINI_KEY" | gcloud secrets create gemini-api-key --data-file=-
```

### النشر
```bash
gcloud builds submit --config services/cloudbuild.yaml \
  --substitutions=_REGION=europe-west1,_PROJECT=YOUR_PROJECT_ID
```
سينشر الأربعة دفعة واحدة. مدّة أوّل build: ~10 دقائق. كل build لاحق: 3-5 دقائق.

### بعد النشر
احصل على الـ URLs من Cloud Run console، وضعها في **Vercel Environment Variables**:
```
PDF_WORKER_URL=https://kalmeron-pdf-worker-XXXX-ew.a.run.app
EGYPT_CALC_URL=https://kalmeron-egypt-calc-XXXX-ew.a.run.app
LLM_JUDGE_URL=https://kalmeron-llm-judge-XXXX-ew.a.run.app
EMBEDDINGS_WORKER_URL=https://kalmeron-embeddings-worker-XXXX-ew.a.run.app
```

### تكلفة متوقّعة (Cloud Run)
- PDF Worker: $0-3/شهر (scale-to-zero)
- Egypt Calc: $0-2/شهر (cheap)
- LLM Judge: $2-5/شهر (يستهلك Gemini API tokens)
- Embeddings: $5-10/شهر (`min-instances=1` لتجنّب cold-start)
- **الإجمالي: ~$10-20/شهر** عند 1000 user/يوم.

---

## الخيار 2 — Railway (الأسهل للبداية)

```bash
# 1. ثبّت Railway CLI
npm i -g @railway/cli
railway login

# 2. أنشئ مشروع جديد
railway init kalmeron-sidecars

# 3. لكلّ خدمة، اعمل deploy منفصل
cd services/pdf-worker && railway up && cd ../..
cd services/egypt-calc && railway up && cd ../..
cd services/llm-judge && railway up --service kalmeron-llm-judge && cd ../..
cd services/embeddings-worker && railway up && cd ../..
```
ضع المتغيّرات في Railway Dashboard، خصوصاً `GEMINI_API_KEY` للـ LLM Judge.

**التكلفة:** $20/شهر للـ Hobby plan (يكفي الـ 4 خدمات معاً).

---

## الخيار 3 — Fly.io

```bash
flyctl launch --copy-config services/pdf-worker --name kalmeron-pdf-worker --region cdg
flyctl launch --copy-config services/egypt-calc --name kalmeron-egypt-calc --region cdg
flyctl launch --copy-config services/llm-judge --name kalmeron-llm-judge --region cdg
flyctl launch --copy-config services/embeddings-worker --name kalmeron-embeddings-worker --region cdg
flyctl secrets set GEMINI_API_KEY=YOUR_KEY -a kalmeron-llm-judge
```
**التكلفة:** $5-15/شهر مع free tier.

---

## ✅ Health-check بعد النشر

```bash
curl https://kalmeron-pdf-worker-XXXX/health
curl https://kalmeron-egypt-calc-XXXX/health
curl https://kalmeron-llm-judge-XXXX/health
curl https://kalmeron-embeddings-worker-XXXX/health
```
كلّها يجب أن ترجع `{"ok": true, ...}`.

## ⚠️ ملاحظات مهمّة

1. **Embeddings cold-start:** الموديل ~220MB يحمّل lazy عند أوّل استدعاء (5-8 ثانية). على Cloud Run، استخدم `min-instances=1` لتجنّبه (التكلفة الإضافيّة ~$5/شهر).

2. **CORS:** كلّ خدمة تقرأ `*_CORS` env var. للإنتاج، ضع `https://kalmeron.com,https://www.kalmeron.com` بدلاً من `*`.

3. **Graceful fallback:** الـ Next.js app مصمَّم بحيث **يعمل حتى لو سقطت أيّ خدمة**. الـ TS clients يرجعون `{ok: false, reason}` وتعرض الواجهة رسالة عربيّة سليمة. تحقّق دائماً من `/health` قبل الإطلاق.

4. **dbt warehouse غير مذكور:** يُنفَّذ كـ batch job (cron يومي) عبر `npm run dw:build` — ليس sidecar طول الوقت.

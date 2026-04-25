/**
 * Generates docs/REMAINING_HUMAN_TASKS.pdf — the list of tasks the user must
 * do manually (cannot be done by the agent).
 *
 * Arabic rendering pipeline:
 *   raw Arabic → arabic-reshaper (joining forms) → bidi-js (logical→visual)
 *   → pdfkit text() with Amiri TTF, right-aligned.
 *
 * Run:  npx tsx scripts/generate-remaining-tasks-pdf.ts
 */
 
const PDFDocument = require('pdfkit');
import { createWriteStream, mkdirSync } from 'node:fs';
import { join } from 'node:path';
 
const reshaper = require('arabic-reshaper');
 
const bidiFactory = require('bidi-js');
const bidi = bidiFactory();

const FONT_PATH = join(process.cwd(), '.cache', 'fonts', 'Arabic-Regular.ttf');
const OUT_PATH = join(process.cwd(), 'docs', 'REMAINING_HUMAN_TASKS.pdf');

/** Reshape Arabic + apply bidi to get visual-order string for pdfkit. */
function arabize(text: string): string {
  const reshaped = reshaper.convertArabic(text);
  // bidi-js expects per-paragraph processing
  const embeddingLevels = bidi.getEmbeddingLevels(reshaped, 'rtl');
  const reorderSegments = bidi.getReorderSegments(reshaped, embeddingLevels);
  let out = reshaped;
  for (const [start, end] of reorderSegments) {
    const slice = out.slice(start, end + 1).split('').reverse().join('');
    out = out.slice(0, start) + slice + out.slice(end + 1);
  }
  return out;
}

interface Task {
  id: string;
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  titleAr: string;
  whyAr: string;
  stepsAr: string[];
  estTime: string;
  blocker?: boolean;
}

const TASKS: Task[] = [
  // ───── P0 — Blockers ─────
  {
    id: 'T1',
    priority: 'P0',
    titleAr: 'حذف ملف .replit من Git',
    whyAr: 'الملف يحتوي على إعدادات حسّاسة وقد كشف مفتاح Firebase Service Account سابقاً.',
    stepsAr: [
      'افتح Replit Shell.',
      'نفّذ: git rm --cached .replit && echo ".replit" >> .gitignore',
      'نفّذ: git commit -m "chore: remove .replit from tracking"',
      'ادفع التغييرات: git push',
    ],
    estTime: '5 دقائق',
    blocker: true,
  },
  {
    id: 'T2',
    priority: 'P0',
    titleAr: 'تدوير مفتاح Firebase Service Account المسرَّب',
    whyAr: 'المفتاح القديم ظهر في git history. أيّ شخص نسخ الـ repo قد يصل لـ Firestore.',
    stepsAr: [
      'افتح Firebase Console → Project Settings → Service Accounts.',
      'احذف المفتاح القديم (تاريخه قبل اليوم).',
      'أنشئ مفتاح جديد، حمّل الـ JSON.',
      'في Vercel Environment Variables، حدّث: FIREBASE_ADMIN_PRIVATE_KEY و FIREBASE_ADMIN_CLIENT_EMAIL.',
      'أعد نشر التطبيق (Vercel Deployments → Redeploy).',
    ],
    estTime: '15 دقيقة',
    blocker: true,
  },
  {
    id: 'T3',
    priority: 'P0',
    titleAr: 'إضافة GOOGLE_GENERATIVE_AI_API_KEY في الإنتاج',
    whyAr: 'بدون هذا المفتاح، كل الوكلاء (16 agent) يفشلون في الإنتاج برسالة 503.',
    stepsAr: [
      'افتح Google AI Studio: https://aistudio.google.com/apikey',
      'أنشئ API Key جديد (اختر مشروع GCP حقيقي وليس "Default").',
      'انسخ المفتاح.',
      'في Vercel → Settings → Environment Variables، أضف: GOOGLE_GENERATIVE_AI_API_KEY = <المفتاح>',
      'اختر Production فقط، ثم Save → Redeploy.',
    ],
    estTime: '10 دقائق',
    blocker: true,
  },
  {
    id: 'T4',
    priority: 'P0',
    titleAr: 'إضافة مفاتيح Stripe في الإنتاج',
    whyAr: 'بدونها لا يمكن للمستخدمين الدفع بالبطاقة. الـ TS code جاهز ينتظر فقط القيم.',
    stepsAr: [
      'سجّل دخول Stripe Dashboard → Developers → API Keys.',
      'انسخ Secret Key (sk_live_...) و Publishable Key (pk_live_...).',
      'أضف في Vercel: STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.',
      'اذهب لـ Stripe → Webhooks → Add endpoint: https://kalmeron.com/api/webhooks/stripe',
      'اختر الأحداث: customer.subscription.* و invoice.payment_succeeded و invoice.payment_failed',
      'انسخ Signing Secret (whsec_...) → أضفه كـ STRIPE_WEBHOOK_SECRET.',
    ],
    estTime: '20 دقيقة',
    blocker: true,
  },

  // ───── P1 — Launch-Critical ─────
  {
    id: 'T5',
    priority: 'P1',
    titleAr: 'إنشاء منتجات وأسعار Stripe + إضافة Price IDs',
    whyAr: 'الـ checkout يحتاج Price ID لكل خطّة. الكود محدَّث بالأسعار الجديدة (Starter 199، Pro 399، Founder 999 ج.م).',
    stepsAr: [
      'في Stripe Dashboard → Products → Create Product.',
      'أنشئ 3 منتجات: Kalmeron Starter, Kalmeron Pro, Kalmeron Founder.',
      'لكل منتج، أضف 4 أسعار: Monthly EGP, Annual EGP, Monthly USD, Annual USD.',
      'الأسعار المطلوبة (شهري): Starter 199 ج.م / $7، Pro 399 ج.م / $15، Founder 999 ج.م / $39.',
      'الأسعار السنويّة بخصم 33٪: 134/93/669 ج.م شهرياً.',
      'انسخ كل Price ID وضعه في Vercel كمتغيّر مطابق لـ src/lib/billing/plans.ts (مثلاً: STRIPE_PRICE_PRO_MONTHLY_EGP).',
    ],
    estTime: '45 دقيقة',
  },
  {
    id: 'T6',
    priority: 'P1',
    titleAr: 'نشر فهارس Firestore (Firestore Indexes)',
    whyAr: 'بدونها، الـ queries المعقّدة (المحادثات، التحاليل، الفوترة) ترجع خطأ FAILED_PRECONDITION.',
    stepsAr: [
      'ثبّت Firebase CLI لو مش موجود: npm i -g firebase-tools',
      'سجّل دخول: firebase login',
      'اختر المشروع: firebase use YOUR_PROJECT_ID',
      'انشر الفهارس: firebase deploy --only firestore:indexes',
      'انتظر 5-10 دقائق حتى تنتهي عملية الإنشاء.',
    ],
    estTime: '15 دقيقة',
  },
  {
    id: 'T7',
    priority: 'P1',
    titleAr: 'تعريف PLATFORM_ADMIN_UIDS',
    whyAr: 'لوحات الـ admin لن تعمل بدون هذا (مثلاً /admin، تقارير الفوترة، الموافقة على المرتجعات).',
    stepsAr: [
      'سجّل دخول التطبيق بحسابك (production)، اذهب لـ /account.',
      'انسخ Firebase UID من الـ profile (أو من Firebase Console → Authentication → Users).',
      'في Vercel Environment Variables أضف: PLATFORM_ADMIN_UIDS = <uid1>,<uid2>',
      'أضف UIDs لأي شخص آخر تثق فيه (المؤسس المشارك، CTO، إلخ).',
    ],
    estTime: '5 دقائق',
  },
  {
    id: 'T8',
    priority: 'P1',
    titleAr: 'إنشاء حساب Resend وإضافة API Key',
    whyAr: 'Daily Brief والإشعارات والتحقّق من البريد لن تعمل بدونه.',
    stepsAr: [
      'سجّل في https://resend.com (مجاناً 3000 رسالة/شهر).',
      'أضف وأكّد دومين kalmeron.com (DNS records).',
      'أنشئ API Key في Resend Dashboard.',
      'في Vercel: RESEND_API_KEY = <المفتاح>، EMAIL_FROM = "Kalmeron <noreply@kalmeron.com>"',
    ],
    estTime: '30 دقيقة',
  },
  {
    id: 'T9',
    priority: 'P1',
    titleAr: 'إعداد Sentry للمراقبة',
    whyAr: 'بدون Sentry لن ترى الأخطاء في الإنتاج. ستكتشف المشاكل من شكاوى المستخدمين فقط.',
    stepsAr: [
      'سجّل في https://sentry.io (مجاناً 5K errors/شهر).',
      'أنشئ مشروع Next.js جديد باسم "kalmeron-web".',
      'انسخ DSN.',
      'في Vercel: SENTRY_DSN, NEXT_PUBLIC_SENTRY_DSN, SENTRY_ORG, SENTRY_PROJECT, SENTRY_AUTH_TOKEN.',
      'اختبر بـ /api/sentry-test لو موجود، أو رمي خطأ متعمّد.',
    ],
    estTime: '20 دقيقة',
  },
  {
    id: 'T10',
    priority: 'P1',
    titleAr: 'تعبئة بيانات الـ Pitch Deck الفعليّة',
    whyAr: 'العرض الحالي يحتوي placeholders (مثل [اسم المؤسس]، [حجم السوق المحلّي]).',
    stepsAr: [
      'افتح docs/PITCH_DECK.md',
      'استبدل كل [PLACEHOLDER] بقيمة حقيقيّة.',
      'أضف بيانات الفريق، التراكشن الفعلي، LOIs، إلخ.',
      'صدّر PDF للعرض على المستثمرين.',
    ],
    estTime: '3 ساعات',
  },
  {
    id: 'T11',
    priority: 'P1',
    titleAr: 'مراجعة الأسعار الجديدة وقرار التفعيل',
    whyAr: 'الكود تم تحديثه (Starter 199 / Pro 399 / Founder 999) لكن قد تريد أرقام مختلفة.',
    stepsAr: [
      'راجع src/lib/billing/plans.ts',
      'لو موافق على الأرقام، انتقل لـ T5 لإنشاء Stripe Prices.',
      'لو تريد تعديل، حدّث القيم في plans.ts ثم أنشئ Stripe Prices مطابقة.',
    ],
    estTime: '30 دقيقة',
  },
  {
    id: 'T12',
    priority: 'P1',
    titleAr: 'تسجيل تاجر Fawry والحصول على Merchant Code',
    whyAr: 'كود الـ Fawry جاهز كامل في src/lib/billing/fawry/ والـ /api/billing/fawry/* — ينتظر فقط بيانات اعتماد التاجر.',
    stepsAr: [
      'افتح https://atfawry.com → Become a Merchant.',
      'املأ نموذج التاجر (سجل تجاري، بطاقة ضريبيّة، حساب بنكي).',
      'انتظر الموافقة (3-7 أيام عمل).',
      'احصل على: FAWRY_MERCHANT_CODE و FAWRY_SECURITY_KEY.',
      'في Vercel: ضع القيم + غيّر FAWRY_BASE_URL إلى https://www.atfawry.com للإنتاج.',
      'في لوحة Fawry، ضع callback URL: https://kalmeron.com/api/billing/fawry/webhook',
      'اختبر: ادفع 1 ج.م تجريبي وتأكّد من الـ webhook.',
    ],
    estTime: '7 أيام (ورقي) + ساعة إعداد',
  },

  // ───── P2 — Growth ─────
  {
    id: 'T13',
    priority: 'P2',
    titleAr: 'نشر الـ 4 Sidecars على Cloud Run / Railway',
    whyAr: 'حالياً تشتغل في Replit للتطوير. للإنتاج محتاجة host خارجي. الـ Dockerfiles جاهزة.',
    stepsAr: [
      'اقرأ docs/SIDECAR_DEPLOYMENT.md للخطوات الكاملة.',
      'الموصى به: Google Cloud Run (services/cloudbuild.yaml جاهز).',
      'أو Railway (services/railway.json جاهز، أسهل لكن أغلى).',
      'بعد النشر، حدّث Vercel: PDF_WORKER_URL, EGYPT_CALC_URL, LLM_JUDGE_URL, EMBEDDINGS_WORKER_URL.',
      'اختبر /health لكل خدمة.',
    ],
    estTime: 'يوم كامل',
  },
  {
    id: 'T14',
    priority: 'P2',
    titleAr: 'إعداد بيئة Staging',
    whyAr: 'نشر مباشرة على الإنتاج خطر. تحتاج بيئة وسيطة للتجارب.',
    stepsAr: [
      'في Vercel، أنشئ deployment branch جديد: staging.',
      'أنشئ مشروع Firebase ثاني: kalmeron-staging.',
      'انسخ كل Environment Variables لكن بقيم staging (sandbox Stripe, sandbox Fawry).',
      'أنشئ سياسة: كل PR ينزل أوّلاً على staging، ثم بعد QA يدخل main.',
    ],
    estTime: 'نصف يوم',
  },
  {
    id: 'T15',
    priority: 'P2',
    titleAr: 'مراجعة قانونيّة (شروط الخدمة + سياسة الخصوصيّة)',
    whyAr: 'مطلوب قانونياً قبل قبول مدفوعات في مصر/الخليج.',
    stepsAr: [
      'وظّف محامٍ متخصّص في تكنولوجيا (~5,000-15,000 ج.م).',
      'راجع: ToS, Privacy Policy, Refund Policy, Data Processing Agreement.',
      'تأكّد من توافق GDPR (للسوق الخليجي) وقانون حماية البيانات المصري 151/2020.',
      'انشر النسخ النهائيّة في /terms و /privacy.',
    ],
    estTime: 'أسبوعين',
  },
  {
    id: 'T16',
    priority: 'P2',
    titleAr: 'إنشاء حسابات السوشيال + استراتيجيّة محتوى',
    whyAr: 'بدون presence على TikTok/Instagram/X لن يصل المنتج لجمهوره.',
    stepsAr: [
      'أنشئ حسابات: @kalmeron على TikTok, Instagram, X (Twitter), LinkedIn.',
      'وظّف صانع محتوى عربي (~$300-800/شهر).',
      'احرز: 3 reels/أسبوع تشرح وكيلاً مختلفاً.',
      'استخدم وكلاء كلميرون نفسهم لتوليد المحتوى.',
    ],
    estTime: 'شهر للإطلاق',
  },
  {
    id: 'T17',
    priority: 'P2',
    titleAr: 'إطلاق برنامج Beta المغلق',
    whyAr: 'احصل على feedback حقيقي قبل الإطلاق العام.',
    stepsAr: [
      'اختر 50-100 رائد أعمال مصري من شبكتك.',
      'أنشئ Discord/Telegram خاص للـ beta.',
      'أعطهم Founder plan مجاناً لمدّة 3 شهور.',
      'اجمع feedback أسبوعياً في مكالمة 30 دقيقة.',
      'كرّر بناءً على الملاحظات.',
    ],
    estTime: 'شهرين',
  },
  {
    id: 'T18',
    priority: 'P2',
    titleAr: 'حسابات App Store / Google Play',
    whyAr: 'لو هتعمل تطبيق موبايل لاحقاً، تحتاج حسابات developer.',
    stepsAr: [
      'Apple Developer Account: $99/سنة.',
      'Google Play Developer Account: $25 لمرّة واحدة.',
      'مطلوب: ID شركة (سجل تجاري).',
    ],
    estTime: 'أسبوع',
  },
  {
    id: 'T19',
    priority: 'P2',
    titleAr: 'التقديم على Incubators/Accelerators',
    whyAr: 'تمويل + شبكة + mentorship.',
    stepsAr: [
      'مصر: Flat6Labs, AUC Venture Lab, Falak Startups, EFG-EV.',
      'الخليج: 500 MENA, MITEF Pan Arab, Saudi Garage.',
      'دولي: YC, Techstars, Antler.',
      'قدّم بـ pitch deck الجاهز (بعد T10).',
    ],
    estTime: 'شهر مستمر',
  },
  {
    id: 'T20',
    priority: 'P2',
    titleAr: 'البحث عن Co-Founder/CTO/Head of Growth',
    whyAr: 'صعب تبني شركة بنفسك. تحتاج فريق تأسيس.',
    stepsAr: [
      'حدّد الفجوة: تقنيّة (CTO)؟ تجاريّة (Head of Growth)؟ منتج (CPO)؟',
      'ابحث في: AngelList, LinkedIn, Telegram تجمّعات الشركات الناشئة.',
      'اعرض equity (10-30٪) + راتب رمزي للأشهر الأولى.',
      'اعمل trial periods (3 أشهر) قبل توقيع الـ shareholder agreement.',
    ],
    estTime: '3-6 شهور',
  },

  // ───── P3 — Scale ─────
  {
    id: 'T21',
    priority: 'P3',
    titleAr: 'Penetration Test',
    whyAr: 'مطلوب قبل التعامل مع شركات كبرى أو مؤسسات حكوميّة.',
    stepsAr: [
      'وظّف شركة pentest محترفة (HackerOne, Cobalt.io، أو شركات مصريّة مثل Bluekaizen).',
      'التكلفة: $5,000-15,000 لتقرير شامل.',
      'صحّح كل critical/high قبل الإطلاق على الـ enterprise.',
    ],
    estTime: '3-4 أسابيع',
  },
  {
    id: 'T22',
    priority: 'P3',
    titleAr: 'الحصول على شهادة SOC 2 Type II',
    whyAr: 'الشركات الكبرى لن تشتري بدونها.',
    stepsAr: [
      'استخدم منصّة مثل Vanta أو Drata (~$10K-30K/سنة).',
      'مدّة الـ audit: 6-12 شهر.',
      'يجب أن يكون عندك سياسات internal أمن، نسخ احتياطي، DR plan، إلخ.',
    ],
    estTime: '6-12 شهر',
  },
  {
    id: 'T23',
    priority: 'P3',
    titleAr: 'تأمين المسؤوليّة المهنيّة (E&O Insurance)',
    whyAr: 'حماية قانونيّة لو حصل خطأ كارثي في توصياتنا.',
    stepsAr: [
      'تواصل مع شركات تأمين تكنولوجيّة (Hiscox دولياً، أو مصر للتأمين محلياً).',
      'التغطية الموصى بها: $1M-5M.',
      'التكلفة: ~$2,000-10,000/سنة.',
    ],
    estTime: 'أسبوعين',
  },
  {
    id: 'T24',
    priority: 'P3',
    titleAr: 'تكاملات إضافيّة (Slack, WhatsApp Business, Google Calendar, Notion)',
    whyAr: 'لتعميق المنتج وزيادة retention.',
    stepsAr: [
      'كل تكامل يحتاج: OAuth setup, API integration, UI flow.',
      'الترتيب الموصى به: WhatsApp Business → Google Calendar → Notion → Slack.',
      'كل واحد يستغرق 2-4 أسابيع.',
    ],
    estTime: '3-4 شهور',
  },
  {
    id: 'T25',
    priority: 'P3',
    titleAr: 'بناء Community (Discord/Telegram عام)',
    whyAr: 'Network effect + word-of-mouth marketing.',
    stepsAr: [
      'أنشئ Discord أو Telegram عام لـ "رواد الأعمال المصريين".',
      'وظّف Community Manager (~$500-1,500/شهر).',
      'افتح قنوات: عام، أسئلة تقنيّة، طلب feedback، فرص شراكات.',
    ],
    estTime: 'مستمر',
  },
  {
    id: 'T26',
    priority: 'P3',
    titleAr: 'كتابة Case Studies',
    whyAr: 'social proof للبيع.',
    stepsAr: [
      'اختر 5-10 مستخدمين ناجحين من الـ beta.',
      'اكتب case study لكل واحد (challenge → solution → result).',
      'انشر على /customers + استخدم في الـ pitch.',
    ],
    estTime: 'شهر',
  },
  {
    id: 'T27',
    priority: 'P3',
    titleAr: 'PR + مقالات صحفيّة',
    whyAr: 'وعي بالعلامة التجاريّة في السوق.',
    stepsAr: [
      'استهدف: Wamda, MenaBytes, Forbes ME, الشروق, اليوم السابع.',
      'وظّف PR agency (~$3K-10K/شهر) أو افعلها بنفسك.',
      'هدف: 5-10 مقالات في أوّل 6 شهور.',
    ],
    estTime: 'مستمر',
  },
  {
    id: 'T28',
    priority: 'P3',
    titleAr: 'حضور المؤتمرات والفعاليات',
    whyAr: 'networking + leads.',
    stepsAr: [
      'مصر: RiseUp Summit (سنوي)، Cairo ICT.',
      'الخليج: GITEX, LEAP, STEP Conference.',
      'احرز: 4-6 فعاليات/سنة، booth أو speaking slot.',
    ],
    estTime: 'مستمر',
  },
  {
    id: 'T29',
    priority: 'P3',
    titleAr: 'ربط برنامج الإحالة بالـ entitlement',
    whyAr: 'الـ referral system موجود في الكود لكن المكافآت يدويّة الآن.',
    stepsAr: [
      'افتح src/lib/referrals/manager.ts.',
      'أضف منطق: عند تسجيل المُحال، أضف 1000 رصيد للمُحيل.',
      'حدّث UI في /account لعرض المُحالين والمكافآت.',
    ],
    estTime: '3-5 أيام',
  },
  {
    id: 'T30',
    priority: 'P3',
    titleAr: 'التوظيف (Engineers, Designer, Sales)',
    whyAr: 'لا يمكن لشخص واحد تشغيل كل شيء.',
    stepsAr: [
      'الترتيب: Senior Engineer → Designer → Sales → Marketing.',
      'استخدم: WUZZUF (مصر), Bayt (خليج), AngelList (دولي).',
      'الميزانيّة الموصى بها: $40K-80K/شهر بعد الـ Series A.',
    ],
    estTime: 'مستمر',
  },
];

const PRIORITY_LABELS = {
  P0: 'P0 — حظر فوري',
  P1: 'P1 — حرج للإطلاق',
  P2: 'P2 — للنموّ',
  P3: 'P3 — للتوسّع',
};

const PRIORITY_COLORS = {
  P0: '#dc2626', // red
  P1: '#ea580c', // orange
  P2: '#0891b2', // cyan
  P3: '#6b7280', // gray
};

function generate() {
  mkdirSync('docs', { recursive: true });
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
    info: {
      Title: 'Kalmeron — المهام البشريّة المتبقّية',
      Author: 'Kalmeron AI',
      Subject: 'المهام التي يحتاج المؤسس تنفيذها يدوياً',
    },
  });
  doc.pipe(createWriteStream(OUT_PATH));
  doc.registerFont('Amiri', FONT_PATH);
  doc.font('Amiri');

  // ── Cover ──
  doc.fontSize(28).fillColor('#0f172a');
  doc.text(arabize('كلميرون — المهام المتبقّية للمؤسس'), { align: 'right' });
  doc.moveDown(0.3);
  doc.fontSize(14).fillColor('#475569');
  doc.text(arabize('قائمة بكل ما يحتاج إليه التنفيذ اليدوي قبل الإطلاق'), { align: 'right' });
  doc.moveDown(0.3);
  doc.fontSize(11).fillColor('#94a3b8');
  doc.text(arabize(`تاريخ الإنشاء: ${new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}`), { align: 'right' });

  doc.moveDown(1);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#e2e8f0');
  doc.moveDown(0.8);

  // ── Summary box ──
  const counts = { P0: 0, P1: 0, P2: 0, P3: 0 };
  TASKS.forEach((t) => counts[t.priority]++);
  doc.fontSize(13).fillColor('#0f172a');
  doc.text(arabize('ملخّص:'), { align: 'right' });
  doc.moveDown(0.3);
  doc.fontSize(11).fillColor('#334155');
  for (const p of ['P0', 'P1', 'P2', 'P3'] as const) {
    doc.fillColor(PRIORITY_COLORS[p]);
    doc.text(arabize(`${PRIORITY_LABELS[p]}: ${counts[p]} مهمّة`), { align: 'right' });
  }
  doc.moveDown(0.3);
  doc.fillColor('#0f172a').fontSize(11);
  doc.text(arabize(`المجموع: ${TASKS.length} مهمّة بشريّة`), { align: 'right' });
  doc.moveDown(0.3);
  doc.fillColor('#16a34a').fontSize(10);
  doc.text(arabize('ملاحظة: تم تنفيذ كل ما يستطيع الـ agent تنفيذه (تحديث الأسعار، Fawry integration، Dockerfiles، إلخ).'), { align: 'right' });
  doc.moveDown(1);

  // ── Tasks ──
  for (const task of TASKS) {
    if (doc.y > 720) doc.addPage().font('Amiri');

    // Priority badge
    const badgeColor = PRIORITY_COLORS[task.priority];
    doc.fontSize(9).fillColor('white');
    const badge = ` ${task.priority} `;
    const badgeWidth = doc.widthOfString(badge) + 8;
    const startX = 545 - badgeWidth;
    doc.rect(startX, doc.y, badgeWidth, 16).fill(badgeColor);
    doc.fillColor('white').text(badge, startX + 4, doc.y - 14, { lineBreak: false });

    // Title
    doc.fontSize(14).fillColor('#0f172a');
    doc.text(arabize(`${task.id}: ${task.titleAr}`), 50, doc.y + 4, { align: 'right', width: 480 });

    // Why
    doc.fontSize(10).fillColor('#64748b');
    doc.text(arabize(`السبب: ${task.whyAr}`), { align: 'right' });
    doc.moveDown(0.2);

    // Steps
    doc.fontSize(10).fillColor('#1e293b');
    doc.text(arabize('الخطوات:'), { align: 'right' });
    for (let i = 0; i < task.stepsAr.length; i++) {
      doc.text(arabize(`${i + 1}. ${task.stepsAr[i]}`), { align: 'right', indent: 10 });
    }

    // Estimate
    doc.moveDown(0.2);
    doc.fontSize(9).fillColor('#94a3b8');
    doc.text(arabize(`الوقت المتوقّع: ${task.estTime}${task.blocker ? '   |   حظر للإطلاق' : ''}`), { align: 'right' });

    doc.moveDown(0.6);
    doc.moveTo(80, doc.y).lineTo(515, doc.y).stroke('#f1f5f9');
    doc.moveDown(0.4);
  }

  // ── Footer ──
  if (doc.y > 700) doc.addPage().font('Amiri');
  doc.moveDown(1);
  doc.fontSize(9).fillColor('#94a3b8');
  doc.text(arabize('تم توليد هذا الملف تلقائياً بواسطة كلميرون. للتفاصيل التقنيّة، راجع docs/PROJECT_ASSESSMENT_AND_HUMAN_TASKS.md'), { align: 'right' });

  doc.end();
  console.log(`PDF generated: ${OUT_PATH}`);
}

generate();

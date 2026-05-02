/**
 * POST /api/legal-ai
 * Contract drafts, compliance, IP protection, dispute guidance for Egyptian startups.
 */
import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { google } from '@/src/lib/gemini';
import { adminAuth } from '@/src/lib/firebase-admin';
import { rateLimit, rateLimitResponse } from '@/src/lib/security/rate-limit';
import xss from 'xss';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MODEL = google('gemini-2.5-flash');

async function softAuth(req: NextRequest): Promise<{ userId: string; isGuest: boolean }> {
  const auth = req.headers.get('Authorization');
  if (auth?.startsWith('Bearer ')) {
    try {
      const dec = await adminAuth.verifyIdToken(auth.slice(7).trim());
      return { userId: dec.uid, isGuest: false };
    } catch { /* fall through */ }
  }
  return { userId: 'guest', isGuest: true };
}

const MODE_PROMPTS: Record<string, (d: Record<string, string>) => string> = {
  contract: (d) => `أعدّ مسوّدة عقد مبسّطة:

نوع العقد: ${d.contractType}
الوصف: ${d.description}
الأطراف: ${d.parties || 'طرف أول وطرف ثانٍ'}
بنود خاصة: ${d.specificTerms || 'لا توجد'}

أعدّ مسوّدة عقد للقانون المصري تشمل:

## 📄 ديباجة العقد
(التاريخ، الأطراف، مقدمة)

## 🎯 موضوع العقد والنطاق

## 💰 المقابل المالي وشروط السداد

## 📅 المدة والتجديد

## 🔑 الالتزامات والحقوق (كلا الطرفين)

## 🔒 السرية وحماية البيانات

## ⚖️ فسخ العقد وحالاته

## 🏛️ حل النزاعات والقانون الواجب التطبيق
(قانون العمل المصري / التحكيم)

## ✍️ التوقيعات والشهود

---
## ⚠️ بنود تحتاج مراجعة محامٍ
## 💡 نصائح قانونية للحماية
`,

  compliance: (d) => `وضّح الالتزامات القانونية:

الموضوع: ${d.description}

أنشئ دليل امتثال قانوني للشركات الناشئة المصرية:

## 📋 الالتزامات القانونية الأساسية
(بموجب القانون المصري)

## 🏢 التراخيص والتصاريح المطلوبة
(وفقاً للنشاط التجاري)

## 👥 قانون العمل المصري — النقاط الحرجة
(عقود العمل، التأمينات الاجتماعية، الإجازات)

## 💳 الالتزامات الضريبية
(ضريبة القيمة المضافة، ضريبة الدخل، الخصم والإضافة)

## 🔐 حماية البيانات الشخصية
(متطلبات قانون حماية البيانات المصري)

## 🌐 إذا كانت الشركة تعمل رقمياً
(التجارة الإلكترونية، المدفوعات الرقمية — اللوائح المطلوبة)

## 🗓️ جدول الامتثال الشهري/السنوي
(ما يجب فعله ومتى)

## ⚠️ أشيع المخالفات وعقوباتها
`,

  ip: (d) => `وضّح كيفية حماية الملكية الفكرية:

الموضوع: ${d.description}

أنشئ دليل حماية الملكية الفكرية في مصر:

## 🔑 أنواع حماية الملكية الفكرية المتاحة في مصر
| النوع | ما يحميه | المدة | الجهة المسؤولة |

## 📝 تسجيل العلامة التجارية
(الخطوات، التكلفة، المدة — مكتب تسجيل العلامات التجارية المصري)

## 💻 حقوق النشر للبرمجيات والمحتوى
(آلية الحماية التلقائية في مصر)

## 🔐 براءات الاختراع
(هل منتجك قابل للتسجيل؟ الشروط والإجراءات)

## 📋 خطوات حماية أسرار التجارة
(Trade Secrets — كيف تحمي خوارزميتك أو بياناتك)

## ⚡ ماذا تفعل إذا انتُهكت حقوقك؟
(الخطوات القانونية المتاحة)

## 💰 تكاليف الحماية
(جدول تقديري للرسوم والخدمات)
`,

  disputes: (d) => `وجّهني في النزاع التجاري:

الموضوع: ${d.description}

أنشئ دليل التعامل مع النزاع:

## 🔍 تشخيص النزاع
(تحديد نوع النزاع وحجمه)

## ⚖️ الخيارات القانونية المتاحة
| الخيار | المزايا | العيوب | التكلفة | الوقت |
|--------|---------|--------|--------|-------|
| التسوية الودية | | | | |
| الوساطة | | | | |
| التحكيم | | | | |
| القضاء | | | | |

## 📝 خطوات التسوية الودية (الأولوية)
(كيف تحل النزاع بدون محاكم)

## 📋 الوثائق المطلوبة لحماية موقفك
(ما تجمعه قبل أي إجراء)

## ⏰ المواعيد القانونية الحرجة
(التقادم وآجال المطالبة)

## 💡 نصائح عملية خاصة بالسوق المصري
(الواقعية في التوقعات والإجراءات)

## 🚫 ما لا تفعله أبداً في النزاعات التجارية
`,
};

export async function POST(request: NextRequest) {
  const { userId, isGuest } = await softAuth(request);
  const rl = rateLimit(request, {
    limit: isGuest ? 3 : 15,
    windowMs: 60_000,
    userId: isGuest ? undefined : userId,
    scope: isGuest ? 'guest' : 'user',
  });
  if (!rl.success) return rateLimitResponse();

  try {
    const body = await request.json();
    const mode = (body.mode as string) || 'contract';
    if (!Object.keys(MODE_PROMPTS).includes(mode)) {
      return NextResponse.json({ error: 'invalid mode' }, { status: 400 });
    }

    const d = {
      contractType: xss(String(body.contractType ?? 'عقد عمل').slice(0, 100)),
      description: xss(String(body.description ?? '').slice(0, 2000)),
      parties: xss(String(body.parties ?? '').slice(0, 300)),
      specificTerms: xss(String(body.specificTerms ?? '').slice(0, 500)),
    };

    if (!d.description.trim()) {
      return NextResponse.json({ error: 'description required' }, { status: 400 });
    }

    const { text } = await generateText({
      model: MODEL,
      system: `أنت "المستشار القانوني الذكي" في منصة كلميرون — خبير في القانون التجاري المصري وقانون الشركات الناشئة.

تُبسّط المفاهيم القانونية المعقدة وتُقدّم إرشادات عملية واضحة، مع الإشارة دائماً عند الحاجة لمحامٍ متخصص.

تعرف جيداً: قانون الشركات المصري، قانون العمل رقم 12/2003، قانون حماية الملكية الفكرية رقم 82/2002، وقانون حماية البيانات الشخصية رقم 151/2020.

**تذكير مهم:** دائماً أشر إلى أن هذه إرشادات عامة وليست استشارة قانونية متخصصة.`,
      prompt: MODE_PROMPTS[mode](d),
    });

    return NextResponse.json({ result: text, mode });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

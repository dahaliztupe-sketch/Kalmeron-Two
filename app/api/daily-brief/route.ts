/**
 * Daily Brief API — feeds `app/(dashboard)/daily-brief`.
 *
 * P1-1 from the 45-expert business audit. Today this returns a deterministic
 * stub so the UI ships first; the next pass wires it to the LangGraph
 * supervisor (anomaly detection + decision + message in one tool call) and
 * caches the brief per (workspace, day) in Firestore.
 */
import { NextResponse } from 'next/server';

interface BriefBlock {
  type: 'anomaly' | 'decision' | 'message';
  title: string;
  body: string;
  ctaLabel?: string;
}

interface DailyBrief {
  generatedAt: string;
  greeting: string;
  blocks: BriefBlock[];
}

const STUB_LIBRARY: BriefBlock[][] = [
  [
    {
      type: 'anomaly',
      title: 'مبيعات الأمس انخفضت 12 % عن متوسط الأسبوع',
      body: 'الانخفاض مركّز في فئة المنتج "B" — بقية الفئات مستقرة. السبب الأرجح: تأخّر شحنة المورد X (3 أيام بدلاً من 1).',
    },
    {
      type: 'decision',
      title: 'حدّد بديلاً مؤقتاً للمورد X خلال 24 ساعة',
      body: 'المورد Y لديه نفس العنصر بسعر أعلى 6 % لكنه يضمن توصيل خلال 36 ساعة. التكلفة الإضافية الإجمالية المتوقعة: 1,800 ج.م خلال أسبوعين، مقابل خسارة مبيعات أكبر إذا استمر النقص.',
    },
    {
      type: 'message',
      title: 'رسالة جاهزة للمورد Y',
      body: 'السلام عليكم، أ. [الاسم]،\n\nنحتاج 200 وحدة من المنتج B للتوصيل خلال 36 ساعة. سعر الوحدة 95 ج.م مقبول. الدفع تحويل بنكي عند الاستلام.\n\nهل يمكن التأكيد قبل الساعة 4 عصراً اليوم؟\n\nشكراً.',
      ctaLabel: 'افتح المحادثة لتحرير الرسالة',
    },
  ],
  [
    {
      type: 'anomaly',
      title: 'تذاكر الدعم ارتفعت 28 % خلال 48 ساعة',
      body: '14 من أصل 19 تذكرة جديدة عن "مشكلة تحميل صفحة المنتج" على المتصفحات القديمة. لم نُغيّر الكود مؤخراً — الأرجح تحديث Chrome أمس.',
    },
    {
      type: 'decision',
      title: 'انشر إعلاناً مؤقتاً + أصلح خلال 72 ساعة',
      body: 'الإعلان: شريط أعلى الموقع يطلب من المستخدمين تحديث المتصفح، يُخفي الشكاوى المتكررة. الإصلاح الفعلي: تكليف المهندس X بمراجعة polyfills المُسقطة.',
    },
    {
      type: 'message',
      title: 'إعلان مقترح للمستخدمين',
      body: 'نلاحظ أن بعض العملاء يواجهون مشكلة في تحميل الصفحة بمتصفحات قديمة. نُصلح الأمر خلال 3 أيام. لتجربة سلسة الآن، يُرجى تحديث Chrome / Safari لآخر إصدار. شكراً لصبركم.',
      ctaLabel: 'استخدم الإعلان كما هو',
    },
  ],
];

function pickStub(seed: number): BriefBlock[] {
  return STUB_LIBRARY[seed % STUB_LIBRARY.length];
}

export async function GET() {
  const today = new Date();
  const dayIndex = today.getUTCFullYear() * 366 + today.getUTCMonth() * 31 + today.getUTCDate();
  const greetings = [
    'صباح الخير. قرار واحد، رسالة واحدة، خمس دقائق.',
    'يوم جديد. لا تفوّت ما يستحق انتباهك اليوم.',
    'إيجاز اليوم جاهز — افعل أهم شيء قبل أن يُسرَق وقتك.',
  ];
  const brief: DailyBrief = {
    generatedAt: today.toISOString(),
    greeting: greetings[dayIndex % greetings.length],
    blocks: pickStub(dayIndex),
  };
  return NextResponse.json(brief, {
    headers: { 'Cache-Control': 'private, max-age=60' },
  });
}

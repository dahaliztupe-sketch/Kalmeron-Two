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

const TEMPLATE_PROMPTS: Record<string, (d: Record<string, string>) => string> = {
  employment: (d) => `أنشئ عقد عمل احترافي باللغة العربية وفق قانون العمل المصري رقم 12 لسنة 2003:

بيانات العقد:
- صاحب العمل: ${d.partyA || 'الشركة'}
- الموظف: ${d.partyB || 'الموظف'}
- المسمى الوظيفي: ${d.role || 'موظف'}
- الراتب الأساسي: ${d.salary || 'يُحدَّد'}
- مدة العقد: ${d.duration || 'سنة قابلة للتجديد'}
- مكان العمل: ${d.location || 'القاهرة'}
${d.extra ? `- بنود إضافية: ${d.extra}` : ''}

ضمّن: التعريفات، الالتزامات، السرية، الإجازات، إنهاء العقد، بند عدم المنافسة إن طُلب، والتوقيعات.`,

  nda: (d) => `أنشئ اتفاقية عدم إفصاح (NDA) احترافية باللغة العربية:

- الطرف المُفصِح: ${d.partyA || 'الطرف الأول'}
- الطرف المُتلقّي: ${d.partyB || 'الطرف الثاني'}
- الغرض من الاتفاقية: ${d.purpose || 'التعاون التجاري'}
- مدة السرية: ${d.duration || 'سنتان'}
${d.extra ? `- بنود إضافية: ${d.extra}` : ''}

ضمّن: تعريف المعلومات السرية، الاستثناءات، الالتزامات، العقوبات، القانون المنطبق.`,

  cofounder: (d) => `أنشئ اتفاقية مؤسسين (Founders Agreement) احترافية باللغة العربية:

- اسم الشركة: ${d.companyName || 'الشركة'}
- المؤسسون وحصصهم: ${d.founders || 'يُحدَّد'}
- القطاع: ${d.sector || 'التقنية'}
${d.extra ? `- بنود إضافية: ${d.extra}` : ''}

ضمّن: الحصص والتخفيف، Vesting Schedule، الأدوار والمسؤوليات، اتخاذ القرار، خروج المؤسسين، حل النزاعات.`,

  investment: (d) => `أنشئ نموذج عرض استثمار (Investment Proposal) احترافياً باللغة العربية:

- اسم الشركة: ${d.companyName || 'الشركة'}
- القطاع: ${d.sector || 'التقنية'}
- المبلغ المطلوب: ${d.amount || 'يُحدَّد'}
- نبذة عن الشركة: ${d.description || 'شركة ناشئة'}
${d.extra ? `- معلومات إضافية: ${d.extra}` : ''}

ضمّن: ملخص تنفيذي، المشكلة والحل، حجم السوق، نموذج الأعمال، الفريق، المالية، شروط الاستثمار المقترحة.`,

  'business-plan': (d) => `أنشئ خطة عمل (Business Plan) شاملة واحترافية باللغة العربية للشركة الناشئة التالية:

- اسم الشركة: ${d.companyName || 'الشركة'}
- القطاع والنموذج: ${d.sector || 'التقنية'}
- المشكلة: ${d.problem || 'يُحدَّد'}
- الحل والمنتج: ${d.solution || 'يُحدَّد'}
- الشريحة المستهدفة: ${d.target || 'يُحدَّد'}
${d.traction ? `- الزخم الحالي: ${d.traction}` : ''}
${d.team ? `- الفريق: ${d.team}` : ''}
${d.financials ? `- التوقعات المالية: ${d.financials}` : ''}
${d.extra ? `- معلومات إضافية: ${d.extra}` : ''}

أنشئ خطة العمل كاملة بالأقسام التالية:

## 1. الملخص التنفيذي (Executive Summary)
## 2. المشكلة والفرصة
## 3. الحل والمنتج
## 4. حجم السوق (TAM / SAM / SOM)
## 5. نموذج الأعمال وتدفقات الإيراد
## 6. استراتيجية الوصول للسوق (GTM)
## 7. المنافسون والميزة التنافسية
## 8. الفريق المؤسس
## 9. الخطة التشغيلية (أول 12 شهر)
## 10. التوقعات المالية (P&L مبسّط)
## 11. الاحتياجات التمويلية وخطة الاستخدام
## 12. المخاطر وخطط التخفيف`,

  service: (d) => `أنشئ عقد خدمات احترافياً باللغة العربية:

- مزود الخدمة: ${d.partyA || 'الشركة'}
- العميل: ${d.partyB || 'العميل'}
- نوع الخدمة: ${d.role || 'خدمات تقنية'}
- الأتعاب: ${d.salary || 'يُحدَّد'}
- مدة الخدمة: ${d.duration || 'حسب المشروع'}
${d.extra ? `- بنود إضافية: ${d.extra}` : ''}

ضمّن: نطاق العمل، الجدول الزمني، الدفعات، الملكية الفكرية، إنهاء العقد، المسؤولية.`,
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
    const templateType = xss(String(body.templateType ?? 'employment').slice(0, 50));
    const fields: Record<string, string> = {};
    for (const key of ['partyA', 'partyB', 'role', 'salary', 'duration', 'location', 'purpose', 'extra', 'companyName', 'founders', 'sector', 'amount', 'description', 'problem', 'solution', 'target', 'traction', 'team', 'financials']) {
      if (body[key]) fields[key] = xss(String(body[key]).slice(0, 500));
    }

    const promptFn = TEMPLATE_PROMPTS[templateType];
    if (!promptFn) {
      return NextResponse.json({ error: 'template type not supported' }, { status: 400 });
    }

    const { text } = await generateText({
      model: MODEL,
      system: `أنت متخصص في صياغة العقود والوثائق القانونية والتجارية للشركات الناشئة المصرية. تكتب بأسلوب قانوني واضح يجمع بين الاحترافية والبساطة، مراعياً القوانين المصرية واللوائح المعمول بها.

قدّم النموذج كاملاً جاهزاً للاستخدام مع مساحات للتعبئة حيث يلزم.`,
      prompt: promptFn(fields),
    });

    return NextResponse.json({ result: text });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

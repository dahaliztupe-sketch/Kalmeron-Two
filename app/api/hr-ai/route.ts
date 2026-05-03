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
  'cv-compare': (d) => `أنت خبير Human Resources متخصص في المقارنة النهائية بين المرشحين للشركات الناشئة.

الوظيفة: ${d.role}
${d.skills ? `المتطلبات: ${d.skills}` : ''}

فيما يلي تقارير تقييم منفصلة لكل مرشح:
${(d.cvText ?? '').slice(0, 10000)}

قدّم:
## 🏆 ترتيب المرشحين (من الأفضل للأقل)
(جدول مقارنة يُظهر الاسم، النتيجة، أبرز ميزة، أبرز ضعف)

## 🥇 التوصية النهائية
من تُوصي باستدعائه أولاً وسبب ذلك بالتفصيل.

## 📌 ملاحظات للمقابلة
نقاط يجب التحقق منها لأفضل المرشحين.
`,
  'cv-screen': (d) => `أنت خبير Human Resources متخصص في فحص وتقييم السير الذاتية للشركات الناشئة في مصر.

الوظيفة المطلوبة: ${d.role}
${d.skills ? `المتطلبات الأساسية: ${d.skills}` : ''}
${d.department ? `القسم: ${d.department}` : ''}
${d.experience ? `الخبرة المطلوبة: ${d.experience}` : ''}

--- نص السيرة الذاتية ---
${(d.cvText ?? '').slice(0, 10000)}
--- نهاية السيرة الذاتية ---

قدّم تقييماً شاملاً يتضمن:

## 📊 نتيجة التوافق مع الوظيفة
**النتيجة الإجمالية: X / 10** — (توافق: ضعيف / متوسط / جيد / ممتاز)

## 👤 ملخص المرشح
(5 نقاط أبرز ما في السيرة الذاتية)

## ✅ نقاط القوة المُطابِقة للوظيفة
(ما الذي يُؤهّله لهذا الدور؟)

## ⚠️ نقاط الضعف والفجوات
(ما الذي يفتقر إليه مقارنةً بالمتطلبات؟)

## 🎯 أسئلة مقابلة مُخصَّصة لهذا المرشح
(7-10 أسئلة مبنية على تجربته الفعلية — ليست عامة)

## 📋 توصية نهائية
(هل تُوصي باستدعائه للمقابلة؟ ولماذا؟)
`,
  jobdesc: (d) => `اكتب وصفاً وظيفياً احترافياً:

المسمى الوظيفي: ${d.role}
القسم: ${d.department}
سنوات الخبرة: ${d.experience || 'غير محدد'}
المهارات المطلوبة: ${d.skills || 'غير محدد'}
سياق الشركة: ${d.context || 'شركة ناشئة مصرية'}

أنشئ وصفاً وظيفياً شاملاً يشمل:

## 🏢 عن الشركة
(وصف موجز جذاب)

## 💼 ملخص الدور
(فقرة مقنعة عن الدور وأثره)

## 🎯 المسؤوليات الأساسية
(8-10 نقاط واضحة وقابلة للقياس)

## ✅ المتطلبات الأساسية
(المهارات والخبرات المطلوبة)

## ⭐ المتطلبات المفضّلة (Bonus)
(مهارات إضافية تُميّز المرشح)

## 🎁 ما نقدمه
(المزايا والبيئة — مناسب للسوق المصري)

## 📝 كيفية التقديم
`,

  interview: (d) => `أنشئ مجموعة أسئلة مقابلة احترافية:

المسمى الوظيفي: ${d.role}
القسم: ${d.department}
سنوات الخبرة: ${d.experience || 'غير محدد'}
المهارات المطلوبة: ${d.skills || 'غير محدد'}
التركيز: ${d.context || 'مقابلة شاملة'}

أنشئ مجموعة أسئلة مقابلة تشمل:

## 🧠 أسئلة Technical / الكفاءة الفنية
(5 أسئلة مع المطلوب في الإجابة المثالية)

## 💡 أسئلة Problem Solving
(3 أسئلة على حل المشكلات)

## 🤝 أسئلة Behavioral (STAR Method)
(5 أسئلة سلوكية بصيغة "حدّثني عن وقت...")

## 🎯 أسئلة Cultural Fit
(3 أسئلة للتوافق الثقافي)

## 📈 أسئلة Ambition & Growth
(2-3 أسئلة عن التطلعات المستقبلية)

## ❓ أسئلة يحق للمرشح أن يسألها
(5 أسئلة تُظهر اهتمام المرشح الجاد)

## 🔴 علامات التحذير (Red Flags)
(ما يجب الانتباه إليه في الإجابات)
`,

  performance: (d) => `أنشئ نموذج تقييم أداء شامل:

المسمى الوظيفي: ${d.role}
القسم: ${d.department}
سياق الموظف: ${d.context || 'موظف في فترة تقييم'}

أنشئ نموذج تقييم أداء يشمل:

## 📊 محاور التقييم ونظام النقاط
| المحور | الوزن | التقييم (1-5) | التعليق |
|--------|------|--------------|---------|
| الكفاءة الفنية | 30% | _ | |
| جودة العمل | 25% | _ | |
| الإنتاجية | 20% | _ | |
| روح الفريق | 15% | _ | |
| المبادرة والابتكار | 10% | _ | |

## 🎯 الأهداف المحققة مقابل المستهدف

## 💪 نقاط القوة الظاهرة

## 📈 مجالات التطوير

## 🗓️ أهداف الفترة القادمة
(SMART Goals للربع القادم)

## 💬 تعليق المدير

## 📝 تعليق الموظف

## ✅ الخطوات التالية المتفق عليها
`,

  offer: (d) => `اكتب عرض عمل رسمي:

المسمى الوظيفي: ${d.role}
القسم: ${d.department}
سنوات الخبرة: ${d.experience || 'غير محدد'}
الراتب: ${d.salary || 'يُحدَّد'}
السياق: ${d.context || 'شركة ناشئة مصرية'}

أنشئ مسوّدة عرض عمل رسمي يشمل:

## 📄 خطاب عرض العمل

[تاريخ اليوم]

[اسم المرشح]

عزيزي/عزيزتي [الاسم]،

يسعدنا...

## 📋 تفاصيل العرض
| البند | التفاصيل |
|------|---------|
| المسمى الوظيفي | ${d.role} |
| القسم | ${d.department} |
| تاريخ البدء | ... |
| الراتب الأساسي | ${d.salary || 'يُحدَّد بالاتفاق'} |
| طبيعة العمل | دوام كامل |
| فترة التجربة | 3 أشهر |

## 🎁 المزايا الإضافية
(تأمين طبي، إجازات، بدلات — مناسبة للسوق المصري)

## ⚖️ الشروط والأحكام
(نقاط قانونية أساسية: سرية المعلومات، فترة الإشعار، إلخ)

## ✍️ قبول العرض
(توقيع المرشح والشركة)

---
## 💡 ملاحظات للتفاوض
(نصائح للتعامل مع التفاوض)
`,
};

export async function POST(request: NextRequest) {
  const { userId, isGuest } = await softAuth(request);
  const rl = rateLimit(request, {
    limit: isGuest ? 3 : 20,
    windowMs: 60_000,
    userId: isGuest ? undefined : userId,
    scope: isGuest ? 'guest' : 'user',
  });
  if (!rl.success) return rateLimitResponse();

  try {
    const body = await request.json();
    const mode = (body.mode as string) || 'jobdesc';
    if (!Object.keys(MODE_PROMPTS).includes(mode)) {
      return NextResponse.json({ error: 'invalid mode' }, { status: 400 });
    }

    const d = {
      role: xss(String(body.role ?? '').slice(0, 200)),
      department: xss(String(body.department ?? 'هندسة برمجيات').slice(0, 100)),
      experience: xss(String(body.experience ?? '').slice(0, 100)),
      skills: xss(String(body.skills ?? '').slice(0, 500)),
      context: xss(String(body.context ?? '').slice(0, 1000)),
      salary: xss(String(body.salary ?? '').slice(0, 100)),
      cvText: String(body.cvText ?? '').slice(0, 12000),
    };

    if (!d.role.trim()) {
      return NextResponse.json({ error: 'role is required' }, { status: 400 });
    }
    if (mode === 'cv-screen' && !d.cvText.trim()) {
      return NextResponse.json({ error: 'cvText is required for cv-screen mode' }, { status: 400 });
    }

    const { text } = await generateText({
      model: MODEL,
      maxOutputTokens: 4096,
      system: `أنت "مستشار الموارد البشرية" في منصة كلميرون — خبير HR يفهم سوق العمل المصري والعربي جيداً.

تُنشئ محتوى HR احترافياً وعملياً: وصف وظيفي جذاب، أسئلة مقابلة ذكية، تقييمات موضوعية، وعروض عمل قانونية.

تراعي: القوانين المصرية، مستويات الرواتب المناسبة للسوق، والثقافة العربية في بيئة العمل.`,
      prompt: MODE_PROMPTS[mode](d),
    });

    return NextResponse.json({ result: text, mode });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

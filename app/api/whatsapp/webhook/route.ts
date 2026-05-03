import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { google } from '@/src/lib/gemini';
import { adminDb } from '@/src/lib/firebase-admin';
import crypto from 'crypto';
import { CEO_SYSTEM_PROMPT } from '@/src/ai/agents/ceo/prompt';
import { CHRO_SYSTEM_PROMPT } from '@/src/ai/agents/chro/prompt';
import { HIRING_ADVISOR_PROMPT } from '@/src/ai/agents/hiring-advisor/prompt';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MODEL = google('gemini-2.5-flash');

const WHATSAPP_SUFFIX = `
قدّم ردّاً مختصراً ومباشراً يناسب WhatsApp: 3-4 جمل فقط، بالعربية.`;

const AGENT_REGISTRY: Array<{
  id: string;
  keywords: string[];
  nameAr: string;
  system: string;
}> = [
  {
    id: 'ceo',
    keywords: ['@ceo', 'ceo', 'الرئيس التنفيذي', 'استراتيجية', 'رؤية', 'قرار استراتيجي', 'نمو الشركة'],
    nameAr: 'المدير التنفيذي (CEO)',
    system: CEO_SYSTEM_PROMPT + WHATSAPP_SUFFIX,
  },
  {
    id: 'chro',
    keywords: ['@chro', 'chro', 'مدير موارد بشرية', 'ثقافة الشركة', 'إدارة المواهب', 'احتفاظ بالموظفين'],
    nameAr: 'مدير الموارد البشرية (CHRO)',
    system: CHRO_SYSTEM_PROMPT + WHATSAPP_SUFFIX,
  },
  {
    id: 'hiring',
    keywords: ['@hiring', 'توظيف', 'مقابلة', 'وظيفة', 'سيرة ذاتية', 'cv', 'resume', 'hiring', 'job description'],
    nameAr: 'مستشار التوظيف',
    system: HIRING_ADVISOR_PROMPT + WHATSAPP_SUFFIX,
  },
];

const GENERAL_SYSTEM = `أنت مساعد كلميرون الذكي — منصة رواد الأعمال المصريين والعرب.
تُجيب بالعربية على أسئلة ريادة الأعمال، التمويل، التسويق، القانون، والموارد البشرية.
ردّك مختصر (3-4 جمل) ومناسب لـ WhatsApp.
للتواصل مع وكيل متخصص اكتب: @CEO للاستراتيجية • @CHRO للموارد البشرية • @Hiring للتوظيف`;

function detectAgent(message: string): typeof AGENT_REGISTRY[number] | null {
  const lower = message.toLowerCase();
  for (const agent of AGENT_REGISTRY) {
    if (agent.keywords.some(kw => lower.includes(kw.toLowerCase()))) {
      return agent;
    }
  }
  return null;
}

function validateTwilioSignature(req: NextRequest, body: string): boolean {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) return false;

  const signature = req.headers.get('x-twilio-signature') ?? '';
  const url = `https://${req.headers.get('host')}${req.nextUrl.pathname}`;

  const params = new URLSearchParams(body);
  const sortedKeys = Array.from(params.keys()).sort();
  let str = url;
  for (const key of sortedKeys) {
    str += key + (params.get(key) ?? '');
  }

  const expected = crypto
    .createHmac('sha1', authToken)
    .update(str)
    .digest('base64');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected),
  );
}

function escapeXml(str: string): string {
  return str.replace(/[<>&"']/g, c =>
    ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c] ?? c)
  );
}

function twimlReply(message: string): NextResponse {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n  <Message>${escapeXml(message)}</Message>\n</Response>`;
  return new NextResponse(xml, {
    status: 200,
    headers: { 'Content-Type': 'text/xml; charset=utf-8' },
  });
}

/** Returns the userId if the phone is verified and registered, else null. */
async function lookupUserIdByPhone(twilioFrom: string): Promise<string | null> {
  try {
    const snap = await adminDb
      .collection('whatsapp_registrations')
      .where('twilioPhone', '==', twilioFrom)
      .where('verified', '==', true)
      .limit(1)
      .get();
    if (!snap.empty) return snap.docs[0].data().userId as string;

    const normalized = twilioFrom.replace('whatsapp:', '');
    const snap2 = await adminDb
      .collection('whatsapp_registrations')
      .where('normalizedPhone', '==', normalized)
      .where('verified', '==', true)
      .limit(1)
      .get();
    if (!snap2.empty) return snap2.docs[0].data().userId as string;

    return null;
  } catch {
    return null;
  }
}

/** Try to verify a pending OTP.  Returns userId if matched, null otherwise. */
async function tryVerifyOtp(twilioFrom: string, code: string): Promise<string | null> {
  try {
    const normalized = twilioFrom.replace('whatsapp:', '');
    const snap = await adminDb
      .collection('whatsapp_registrations')
      .where('normalizedPhone', '==', normalized)
      .where('verified', '==', false)
      .limit(1)
      .get();
    if (snap.empty) return null;

    const doc = snap.docs[0];
    const data = doc.data();
    if (
      data.otpCode === code.trim() &&
      typeof data.otpExpiresAt === 'number' &&
      Date.now() < data.otpExpiresAt
    ) {
      await doc.ref.update({ verified: true, verifiedAt: Date.now(), otpCode: null });
      return data.userId as string;
    }
    return null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  if (process.env.NODE_ENV === 'production') {
    if (!process.env.TWILIO_AUTH_TOKEN) {
      console.error('[whatsapp/webhook] TWILIO_AUTH_TOKEN not set — rejecting request');
      return new NextResponse('Service Unavailable', { status: 503 });
    }
    if (!validateTwilioSignature(request, rawBody)) {
      return new NextResponse('Forbidden', { status: 403 });
    }
  }

  const params = new URLSearchParams(rawBody);
  const from = params.get('From') ?? '';
  const body = params.get('Body') ?? '';
  const messageSid = params.get('MessageSid') ?? '';
  const to = params.get('To') ?? '';

  if (!body.trim()) {
    return twimlReply('أرسل رسالتك وسأردّ عليك فوراً! يمكنك مخاطبة وكيل متخصص: @CEO للاستراتيجية • @CHRO للموارد البشرية • @Hiring للتوظيف');
  }

  const phoneNumber = from.replace('whatsapp:', '');

  // Check if this message is an OTP verification attempt (6 digits only)
  const otpMatch = body.trim().match(/^\d{6}$/);
  if (otpMatch) {
    const verifiedUserId = await tryVerifyOtp(from, otpMatch[0]);
    if (verifiedUserId) {
      return twimlReply('✅ تم التحقق من رقمك بنجاح! يمكنك الآن استخدام وكلاء كلميرون عبر WhatsApp. اكتب سؤالك أو @CEO • @CHRO • @Hiring لمخاطبة وكيل محدد.');
    }
    // If 6 digits but not a valid OTP, fall through to normal handling
  }

  const userId = await lookupUserIdByPhone(from);

  if (!userId) {
    return twimlReply('هذا الرقم غير مسجَّل أو لم يُفعَّل في منصة كلميرون. سجّل في kalmeron.com ثم أرسل رمز التحقق هنا.');
  }

  // Detect which agent should handle this message
  const targetAgent = detectAgent(body);
  const agentSystem = targetAgent ? targetAgent.system : GENERAL_SYSTEM;
  const agentId = targetAgent?.id ?? 'general';
  const agentNameAr = targetAgent?.nameAr ?? 'المساعد العام';

  try {
    const { text: aiReply } = await generateText({
      model: MODEL,
      system: agentSystem,
      prompt: body.trim(),
      maxOutputTokens: 500,
    });

    await adminDb.collection('whatsapp_conversations').add({
      userId,
      phoneNumber,
      from,
      to,
      messageSid,
      userMessage: body.trim(),
      aiReply,
      agentId,
      agentNameAr,
      timestamp: Date.now(),
      createdAt: new Date().toISOString(),
    });

    // Prefix reply with agent name so user knows who answered
    const prefixedReply = targetAgent
      ? `🤖 ${agentNameAr}:\n${aiReply}`
      : aiReply;

    return twimlReply(prefixedReply);
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : 'error';
    console.error('[whatsapp/webhook] error:', errMsg);

    await adminDb.collection('whatsapp_conversations').add({
      userId,
      phoneNumber,
      from,
      to,
      messageSid,
      userMessage: body.trim(),
      aiReply: null,
      agentId,
      agentNameAr,
      error: errMsg,
      timestamp: Date.now(),
      createdAt: new Date().toISOString(),
    }).catch(() => {});

    return twimlReply('عذراً، حدث خطأ مؤقت. أعد المحاولة بعد لحظة.');
  }
}

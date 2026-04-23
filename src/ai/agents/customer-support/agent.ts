// @ts-nocheck
import { GoogleGenerativeAI } from '@google/generative-ai';
import { recordDriftSample } from '@/src/lib/observability/drift-detector';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function createSupportSession() {
  const start = Date.now();
  let success = true;
  let errorCode: string | undefined;
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-live-preview',
    });

    const chat = model.startChat({
      systemInstruction: `أنت وكيل خدمة عملاء لمنصة كلميرون تو.
    دورك: مساعدة رواد الأعمال في استخدام المنصة، الإجابة على أسئلتهم، وحل مشكلاتهم بالاعتماد على قاعدة المعرفة.
    كن ودودًا، محترفًا، وتحدث بالعربية الفصحى الواضحة أو العامية المصرية الأنيقة.
    أنت تدعم الآن التواصل الصوتي والمرئي، فاستخدم أسلوب المحادثة المباشرة (Live).`,
    });

    return chat;
  } catch (e: any) {
    success = false;
    errorCode = e?.code || e?.name || 'support_session_error';
    throw e;
  } finally {
    void recordDriftSample({
      agent: 'customer_support.session',
      toolsUsed: ['gemini.live'],
      responseLength: 0,
      latencyMs: Date.now() - start,
      success,
      errorCode,
    });
  }
}

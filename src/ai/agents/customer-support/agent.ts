import { GoogleGenerativeAI } from '@google/generative-ai';
import { recordDriftSample } from '@/src/lib/observability/drift-detector';
import { CUSTOMER_SUPPORT_PROMPT } from './prompt';
import { liveModel } from '@/src/lib/model-ids';

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    ''
);

export async function createSupportSession() {
  const start = Date.now();
  let success = true;
  let errorCode: string | undefined;
  try {
    const model = genAI.getGenerativeModel({
      model: liveModel(),
    });

    const chat = model.startChat({
      systemInstruction: CUSTOMER_SUPPORT_PROMPT,
    });

    return chat;
  } catch (e: unknown) {
    success = false;
    errorCode = (e as { code?: string; name?: string })?.code || (e as { code?: string; name?: string })?.name || 'support_session_error';
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

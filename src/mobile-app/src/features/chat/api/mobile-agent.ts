import { GoogleGenerativeAI, type ChatSession } from '@google/generative-ai';

const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';
const genAI = new GoogleGenerativeAI(apiKey);

export interface MobileAgentSession {
  chat: ChatSession;
  userId: string;
  userDID: string;
}

export async function createMobileAgentSession(
  userId: string,
  userDID: string,
): Promise<MobileAgentSession> {
  if (!apiKey) {
    throw new Error('[mobile-agent] EXPO_PUBLIC_GEMINI_API_KEY is not set.');
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: `أنت "كلميرون"، المساعد الافتراضي لرواد الأعمال على الهاتف المحمول.

أنت تعمل على جهاز المستخدم المحمول. يمكنك:
- تحليل الأفكار التجارية
- بناء خطط عمل مختصرة
- الإجابة على أسئلة ريادة الأعمال

هوية المستخدم اللامركزية (DID): ${userDID}

كن موجزاً في إجاباتك وركّز على السياق المصري والعربي.`,
  });

  const chat = model.startChat({ history: [] });
  return { chat, userId, userDID };
}

export async function sendMessage(
  session: MobileAgentSession,
  message: string,
): Promise<string> {
  const result = await session.chat.sendMessage(message);
  return result.response.text();
}

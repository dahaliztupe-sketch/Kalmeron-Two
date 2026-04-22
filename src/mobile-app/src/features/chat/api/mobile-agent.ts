// @ts-nocheck
// src/mobile-app/src/features/chat/api/mobile-agent.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

// Note: Using placeholder API Key until environment is configured
const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY || '');

export async function createMobileAgentSession(userId: string, userDID: string) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
  });
  
  return model.startChat({
    history: [],
    systemInstruction: `أنت "كلميرون"، المساعد الافتراضي لرواد الأعمال على الهاتف المحمول.
    
    أنت تعمل على جهاز المستخدم المحمول. يمكنك:
    - تحليل الأفكار
    - بناء خطط عمل مختصرة
    - الإجابة على الأسئلة
    
    هوية المستخدم اللامركزية (DID): ${userDID}
    
    كن موجزاً في إجاباتك.`,
  });
}

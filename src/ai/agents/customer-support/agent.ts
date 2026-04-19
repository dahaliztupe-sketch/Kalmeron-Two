import { GoogleGenerativeAI } from '@google/generative-ai';

// Assume Gateway URL is configured in process.env.GOOGLE_BASE_URL internally or via sdk
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function createSupportSession() {
  const model = genAI.getGenerativeModel({
    model: 'gemini-3.1-flash-live-preview',
  });
  
  // Create a chat session designed for Multimodal Live API
  const chat = model.startChat({
    systemInstruction: `أنت وكيل خدمة عملاء لمنصة كلميرون تو.
    دورك: مساعدة رواد الأعمال في استخدام المنصة، الإجابة على أسئلتهم، وحل مشكلاتهم بالاعتماد على قاعدة المعرفة.
    كن ودودًا، محترفًا، وتحدث بالعربية الفصحى الواضحة أو العامية المصرية الأنيقة.
    أنت تدعم الآن التواصل الصوتي والمرئي، فاستخدم أسلوب المحادثة المباشرة (Live).`,
    // Mock configuration for 2026 specs:
    // tools: [{ retrieval: { activeloop_l0_index: "kalmeron_kb" } }],
    // generationConfig: {
    //   inputAudioTranscription: { enabled: true, language: "ar-EG" },
    //   outputAudioTranscription: { enabled: true },
    // }
  });
  
  return chat;
}

// @ts-nocheck
import { streamText, tool } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { db } from '@/src/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Vercel Edge Runtime Configuration for Global Scaling (Middle East focused)
export const runtime = 'edge';
export const preferredRegion = ['dub1', 'bom1', 'fra1'];

// السماح بوقت تنفيذ أطول للردود التي تحتاج تحليلاً عميقاً (أقصى حد في مسارات API)
export const maxDuration = 60; 

export async function POST(req: Request) {
  try {
    const { messages, userId = 'anonymous' } = await req.json();

    // إعداد النموذج وتوجيهاته الأساسية (مع دمج Vercel AI Gateway Tags للتكاليف)
    const result = streamText({
      model: google('gemini-3.1-flash-preview'), // نموذج سريع ذو جودة عالية للمحادثات
      headers: {
        'X-Vercel-AI-Gateway-Tags': `userId:${userId},feature:chat_agent`,
      },
      system: `أنت 'كلميرون' (Kalmeron)، المساعد الذكي والمؤسس الافتراضي لرواد الأعمال في مصر. 
      أنت الواجهة الأساسية لمنصة "كلميرون تو" الافتراضية.
      مهمتك مساعدة المستخدم في تأسيس أعماله وتطويرها خطوة بخطوة (من الفكرة، التحقق، التأسيس، إلى التوسع).
      وظيفتك تقييم أفكار المستخدم، وتوفير رؤى نقدية وبناءة لتجنب الفشل في السوق المحلي، وإعطاء نصائح مالية، وقانونية، وتسويقية.
      - كن مهنياً، ودوداً، وتحدث بوضوح باللغة العربية.
      - لديك القدرة على استخدام أدوات متخصصة (مثل تقييم الأفكار) إذا لزم الأمر، لا تتردد في استخدامها لتقديم تحليلات دقيقة.
      - إذا سألك المستخدم عما إذا كان بإمكانك تفويض المهام، أجب بأنك تستعين بوكلاء متخصصين لمساعدتك.
      - قدم إجابات منظمة ومكتوبة بصيغة Markdown، واستخدم النقاط العريضة والخطوط الغامقة عند الحاجة لتسليط الضوء على المعلومات المهمة.`,
      messages,
      temperature: 0.5,
      tools: {
        validateIdea: tool({
          description: 'يفحص فكرة المشروع ويقدم تحليل SWOT وتقييماً أولياً للجدوى.',
          parameters: z.object({
            idea: z.string().describe('وصف الفكرة الخاصة بالمستخدم بشكل واضح.'),
          }),
          execute: async ({ idea }) => {
            // محاكاة سريعة لأداة تقييم الأفكار من الوكيل الداخلي
            return {
              analysis: `هذا تحليل أولي لفكرة "${idea}": نقاط القوة (S): طلب مرتفع محتمل. نقاط الضعف (W): قلة الموارد في البداية. الفرص (O): سوق رقمي متنامٍ. التهديدات (T): منافسة عالية.`,
              score: 85,
            };
          },
        }),
        createTask: tool({
          description: 'يُنشئ مهمة جديدة ويعينها لوكيل متخصص (مثل: المدير المالي، المرشد القانوني، خبير التسويق).',
          parameters: z.object({
            name: z.string().describe('عنوان المهمة.'),
            description: z.string().describe('وصف شامل للمهمة.'),
            assignee: z.string().describe('الوكيل المسؤول (مثلاً: المدير المالي).'),
          }),
          execute: async ({ name, description, assignee }) => {
            return {
              status: 'success',
              message: `تم تكليف '${assignee}' بنجاح بمهمة: ${name}.`,
              taskId: `task_${Math.floor(Math.random() * 1000)}`,
            };
          },
        }),
      },
      onFinish: async ({ text, toolCalls, toolResults }) => {
        try {
          // حفظ المحادثة في Firestore
          const lastUserMessage = messages[messages.length - 1];
          await addDoc(collection(db, 'chat_history'), {
            userId,
            userMessage: lastUserMessage.content,
            assistantMessage: text,
            toolCalls: toolCalls || [],
            toolResults: toolResults || [],
            timestamp: serverTimestamp(),
          });
        } catch (dbError) {
          console.error("Error saving to chat history:", dbError);
        }
      }
    });

    // إرجاع الرد كتدفق بيانات (Streaming)
    return result.toDataStreamResponse();
    
  } catch (error) {
    console.error('API Chat Error:', error);
    return new Response(JSON.stringify({ error: 'عذراً، حدث خطأ أثناء معالجة طلبك.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

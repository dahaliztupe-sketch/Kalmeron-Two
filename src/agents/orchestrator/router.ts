import { generateText } from "ai";
import { MODELS } from "@/src/lib/gemini";

export type AgentIntent = 
    | 'GENERAL_CHAT' 
    | 'IDEA_VALIDATOR' 
    | 'PLAN_BUILDER' 
    | 'MISTAKE_SHIELD' 
    | 'SUCCESS_MUSEUM' 
    | 'OPPORTUNITY_RADAR';

/**
 * Intelligent Router using Gemini 3.1 Flash Lite.
 * Classifies user intent to route to the specialized agent team.
 */
export async function routeIntent(messages: any[], userMemory: string): Promise<AgentIntent> {
    const lastMessage = messages[messages.length - 1].content;

    const { text: intent } = await generateText({
        model: MODELS.LITE,
        system: `أنت المنسق (Orchestrator) لمنصة كلميرون تو. مهمتك هي تحديد نية المستخدم وتوجيهه للوكيل المناسب.
        
        الوكلاء المتاحون:
        1. IDEA_VALIDATOR: عندما يسأل عن جودة فكرته أو يطلب تقييمها.
        2. PLAN_BUILDER: عندما يطلب خطة عمل، دراسة جدوى، أو خطوات تنفيذية.
        3. MISTAKE_SHIELD: عندما يسأل عن أخطاء محتملة، تحذيرات، أو نصائح أمان.
        4. SUCCESS_MUSEUM: عندما يسأل عن قصص نجاح شركات معينة أو كيف نجحت شركة س.
        5. OPPORTUNITY_RADAR: عندما يسأل عن منح، مسابقات، أو فرص تمويل وحضانات أعمال.
        6. GENERAL_CHAT: إذا كان الكلام عاماً، ترحيباً، أو سؤالاً لا يقع تحت التخصصات السابقة.

        يجب أن يكون ردك عبارة عن الكلمة المفتاحية فقط (مثلاً: IDEA_VALIDATOR).`,
        prompt: `سياق المستخدم السابق: ${userMemory}\n\nالرسالة الحالية: ${lastMessage}`
    });

    const validIntents: AgentIntent[] = ['IDEA_VALIDATOR', 'PLAN_BUILDER', 'MISTAKE_SHIELD', 'SUCCESS_MUSEUM', 'OPPORTUNITY_RADAR'];
    const finalIntent = validIntents.find(i => intent.includes(i)) || 'GENERAL_CHAT';

    return finalIntent as AgentIntent;
}

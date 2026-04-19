import { generateText } from "ai";
import { MODELS } from "@/src/lib/gemini";
import { searchKnowledge } from "@/src/lib/rag";

/**
 * High-Reasoning Idea Validator using Gemini 3.1 Pro & RAG.
 */
export async function validateIdea(ideaDesc: string): Promise<string> {
    // RAG: Look for similar success stories or market mistakes
    const relevantInsights = await searchKnowledge(ideaDesc);

    const { text } = await generateText({
        model: MODELS.PRO, // Use the flagship model for deep analysis
        system: `أنت خبير استراتيجي في تقييم الأفكار التجارية للسوق المصري.
        مهمتك هي إجراء تحليل نقدي (Deep Reasoning) للفكرة المقدمة.
        
        سياق إضافي من قاعدة المعرفة:
        ${relevantInsights}
        
        يجب أن يتضمن تحليلك:
        1. القابلية للتنفيذ (Feasibility).
        2. حجم السوق والطلب المتوقع في مصر.
        3. التحديات اللوجستية والبيروقراطية.
        4. نصيحة "مؤسس لمؤسس" حقيقية وغير مجملة.
        
        استخدم لغة قوية، ملهمة، ومبنية على حقائق. ملف الإخراج يجب أن يكون Markdown.`,
        prompt: `حلل هذه الفكرة بالتفصيل: ${ideaDesc}`
    });

    return text;
}

/**
 * Suggestions Generator — يقترح 2–3 أسئلة متابعة منطقية بعد كل رد.
 * يستخدم Gemini Lite عبر بوابة LLM الموحّدة (للحوكمة + التتبع).
 */
import { z } from 'zod';
import { MODELS } from '@/src/lib/gemini';
import { safeGenerateObject, PromptInjectionBlockedError } from '@/src/lib/llm/gateway';

const SUGGESTIONS_SCHEMA = z.object({
  suggestions: z.array(z.string().min(5).max(120)).min(2).max(3),
});

const SYSTEM = `أنت مساعد يقترح أسئلة متابعة قصيرة ومحفّزة لرائد أعمال مصري.
- اكتب 3 أسئلة قصيرة (أقل من 12 كلمة لكل سؤال) بالعربية المصرية البسيطة.
- يجب أن تكون منطقية ومتعلقة بآخر إجابة، وتدفع المستخدم للخطوة التالية.
- لا تكرر صياغة السؤال الأخير، ولا تطرح أسئلة عامة جداً.`;

const FALLBACK = [
  'ابني خطة عمل تفصيلية للفكرة دي.',
  'إيه أكبر 3 أخطاء أتجنبها في البداية؟',
  'في فرص تمويل أو حاضنات مناسبة لي؟',
];

export async function generateFollowUpSuggestions(params: {
  intent: string;
  lastAnswer: string;
  userId?: string;
}): Promise<string[]> {
  try {
    const truncated = params.lastAnswer.slice(0, 1500);
    const { result } = await safeGenerateObject(
      {
        model: MODELS.LITE,
        system: SYSTEM,
        prompt: `النية: ${params.intent}
آخر إجابة من الإيجنت:
"""
${truncated}
"""

اقترح 3 أسئلة متابعة.`,
        schema: SUGGESTIONS_SCHEMA,
      },
      { agent: 'suggestions', userId: params.userId, softCostBudgetUsd: 0.005 },
    );
    return result.object.suggestions.slice(0, 3);
  } catch (e) {
    if (e instanceof PromptInjectionBlockedError) {
      return FALLBACK;
    }
    return FALLBACK;
  }
}

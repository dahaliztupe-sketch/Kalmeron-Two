// @ts-nocheck
import { generateText } from "ai";
import { MODELS } from "@/src/lib/gemini";
import { searchKnowledge } from "@/src/lib/rag";
import { instrumentAgent } from "@/src/lib/observability/agent-instrumentation";
import { IDEA_VALIDATOR_SYSTEM_PROMPT } from "./prompt";

/**
 * High-Reasoning Idea Validator using Gemini Pro & RAG.
 * Uses a rich Arabic-native prompt focused on the Egyptian/Arab market.
 */
export async function validateIdea(ideaDesc: string): Promise<string> {
  return instrumentAgent('idea_validator', async () => {
    const relevantInsights = await searchKnowledge(ideaDesc);

    const systemWithContext = relevantInsights
      ? `${IDEA_VALIDATOR_SYSTEM_PROMPT}\n\n═══════════════════════════════════════════\nبيانات إضافية من قاعدة المعرفة\n═══════════════════════════════════════════\n${relevantInsights}`
      : IDEA_VALIDATOR_SYSTEM_PROMPT;

    const { text } = await generateText({
      model: MODELS.PRO,
      system: systemWithContext,
      prompt: `تقييم الفكرة التالية بالكامل وفق الإطار المحدد:\n\n${ideaDesc}`,
    });

    return text;
  }, { model: 'gemini-pro', input: { ideaDesc }, toolsUsed: ['rag.search'] });
}

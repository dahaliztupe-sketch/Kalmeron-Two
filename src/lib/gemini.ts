import { google } from "@ai-sdk/google";
import { generateText } from "ai";

/**
 * Kalmeron AI Model Tiers (2026 Strategy)
 */
export const MODELS = {
    // Basic tasks (Classification, Summarization) - High speed, low cost
    LITE: google('gemini-3.1-flash-lite-preview'),
    
    // Balanced tasks (General Chat, Standard Analysis)
    FLASH: google('gemini-3-flash-preview'),
    
    // Complex tasks (Business Plan, In-depth Validation)
    PRO: google('gemini-3.1-pro-preview'),
    
    // Embedding for RAG
    EMBEDDING: google.embedding('gemini-embedding-2-preview')
};

/**
 * Cost Optimization Strategy
 */
export const FLEX_CONFIG = {
    experimental_flexInference: true,
};

/**
 * Cost Optimization: Compress long text using Flash Lite before sending to reasoning models.
 */
export async function compressText(text: string): Promise<string> {
    if (text.length < 2000) return text;
  
    const { text: summary } = await generateText({
      model: MODELS.LITE,
      system: "أنت خبير في تلخيص النصوص. قم بتلخيص النص التالي مع الحفاظ على كافة النقاط الجوهرية والبيانات الهامة لرائد الأعمال. اجعل التلخيص مكثفاً جداً.",
      prompt: text,
    });
  
    return summary;
  }

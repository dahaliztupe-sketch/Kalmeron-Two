import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    "";

if (!apiKey && typeof window === "undefined") {
    console.warn("[gemini] GEMINI_API_KEY غير موجود — وكلاء كلميرون لن يعملوا.");
}

export const google = createGoogleGenerativeAI({ apiKey });

/**
 * Kalmeron AI Model Tiers — using real Gemini model IDs.
 * Aliased so we can swap to preview models when they GA without touching call sites.
 */
export const MODEL_IDS = {
    LITE: process.env.MODEL_LITE || "gemini-2.5-flash-lite",
    FLASH: process.env.MODEL_FLASH || "gemini-2.5-flash",
    PRO: process.env.MODEL_PRO || "gemini-2.5-pro",
    EMBEDDING: process.env.MODEL_EMBEDDING || "gemini-embedding-001",
} as const;

export const MODELS = {
    LITE: google(MODEL_IDS.LITE),
    FLASH: google(MODEL_IDS.FLASH),
    PRO: google(MODEL_IDS.PRO),
    EMBEDDING: google.textEmbeddingModel(MODEL_IDS.EMBEDDING),
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

// ──────────────────────────────────────────────────────────────────────────
// Legacy raw GoogleGenAI client (formerly /lib/gemini.ts).
// Used by /api/ideas/analyze. Prefer the `google()` AI SDK adapter above.
// ──────────────────────────────────────────────────────────────────────────
import { GoogleGenAI } from '@google/genai';

const _legacyApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
if (!_legacyApiKey) {
  console.warn('[gemini] Missing GEMINI_API_KEY / GOOGLE_GENERATIVE_AI_API_KEY for legacy `ai` client');
}
export const ai = new GoogleGenAI({ apiKey: _legacyApiKey || '' });

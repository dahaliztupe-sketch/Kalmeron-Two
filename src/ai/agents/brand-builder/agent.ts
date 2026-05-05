import { generateText } from 'ai';
import { MODELS } from '@/src/lib/gemini';
import { instrumentAgent } from '@/src/lib/observability/agent-instrumentation';
import { getCurrentLearnedSkillsAddon } from '@/src/lib/learning/context';
import { BRAND_BUILDER_PROMPT } from './prompt';
import { z } from 'zod';

export const BrandBookSchema = z.object({
  brandName: z.string(),
  tagline: z.string(),
  brandVoice: z.object({
    tone: z.array(z.string()),
    personality: z.string(),
    communicationStyle: z.string(),
  }),
  brandStory: z.string(),
  communicationRules: z.array(z.string()),
  colorSuggestions: z.array(z.object({ name: z.string(), hex: z.string(), usage: z.string() })),
  messagingPillars: z.array(z.string()),
  targetAudience: z.string(),
});

export type BrandBook = z.infer<typeof BrandBookSchema>;

export interface BrandBuilderResult {
  text: string;
  structured?: BrandBook;
}

export async function brandBuilderAction(businessName: string, description: string): Promise<BrandBuilderResult> {
  return instrumentAgent(
    'brand_builder',
    async () => {
      const baseSystem = BRAND_BUILDER_PROMPT;
      const learnedAddon = getCurrentLearnedSkillsAddon();
      const system = learnedAddon ? `${baseSystem}\n\n${learnedAddon}` : baseSystem;

      const prompt = `ساعدني في بناء هوية علامة تجارية قوية لـ "${businessName}": ${description}

بعد التحليل النثري، أضف قسماً بعنوان [BRAND_BOOK_JSON] يحوي JSON بالهيكل التالي (لا تضف أي نص خارج الـ JSON في هذا القسم):
{
  "brandName": "...",
  "tagline": "...",
  "brandVoice": {
    "tone": ["صفة1", "صفة2", "صفة3"],
    "personality": "وصف شخصية العلامة",
    "communicationStyle": "أسلوب التواصل"
  },
  "brandStory": "قصة العلامة في ٣-٤ جمل",
  "communicationRules": ["قاعدة1", "قاعدة2", "قاعدة3"],
  "colorSuggestions": [
    {"name": "اسم اللون", "hex": "#XXXXXX", "usage": "متى تُستخدم"}
  ],
  "messagingPillars": ["ركيزة1", "ركيزة2", "ركيزة3"],
  "targetAudience": "الجمهور المستهدف"
}`;

      const { text } = await generateText({ model: MODELS.PRO, system, prompt });

      let structured: BrandBook | undefined;
      try {
        const jsonMatch = text.match(/\[BRAND_BOOK_JSON\]\s*\n([\s\S]*?)(?:\n\[|$)/);
        if (jsonMatch?.[1]) {
          const cleaned = jsonMatch[1].replace(/^```(?:json)?/im, '').replace(/```$/im, '').trim();
          const parsed = JSON.parse(cleaned);
          const result = BrandBookSchema.safeParse(parsed);
          if (result.success) structured = result.data;
        }
      } catch { /* structured output is optional */ }

      return { text, structured };
    },
    { model: 'gemini-pro', input: { businessName, description }, toolsUsed: ['brand.strategy', 'brand.identity'] }
  );
}

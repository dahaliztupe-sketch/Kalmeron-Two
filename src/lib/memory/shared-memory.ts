// @ts-nocheck
  /**
   * Shared Memory System — التوأم الرقمي (Digital Twin) للشركة
   * Observational Memory: ضغط المحادثات الطويلة واستخراج الحقائق الجوهرية فقط.
   */
  import { generateText } from 'ai';
  import { MODELS } from '@/src/lib/gemini';

  export interface CompanyTwin {
    userId: string;
    companyName?: string;
    stage?: 'idea' | 'validation' | 'foundation' | 'growth' | 'scaling';
    industry?: string;
    facts: string[];          // Observed facts (long-term)
    decisions: string[];      // Past decisions
    currentGoals: string[];
    updatedAt: Date;
  }

  const twins = new Map<string, CompanyTwin>();

  export async function getTwin(userId: string): Promise<CompanyTwin> {
    if (!twins.has(userId)) {
      twins.set(userId, {
        userId, facts: [], decisions: [], currentGoals: [], updatedAt: new Date(),
      });
    }
    return twins.get(userId)!;
  }

  export async function observe(userId: string, conversationText: string): Promise<string[]> {
    if (!conversationText || conversationText.length < 20) return [];
    const { text } = await generateText({
      model: MODELS.LITE,
      system: 'استخرج 1-5 حقائق جوهرية فقط من المحادثة بصيغة قائمة نقطية. لا تكرر، ولا تضف رأيًا.',
      prompt: conversationText.slice(0, 4000),
    });
    return text.split('\n').map(s => s.replace(/^[-*•\s]+/, '').trim()).filter(Boolean).slice(0, 5);
  }

  export async function reflect(userId: string, newFacts: string[]) {
    const twin = await getTwin(userId);
    for (const f of newFacts) {
      if (!twin.facts.includes(f)) twin.facts.push(f);
    }
    if (twin.facts.length > 200) twin.facts = twin.facts.slice(-200);
    twin.updatedAt = new Date();
  }

  export async function updateTwin(userId: string, patch: Partial<CompanyTwin>) {
    const twin = await getTwin(userId);
    Object.assign(twin, patch, { updatedAt: new Date() });
  }
  
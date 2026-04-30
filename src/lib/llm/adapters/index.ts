/**
 * Provider adapter registry — turns a `(providerId, modelId)` pair into a
 * concrete `LanguageModel` from the AI SDK.
 *
 * Each adapter is loaded *lazily* via dynamic `import()` so that a project
 * which only ever uses Gemini doesn't pay the bundle cost of OpenRouter,
 * Groq, Anthropic or OpenAI SDKs.
 */
import type { LanguageModel } from 'ai';
import type { ProviderId } from '../providers';

export async function getModelInstance(
  provider: ProviderId,
  modelId: string,
): Promise<LanguageModel> {
  switch (provider) {
    case 'gemini': {
      const { google } = await import('../../gemini');
      return google(modelId);
    }
    case 'openrouter': {
      const mod = await import('@openrouter/ai-sdk-provider');
      const factory = mod.createOpenRouter({
        apiKey: process.env.OPENROUTER_API_KEY ?? '',
        // OpenRouter recommends headers for analytics + rate-limit fairness.
        headers: {
          'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kalmeron.com',
          'X-Title': 'Kalmeron AI Studio',
        },
      });
      return factory.chat(modelId) as LanguageModel;
    }
    case 'groq': {
      const { createGroq } = await import('@ai-sdk/groq');
      const factory = createGroq({ apiKey: process.env.GROQ_API_KEY ?? '' });
      return factory(modelId);
    }
    case 'anthropic': {
      const { createAnthropic } = await import('@ai-sdk/anthropic');
      const factory = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? '' });
      return factory(modelId);
    }
    case 'openai': {
      const { createOpenAI } = await import('@ai-sdk/openai');
      const factory = createOpenAI({ apiKey: process.env.OPENAI_API_KEY ?? '' });
      return factory(modelId);
    }
  }
}

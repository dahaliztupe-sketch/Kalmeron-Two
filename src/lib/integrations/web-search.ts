// @ts-nocheck
/**
 * Web search with citations.
 * Primary: Gemini with built-in Google Search grounding (free with GEMINI_API_KEY).
 * Fallback: Tavily API if TAVILY_API_KEY is set.
 * Last-resort: simple DuckDuckGo HTML scrape (no key needed) — best-effort.
 */
import { GoogleGenAI } from '@google/genai';

export interface WebSearchResult {
  ok: boolean;
  source: 'gemini_grounded' | 'tavily' | 'duckduckgo' | 'none';
  answer?: string;
  citations: { title?: string; url: string; snippet?: string }[];
  error?: string;
}

export async function webSearch(query: string, opts: { maxResults?: number } = {}): Promise<WebSearchResult> {
  const max = opts.maxResults || 5;

  // 1) Gemini grounded search (preferred — free with the existing API key)
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (geminiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const r = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: query,
        config: {
          tools: [{ googleSearch: {} }],
          systemInstruction:
            'أجب باختصار ودقّة، باللغة العربية، مع الاستناد إلى نتائج البحث. اذكر التواريخ والأرقام كما وردت.',
        },
      });
      const answer =
        (r as { text?: string }).text ||
        (r as { candidates?: { content?: { parts?: { text?: string }[] } }[] })?.candidates?.[0]?.content?.parts
          ?.map((p) => p.text || '')
          .join('\n') ||
        '';
      const grounding =
        (r as { candidates?: { groundingMetadata?: unknown }[] })?.candidates?.[0]?.groundingMetadata || {};
      const chunks =
        (grounding as { groundingChunks?: { web?: { uri?: string; title?: string } }[] }).groundingChunks || [];
      const citations = chunks
        .filter((c) => c?.web?.uri)
        .slice(0, max)
        .map((c) => ({ title: c.web?.title, url: c.web!.uri! }));
      return { ok: true, source: 'gemini_grounded', answer, citations };
    } catch (e: unknown) {
      // fall through
      console.warn('[web-search] gemini grounded failed:', (e as Error)?.message);
    }
  }

  // 2) Tavily fallback
  if (process.env.TAVILY_API_KEY) {
    try {
      const r = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: process.env.TAVILY_API_KEY,
          query,
          max_results: max,
          include_answer: true,
          search_depth: 'basic',
        }),
      });
      const j = await r.json();
      return {
        ok: true,
        source: 'tavily',
        answer: j.answer,
        citations: (j.results || []).slice(0, max).map((it: { title: string; url: string; content?: string }) => ({
          title: it.title,
          url: it.url,
          snippet: it.content,
        })),
      };
    } catch (e: unknown) {
      console.warn('[web-search] tavily failed:', (e as Error)?.message);
    }
  }

  // 3) DuckDuckGo HTML scrape (no key)
  try {
    const r = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 KalmeronBot/1.0' },
    });
    const html = await r.text();
    const matches = [...html.matchAll(/<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/g)];
    const citations = matches.slice(0, max).map((m) => ({
      url: decodeURIComponent(m[1].replace(/^\/\/duckduckgo\.com\/l\/\?uddg=/, '').split('&')[0] || m[1]),
      title: m[2],
    }));
    return { ok: true, source: 'duckduckgo', citations };
  } catch (e: unknown) {
    return { ok: false, source: 'none', citations: [], error: (e as Error)?.message || 'all_search_failed' };
  }
}

export function webSearchConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.TAVILY_API_KEY);
}

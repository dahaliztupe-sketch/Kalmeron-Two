// @ts-nocheck
/**
 * Web search with citations.
 * Primary: Gemini with built-in Google Search grounding (free with GEMINI_API_KEY).
 * Fallback 1: Tavily API if TAVILY_API_KEY is set.
 * Fallback 2: Serper.dev API if SERPER_API_KEY is set.
 * Last-resort: simple DuckDuckGo HTML scrape (no key needed) — best-effort.
 */
import { GoogleGenAI } from '@google/genai';

export interface WebSearchResult {
  ok: boolean;
  source: 'gemini_grounded' | 'tavily' | 'serper' | 'duckduckgo' | 'none';
  answer?: string;
  citations: { title?: string; url: string; snippet?: string }[];
  error?: string;
}

export interface WebSearchOpts {
  maxResults?: number;
  /** Force a specific provider (skip the rest of the chain). */
  provider?: 'gemini' | 'tavily' | 'serper' | 'duckduckgo';
  /** Tavily-only: 'basic' | 'advanced'. */
  searchDepth?: 'basic' | 'advanced';
  /** Restrict to a country (Serper gl / Tavily country). */
  country?: string;
  /** Language hint (Serper hl / Tavily lang). */
  language?: string;
}

export async function webSearch(query: string, opts: WebSearchOpts = {}): Promise<WebSearchResult> {
  const max = opts.maxResults || 5;
  const provider = opts.provider;

  // 1) Gemini grounded search (preferred — free with the existing API key)
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (geminiKey && (!provider || provider === 'gemini')) {
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
      // gemini grounded search failed — trying next provider
    }
  }

  // 2) Tavily fallback
  if (process.env.TAVILY_API_KEY && (!provider || provider === 'tavily')) {
    try {
      const r = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: process.env.TAVILY_API_KEY,
          query,
          max_results: max,
          include_answer: true,
          search_depth: opts.searchDepth || 'basic',
          country: opts.country,
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
      // tavily search failed — trying next provider
    }
  }

  // 3) Serper.dev fallback (Google SERP API)
  if (process.env.SERPER_API_KEY && (!provider || provider === 'serper')) {
    try {
      const r = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
          'X-API-KEY': process.env.SERPER_API_KEY as string,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: query,
          num: max,
          gl: opts.country || 'eg',
          hl: opts.language || 'ar',
        }),
      });
      const j = await r.json();
      const organic = Array.isArray(j.organic) ? j.organic : [];
      const citations = organic.slice(0, max).map((it: { title: string; link: string; snippet?: string }) => ({
        title: it.title,
        url: it.link,
        snippet: it.snippet,
      }));
      return {
        ok: true,
        source: 'serper',
        answer: j.answerBox?.answer || j.answerBox?.snippet,
        citations,
      };
    } catch (e: unknown) {
      // serper search failed — trying next provider
    }
  }

  // 4) DuckDuckGo HTML scrape (no key)
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
  return Boolean(
    process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.TAVILY_API_KEY ||
      process.env.SERPER_API_KEY,
  );
}

/**
 * Run several search queries in parallel and merge their citations,
 * deduplicating by URL. Useful for fan-out searches (e.g. multiple
 * opportunity categories at once).
 */
export async function webSearchMany(
  queries: string[],
  opts: WebSearchOpts = {},
): Promise<WebSearchResult> {
  const results = await Promise.all(queries.map((q) => webSearch(q, opts)));
  const seen = new Set<string>();
  const citations: WebSearchResult['citations'] = [];
  let source: WebSearchResult['source'] = 'none';
  const answers: string[] = [];
  for (const r of results) {
    if (!r.ok) continue;
    if (source === 'none') source = r.source;
    if (r.answer) answers.push(r.answer);
    for (const c of r.citations) {
      if (!c?.url || seen.has(c.url)) continue;
      seen.add(c.url);
      citations.push(c);
    }
  }
  return {
    ok: citations.length > 0 || answers.length > 0,
    source,
    answer: answers.join('\n\n') || undefined,
    citations,
  };
}

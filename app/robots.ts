import type { MetadataRoute } from 'next';

const rawUrl = process.env.NEXT_PUBLIC_APP_URL;
// codeql[js/incomplete-url-substring-sanitization]: this is an environment
// detection heuristic, not a security trust check. We are testing whether
// the configured URL is a local/dev domain so we can substitute the
// production domain — there is no security decision based on this substring.
const siteUrl = (!rawUrl || rawUrl.includes('replit.dev') || rawUrl.includes('localhost'))
  ? 'https://kalmeron.app'
  : rawUrl;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/profile/', '/onboarding/'],
      },
      // Allow crawlers explicitly access OG endpoint for richer previews.
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'Google-Extended', 'CCBot', 'PerplexityBot'],
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}

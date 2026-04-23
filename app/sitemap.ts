import type { MetadataRoute } from 'next';
import { getAllUseCaseSlugs } from '@/src/lib/seo/use-cases';
import { getAllComparisonSlugs } from '@/src/lib/seo/comparisons';
import { getAllIndustrySlugs } from '@/src/lib/seo/industries';
import { getAllExpertSlugs } from '@/src/lib/seo/experts';
import { BLOG_POSTS } from '@/src/lib/seo/blog-posts';
import { getAllTemplateSlugs } from '@/src/lib/seo/templates';
import { getAllGlossarySlugs } from '@/src/lib/seo/glossary';
import { getAllCitySlugs } from '@/src/lib/seo/cities';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kalmeron.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${siteUrl}/pricing`, lastModified: now, changeFrequency: 'weekly', priority: 0.95 },
    { url: `${siteUrl}/use-cases`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/industries`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/compare`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/ai-experts`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/blog`, lastModified: now, changeFrequency: 'daily', priority: 0.85 },
    { url: `${siteUrl}/templates`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/glossary`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${siteUrl}/cities`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${siteUrl}/founder-mode`, lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${siteUrl}/market-pulse`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${siteUrl}/investor-deck`, lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${siteUrl}/founder-network`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${siteUrl}/api-docs`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/mcp-server`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/workflows`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/chat`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/ideas/analyze`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/plan`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/opportunities`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${siteUrl}/mistake-shield`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${siteUrl}/marketplace`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${siteUrl}/legal-templates`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${siteUrl}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${siteUrl}/auth/signup`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/auth/login`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ];

  const useCasePages: MetadataRoute.Sitemap = getAllUseCaseSlugs().map((slug) => ({
    url: `${siteUrl}/use-cases/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.85,
  }));

  const comparisonPages: MetadataRoute.Sitemap = getAllComparisonSlugs().map((slug) => ({
    url: `${siteUrl}/compare/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.85,
  }));

  const industryPages: MetadataRoute.Sitemap = getAllIndustrySlugs().map((slug) => ({
    url: `${siteUrl}/industries/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.85,
  }));

  const expertPages: MetadataRoute.Sitemap = getAllExpertSlugs().map((slug) => ({
    url: `${siteUrl}/ai-experts/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const blogPages: MetadataRoute.Sitemap = BLOG_POSTS.map((p) => ({
    url: `${siteUrl}/blog/${p.slug}`,
    lastModified: new Date(p.publishedAt),
    changeFrequency: 'monthly',
    priority: 0.75,
  }));

  const templatePages: MetadataRoute.Sitemap = getAllTemplateSlugs().map((slug) => ({
    url: `${siteUrl}/templates/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const glossaryPages: MetadataRoute.Sitemap = getAllGlossarySlugs().map((slug) => ({
    url: `${siteUrl}/glossary/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const cityPages: MetadataRoute.Sitemap = getAllCitySlugs().map((slug) => ({
    url: `${siteUrl}/cities/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [
    ...staticPages,
    ...useCasePages,
    ...comparisonPages,
    ...industryPages,
    ...expertPages,
    ...blogPages,
    ...templatePages,
    ...glossaryPages,
    ...cityPages,
  ];
}

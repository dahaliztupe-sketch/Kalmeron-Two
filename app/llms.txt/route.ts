/**
 * /llms.txt — emerging convention for letting AI systems (ChatGPT, Claude,
 * Perplexity, etc.) discover the structure of your site. This is the
 * AI-native equivalent of robots.txt + sitemap.
 *
 * Spec reference: https://llmstxt.org
 */

import { EXPERTS } from '@/src/lib/seo/experts';
import { USE_CASES } from '@/src/lib/seo/use-cases';
import { COMPARISONS } from '@/src/lib/seo/comparisons';
import { INDUSTRIES } from '@/src/lib/seo/industries';
import { BLOG_POSTS } from '@/src/lib/seo/blog-posts';

export const dynamic = 'force-static';
export const revalidate = 3600;

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kalmeron.app';

  const lines: string[] = [];
  lines.push('# Kalmeron AI');
  lines.push('');
  lines.push('> مقرّ عمليات ذكي لرواد الأعمال في المنطقة العربية، يضم 16 مساعداً متخصصاً عبر 7 أقسام يعملون كفريق التأسيس الخاص بك.');
  lines.push('');
  lines.push(
    'Kalmeron AI is an Arabic-first AI studio for entrepreneurs in MENA. It bundles 16 specialized assistants across 7 departments (CFO, legal advisor, marketing manager, opportunity radar, mistake shield, etc.) trained on the Egyptian and Gulf markets.'
  );
  lines.push('');
  lines.push('## Core pages');
  lines.push(`- [Home](${siteUrl}/): platform overview, value proposition, CTAs.`);
  lines.push(`- [Pricing](${siteUrl}/pricing): plans (Free / Pro / Founder / Enterprise), monthly + annual.`);
  lines.push(`- [Use cases](${siteUrl}/use-cases): 10+ deep guides covering entrepreneur journeys.`);
  lines.push(`- [Industries](${siteUrl}/industries): 8 verticals with market data and case studies.`);
  lines.push(`- [Compare](${siteUrl}/compare): head-to-head with ChatGPT, Claude, Manus, Lovable, Copilot.`);
  lines.push(`- [Blog](${siteUrl}/blog): thought leadership for Arab founders.`);
  lines.push(`- [Experts](${siteUrl}/ai-experts): directory of all specialized AI agents.`);
  lines.push('');

  lines.push('## Experts (specialized AI agents)');
  for (const e of EXPERTS) {
    lines.push(`- [${e.nameAr} — ${e.roleAr}](${siteUrl}/ai-experts/${e.slug}): ${e.metaDescriptionAr}`);
  }
  lines.push('');

  lines.push('## Use cases');
  for (const u of USE_CASES) {
    lines.push(`- [${u.titleAr}](${siteUrl}/use-cases/${u.slug}): ${u.metaDescriptionAr}`);
  }
  lines.push('');

  lines.push('## Industries served');
  for (const i of INDUSTRIES) {
    lines.push(`- [${i.nameAr}](${siteUrl}/industries/${i.slug}): ${i.metaDescriptionAr}`);
  }
  lines.push('');

  lines.push('## Competitor comparisons');
  for (const c of COMPARISONS) {
    lines.push(`- [Kalmeron vs ${c.competitorName}](${siteUrl}/compare/${c.slug}): ${c.metaDescriptionAr}`);
  }
  lines.push('');

  lines.push('## Recent articles');
  for (const p of BLOG_POSTS) {
    lines.push(`- [${p.titleAr}](${siteUrl}/blog/${p.slug}): ${p.excerptAr}`);
  }
  lines.push('');

  lines.push('## Optional');
  lines.push(`- [Sitemap](${siteUrl}/sitemap.xml)`);
  lines.push(`- [Robots](${siteUrl}/robots.txt)`);

  return new Response(lines.join('\n'), {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}

import { execSync } from 'child_process';
import type { AuditFinding } from '../types';
import { config } from '../config';

function safeFetch(url: string, opts: { extra?: string } = {}): { status: string; body: string } {
  try {
    const status = execSync(
      `curl -s -o /dev/null -w "%{http_code}" "${url}" --max-time 8 ${opts.extra ?? ''}`,
      { encoding: 'utf8', timeout: 12_000, stdio: ['pipe', 'pipe', 'pipe'] }
    ).trim();
    let body = '';
    if (status === '200') {
      body = execSync(`curl -s "${url}" --max-time 8 ${opts.extra ?? ''}`, {
        encoding: 'utf8',
        timeout: 12_000,
        stdio: ['pipe', 'pipe', 'pipe'],
      });
    }
    return { status, body };
  } catch {
    return { status: '000', body: '' };
  }
}

export async function auditSEO(): Promise<AuditFinding[]> {
  const findings: AuditFinding[] = [];
  const BASE_URL = config.baseUrl;

  // ── sitemap.xml ──
  const sitemap = safeFetch(`${BASE_URL}/sitemap.xml`);
  if (sitemap.status !== '200') {
    findings.push({
      id: 'SEO-001',
      category: 'seo',
      severity: 'high',
      title: 'sitemap.xml غير موجود أو لا يعمل',
      description: `Google لا تستطيع اكتشاف صفحاتك بشكل كامل (status: ${sitemap.status})`,
      fix: 'أضف app/sitemap.ts لتوليد sitemap تلقائياً',
      autoFixable: false,
      references: ['https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview'],
    });
  }

  // ── robots.txt ──
  const robots = safeFetch(`${BASE_URL}/robots.txt`);
  if (robots.status !== '200') {
    findings.push({
      id: 'SEO-002',
      category: 'seo',
      severity: 'medium',
      title: 'robots.txt غير موجود',
      description: 'Google تُفضّل robots.txt لفهم ما يُسمح بفهرسته',
      fix: 'أنشئ public/robots.txt أو app/robots.ts',
      autoFixable: false,
    });
  } else if (!robots.body.includes('Sitemap:')) {
    findings.push({
      id: 'SEO-003',
      category: 'seo',
      severity: 'low',
      title: 'robots.txt لا يشير لـ sitemap.xml',
      description: 'أضف Sitemap URL في robots.txt لتسريع الفهرسة',
      fix: 'أضف: Sitemap: https://kalmeron.ai/sitemap.xml',
      autoFixable: false,
    });
  }

  // ── Open Graph + Twitter + hreflang ──
  const home = safeFetch(`${BASE_URL}/`);
  if (home.status === '200') {
    const ogChecks = [
      { tag: 'og:title', id: 'SEO-OG-TITLE', sev: 'medium' as const },
      { tag: 'og:description', id: 'SEO-OG-DESC', sev: 'medium' as const },
      { tag: 'og:image', id: 'SEO-OG-IMAGE', sev: 'high' as const },
      { tag: 'og:url', id: 'SEO-OG-URL', sev: 'medium' as const },
      { tag: 'og:locale', id: 'SEO-OG-LOCALE', sev: 'medium' as const },
    ];

    for (const check of ogChecks) {
      if (!home.body.includes(check.tag)) {
        findings.push({
          id: check.id,
          category: 'seo',
          severity: check.sev,
          title: `Open Graph tag مفقود: ${check.tag}`,
          description: `بدون ${check.tag}: مشاركة الروابط على سوشيال ميديا تبدو فقيرة`,
          location: 'app/layout.tsx أو app/page.tsx',
          fix: `أضف ${check.tag} في metadata object`,
          autoFixable: false,
          references: ['https://ogp.me/'],
        });
      }
    }

    if (!home.body.includes('twitter:card')) {
      findings.push({
        id: 'SEO-TWITTER',
        category: 'seo',
        severity: 'low',
        title: 'Twitter Card tags مفقودة',
        description: 'بدون Twitter Card: التغريدات التي تشاركها تبدو عادية',
        fix: "أضف: twitter: { card: 'summary_large_image' } في metadata",
        autoFixable: false,
      });
    }

    if (!home.body.includes('hreflang')) {
      findings.push({
        id: 'SEO-HREFLANG',
        category: 'seo',
        severity: 'medium',
        title: 'hreflang مفقود (ar / en)',
        description: 'بدون hreflang: Google لا تعرف أي نسخة للزائر العربي أم الإنجليزي',
        fix: 'أضف alternates.languages في metadata: { ar: /, en: /en }',
        autoFixable: false,
        references: ['https://developers.google.com/search/docs/specialty/international/localization'],
      });
    }

    // ── Schema.org JSON-LD ──
    // We are scanning the rendered HTML body of *our own* homepage looking for
    // the literal substring `schema.org` inside a `<script type="application/ld+json">`
    // block. This is NOT a URL allow-list / origin check — `home.body` is HTML,
    // not a URL — so CodeQL's `js/incomplete-url-substring-sanitization`
    // heuristic does not apply here.
    // codeql[js/incomplete-url-substring-sanitization]: substring scan over our
    //   own rendered HTML, not a host-trust check.
    if (!home.body.includes('application/ld+json') && !home.body.includes('schema.org')) {
      findings.push({
        id: 'SEO-SCHEMA',
        category: 'seo',
        severity: 'medium',
        title: 'Schema.org Structured Data مفقود',
        description: 'بدون Schema: لا rich snippets في Google + ضعف AI SEO',
        fix: 'أضف <script type="application/ld+json"> مع SoftwareApplication schema في app/layout.tsx',
        autoFixable: false,
        references: ['https://schema.org/SoftwareApplication'],
      });
    }
  }

  return findings;
}

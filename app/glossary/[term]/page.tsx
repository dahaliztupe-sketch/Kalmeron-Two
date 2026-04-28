import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  GLOSSARY,
  getGlossaryTermBySlug,
  getAllGlossarySlugs,
} from "@/src/lib/seo/glossary";
import { SeoLandingShell } from "@/components/seo/SeoLandingShell";
import { definedTermSchema, breadcrumbSchema } from "@/src/lib/seo/schema";
import { safeJsonLd } from "@/src/lib/security/safe-json-ld";

interface PageProps {
  params: Promise<{ term: string }>;
}

export async function generateStaticParams() {
  return getAllGlossarySlugs().map((term) => ({ term }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { term } = await params;
  const t = getGlossaryTermBySlug(term);
  if (!t) return { title: "مصطلح غير موجود" };
  return {
    title: `${t.termAr} (${t.termEn}) | قاموس كلميرون`,
    description: t.shortDefinitionAr,
    keywords: t.keywords,
    alternates: { canonical: `/glossary/${term}` },
  };
}

export default async function GlossaryTermPage({ params }: PageProps) {
  const { term } = await params;
  const t = getGlossaryTermBySlug(term);
  if (!t) notFound();

  const related = (t.relatedTerms || [])
    .map((slug) => GLOSSARY.find((g) => g.slug === slug))
    .filter(Boolean) as typeof GLOSSARY;

  const jsonLd = [
    definedTermSchema({
      name: t.termAr,
      description: t.fullDefinitionAr,
      url: `https://kalmeron.com/glossary/${term}`,
    }),
    breadcrumbSchema([
      { name: "الرئيسية", url: "https://kalmeron.com/" },
      { name: "القاموس", url: "https://kalmeron.com/glossary" },
      { name: t.termAr, url: `https://kalmeron.com/glossary/${term}` },
    ]),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        // nosemgrep: typescript.react.security.audit.react-dangerouslysetinnerhtml.react-dangerouslysetinnerhtml -- safeJsonLd escapes </script and HTML entities; required for SEO JSON-LD per schema.org guidelines
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
      <SeoLandingShell
        eyebrow={t.termEn}
        title={t.termAr}
        description={t.shortDefinitionAr}
        breadcrumbs={[
          { label: "القاموس", href: "/glossary" },
          { label: t.termAr },
        ]}
      >
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">التعريف الكامل</h2>
          <p className="text-lg text-zinc-300 leading-relaxed">{t.fullDefinitionAr}</p>
        </section>

        {t.examples && t.examples.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">أمثلة</h2>
            <ul className="space-y-3">
              {t.examples.map((e, i) => (
                <li
                  key={i}
                  className="text-zinc-300 rounded-xl bg-white/[0.03] border border-white/10 p-4"
                >
                  {e}
                </li>
              ))}
            </ul>
          </section>
        )}

        {related.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">مصطلحات ذات صلة</h2>
            <div className="grid md:grid-cols-3 gap-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/glossary/${r.slug}`}
                  className="rounded-xl bg-white/[0.03] border border-white/10 p-4 hover:border-cyan-500/30 transition"
                >
                  <div className="text-sm font-semibold text-white mb-1">{r.termAr}</div>
                  <div className="text-xs text-zinc-400 line-clamp-2">{r.shortDefinitionAr}</div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="rounded-2xl bg-gradient-to-br from-cyan-500/10 to-indigo-600/10 border border-cyan-500/20 p-6 text-center">
          <p className="text-zinc-300 mb-4">
            مهتم تطبق <strong className="text-white">{t.termAr}</strong> في شركتك؟
          </p>
          <Link
            href="/auth/signup"
            className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-medium hover:opacity-90"
          >
            ابدأ مجاناً مع كلميرون
          </Link>
        </div>
      </SeoLandingShell>
    </>
  );
}

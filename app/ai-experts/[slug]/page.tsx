import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getExpertBySlug, getAllExpertSlugs, EXPERTS } from "@/src/lib/seo/experts";
import { getUseCaseBySlug } from "@/src/lib/seo/use-cases";
import { SeoLandingShell, FeatureCheck } from "@/components/seo/SeoLandingShell";
import { MessageSquare, Sparkles } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllExpertSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const e = getExpertBySlug(slug);
  if (!e) return { title: "Expert not found" };

  return {
    title: `${e.nameAr} | خبير كلميرون`,
    description: e.metaDescriptionAr,
    keywords: e.keywords,
    alternates: { canonical: `/ai-experts/${slug}` },
    openGraph: {
      title: `${e.nameAr} ${e.emoji} | كلميرون`,
      description: e.metaDescriptionAr,
      type: "profile",
      images: [{ url: `/api/og?title=${encodeURIComponent(e.nameAr)}&type=use-case` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${e.nameAr} | كلميرون`,
      description: e.metaDescriptionAr,
      images: [`/api/og?title=${encodeURIComponent(e.nameAr)}&type=use-case`],
    },
  };
}

export default async function ExpertPage({ params }: PageProps) {
  const { slug } = await params;
  const expert = getExpertBySlug(slug);
  if (!expert) notFound();

  const relatedExperts = expert.relatedExpertSlugs
    .map((s) => EXPERTS.find((e) => e.slug === s))
    .filter((e): e is NonNullable<typeof e> => Boolean(e));

  const relatedUseCases = expert.relatedUseCaseSlugs
    .map((s) => getUseCaseBySlug(s))
    .filter((u): u is NonNullable<typeof u> => Boolean(u));

  // JSON-LD: SoftwareApplication / Service
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": expert.nameAr,
    "description": expert.metaDescriptionAr,
    "provider": { "@type": "Organization", "name": "Kalmeron AI" },
    "serviceType": expert.roleAr,
    "areaServed": ["EG", "SA", "AE", "MENA"],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SeoLandingShell
        eyebrow={`${expert.emoji} ${expert.roleAr}`}
        title={expert.nameAr}
        description={expert.taglineAr}
        breadcrumbs={[
          { label: "الخبراء", href: "/ai-experts" },
          { label: expert.nameAr },
        ]}
        ctaLabel={`جرب ${expert.nameAr} مجاناً`}
        ctaHref="/auth/signup"
      >
        {/* What it does */}
        <section className="mb-16">
          <div className="rounded-3xl bg-gradient-to-br from-cyan-500/8 to-indigo-500/8 border border-cyan-500/20 p-8">
            <h2 className="text-2xl font-bold text-white mb-4 inline-flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-cyan-400" />
              ماذا يفعل
            </h2>
            <p className="text-lg text-zinc-200 leading-relaxed">{expert.whatItDoesAr}</p>
          </div>
        </section>

        {/* Capabilities */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8">القدرات</h2>
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-6">
            <ul className="grid md:grid-cols-2 gap-3">
              {expert.capabilities.map((c, i) => (
                <FeatureCheck key={i}>{c}</FeatureCheck>
              ))}
            </ul>
          </div>
        </section>

        {/* Example questions */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 inline-flex items-center gap-2">
            <MessageSquare className="w-7 h-7 text-cyan-400" />
            أسئلة يجاوبك عليها
          </h2>
          <div className="space-y-3">
            {expert.exampleQuestions.map((q, i) => (
              <div
                key={i}
                className="rounded-xl bg-white/[0.03] border border-white/10 p-4 text-zinc-200 hover:bg-white/[0.05] transition"
              >
                <span className="text-cyan-400 ml-2">«</span>
                {q}
                <span className="text-cyan-400 mr-2">»</span>
              </div>
            ))}
          </div>
        </section>

        {/* Best for */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8">الأفضل لـ</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {expert.bestForAr.map((b, i) => (
              <div
                key={i}
                className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-4 text-emerald-200"
              >
                {b}
              </div>
            ))}
          </div>
        </section>

        {/* Related experts */}
        {relatedExperts.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-8">خبراء يعملون معاً</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {relatedExperts.map((r) => (
                <Link
                  key={r.slug}
                  href={`/ai-experts/${r.slug}`}
                  className="rounded-xl bg-white/[0.03] border border-white/10 p-5 hover:border-cyan-500/30 transition"
                >
                  <div className="text-2xl mb-2">{r.emoji}</div>
                  <h3 className="text-lg font-semibold text-white mb-1">{r.nameAr}</h3>
                  <p className="text-xs text-zinc-500">{r.roleAr}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Related use cases */}
        {relatedUseCases.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold text-white mb-8">حالات استخدام يخدمها</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {relatedUseCases.map((uc) => (
                <Link
                  key={uc.slug}
                  href={`/use-cases/${uc.slug}`}
                  className="rounded-xl bg-white/[0.03] border border-white/10 p-5 hover:border-cyan-500/30 transition"
                >
                  <h3 className="text-lg font-semibold text-white mb-2">{uc.titleAr}</h3>
                  <p className="text-sm text-zinc-500 line-clamp-2">{uc.metaDescriptionAr}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </SeoLandingShell>
    </>
  );
}

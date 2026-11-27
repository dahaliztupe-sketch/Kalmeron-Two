import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getIndustryBySlug, getAllIndustrySlugs } from "@/src/lib/seo/industries";
import { getUseCaseBySlug } from "@/src/lib/seo/use-cases";
import { SeoLandingShell } from "@/components/seo/SeoLandingShell";
import { TrendingUp, Target, AlertTriangle } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllIndustrySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const ind = getIndustryBySlug(slug);
  if (!ind) return { title: "Industry not found" };

  return {
    title: `${ind.nameAr} | حلول كلميرون`,
    description: ind.metaDescriptionAr,
    keywords: ind.keywords,
    alternates: { canonical: `/industries/${slug}` },
    openGraph: {
      title: `${ind.nameAr} | كلميرون`,
      description: ind.metaDescriptionAr,
      type: "article",
      images: [{ url: `/api/og?title=${encodeURIComponent(ind.nameAr)}&type=industry` }],
    },
  };
}

export default async function IndustryPage({ params }: PageProps) {
  const { slug } = await params;
  const ind = getIndustryBySlug(slug);
  if (!ind) notFound();

  const relatedUseCases = ind.relatedUseCaseSlugs
    .map((s) => getUseCaseBySlug(s))
    .filter((u): u is NonNullable<typeof u> => Boolean(u));

  return (
    <SeoLandingShell
      eyebrow={`صناعة · ${ind.nameAr}`}
      title={ind.nameAr}
      description={ind.heroIntroAr}
      breadcrumbs={[
        { label: "الصناعات", href: "/industries" },
        { label: ind.nameAr },
      ]}
    >
      {/* Market size, growth rate and case studies were removed: they were unsourced and not backed by real customers. */}

      {/* Challenges & Opportunities */}
      <section className="grid md:grid-cols-2 gap-6 mb-16">
        <div className="rounded-2xl bg-rose-500/5 border border-rose-500/20 p-6">
          <h2 className="text-xl font-bold text-white mb-4 inline-flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            التحديات
          </h2>
          <ul className="space-y-2">
            {ind.challenges.map((ch, i) => (
              <li key={i} className="flex gap-2 text-zinc-300">
                <span className="text-rose-400">·</span>
                {ch}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl bg-emerald-500/5 border border-emerald-500/20 p-6">
          <h2 className="text-xl font-bold text-white mb-4 inline-flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-400" />
            الفرص
          </h2>
          <ul className="space-y-2">
            {ind.opportunities.map((op, i) => (
              <li key={i} className="flex gap-2 text-zinc-300">
                <span className="text-emerald-400">·</span>
                {op}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Top agents for this industry */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-white mb-8">المساعدين المتخصصون</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {ind.topAgents.map((agent) => (
            <div key={agent} className="rounded-xl bg-white/[0.03] border border-white/10 p-4 text-zinc-200">
              {agent.replace(/_/g, " ")}
            </div>
          ))}
        </div>
      </section>

      {/* Related use cases */}
      {relatedUseCases.length > 0 && (
        <section>
          <h2 className="text-3xl font-bold text-white mb-8">حالات استخدام ذات صلة</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {relatedUseCases.map((uc) => (
              <Link
                key={uc.slug}
                href={`/use-cases/${uc.slug}`}
                className="rounded-xl bg-white/[0.03] border border-white/10 p-5 hover:border-cyan-500/30 transition"
              >
                <h3 className="text-lg font-semibold text-white mb-2">{uc.titleAr}</h3>
                <p className="text-sm text-zinc-400 line-clamp-2">{uc.metaDescriptionAr}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </SeoLandingShell>
  );
}

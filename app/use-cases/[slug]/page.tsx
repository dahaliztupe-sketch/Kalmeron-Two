import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getUseCaseBySlug, getAllUseCaseSlugs, USE_CASES } from "@/src/lib/seo/use-cases";
import { SeoLandingShell, FeatureCheck } from "@/components/seo/SeoLandingShell";
import { Clock, Award, Users, Zap } from "lucide-react";
import { safeJsonLd } from "@/src/lib/security/safe-json-ld";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllUseCaseSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const uc = getUseCaseBySlug(slug);
  if (!uc) return { title: "Use case not found" };

  return {
    title: uc.titleAr,
    description: uc.metaDescriptionAr,
    keywords: uc.relatedKeywords,
    alternates: {
      canonical: `/use-cases/${slug}`,
      languages: { ar: `/use-cases/${slug}`, en: `/en/use-cases/${slug}` },
    },
    openGraph: {
      title: uc.titleAr,
      description: uc.metaDescriptionAr,
      type: "article",
      images: [{ url: `/api/og?title=${encodeURIComponent(uc.titleAr)}&type=use-case` }],
    },
    twitter: {
      card: "summary_large_image",
      title: uc.titleAr,
      description: uc.metaDescriptionAr,
      images: [`/api/og?title=${encodeURIComponent(uc.titleAr)}&type=use-case`],
    },
  };
}

const DIFFICULTY_AR: Record<string, string> = {
  beginner: "مبتدئ",
  intermediate: "متوسط",
  advanced: "متقدم",
};

export default async function UseCasePage({ params }: PageProps) {
  const { slug } = await params;
  const uc = getUseCaseBySlug(slug);
  if (!uc) notFound();

  const related = USE_CASES.filter(
    (u) => u.slug !== slug && (u.industry === uc.industry || u.difficulty === uc.difficulty)
  ).slice(0, 3);

  // JSON-LD HowTo schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": uc.titleAr,
    "description": uc.metaDescriptionAr,
    "totalTime": `PT${uc.estimatedTimeMinutes}M`,
    "step": uc.steps.map((s, i) => ({
      "@type": "HowToStep",
      "position": i + 1,
      "name": s.title,
      "text": s.description,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
      <SeoLandingShell
        eyebrow={`دليل تفصيلي · ${DIFFICULTY_AR[uc.difficulty]}`}
        title={uc.titleAr}
        description={uc.heroIntroAr}
        breadcrumbs={[
          { label: "حالات الاستخدام", href: "/use-cases" },
          { label: uc.titleAr },
        ]}
      >
        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
            <Clock className="w-5 h-5 text-cyan-400 mb-2" />
            <div className="text-xs text-zinc-500">المدة</div>
            <div className="text-lg font-semibold text-white">{uc.estimatedTimeMinutes} دقيقة</div>
          </div>
          <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
            <Users className="w-5 h-5 text-indigo-400 mb-2" />
            <div className="text-xs text-zinc-500">المساعدين</div>
            <div className="text-lg font-semibold text-white">{uc.primaryAgents.length}</div>
          </div>
          <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
            <Award className="w-5 h-5 text-amber-400 mb-2" />
            <div className="text-xs text-zinc-500">المستوى</div>
            <div className="text-lg font-semibold text-white">{DIFFICULTY_AR[uc.difficulty]}</div>
          </div>
          <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
            <Zap className="w-5 h-5 text-emerald-400 mb-2" />
            <div className="text-xs text-zinc-500">المخرجات</div>
            <div className="text-lg font-semibold text-white">{uc.outcomes.length}</div>
          </div>
        </div>

        {/* Steps */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8">الخطوات التفصيلية</h2>
          <div className="space-y-4">
            {uc.steps.map((step, i) => (
              <div key={i} className="flex gap-4 rounded-xl bg-white/[0.03] border border-white/10 p-5">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                  {i + 1}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">{step.title}</h3>
                  <p className="text-zinc-400 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Outcomes */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8">ما الذي ستحصل عليه</h2>
          <div className="rounded-2xl bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 border border-emerald-500/20 p-6">
            <ul className="space-y-3">
              {uc.outcomes.map((o, i) => (
                <FeatureCheck key={i}>{o}</FeatureCheck>
              ))}
            </ul>
          </div>
        </section>

        {/* Agents involved */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8">المساعدين المشاركون</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {uc.primaryAgents.map((agent) => (
              <div key={agent} className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/10 p-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-cyan-300" />
                </div>
                <span className="text-zinc-200 font-medium">{agent.replace(/_/g, " ")}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Related use cases */}
        {related.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold text-white mb-8">حالات استخدام مشابهة</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/use-cases/${r.slug}`}
                  className="rounded-xl bg-white/[0.03] border border-white/10 p-5 hover:border-cyan-500/30 transition"
                >
                  <h3 className="text-lg font-semibold text-white mb-2">{r.titleAr}</h3>
                  <p className="text-sm text-zinc-500 line-clamp-2">{r.metaDescriptionAr}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </SeoLandingShell>
    </>
  );
}

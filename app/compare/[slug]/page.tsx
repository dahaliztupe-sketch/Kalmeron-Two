import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getComparisonBySlug, getAllComparisonSlugs } from "@/src/lib/seo/comparisons";
import { SeoLandingShell } from "@/components/seo/SeoLandingShell";
import { Check, X, Minus } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllComparisonSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const c = getComparisonBySlug(slug);
  if (!c) return { title: "Comparison not found" };

  const title = `كلميرون vs ${c.competitorName} — مقارنة تفصيلية`;
  return {
    title,
    description: c.metaDescriptionAr,
    alternates: { canonical: `/compare/${slug}` },
    openGraph: {
      title,
      description: c.metaDescriptionAr,
      type: "article",
      images: [{ url: `/api/og?title=${encodeURIComponent(title)}&type=compare` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: c.metaDescriptionAr,
      images: [`/api/og?title=${encodeURIComponent(title)}&type=compare`],
    },
  };
}

function VerdictCell({ value }: { value: string }) {
  if (value === "yes") return <Check className="w-5 h-5 text-emerald-400 mx-auto" />;
  if (value === "no") return <X className="w-5 h-5 text-rose-400 mx-auto" />;
  if (value === "partial") return <Minus className="w-5 h-5 text-amber-400 mx-auto" />;
  return <span className="text-sm text-zinc-300 text-center block">{value}</span>;
}

export default async function ComparePage({ params }: PageProps) {
  const { slug } = await params;
  const c = getComparisonBySlug(slug);
  if (!c) notFound();

  return (
    <SeoLandingShell
      eyebrow="مقارنة تفصيلية"
      title={`كلميرون vs ${c.competitorName}`}
      description={c.heroIntroAr}
      breadcrumbs={[
        { label: "المقارنات", href: "/compare" },
        { label: c.competitorName },
      ]}
    >
      {/* Best for sections */}
      <div className="grid md:grid-cols-2 gap-6 mb-16">
        <div className="rounded-2xl bg-gradient-to-br from-cyan-500/10 to-indigo-500/10 border border-cyan-500/20 p-6">
          <h2 className="text-xl font-bold text-white mb-4">كلميرون أفضل لـ</h2>
          <ul className="space-y-2">
            {c.bestForKalmeron.map((b, i) => (
              <li key={i} className="flex gap-2 text-zinc-200">
                <Check className="w-5 h-5 text-cyan-300 flex-shrink-0 mt-0.5" />
                {b}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-6">
          <h2 className="text-xl font-bold text-white mb-4">{c.competitorName} أفضل لـ</h2>
          <ul className="space-y-2">
            {c.bestForCompetitor.map((b, i) => (
              <li key={i} className="flex gap-2 text-zinc-300">
                <Check className="w-5 h-5 text-zinc-400 flex-shrink-0 mt-0.5" />
                {b}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <section className="mb-16 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <p className="text-zinc-300 leading-relaxed">
          أزلنا جدول الميزات والأسعار وحكم المقارنة لأنها لم تكن موثقة بمصادر حديثة ولا مختبَرة. تتغير ميزات المنافسين وأسعارهم، فراجع موقع {c.competitorName} مباشرة. القوائم أعلاه آراء عامة وليست نتائج اختبار.
        </p>
      </section>
    </SeoLandingShell>
  );
}

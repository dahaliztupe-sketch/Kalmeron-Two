import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
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
                <Check className="w-5 h-5 text-zinc-500 flex-shrink-0 mt-0.5" />
                {b}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Feature matrix */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-white mb-8">مصفوفة الميزات</h2>
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead className="bg-white/[0.03]">
              <tr className="text-zinc-400 text-sm">
                <th className="text-right p-4">الميزة</th>
                <th className="p-4">كلميرون</th>
                <th className="p-4">{c.competitorName}</th>
              </tr>
            </thead>
            <tbody>
              {c.featureMatrix.map((f, i) => (
                <tr key={i} className="border-t border-white/5 hover:bg-white/[0.02]">
                  <td className="text-right p-4 text-zinc-200">{f.feature}</td>
                  <td className="p-4"><VerdictCell value={f.kalmeron} /></td>
                  <td className="p-4"><VerdictCell value={f.competitor} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Pricing */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-white mb-8">مقارنة الأسعار</h2>
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead className="bg-white/[0.03]">
              <tr className="text-zinc-400 text-sm">
                <th className="text-right p-4">الخطة</th>
                <th className="text-right p-4">كلميرون</th>
                <th className="text-right p-4">{c.competitorName}</th>
              </tr>
            </thead>
            <tbody>
              {c.pricingComparison.map((p, i) => (
                <tr key={i} className="border-t border-white/5">
                  <td className="text-right p-4 text-zinc-200 font-medium">{p.plan}</td>
                  <td className="text-right p-4 text-cyan-300">{p.kalmeron}</td>
                  <td className="text-right p-4 text-zinc-400">{p.competitor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Verdict */}
      <section className="mb-16">
        <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-8">
          <h2 className="text-2xl font-bold text-white mb-4">حُكمنا الصادق</h2>
          <p className="text-lg text-zinc-200 leading-relaxed">{c.verdictAr}</p>
        </div>
      </section>
    </SeoLandingShell>
  );
}

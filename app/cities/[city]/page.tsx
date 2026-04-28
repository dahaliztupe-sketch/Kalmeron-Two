import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  CITIES,
  getCityBySlug,
  getAllCitySlugs,
} from "@/src/lib/seo/cities";
import { SeoLandingShell } from "@/components/seo/SeoLandingShell";
import { localBusinessSchema, breadcrumbSchema } from "@/src/lib/seo/schema";
import {TrendingUp, Building2, Trophy } from "lucide-react";
import { safeJsonLd } from "@/src/lib/security/safe-json-ld";

interface PageProps {
  params: Promise<{ city: string }>;
}

export async function generateStaticParams() {
  return getAllCitySlugs().map((city) => ({ city }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city } = await params;
  const c = getCityBySlug(city);
  if (!c) return { title: "مدينة غير موجودة" };
  return {
    title: `ستارت أبس ${c.cityAr} | دليل ${c.countryAr} | كلميرون`,
    description: c.metaDescriptionAr,
    keywords: c.keywords,
    alternates: { canonical: `/cities/${city}` },
    openGraph: {
      title: `ستارت أبس ${c.cityAr}`,
      description: c.metaDescriptionAr,
      images: [{ url: `/api/og?title=${encodeURIComponent(c.cityAr)}&type=city` }],
    },
  };
}

export default async function CityPage({ params }: PageProps) {
  const { city } = await params;
  const c = getCityBySlug(city);
  if (!c) notFound();

  const others = CITIES.filter((x) => x.slug !== city).slice(0, 6);

  const jsonLd = [
    localBusinessSchema({
      name: `كلميرون ${c.cityAr}`,
      city: c.cityEn,
      country: c.countryEn,
      description: c.metaDescriptionAr,
    }),
    breadcrumbSchema([
      { name: "الرئيسية", url: "https://kalmeron.com/" },
      { name: "المدن", url: "https://kalmeron.com/cities" },
      { name: c.cityAr, url: `https://kalmeron.com/cities/${city}` },
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
        eyebrow={`📍 ${c.countryAr}`}
        title={`ستارت أبس ${c.cityAr}`}
        description={c.heroIntroAr}
        breadcrumbs={[
          { label: "المدن", href: "/cities" },
          { label: c.cityAr },
        ]}
      >
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-cyan-400" /> الـ Ecosystem
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            {c.ecosystemFactsAr.map((f, i) => (
              <div key={i} className="rounded-xl bg-white/[0.03] border border-white/10 p-4 text-zinc-300">
                {f}
              </div>
            ))}
          </div>
        </section>

        {c.topVCs.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">أهم الـ VCs</h2>
            <div className="flex flex-wrap gap-2">
              {c.topVCs.map((vc) => (
                <span
                  key={vc}
                  className="px-4 py-2 rounded-full bg-white/[0.05] border border-white/10 text-zinc-300 text-sm"
                >
                  {vc}
                </span>
              ))}
            </div>
          </section>
        )}

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Use Cases الرائجة</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {c.popularUseCasesAr.map((u, i) => (
              <div key={i} className="rounded-xl bg-white/[0.03] border border-white/10 p-5">
                <h3 className="text-lg font-semibold text-white mb-2">{u.title}</h3>
                <p className="text-sm text-zinc-400">{u.description}</p>
              </div>
            ))}
          </div>
        </section>

        {c.localResources.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-indigo-400" /> الموارد المحلية
            </h2>
            <div className="grid md:grid-cols-2 gap-3">
              {c.localResources.map((r) => (
                <div key={r.name} className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
                  <div className="text-base font-semibold text-white mb-1">{r.name}</div>
                  <div className="text-sm text-zinc-400">{r.description}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {c.successStories.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-400" /> قصص نجاح
            </h2>
            <div className="space-y-3">
              {c.successStories.map((s) => (
                <div key={s.name} className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
                  <div className="text-base font-semibold text-white">{s.name}</div>
                  <div className="text-sm text-zinc-400">{s.achievement}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="rounded-2xl bg-gradient-to-br from-cyan-500/10 to-indigo-600/10 border border-cyan-500/20 p-8 text-center mb-12">
          <h3 className="text-2xl font-bold text-white mb-2">
            ابدأ ستارت أبك من {c.cityAr}
          </h3>
          <p className="text-zinc-400 mb-6">
            كلميرون يدعم رواد الأعمال في {c.cityAr} بأدوات AI متخصصة في السوق المحلي.
          </p>
          <Link
            href="/auth/signup"
            className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-medium hover:opacity-90"
          >
            ابدأ مجاناً
          </Link>
        </div>

        <section>
          <h2 className="text-2xl font-bold text-white mb-6">مدن أخرى</h2>
          <div className="grid md:grid-cols-3 gap-3">
            {others.map((o) => (
              <Link
                key={o.slug}
                href={`/cities/${o.slug}`}
                className="rounded-xl bg-white/[0.03] border border-white/10 p-4 hover:border-cyan-500/30 transition"
              >
                <div className="text-base font-semibold text-white">{o.cityAr}</div>
                <div className="text-xs text-zinc-500">{o.countryAr}</div>
              </Link>
            ))}
          </div>
        </section>
      </SeoLandingShell>
    </>
  );
}

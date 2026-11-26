import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  CITIES,
  getCityBySlug,
  getAllCitySlugs,
} from "@/src/lib/seo/cities";
import { SeoLandingShell } from "@/components/seo/SeoLandingShell";
import { breadcrumbSchema } from "@/src/lib/seo/schema";
import { sanitizeJsonLd } from "@/src/lib/security/safe-json-ld";
import { SITE_URL } from "@/src/lib/site";

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
    breadcrumbSchema([
      { name: "الرئيسية", url: `${SITE_URL}/` },
      { name: "المدن", url: `${SITE_URL}/cities` },
      { name: c.cityAr, url: `${SITE_URL}/cities/${city}` },
    ]),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        // nosemgrep: typescript.react.security.audit.react-dangerouslysetinnerhtml.react-dangerouslysetinnerhtml -- safeJsonLd escapes </script and HTML entities; required for SEO JSON-LD per schema.org guidelines
        dangerouslySetInnerHTML={{ __html: sanitizeJsonLd(jsonLd) }}
      />
      <SeoLandingShell
        eyebrow={`📍 ${c.countryAr}`}
        title={`ستارت أبس ${c.cityAr}`}
        description={`دليل مبدئي لرواد الأعمال في ${c.cityAr}. أزلنا الأرقام والأسماء التي لم نتحقق منها من مصدر.`}
        breadcrumbs={[
          { label: "المدن", href: "/cities" },
          { label: c.cityAr },
        ]}
      >
        <section className="mb-12 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <p className="text-zinc-300 leading-relaxed">
            كان هذا القسم يعرض أرقاماً عن حجم المنظومة والتمويل وقصص نجاح بلا مصادر، فأزلناه إلى أن نوثّقه من مصادر منشورة. يمكنك مع ذلك التحقق من فكرتك وتجهيز خطة أولية من صفحة التحقق.
          </p>
        </section>

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

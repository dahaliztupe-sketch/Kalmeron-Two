import type { Metadata } from "next";
import Link from "next/link";
import { GLOSSARY } from "@/src/lib/seo/glossary";
import { SeoLandingShell } from "@/components/seo/SeoLandingShell";

export const metadata: Metadata = {
  title: "قاموس رواد الأعمال | كلميرون",
  description:
    "أكثر من 60 مصطلح أساسي لرواد الأعمال العرب: MVP، CAC، LTV، PMF، وأكثر. شرح بسيط بالعربية.",
  alternates: { canonical: "/glossary" },
  openGraph: {
    title: "قاموس رواد الأعمال",
    description: "كل المصطلحات التي يجب أن يعرفها رائد الأعمال العربي.",
    images: [{ url: "/api/og?title=قاموس%20رواد%20الأعمال&type=glossary" }],
  },
};

const CATEGORY_AR: Record<string, string> = {
  finance: "مالية",
  product: "منتج",
  marketing: "تسويق",
  sales: "مبيعات",
  legal: "قانون وامتثال",
  tech: "تكنولوجيا",
  hr: "موارد بشرية",
  fundraising: "تمويل",
};

export default function GlossaryIndexPage() {
  const grouped = GLOSSARY.reduce<Record<string, typeof GLOSSARY>>((acc, t) => {
    (acc[t.category] ||= []).push(t);
    return acc;
  }, {});

  return (
    <SeoLandingShell
      eyebrow={`${GLOSSARY.length} مصطلح`}
      title="قاموس رواد الأعمال"
      description="كل المصطلحات التي يحتاجها مؤسس الستارت أب العربي. شرح واضح، أمثلة عملية، ومصطلحات مرتبطة."
      breadcrumbs={[{ label: "القاموس" }]}
    >
      {Object.entries(grouped).map(([cat, items]) => (
        <section key={cat} className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-5">{CATEGORY_AR[cat] || cat}</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {items.map((t) => (
              <Link
                key={t.slug}
                href={`/glossary/${t.slug}`}
                className="rounded-xl bg-white/[0.03] border border-white/10 p-4 hover:border-cyan-500/30 transition"
              >
                <div className="text-base font-semibold text-white mb-1">{t.termAr}</div>
                <div className="text-xs text-zinc-500 mb-2">{t.termEn}</div>
                <p className="text-sm text-zinc-400 line-clamp-2">{t.shortDefinitionAr}</p>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </SeoLandingShell>
  );
}

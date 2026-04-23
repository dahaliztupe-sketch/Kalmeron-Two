import type { Metadata } from "next";
import Link from "next/link";
import { CITIES } from "@/src/lib/seo/cities";
import { SeoLandingShell } from "@/components/seo/SeoLandingShell";
import { MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "ستارت أبس عبر مدن MENA | كلميرون",
  description:
    "دليلك للستارت أبس في 15 مدينة عربية: القاهرة، الرياض، دبي، عمان، الدوحة، وأكثر. ecosystem، VCs، فرص.",
  alternates: { canonical: "/cities" },
};

export default function CitiesIndexPage() {
  return (
    <SeoLandingShell
      eyebrow={`${CITIES.length} مدينة`}
      title="ستارت أبس MENA"
      description="استكشف الـ ecosystem في كل مدينة كبرى. VCs، حواضن، قصص نجاح، وفرص."
      breadcrumbs={[{ label: "المدن" }]}
    >
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CITIES.map((c) => (
          <Link
            key={c.slug}
            href={`/cities/${c.slug}`}
            className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 hover:border-cyan-500/30 transition"
          >
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-zinc-500">{c.countryAr}</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{c.cityAr}</h3>
            <p className="text-sm text-zinc-400 line-clamp-3">{c.heroIntroAr}</p>
          </Link>
        ))}
      </div>
    </SeoLandingShell>
  );
}

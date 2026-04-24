import type { Metadata } from "next";
import Link from "next/link";
import { INDUSTRIES } from "@/src/lib/seo/industries";
import { SeoLandingShell } from "@/components/seo/SeoLandingShell";
import { ArrowLeft, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "الصناعات | حلول AI متخصصة لكل قطاع",
  description: "كلميرون يخدم 8 صناعات رئيسية: الفنتك، التجارة الإلكترونية، EdTech، HealthTech، اللوجستيات، الزراعة، الطعام، والـ SaaS.",
  alternates: { canonical: "/industries" },
};

export default function IndustriesIndexPage() {
  return (
    <SeoLandingShell
      eyebrow="حلول قطاعية"
      title="حلول مخصصة لكل صناعة"
      description="كل صناعة لها قواعدها. كلميرون يفهم خصوصيات سوقك ويوفر مساعدين متخصصين لها."
      breadcrumbs={[{ label: "الصناعات" }]}
    >
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {INDUSTRIES.map((ind) => (
          <Link
            key={ind.slug}
            href={`/industries/${ind.slug}`}
            className="group rounded-2xl bg-white/[0.03] border border-white/10 p-6 hover:bg-white/[0.06] hover:border-indigo-500/30 transition-all"
          >
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-300 transition">
              {ind.nameAr}
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed mb-4 line-clamp-3">
              {ind.metaDescriptionAr}
            </p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-emerald-400 inline-flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {ind.growthRateAr}
              </span>
              <span className="text-cyan-400 inline-flex items-center gap-1 group-hover:translate-x-[-4px] transition-transform">
                التفاصيل
                <ArrowLeft className="w-3 h-3" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </SeoLandingShell>
  );
}

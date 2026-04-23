import type { Metadata } from "next";
import { SeoLandingShell, FeatureCheck } from "@/components/seo/SeoLandingShell";
import { Users, Handshake, Coffee, MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Founder Network | كلميرون",
  description:
    "شبكة المؤسسين العرب: 5000+ founder، intros ذكية، mastermind groups، مجتمع private، وفرص شراكة حقيقية.",
  alternates: { canonical: "/founder-network" },
};

export default function FounderNetworkPage() {
  return (
    <SeoLandingShell
      eyebrow="مجتمع حصري"
      title="Founder Network"
      description="أكبر شبكة مؤسسين عرب. AI يربطك بمن يحل مشكلتك بالضبط، lifetime peer learning."
      breadcrumbs={[{ label: "Founder Network" }]}
    >
      <section className="grid md:grid-cols-2 gap-6 mb-16">
        {[
          { icon: Users, title: "5000+ Founder", desc: "من 22 دولة عربية، عبر 20+ صناعة، من pre-seed إلى Series C+." },
          { icon: Handshake, title: "Smart Intros", desc: "AI يحلل تحديك ويربطك بـ 3 founders تجاوزوا نفس المشكلة." },
          { icon: Coffee, title: "Mastermind Groups", desc: "مجموعات صغيرة (8 founders) متشابهين في المرحلة، تجتمع شهرياً." },
          { icon: MessageCircle, title: "Private Forum", desc: "نقاشات candid عن fundraising، hiring، failures - بعيد عن LinkedIn." },
        ].map((f) => (
          <div key={f.title} className="rounded-2xl bg-white/[0.03] border border-white/10 p-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-indigo-600/20 flex items-center justify-center mb-4">
              <f.icon className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">{f.title}</h3>
            <p className="text-zinc-400">{f.desc}</p>
          </div>
        ))}
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-bold text-white mb-6">ما تحصل عليه</h2>
        <ul className="space-y-3">
          <FeatureCheck>3 intros شهرياً مع founders ذوي خبرة في تحديك</FeatureCheck>
          <FeatureCheck>Mastermind group من 8 founders متشابهين في المرحلة</FeatureCheck>
          <FeatureCheck>Monthly virtual events: AMAs مع founders بارزين</FeatureCheck>
          <FeatureCheck>Quarterly in-person meetups في القاهرة، الرياض، دبي</FeatureCheck>
          <FeatureCheck>Private channels حسب القطاع (fintech، edtech، إلخ)</FeatureCheck>
          <FeatureCheck>Job board: hire من شبكة الفاوندرز قبل LinkedIn</FeatureCheck>
        </ul>
      </section>

      <section className="rounded-2xl bg-gradient-to-br from-cyan-500/10 to-indigo-600/10 border border-cyan-500/20 p-8 mb-12">
        <h3 className="text-2xl font-bold text-white mb-4">معايير الانضمام</h3>
        <p className="text-zinc-300 mb-4">
          الـ network انتقائية لضمان جودة النقاشات. نقبل founders/co-founders نشطين فقط:
        </p>
        <ul className="space-y-2 text-sm text-zinc-400">
          <li>• Founder/co-founder لشركة نشطة (revenue أو traction قابل للقياس)</li>
          <li>• مقيم في MENA أو يبني للسوق العربي</li>
          <li>• مستعد للمشاركة بأمانة (give before you take)</li>
        </ul>
      </section>
    </SeoLandingShell>
  );
}

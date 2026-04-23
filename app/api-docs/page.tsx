import type { Metadata } from "next";
import { SeoLandingShell, FeatureCheck } from "@/components/seo/SeoLandingShell";
import { Code2, Key, Webhook, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Kalmeron API | كلميرون للمطورين",
  description:
    "REST + Streaming API: ادمج وكلاء كلميرون في تطبيقاتك. SDKs لـ Node.js, Python, PHP. باللغة العربية كاملة.",
  alternates: { canonical: "/api-docs" },
};

const Snippet = ({ code }: { code: string }) => (
  <pre className="rounded-xl bg-black/60 border border-white/10 p-4 overflow-x-auto text-left" dir="ltr">
    <code className="text-xs text-cyan-300 font-mono whitespace-pre">{code}</code>
  </pre>
);

export default function ApiDocsPage() {
  return (
    <SeoLandingShell
      eyebrow="API للمطورين"
      title="Kalmeron API"
      description="ادمج 50+ وكيل ذكاء اصطناعي عربي في تطبيقاتك. REST، Streaming، Webhooks. SDKs رسمية."
      breadcrumbs={[{ label: "API Docs" }]}
    >
      <section className="grid md:grid-cols-2 gap-6 mb-16">
        {[
          { icon: Code2, title: "REST + Streaming", desc: "JSON REST + Server-Sent Events للـ streaming responses." },
          { icon: Key, title: "API Keys آمنة", desc: "Scoped keys، rate limiting، per-key analytics، rotation سهل." },
          { icon: Webhook, title: "Webhooks", desc: "احصل على notifications للـ async tasks (long-running agents)." },
          { icon: Zap, title: "Edge-deployed", desc: "Latency منخفض للـ MENA من خلال edge servers في دبي والرياض." },
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
        <h2 className="text-3xl font-bold text-white mb-4">Quick Start</h2>
        <p className="text-zinc-400 mb-6">استدعاء الوكيل المالي بـ cURL:</p>
        <Snippet code={`curl https://api.kalmeron.com/v1/agents/finance/run \\
  -H "Authorization: Bearer $KALMERON_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "input": "ابني نموذج مالي لـ SaaS بـ ARR $50K",
    "stream": true
  }'`} />
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-bold text-white mb-4">Node.js SDK</h2>
        <Snippet code={`import Kalmeron from "@kalmeron/sdk";

const client = new Kalmeron({ apiKey: process.env.KALMERON_API_KEY });

const stream = await client.agents.finance.run({
  input: "ابني نموذج مالي لـ SaaS بـ ARR $50K",
  stream: true,
});

for await (const event of stream) {
  process.stdout.write(event.delta);
}`} />
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-bold text-white mb-6">الميزات</h2>
        <ul className="space-y-3">
          <FeatureCheck>50+ وكيل متخصص متاح عبر API</FeatureCheck>
          <FeatureCheck>Multi-turn conversations مع conversation IDs</FeatureCheck>
          <FeatureCheck>File upload للـ documents (PDF، Excel، Word)</FeatureCheck>
          <FeatureCheck>Function calling: ربط وكلاء بـ tools خاصة بك</FeatureCheck>
          <FeatureCheck>Cost tracking تفصيلي per request</FeatureCheck>
          <FeatureCheck>SLA 99.95% uptime على Operator+ plans</FeatureCheck>
        </ul>
      </section>
    </SeoLandingShell>
  );
}

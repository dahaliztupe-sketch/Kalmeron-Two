import type { Metadata } from "next";
import { SeoLandingShell, FeatureCheck } from "@/components/seo/SeoLandingShell";
import { Plug, Cpu, Shield, Boxes } from "lucide-react";

export const metadata: Metadata = {
  title: "Kalmeron MCP Server | كلميرون",
  description:
    "Model Context Protocol server: استخدم مساعدين كلميرون مباشرة في Claude Desktop، Cursor، VSCode، وأي MCP client.",
  alternates: { canonical: "/mcp-server" },
};

const Snippet = ({ code }: { code: string }) => (
  <pre className="rounded-xl bg-black/60 border border-white/10 p-4 overflow-x-auto text-left" dir="ltr">
    <code className="text-xs text-cyan-300 font-mono whitespace-pre">{code}</code>
  </pre>
);

export default function McpServerPage() {
  return (
    <SeoLandingShell
      eyebrow="MCP Server رسمي"
      title="Kalmeron MCP Server"
      description="استخدم 16 مساعداً ذكياً عربياً مباشرة من Claude Desktop، Cursor، Continue، VSCode، وأي MCP client. الـ AI الخاص بك يصبح متخصصاً في السوق العربي."
      breadcrumbs={[{ label: "MCP Server" }]}
    >
      <section className="grid md:grid-cols-2 gap-6 mb-16">
        {[
          { icon: Plug, title: "Plug-and-Play", desc: "تكامل في 30 ثانية مع أي MCP client. لا حاجة لـ custom integrations." },
          { icon: Cpu, title: "16 Tools", desc: "كل مساعد من كلميرون متاح كـ MCP tool: legal، finance، marketing، إلخ." },
          { icon: Shield, title: "آمن وموثق", desc: "OAuth 2.0، scoped permissions، audit logs لكل tool call." },
          { icon: Boxes, title: "مفتوح المصدر", desc: "GitHub repo مع Apache 2.0. ساهم وأضف مساعدين خاصة بك." },
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
        <h2 className="text-3xl font-bold text-white mb-4">إعداد Claude Desktop</h2>
        <p className="text-zinc-400 mb-4">أضف لـ <code className="text-cyan-300">claude_desktop_config.json</code>:</p>
        <Snippet code={`{
  "mcpServers": {
    "kalmeron": {
      "command": "npx",
      "args": ["-y", "@kalmeron/mcp-server"],
      "env": {
        "KALMERON_API_KEY": "your_api_key_here"
      }
    }
  }
}`} />
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-bold text-white mb-4">المساعدين المتاحون كـ Tools</h2>
        <div className="grid md:grid-cols-3 gap-3">
          {[
            "kalmeron_finance_model",
            "kalmeron_legal_review",
            "kalmeron_marketing_plan",
            "kalmeron_pitch_deck",
            "kalmeron_competitor_analysis",
            "kalmeron_market_research",
            "kalmeron_arabic_translate",
            "kalmeron_compliance_check",
            "kalmeron_business_plan",
          ].map((t) => (
            <div key={t} className="rounded-xl bg-white/[0.03] border border-white/10 p-3 text-xs font-mono text-cyan-300" dir="ltr">
              {t}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold text-white mb-6">الـ Clients المدعومة</h2>
        <ul className="space-y-3">
          <FeatureCheck>Claude Desktop (Anthropic)</FeatureCheck>
          <FeatureCheck>Cursor IDE</FeatureCheck>
          <FeatureCheck>Continue (VSCode/JetBrains extension)</FeatureCheck>
          <FeatureCheck>Cline (VSCode)</FeatureCheck>
          <FeatureCheck>Zed Editor</FeatureCheck>
          <FeatureCheck>أي MCP-compatible client</FeatureCheck>
        </ul>
      </section>
    </SeoLandingShell>
  );
}

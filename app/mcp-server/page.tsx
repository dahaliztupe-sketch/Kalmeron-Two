import type { Metadata } from "next";
import { SeoLandingShell } from "@/components/seo/SeoLandingShell";

export const metadata: Metadata = {
  title: "MCP Server | كلميرون",
  description: "خادم MCP لكلميرون غير متاح حالياً.",
  alternates: { canonical: "/mcp-server" },
  robots: { index: false, follow: false },
};

export default function McpServerPage() {
  return (
    <SeoLandingShell
      eyebrow="غير متاح"
      title="Kalmeron MCP Server"
      description="لا يوجد خادم MCP منشور لكلميرون حالياً. المشروع تجريبي ومتوقف مؤقتاً، ولا توجد حزمة أو مفاتيح API متاحة للاستخدام الخارجي."
      breadcrumbs={[{ label: "MCP Server" }]}
    >
      <p className="text-zinc-400 leading-relaxed">
        كانت هذه الصفحة تصف تكاملاً لم يُبنَ بعد، فأُزيل الوصف حتى لا يضلّل أحداً. إن تغيّر ذلك سيُعلن هنا.
      </p>
    </SeoLandingShell>
  );
}

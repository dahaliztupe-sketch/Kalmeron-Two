import type { Metadata } from "next";
import UsageClient from "./_usage-client";

export const metadata: Metadata = {
  title: "لوحة الاستخدام | Kalmeron AI",
  description: "تتبّع استهلاكك من نقاط الذكاء الاصطناعي، التوكنز، الطلبات، والتكلفة الشهرية بنمط لوحة استخدام OpenAI.",
  alternates: { canonical: "/usage" },
};

export default function UsagePage() {
  return <UsageClient />;
}

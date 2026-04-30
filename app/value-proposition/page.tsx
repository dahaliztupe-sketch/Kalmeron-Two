import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "عرض القيمة | ابنِ رسالتك التسويقية مع كلميرون",
  description: "صغ عرض قيمة واضحاً ومقنعاً لمنتجك أو خدمتك بمساعدة ذكاء كلميرون الاصطناعي: حدّد جمهورك المستهدف، ألمهم، وكيف تحل مشكلتهم بطريقة لا يقدمها أحد غيرك.",
};

export default function Page() {
  return <PageClient />;
}

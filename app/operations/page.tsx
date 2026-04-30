import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "إدارة العمليات | تحسين كفاءة شركتك مع كلميرون",
  description: "راقب وأدر عمليات شركتك اليومية بكفاءة عالية: المهام، العمليات المتكررة، الأداء التشغيلي، وتحسين العمليات باستخدام الذكاء الاصطناعي لشركتك الناشئة.",
};

export default function Page() {
  return <PageClient />;
}

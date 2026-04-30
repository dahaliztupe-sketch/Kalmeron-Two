import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "خطة العمل الذكية | أنشئ خطتك مع كلميرون",
  description: "ابنِ خطة عمل شاملة واحترافية لشركتك الناشئة باستخدام الذكاء الاصطناعي: تحليل السوق، نموذج الإيرادات، الخطة التسويقية، الخطة المالية — جاهزة للمستثمرين.",
};

export default function Page() {
  return <PageClient />;
}

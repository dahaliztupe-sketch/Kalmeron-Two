import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "المدير المالي الذكي | تحليل مالي بالذكاء الاصطناعي",
  description: "مساعد CFO الذكي من كلميرون: يبني نماذجك المالية، يحلل التدفقات النقدية، يحسب نقطة التعادل، ويضع توقعات الإيرادات لشركتك الناشئة باللغة العربية.",
};

export default function Page() {
  return <PageClient />;
}

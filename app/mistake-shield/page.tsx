import type { Metadata } from "next";
import PageClient from "./_page-client";

export const metadata: Metadata = {
  title: "درع الأخطاء | اكتشف أخطاء مشروعك قبل فوات الأوان",
  description: "درع الأخطاء من كلميرون يحلل مشروعك ويكشف الأخطاء الشائعة في المشاريع الناشئة. أداة آلية غير مراجَعة بشرياً.",
};

export default function Page() {
  return <PageClient />;
}
